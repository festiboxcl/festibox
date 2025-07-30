import { X, Camera, Palette, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { animations } from '../utils/animations';
import { useSound } from '../hooks/useSound';
import type { Product } from '../types';

interface ProductConfirmationModalProps {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
  hasCardOptions: boolean;
}

export function ProductConfirmationModal({ 
  product, 
  onConfirm, 
  onCancel, 
  hasCardOptions 
}: ProductConfirmationModalProps) {
  const { playClick, playSelect } = useSound();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  // Función para obtener el rango de precios de un producto
  const getPriceRange = (product: Product) => {
    if (!product.cardOptions || product.cardOptions.length === 0) {
      return formatPrice(product.price);
    }

    const prices = product.cardOptions.map(option => 
      product.basePrice + option.priceModifier
    );
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return formatPrice(minPrice);
    }

    return `Desde ${formatPrice(minPrice)}`;
  };

  // Función para obtener el rango de fotos de un producto
  const getPhotoRange = (product: Product) => {
    if (!product.cardOptions || product.cardOptions.length === 0) {
      return `${product.imageCount} fotos`;
    }

    const photoCounts = product.cardOptions.map(option => 
      option.cubes * option.spacesPerCube
    );
    const minPhotos = Math.min(...photoCounts);
    const maxPhotos = Math.max(...photoCounts);

    if (minPhotos === maxPhotos) {
      return `${minPhotos} fotos`;
    }

    return `${minPhotos}-${maxPhotos} fotos`;
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50"
        {...animations.modalOverlay}
      >
        <motion.div 
          className="relative max-w-sm w-full mx-4"
          {...animations.modalContent}
        >
          {/* Efecto liquid glass con múltiples capas */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-100/20 via-transparent to-secondary-100/20 rounded-2xl"></div>
          
          {/* Contenido del modal */}
          <div className="relative overflow-hidden rounded-2xl">
            {/* Header compacto con imagen */}
            <div className="relative">
              <motion.button
                onClick={() => {
                  playClick();
                  onCancel();
                }}
                className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-colors shadow-lg"
                {...animations.hoverScale}
              >
                <X className="w-4 h-4 text-gray-600" />
              </motion.button>
            
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Badge si existe */}
            {(product as any).badge && (
              <div className={`absolute top-3 left-3 ${(product as any).badge.color} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg`}>
                {(product as any).badge.text}
              </div>
            )}
          </div>

          {/* Contenido compacto */}
          <div className="p-4 bg-white/80 backdrop-blur-sm">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm leading-tight">
                {product.description}
              </p>
            </div>

            {/* Información compacta */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 mb-4 border border-white/40">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {getPhotoRange(product)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-600">
                    {getPriceRange(product)}
                  </div>
                  {(product as any).originalPrice && (
                    <div className="text-xs text-gray-400 line-through">
                      {formatPrice((product as any).originalPrice)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mini preview del proceso - más compacto */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mb-1">
                    <Camera className="w-3 h-3 text-primary-600" />
                  </div>
                  <span className="text-xs text-gray-600">Fotos</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mb-1">
                    <Palette className="w-3 h-3 text-primary-600" />
                  </div>
                  <span className="text-xs text-gray-600">Creamos</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mb-1">
                    <Gift className="w-3 h-3 text-primary-600" />
                  </div>
                  <span className="text-xs text-gray-600">¡Sorprende!</span>
                </div>
              </div>
            </div>

            {/* Botones compactos */}
            <div className="space-y-2">
              <motion.button
                onClick={() => {
                  playSelect();
                  onConfirm();
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                {...animations.buttonPress}
              >
                {hasCardOptions ? 'Elegir tipo de tarjeta' : `Personalizar ahora`}
              </motion.button>
              
              <motion.button
                onClick={() => {
                  playClick();
                  onCancel();
                }}
                className="w-full py-2 px-4 bg-white/60 backdrop-blur-sm border border-white/40 text-gray-700 rounded-xl font-medium hover:bg-white/80 transition-all duration-300"
                {...animations.hoverScale}
              >
                Elegir otro producto
              </motion.button>
            </div>
          </div>
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
