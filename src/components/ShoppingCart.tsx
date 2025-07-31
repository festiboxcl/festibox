import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, CreditCard, Package, Eye, Minus, Plus } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { animations } from '../utils/animations';
import type { ShoppingCartItem, CartItem, UploadedImage } from '../types';
import type { ShippingOption, ShippingAddress } from '../services/shippingService';
import { ShippingModal } from './ShippingModal';
import { ProductPreviewModal } from './ProductPreviewModal';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: ShoppingCartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: (cartItems: ShoppingCartItem[], shippingOption: ShippingOption, shippingAddress?: ShippingAddress) => Promise<void>;
}

export function ShoppingCartComponent({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem,
  onCheckout 
}: ShoppingCartProps) {
  const { playClick, playSuccess, playHover } = useSound();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | undefined>();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<CartItem | null>(null);

  // Debug del estado del modal
  useEffect(() => {
    console.log('🔄 Estado del modal cambió:');
    console.log('  showPreviewModal:', showPreviewModal);
    console.log('  previewProduct:', previewProduct);
  }, [showPreviewModal, previewProduct]);

  // Calcular totales
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = selectedShipping?.price || 0;
  const total = subtotal + shippingCost;

  const handleCheckout = async () => {
    if (!selectedShipping) {
      // Mostrar modal de envío si no se ha seleccionado
      setShowShippingModal(true);
      playClick();
      return;
    }

    setIsCheckingOut(true);
    playClick();
    
    try {
      await onCheckout(cartItems, selectedShipping, shippingAddress);
      playSuccess();
    } catch (error) {
      console.error('Error en checkout:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleShippingSelected = (option: ShippingOption, address?: ShippingAddress) => {
    setSelectedShipping(option);
    setShippingAddress(address);
    setShowShippingModal(false);
    playSuccess();
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }
    playClick();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Cart Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tu Carrito ({cartItems.length})
                  </h2>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      Tu carrito está vacío
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Agrega productos para comenzar tu pedido
                    </p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={() => onRemoveItem(item.id)}
                      formatPrice={formatPrice}
                      playHover={playHover}
                      onPreview={(item: ShoppingCartItem) => {
                        console.log('📦 Item original del carrito:', item);
                        console.log('📸 Fotos:', item.photos);
                        console.log('� Primera foto (estructura):', item.photos[0]);
                        console.log('�💬 Mensajes:', item.messages);
                        console.log('🏷️ Producto:', item.product);
                        
                        // Verificar la estructura de las fotos antes de usarlas
                        const validPhotos = item.photos.filter(photo => photo instanceof File);
                        console.log('✅ Fotos válidas (File objects):', validPhotos);
                        
                        try {
                          // Convertir ShoppingCartItem a CartItem
                          const cartItem: CartItem = {
                            id: item.id,
                            product: item.product,
                            images: item.photos.map((photo: any, index: number) => {
                              // Si es un File, usar directamente
                              if (photo instanceof File) {
                                return {
                                  id: `photo-${index}`,
                                  file: photo,
                                  preview: URL.createObjectURL(photo),
                                  position: index + 1
                                };
                              }
                              // Si tiene una propiedad file, usar esa
                              else if (photo && photo.file && photo.file instanceof File) {
                                return {
                                  id: `photo-${index}`,
                                  file: photo.file,
                                  preview: URL.createObjectURL(photo.file),
                                  position: index + 1
                                };
                              }
                              // Si tiene una URL de preview
                              else if (photo && photo.preview) {
                                return {
                                  id: `photo-${index}`,
                                  file: photo.file || photo, // Intentar usar el file o el objeto completo
                                  preview: photo.preview,
                                  position: index + 1
                                };
                              }
                              // Caso fallback
                              else {
                                console.warn('⚠️ Foto con estructura no reconocida:', photo);
                                return null;
                              }
                            }).filter(Boolean) as UploadedImage[], // Filtrar elementos null y type assertion
                            quantity: item.quantity,
                            customizations: {
                              messages: item.messages,
                              configuration: item.configuration
                            }
                          };
                          
                          console.log('🔄 CartItem convertido:', cartItem);
                          setPreviewProduct(cartItem);
                          setShowPreviewModal(true);
                          console.log('✅ Modal debería abrirse ahora');
                        } catch (error) {
                          console.error('❌ Error al procesar fotos:', error);
                        }
                      }}
                    />
                  ))
                )}
              </div>

              {/* Summary & Checkout */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  {/* Totals */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    
                    {/* Shipping Selection */}
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-600">Envío:</span>
                      <div className="flex items-center gap-2">
                        {selectedShipping ? (
                          <>
                            <span className="font-medium">
                              {selectedShipping.price === 0 ? (
                                <span className="text-green-600">¡Gratis!</span>
                              ) : (
                                formatPrice(selectedShipping.price)
                              )}
                            </span>
                            <button
                              onClick={() => setShowShippingModal(true)}
                              className="text-xs text-primary-600 hover:text-primary-700 underline"
                            >
                              cambiar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setShowShippingModal(true)}
                            className="text-xs text-primary-600 hover:text-primary-700 underline font-medium"
                          >
                            Seleccionar envío
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {selectedShipping && (
                      <div className="text-xs text-gray-500">
                        {selectedShipping.name} - {selectedShipping.deliveryTime}
                      </div>
                    )}
                    
                    <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-primary-600">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <motion.button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      isCheckingOut
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 hover:scale-105 shadow-lg hover:shadow-xl'
                    }`}
                    whileHover={!isCheckingOut ? { scale: 1.02 } : {}}
                    whileTap={!isCheckingOut ? { scale: 0.98 } : {}}
                  >
                    <CreditCard className="w-5 h-5" />
                    {isCheckingOut ? 'Procesando...' : selectedShipping ? 'Pagar con Flow' : 'Seleccionar envío'}
                  </motion.button>

                  {/* Security Info */}
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Package className="w-3 h-3" />
                    <span>Pago seguro con Flow</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Shipping Modal */}
          {cartItems.length > 0 && (
            <ShippingModal
              isOpen={showShippingModal}
              onClose={() => setShowShippingModal(false)}
              onShippingSelected={handleShippingSelected}
              productCategory={cartItems[0]?.product.category || 'tarjetas'}
              productType={'simple'}
              productName={cartItems.length === 1 ? cartItems[0].product.name : `${cartItems.length} productos`}
            />
          )}
          
          {/* Product Preview Modal */}
          {previewProduct && (
            <ProductPreviewModal
              isOpen={showPreviewModal}
              onClose={() => {
                console.log('🔒 Cerrando modal de preview');
                setShowPreviewModal(false);
                setPreviewProduct(null);
              }}
              product={previewProduct}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// Componente individual de item del carrito
function CartItemCard({ 
  item, 
  onQuantityChange, 
  onRemove, 
  formatPrice, 
  playHover,
  onPreview
}: {
  item: ShoppingCartItem;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: () => void;
  formatPrice: (price: number) => string;
  playHover: () => void;
  onPreview: (item: ShoppingCartItem) => void;
}) {
  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
      {...animations.fadeIn}
    >
      <div className="flex gap-3">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img 
            src={item.product.image} 
            alt={item.product.name}
            className="w-16 h-16 object-cover rounded-lg border"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {item.product.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {item.photos.length} fotos • {item.messages.filter((m: string) => m.trim()).length} mensajes
          </p>
          
          {/* Price */}
          <div className="flex items-center justify-between mt-2">
            <span className="font-semibold text-primary-600">
              {formatPrice(item.price)}
            </span>
            
            {/* Preview Button */}
            <motion.button
              onClick={() => onPreview(item)}
              onHoverStart={playHover}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <Eye className="w-3 h-3" />
              Vista previa
            </motion.button>
          </div>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Minus className="w-4 h-4" />
          </motion.button>
          
          <span className="font-medium text-gray-900 min-w-[2rem] text-center">
            {item.quantity}
          </span>
          
          <motion.button
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        <motion.button
          onClick={onRemove}
          className="text-xs text-red-500 hover:text-red-700 transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          Eliminar
        </motion.button>
      </div>
    </motion.div>
  );
}
