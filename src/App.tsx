import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo';
import { BannerSlider } from './components/BannerSlider';
import { ProductSelector } from './components/ProductSelector';
import { UnifiedCustomizer } from './components/UnifiedCustomizer';
import { CardOptionSelector } from './components/CardOptionSelector';
import { ProductConfirmationModal } from './components/ProductConfirmationModal';
import { ShoppingCartComponent } from './components/ShoppingCart';
import { CheckoutModal } from './components/CheckoutModal';
import { FAQSection } from './components/FAQSection';
import { SEO, useProductSEO } from './components/SEO';
import { ShoppingCart, Heart, Camera, Palette, Gift, Instagram, MessageCircle, Mail, HelpCircle } from 'lucide-react';
// import { assets } from './assets';
import { useProductWithOptions } from './hooks/useProductWithOptions';
import { useShoppingCart } from './hooks/useShoppingCart';
import { useSound } from './hooks/useSound';
import { animations } from './utils/animations';
import type { UploadedImage, ProductConfiguration } from './types';

// Productos disponibles
// const products = Object.values(assets.products);

// Función para obtener el título específico del contenido según el producto
const getContentTitle = (product: any) => {
  if (!product) return '¿Cómo funciona?';
  
  if (product.category === 'cajas') {
    return '¿Qué contiene la caja?';
  }
  
  return '¿Cómo funciona?';
};

