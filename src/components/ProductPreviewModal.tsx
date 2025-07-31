import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

export function ProductPreviewModal({ isOpen, onClose, product }: ProductPreviewModalProps) {
  // Debug completo
  console.log('🎭 ProductPreviewModal render');
  console.log('🔓 isOpen:', isOpen);
  console.log('📦 Product data received:', product);
  
  if (!isOpen) {
    console.log('❌ Modal cerrado, no renderizando');
    return null;
  }

  if (!product) {
    console.log('❌ No hay producto, no renderizando');
    return null;
  }

  console.log('✅ Modal abierto y con producto, renderizando...');

  // Organizar fotos y mensajes por cubos
  const organizeContentByCubes = () => {
    const cubes = [];
    const isTriple = product.product?.name?.toLowerCase()?.includes('triple') || false;
    const cubeCount = isTriple ? 3 : 1;
    const spacesPerCube = 4;

    // Extraer fotos y mensajes de la estructura correcta
    const photos = product.images?.map((img: any) => img.file) || [];
    const messages = product.customizations?.messages || [];

    for (let cubeIndex = 0; cubeIndex < cubeCount; cubeIndex++) {
      const cubeSpaces = [];
      for (let spaceIndex = 0; spaceIndex < spacesPerCube; spaceIndex++) {
        const globalIndex = cubeIndex * spacesPerCube + spaceIndex;
        cubeSpaces.push({
          photo: photos[globalIndex] || null,
          message: messages[globalIndex] || '',
          position: spaceIndex + 1,
        });
      }
      cubes.push(cubeSpaces);
    }
    return cubes;
  };

  const cubes = organizeContentByCubes();
  const isTriple = cubes.length > 1;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/30 bg-gradient-to-r from-primary-50/80 to-secondary-50/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Vista Previa</h3>
              <p className="text-gray-600 text-sm mt-1">{product.product?.name || 'Producto personalizado'}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white/50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {isTriple ? (
            // Vista para tarjeta triple - mostrar cubos separados
            <div className="space-y-8">
              {cubes.map((cube, cubeIndex) => (
                <div key={cubeIndex} className="border border-white/30 rounded-lg p-4 bg-white/50 backdrop-blur-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                      Cubo {cubeIndex + 1}
                    </span>
                    <span className="text-sm text-gray-500">4 espacios</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {cube.map((space, spaceIndex) => (
                      <div key={spaceIndex} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        {space.photo ? (
                          <div className="relative w-full h-full">
                            <img
                              src={URL.createObjectURL(space.photo)}
                              alt={`Cubo ${cubeIndex + 1} - Espacio ${space.position}`}
                              className="w-full h-full object-cover"
                            />
                            {space.message && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white p-2">
                                <p className="text-xs leading-tight line-clamp-2">
                                  {space.message}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            {space.message ? (
                              <div className="text-center p-2">
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  {space.message}
                                </p>
                              </div>
                            ) : (
                              <>
                                <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-1">
                                  <span className="text-lg">📷</span>
                                </div>
                                <p className="text-xs">Espacio {space.position}</p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Vista para tarjeta simple - mostrar grid único
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                  Tarjeta Simple
                </span>
                <span className="text-sm text-gray-500">4 espacios</span>
              </h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {cubes[0]?.map((space, spaceIndex) => (
                  <div key={spaceIndex} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    {space.photo ? (
                      <div className="relative w-full h-full">
                        <img
                          src={URL.createObjectURL(space.photo)}
                          alt={`Espacio ${space.position}`}
                          className="w-full h-full object-cover"
                        />
                        {space.message && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white p-2">
                            <p className="text-xs leading-tight line-clamp-2">
                              {space.message}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        {space.message ? (
                          <div className="text-center p-2">
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {space.message}
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-1">
                              <span className="text-lg">📷</span>
                            </div>
                            <p className="text-xs">Espacio {space.position}</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer con información */}
        <div className="p-4 bg-white/50 border-t border-white/30">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isTriple 
                ? `🎯 Tarjeta triple: ${cubes.length} cubos con 4 espacios cada uno`
                : '🎯 Tarjeta simple: 1 cubo con 4 espacios'
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Las fotos y mensajes se imprimirán en el orden mostrado
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
