import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo';
import { BannerSlider } from './components/BannerSlider';
import { ProductSelector } from './components/ProductSelector';
import { UnifiedCustomizer } from './components/UnifiedCustomizer';
import { CardOptionSelector } from './components/CardOptionSelector';
import { ProductConfirmationModal } from './components/ProductConfirmationModal';
import { ShoppingCart, Heart, Camera, Palette, Gift, Instagram, MessageCircle, Mail } from 'lucide-react';
// import { assets } from './assets';
import { useProductWithOptions } from './hooks/useProductWithOptions';
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
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [currentStep, setCurrentStep] = useState<'product' | 'card-options' | 'customize'>('product');
  const [productConfiguration, setProductConfiguration] = useState<ProductConfiguration | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<any>(null);
  
  // Hook de sonidos
  const { playClick, playSuccess, playSelect, playHover } = useSound();
  
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

  const handleCustomizationComplete = (config: ProductConfiguration, photos: File[], _messages: string[]) => {
    setProductConfiguration(config);
    // Convertir Files a UploadedImages para compatibilidad
    const uploadedImages: UploadedImage[] = photos.map((file, index) => ({
      id: `photo-${index}`,
      file,
      preview: URL.createObjectURL(file),
      position: index + 1
    }));
    setImages(uploadedImages);
    // Agregar directamente al carrito sin paso de resumen
    handleAddToCart();
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
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
                className="p-2 text-gray-600 hover:text-primary-600 relative transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => playClick()}
                onHoverStart={() => playHover()}
              >
                <ShoppingCart className="h-4 w-4" />
                <AnimatePresence>
                  {isAddedToCart && (
                    <motion.span 
                      className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      1
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
            <div className="flex justify-center space-x-8 text-sm mb-6">
              <motion.a 
                href="https://instagram.com/festiboxcl" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors group"
                {...animations.hoverScale}
                onClick={() => playClick()}
              >
                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Instagram
              </motion.a>
              <motion.a 
                href="https://wa.me/56912345678" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-gray-700 hover:text-secondary-600 transition-colors group"
                {...animations.hoverScale}
                onClick={() => playClick()}
              >
                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                WhatsApp
              </motion.a>
              <motion.a 
                href="mailto:contacto@festibox.cl" 
                className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors group"
                {...animations.hoverScale}
                onClick={() => playClick()}
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Contacto
              </motion.a>
            </div>
            <div className="text-xs text-gray-600 flex items-center justify-center gap-2">
              <span>© 2025 FestiBox. Diseñado con</span>
              <Heart className="w-3 h-3 text-red-500" />
              <span>en Chile</span>
            </div>
          </div>
        </div>
      </footer>

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
    </div>
  );
}

export default App;
