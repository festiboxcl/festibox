import { motion } from 'framer-motion';
import { assets } from '../assets';
import { animations } from '../utils/animations';
import { useSound } from '../hooks/useSound';
import type { Product } from '../types';

interface ProductSelectorProps {
  selectedProduct: Product | null;
  onProductChange: (product: Product) => void;
}

export function ProductSelector({ selectedProduct, onProductChange }: ProductSelectorProps) {
  const products = Object.values(assets.products);
  const { playSelect } = useSound();

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

    return `Desde ${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
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
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Elige tu producto FestiBox
      </h3>
      
      {/* Grid de productos mobile-first */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {products.map((product, index) => (
          <motion.button
            key={product.id}
            onClick={() => {
              playSelect();
              onProductChange(product);
            }}
            disabled={!(product as any).isAvailable}
            className={`relative rounded-lg border-2 transition-all ${
              selectedProduct?.id === product.id
                ? 'border-primary-600 ring-2 ring-primary-200'
                : 'border-gray-200 hover:border-primary-300'
            } ${
              !(product as any).isAvailable 
                ? 'opacity-60 cursor-not-allowed grayscale' 
                : ''
            }`}
            {...animations.cardHover}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Badge */}
            {(product as any).badge && (
              <div className={`absolute top-2 left-2 ${(product as any).badge.color} text-white text-xs font-bold px-2 py-1 rounded-full z-10`}>
                {(product as any).badge.text}
              </div>
            )}

            {/* Imagen del producto */}
            <div className="aspect-square overflow-hidden rounded-t-lg">
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover ${!(product as any).isAvailable ? 'grayscale' : ''}`}
              />
            </div>
            
            {/* Info del producto */}
            <div className="p-2 text-left">
              <h4 className={`font-medium text-xs lg:text-sm mb-1 leading-tight ${
                !(product as any).isAvailable ? 'text-gray-400' : 'text-gray-900'
              }`}>
                {product.name}
              </h4>
              <p className={`text-xs mb-2 line-clamp-2 ${
                !(product as any).isAvailable ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {product.description}
              </p>
              <div className="flex flex-col space-y-1">
                {/* Precio con descuento */}
                {(product as any).originalPrice ? (
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-primary-600 text-xs lg:text-sm leading-tight">
                      {getPriceRange(product)}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice((product as any).originalPrice)}
                    </span>
                  </div>
                ) : (
                  <span className={`font-bold text-xs lg:text-sm leading-tight ${
                    !(product as any).isAvailable ? 'text-gray-400' : 'text-primary-600'
                  }`}>
                    {getPriceRange(product)}
                  </span>
                )}
                <span className={`text-xs ${
                  !(product as any).isAvailable ? 'text-gray-400' : 'text-gray-400'
                }`}>
                  {getPhotoRange(product)}
                </span>
              </div>
            </div>
            
            {/* Indicador de selección */}
            {selectedProduct?.id === product.id && (product as any).isAvailable && (
              <div className="absolute -top-2 -right-2 bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
