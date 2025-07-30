import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, CreditCard, Package, Eye, Minus, Plus } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { animations } from '../utils/animations';
import type { ShoppingCartItem } from '../types';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: ShoppingCartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: (cartItems: ShoppingCartItem[]) => Promise<void>;
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

  // Calcular totales
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50000 ? 0 : 5000; // Envío gratis sobre $50.000
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    playClick();
    
    try {
      await onCheckout(cartItems);
      playSuccess();
    } catch (error) {
      console.error('Error en checkout:', error);
    } finally {
      setIsCheckingOut(false);
    }
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
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envío:</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600">¡Gratis!</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>
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
                    {isCheckingOut ? 'Procesando...' : 'Pagar con Flow'}
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
  playHover 
}: {
  item: ShoppingCartItem;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: () => void;
  formatPrice: (price: number) => string;
  playHover: () => void;
}) {
  const [showPreview, setShowPreview] = useState(false);

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
              onClick={() => setShowPreview(!showPreview)}
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

      {/* Preview Panel */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="mt-3 pt-3 border-t border-gray-100"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-4 gap-2 mb-3">
              {item.photos.slice(0, 4).map((photo: File, index: number) => (
                <div key={index} className="aspect-square rounded overflow-hidden bg-gray-100">
                  <img 
                    src={URL.createObjectURL(photo)} 
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {item.photos.length > 4 && (
              <p className="text-xs text-gray-500 text-center">
                +{item.photos.length - 4} fotos más
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