// Función para obtener el contenido específico según el producto
const getProductContent = (product: any) => {
  if (!product) {
    // Contenido por defecto para tarjetas explosivas
    return (
      <motion.div 
        className="grid grid-cols-3 gap-4 text-center"
        variants={animations.staggerContainer}
        initial="initial"
        animate="animate"
      >
        {[
          { icon: Camera, title: "Sube fotos", desc: "Selecciona tus mejores recuerdos" },
          { icon: Palette, title: "Creamos", desc: "Armamos tu tarjeta única" },
          { icon: Gift, title: "¡Sorprende!", desc: "Al abrirla explota de amor" }
        ].map((step, index) => (
          <motion.div
            key={index}
            variants={animations.staggerItem}
          >
            <motion.div 
              className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <step.icon className="w-5 h-5 text-primary-600" />
            </motion.div>
            <h4 className="font-medium text-sm text-gray-900 mb-1">{step.title}</h4>
            <p className="text-xs text-gray-600">{step.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Contenido específico para cajas
  if (product.category === 'cajas') {
    let boxContents: string[] = [];
    
    switch (product.id) {
      case 'd01-dulce':
        boxContents = [
          'Selección de chocolates grandes',
          'Bombones Ferrero Rocher',
          'Otros dulces chilenos',
          'Tarjeta explosiva personalizable'
        ];
        break;
      case 'd01-dulce-mini':
        boxContents = [
          'Sapito',
          'Chokita',
          'Baton',
          'Lollipop',
          'Gomitas',
          'Bonobon',
          'Bombom Bum',
          'Tarjeta explosiva personalizable'
        ];
        break;
      case 's01-salada':
        boxContents = [
          'Una champaña o 6 cervezas',
          'Dip variado',
          'Galletas saladas',
          'Maní',
          'Espacios personalizables'
        ];
        break;
      default:
        boxContents = ['Productos sorpresa', 'Contenido personalizable'];
    }

    return (
      <motion.div 
        className="space-y-3"
        variants={animations.staggerContainer}
        initial="initial"
        animate="animate"
      >
        {boxContents.map((item, index) => (
          <motion.div
            key={index}
            variants={animations.staggerItem}
            className="flex items-center justify-center gap-2 text-sm text-gray-700"
          >
            <motion.div 
              className="w-2 h-2 bg-primary-600 rounded-full"
              whileHover={{ scale: 1.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            />
            <span>{item}</span>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Contenido por defecto para otros productos (tarjetas explosivas)
  return (
    <motion.div 
      className="grid grid-cols-3 gap-4 text-center"
      variants={animations.staggerContainer}
      initial="initial"
      animate="animate"
    >
      {[
        { icon: Camera, title: "Sube fotos", desc: "Selecciona tus mejores recuerdos" },
        { icon: Palette, title: "Creamos", desc: "Armamos tu tarjeta única" },
        { icon: Gift, title: "¡Sorprende!", desc: "Al abrirla explota de amor" }
      ].map((step, index) => (
        <motion.div
          key={index}
          variants={animations.staggerItem}
        >
          <motion.div 
            className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <step.icon className="w-5 h-5 text-primary-600" />
          </motion.div>
          <h4 className="font-medium text-sm text-gray-900 mb-1">{step.title}</h4>
          <p className="text-xs text-gray-600">{step.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

function App() {
  const [selectedBaseProduct, setSelectedBaseProduct] = useState<any>(null); // Empezar sin producto seleccionado
  const [, setImages] = useState<UploadedImage[]>([]); // Underscore para indicar que no se usa
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [currentStep, setCurrentStep] = useState<'product' | 'card-options' | 'customize'>('product');
  const [, setProductConfiguration] = useState<ProductConfiguration | null>(null); // Underscore para indicar que no se usa
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<any>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  
  // Hook de sonidos
  const { playClick, playSuccess, playSelect, playHover } = useSound();
  
  // Hook del carrito de compras (ya no necesita configuración)
  const {
    cartItems,
    isCartOpen,
    isProcessingPayment,
    cartTotals,
    addToCart,
    updateQuantity,
    removeFromCart,
    setIsCartOpen,
    processCheckout
  } = useShoppingCart();
  
  // SEO dinámico basado en el producto seleccionado
  const productSEO = useProductSEO(selectedBaseProduct);
  
  // Usar el hook para manejar las opciones de tarjeta
  const { 
    product: selectedProduct, 
    selectedCardOption, 
    setSelectedCardOption, 
    hasCardOptions 
  } = useProductWithOptions(selectedBaseProduct);

  const handleAddToCart = () => {
    playSuccess(); // Sonido de éxito
    setIsAddedToCart(true);
    setIsCartOpen(true); // Abrir carrito automáticamente
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  const handleProductChange = (product: any) => {
    // Si el producto no está disponible, no hacer nada
    if (!(product as any).isAvailable) {
      return;
    }
    
    playSelect(); // Sonido de selección
    // Mostrar modal de confirmación para cualquier producto
    setPendingProduct(product);
    setShowConfirmationModal(true);
  };

  const handleConfirmProduct = () => {
    if (pendingProduct) {
      playClick(); // Sonido de confirmación
      setSelectedBaseProduct(pendingProduct);
      setImages([]);
      setProductConfiguration(null);
      // Verificar si el pendingProduct tiene opciones de tarjeta
      const pendingHasCardOptions = pendingProduct.cardOptions && pendingProduct.cardOptions.length > 0;
      setCurrentStep(pendingHasCardOptions ? 'card-options' : 'customize');
    }
    setShowConfirmationModal(false);
    setPendingProduct(null);
  };

  const handleCancelProduct = () => {
    setShowConfirmationModal(false);
    setPendingProduct(null);
  };

  const handleCustomizationComplete = async (config: ProductConfiguration, photos: File[], messages: string[]) => {
    setProductConfiguration(config);
    
    // Convertir Files a UploadedImages para compatibilidad
    const uploadedImages: UploadedImage[] = photos.map((file, index) => ({
      id: `photo-${index}`,
      file,
      preview: URL.createObjectURL(file),
      position: index + 1
    }));
    setImages(uploadedImages);
    
    // Verificar que tenemos un producto seleccionado
    if (!selectedProduct) {
      console.error('No hay producto seleccionado para agregar al carrito');
      return;
    }
    
    // Calcular precio base del producto
    const basePrice = selectedProduct.price || 15000; // Precio por defecto
    
    // Agregar al carrito
    addToCart({
      product: selectedProduct,
      configuration: config,
      photos,
      messages: messages.filter(m => m.trim()), // Solo mensajes no vacíos
      price: basePrice
    });
    
    // Mostrar carrito
    handleAddToCart();
  };

  // Manejar checkout desde el carrito con envío
  const handleCartCheckout = async (
    _items: any[], 
    shippingOption: any, 
    shippingAddress?: any
  ) => {
    try {
      // Solicitar email al usuario
      const email = prompt('Por favor ingresa tu email para continuar con el pago:');
      if (!email) {
        throw new Error('Email es requerido para continuar');
      }

      await processCheckout(email, shippingOption, shippingAddress);
      // El usuario será redirigido a Flow automáticamente
    } catch (error) {
      console.error('Error en checkout:', error);
      alert('Error al procesar el pago. Por favor intenta nuevamente.');
    }
  };

  // Procesar checkout con email (para compatibilidad hacia atrás)
  const handleCheckoutWithEmail = async (email: string) => {
    try {
      // Para el checkout directo, usar envío estándar por defecto
      const defaultShipping = {
        id: 'pickup-free',
        name: 'Retiro en tienda',
        type: 'pickup' as const,
        price: 0,
        deliveryTime: '1-2 días hábiles',
        description: 'Retira tu pedido gratis en nuestra tienda'
      };
      
      await processCheckout(email, defaultShipping);
      setShowCheckoutModal(false);
      // El usuario será redirigido a Flow automáticamente
    } catch (error) {
      console.error('Error en checkout:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      {/* SEO dinámico */}
      <SEO {...productSEO} />
      
      {/* Header mejorado sin slogan */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-20 relative"> {/* Reducido de h-24 a h-20 */}
            {/* Logo centrado y clickeable - tamaño ajustado */}
            <motion.button 
              onClick={() => {
                playClick();
                setCurrentStep('product');
                setSelectedBaseProduct(null); // No seleccionar ningún producto
                setImages([]);
                setProductConfiguration(null);
              }}
              className="flex items-center justify-center hover:opacity-80 transition-opacity"
              {...animations.hoverScale}
            >
              <Logo size="lg" />
            </motion.button>
            
            {/* Botones de acción posicionados absolutamente */}
            <div className="absolute right-0 flex items-center space-x-2">
              <motion.button 
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => playClick()}
                onHoverStart={() => playHover()}
              >
                <Heart className="h-4 w-4" />
              </motion.button>
              <motion.button 
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playClick();
                  setIsFAQOpen(true);
                }}
                onHoverStart={() => playHover()}
                title="Preguntas Frecuentes"
              >
                <HelpCircle className="h-4 w-4" />
              </motion.button>
              <motion.button 
                className="p-2 text-gray-600 hover:text-primary-600 relative transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playClick();
                  setIsCartOpen(true);
                }}
                onHoverStart={() => playHover()}
              >
                <ShoppingCart className="h-4 w-4" />
                <AnimatePresence>
                  {(cartItems.length > 0 || isAddedToCart) && (
                    <motion.span 
                      className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {cartItems.length || 1}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Slider compacto */}
      <section className="relative">
        <BannerSlider />
      </section>

      {/* Contenido principal mobile-first */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {/* Selector de productos */}
          {currentStep === 'product' && (
            <motion.div
              key="product"
              {...animations.slideInFromBottom}
            >
              <ProductSelector 
                selectedProduct={selectedBaseProduct}
                onProductChange={handleProductChange}
              />
            </motion.div>
          )}

          {/* Selector de opciones de tarjeta */}
          {currentStep === 'card-options' && hasCardOptions && (
            <motion.div
              key="card-options"
              {...animations.slideInFromBottom}
            >
              <CardOptionSelector
                product={selectedBaseProduct}
                selectedOption={selectedCardOption}
                onOptionChange={setSelectedCardOption}
                onContinue={() => {
                  playClick();
                  setCurrentStep('customize');
                }}
                onBack={() => {
                  playClick();
                  setCurrentStep('product');
                }}
              />
            </motion.div>
          )}

          {/* Personalizador unificado */}
          {currentStep === 'customize' && selectedProduct && (
            <motion.div
              key="customize"
              {...animations.slideInFromBottom}
            >
              <UnifiedCustomizer
                product={selectedProduct}
                onComplete={handleCustomizationComplete}
                onBack={() => {
                  playClick();
                  setCurrentStep(hasCardOptions ? 'card-options' : 'product');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenido específico por producto */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm p-4" 
          id="product-contents-section"
          {...animations.fadeIn}
        >
          <motion.h3 
            className="text-lg font-semibold text-gray-900 mb-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {getContentTitle(selectedProduct)}
          </motion.h3>
          <motion.div 
            className="text-center"
            variants={animations.staggerContainer}
            initial="initial"
            animate="animate"
          >
            {getProductContent(selectedProduct)}
          </motion.div>
        </motion.div>
      </main>

      {/* Footer compacto */}
      <footer className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="md" />
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-sm mb-6">
              <motion.button
                onClick={() => {
                  playClick();
                  setIsFAQOpen(true);
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors group"
                {...animations.hoverScale}
              >
                <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm">FAQ</span>
              </motion.button>
              <motion.a 
                href="https://instagram.com/festiboxcl" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors group"
                {...animations.hoverScale}
                onClick={() => playClick()}
              >
                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm">Instagram</span>
              </motion.a>
              <motion.a 
                href="https://wa.me/message/TBSLQVGBXZ3QM1" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-gray-700 hover:text-secondary-600 transition-colors group"
                {...animations.hoverScale}
                onClick={() => playClick()}
              >
                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm">WhatsApp</span>
              </motion.a>
              <motion.a 
                href="mailto:contacto@festibox.cl" 
                className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors group"
                {...animations.hoverScale}
                onClick={() => playClick()}
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm">Email</span>
              </motion.a>
            </div>
            <div className="text-xs text-gray-600 flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              <span>© 2025 FestiBox.</span>
              <span className="flex items-center gap-1">
                Diseñado con <Heart className="w-3 h-3 text-red-500" /> en Chile
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Carrito de compras */}
      <ShoppingCartComponent
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCartCheckout}
      />

      {/* Modal de checkout */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onConfirm={handleCheckoutWithEmail}
        cartTotal={cartTotals.total}
        isProcessing={isProcessingPayment}
      />

      {/* Modal de confirmación de producto */}
      <AnimatePresence>
        {showConfirmationModal && pendingProduct && (
          <ProductConfirmationModal
            product={pendingProduct}
            onConfirm={handleConfirmProduct}
            onCancel={handleCancelProduct}
            hasCardOptions={pendingProduct.cardOptions && pendingProduct.cardOptions.length > 0}
          />
        )}
      </AnimatePresence>

      {/* Modal FAQ */}
      <FAQSection
        isOpen={isFAQOpen}
        onClose={() => setIsFAQOpen(false)}
      />
    </div>
  );
}

export default App;
