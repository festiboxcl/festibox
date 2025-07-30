import { ArrowLeft, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { animations } from '../utils/animations';
import { useSound } from '../hooks/useSound';
import type { Product } from '../types';

interface CardOptionSelectorProps {
  product: Product;
  selectedOption: string;
  onOptionChange: (optionId: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function CardOptionSelector({ product, selectedOption, onOptionChange, onContinue, onBack }: CardOptionSelectorProps) {
  const { playClick, playSelect } = useSound();
  
  if (!product.cardOptions || product.cardOptions.length === 0) {
    return null; // No mostrar selector si no hay opciones
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50"
        {...animations.modalOverlay}
      >
        <motion.div 
          className="relative max-w-lg w-full mx-4"
          {...animations.modalContent}
        >
          {/* Efecto liquid glass con múltiples capas */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-100/20 via-transparent to-secondary-100/20 rounded-2xl"></div>
        
          {/* Contenido del modal */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="bg-white/80 backdrop-blur-sm p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                Elige tu tipo de tarjeta explosiva
              </h3>
              
              <div className="space-y-3">
                {product.cardOptions.map((option, index) => {
                  const isSelected = selectedOption === option.id;
                  const totalPrice = product.basePrice + option.priceModifier;
                  
                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => {
                        playSelect();
                        onOptionChange(option.id);
                      }}
                      className={`relative w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        isSelected
                          ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-secondary-50 shadow-lg scale-[1.02]'
                          : 'border-white/30 bg-white/60 backdrop-blur-sm hover:border-primary-300 hover:bg-white/80 hover:scale-[1.01]'
                      }`}
                      {...animations.hoverScale}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Imagen compacta */}
                        <div className="flex-shrink-0">
                          <img
                            src={option.image}
                            alt={option.name}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          />
                        </div>
                        
                        {/* Información */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-sm ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                            {option.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {option.cubes} cubo{option.cubes > 1 ? 's' : ''} • {option.cubes * option.spacesPerCube} fotos
                          </p>
                          <div className="text-lg font-bold text-primary-600 mt-1">
                            {formatPrice(totalPrice)}
                          </div>
                        </div>
                        
                        {/* Indicador de selección */}
                        <div className="flex-shrink-0">
                          <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                            isSelected
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && (
                              <motion.svg 
                                className="w-3 h-3 text-white" 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              >
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </motion.svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Botones de acción */}
              <div className="mt-6 flex gap-3">
                <motion.button
                  onClick={() => {
                    playClick();
                    onBack();
                  }}
                  className="flex-1 py-2.5 px-4 bg-white/60 backdrop-blur-sm border border-white/40 text-gray-700 rounded-xl font-medium hover:bg-white/80 transition-all duration-300 flex items-center justify-center gap-2"
                  {...animations.hoverScale}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    playClick();
                    onContinue();
                  }}
                  disabled={!selectedOption}
                  className={`flex-1 py-2.5 px-4 bg-gradient-to-r text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group ${
                    selectedOption 
                      ? 'from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 hover:scale-[1.02]' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  {...animations.buttonPress}
                >
                  <Palette className={`w-4 h-4 transition-transform duration-300 ${selectedOption ? 'group-hover:rotate-12' : ''}`} />
                  <span>Personalizar ahora</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
