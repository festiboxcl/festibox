import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface CubeSpace {
  type: 'photo' | 'message' | 'empty';
  content: any;
  position: number;
}

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
    console.log('🔍 Claves disponibles en product:', Object.keys(product));
    console.log('🔍 product.photos:', product.photos);
    console.log('🔍 product.images:', product.images);
    console.log('🔍 product.messages:', product.messages);
    console.log('🔍 product.customizations:', product.customizations);
    console.log('🔍 product.customizations?.messages:', product.customizations?.messages);
    console.log('🔍 product.configuration:', product.configuration);  if (!isOpen) {
    console.log('❌ Modal cerrado, no renderizando');
    return null;
  }

  if (!product) {
    console.log('❌ No hay producto, no renderizando');
    return null;
  }

  console.log('✅ Modal abierto y con producto, renderizando...');

  // Organizar fotos y mensajes por cubos usando la configuración
  const organizeContentByCubes = (): CubeSpace[][] => {
    const cubes: CubeSpace[][] = [];
    
    // Extraer datos según la estructura ShoppingCartItem
    let photos: any[] = [];
    let messages: string[] = [];
    
    // ShoppingCartItem tiene photos: File[] directamente
    if (product.photos?.length > 0) {
      photos = product.photos.filter(Boolean);
      console.log('📸 Fotos extraídas de photos:', photos.length, 'Tipos:', photos.map((p: any) => typeof p));
    }
    // Fallback para estructura CartItem con images: UploadedImage[]
    else if (product.images?.length > 0) {
      photos = product.images.map((img: any) => img.file).filter(Boolean);
      console.log('📸 Fotos extraídas de images:', photos.length, 'Tipos:', photos.map((p: any) => typeof p));
    }
    
    console.log('📸 Fotos finales:', photos);
    
    // ShoppingCartItem tiene messages: string[] directamente EN EL NIVEL PRINCIPAL
    if (product.messages?.length > 0) {
      messages = product.messages.filter(Boolean);
      console.log('💬 Mensajes extraídos de messages (nivel principal):', messages.length);
    }
    // Fallback para customizations
    else if (product.customizations?.messages?.length > 0) {
      messages = product.customizations.messages.filter(Boolean);
      console.log('💬 Mensajes extraídos de customizations:', messages.length);
    }
    
    console.log('💬 Mensajes finales:', messages);
    console.log('💬 Detalles de mensajes:', messages.map((m, i) => `${i + 1}: "${m}"`));
    
    const configuration = product.configuration || product.customizations?.configuration;
    
    console.log('🔧 Configuración:', configuration);
    console.log('📸 Fotos disponibles:', photos.length);
    console.log('💬 Mensajes disponibles:', messages.length);
    
    if (!configuration || !configuration.cubes || configuration.cubes.length === 0) {
      console.warn('⚠️ No hay configuración de cubos válida, usando fallback');
      // Fallback para productos sin configuración clara
      const isTriple = product.product?.name?.toLowerCase()?.includes('triple') || false;
      const cubeCount = isTriple ? 3 : 1;
      const spacesPerCube = 4;
      
      console.log('🔧 Fallback - Creando', cubeCount, 'cubo(s) con', spacesPerCube, 'espacios cada uno');
      console.log('📸 Fotos disponibles para organizar:', photos.length);
      console.log('💬 Mensajes disponibles para organizar:', messages.length);
      
      for (let cubeIndex = 0; cubeIndex < cubeCount; cubeIndex++) {
        const cubeSpaces: CubeSpace[] = [];
        
        // Primero llenar con fotos disponibles
        let photoIndex = cubeIndex * spacesPerCube;
        let messageIndex = 0;
        
        for (let spaceIndex = 0; spaceIndex < spacesPerCube; spaceIndex++) {
          let spaceContent = null;
          let spaceType: 'photo' | 'message' | 'empty' = 'empty';
          
          // Si hay una foto disponible para este espacio
          if (photoIndex < photos.length && photos[photoIndex]) {
            spaceContent = photos[photoIndex];
            spaceType = 'photo';
            photoIndex++;
          }
          // Si no hay foto, pero hay mensaje disponible
          else if (messageIndex < messages.length && messages[messageIndex]) {
            spaceContent = messages[messageIndex];
            spaceType = 'message';
            messageIndex++;
          }
          // Si no hay contenido, dejar vacío
          else {
            spaceContent = null;
            spaceType = 'empty';
          }
          
          cubeSpaces.push({
            type: spaceType,
            content: spaceContent,
            position: spaceIndex + 1,
          });
          
          console.log(`📦 Cubo ${cubeIndex + 1}, Espacio ${spaceIndex + 1}:`, {
            photoIndex: photoIndex - 1,
            messageIndex: messageIndex - (spaceType === 'message' ? 1 : 0),
            type: spaceType,
            hasContent: !!spaceContent
          });
        }
        cubes.push(cubeSpaces);
      }
      return cubes;
    }
    
    // Usar configuración real
    let photoIndex = 0;
    let messageIndex = 0;
    
    configuration.cubes.forEach((cubeConfig: any) => {
      const cubeSpaces: CubeSpace[] = [];
      
      // Agregar fotos para este cubo
      for (let i = 0; i < cubeConfig.photos && photoIndex < photos.length; i++) {
        cubeSpaces.push({
          type: 'photo' as const,
          content: photos[photoIndex],
          position: cubeSpaces.length + 1,
        });
        photoIndex++;
      }
      
      // Agregar mensajes para este cubo
      for (let i = 0; i < cubeConfig.messages && messageIndex < messages.length; i++) {
        cubeSpaces.push({
          type: 'message' as const,
          content: messages[messageIndex],
          position: cubeSpaces.length + 1,
        });
        messageIndex++;
      }
      
      // Rellenar espacios vacíos hasta 4
      while (cubeSpaces.length < 4) {
        cubeSpaces.push({
          type: 'empty' as const,
          content: null,
          position: cubeSpaces.length + 1,
        });
      }
      
      cubes.push(cubeSpaces);
    });
    
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
                    {cube.map((space: CubeSpace, spaceIndex: number) => (
                      <div 
                        key={spaceIndex}
                        className="aspect-square rounded-lg border-2 border-gray-200 bg-white p-2 flex flex-col items-center justify-center text-center"
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          {space.position}
                        </div>
                        
                        {space.type === 'photo' && space.content && (
                          <div className="w-full h-full overflow-hidden rounded">
                            <img 
                              src={typeof space.content === 'string' ? space.content : URL.createObjectURL(space.content)}
                              alt={`Foto ${spaceIndex + 1}`}
                              className="w-full h-full object-cover"
                              onLoad={() => console.log('✅ Imagen cargada:', spaceIndex + 1)}
                              onError={(e) => {
                                console.error('❌ Error cargando imagen:', spaceIndex + 1, space.content);
                                console.error('Error details:', e);
                              }}
                            />
                          </div>
                        )}
                        
                        {space.type === 'message' && space.content && (
                          <div className="w-full h-full flex items-center justify-center bg-yellow-50 rounded p-1">
                            <p className="text-xs text-gray-700 break-words">
                              {space.content}
                            </p>
                          </div>
                        )}
                        
                        {space.type === 'empty' && (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded border-dashed border-gray-300 border-2">
                            <span className="text-xs text-gray-400">Vacío</span>
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
                {cubes[0]?.map((space: CubeSpace, spaceIndex: number) => (
                  <div 
                    key={spaceIndex}
                    className="aspect-square rounded-lg border-2 border-gray-200 bg-white p-2 flex flex-col items-center justify-center text-center"
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {space.position}
                    </div>
                    
                    {space.type === 'photo' && space.content && (
                      <div className="w-full h-full overflow-hidden rounded">
                        <img 
                          src={typeof space.content === 'string' ? space.content : URL.createObjectURL(space.content)}
                          alt={`Foto ${spaceIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {space.type === 'message' && space.content && (
                      <div className="w-full h-full flex items-center justify-center bg-yellow-50 rounded p-1">
                        <p className="text-xs text-gray-700 break-words">
                          {space.content}
                        </p>
                      </div>
                    )}
                    
                    {space.type === 'empty' && (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded border-dashed border-gray-300 border-2">
                        <span className="text-xs text-gray-400">Vacío</span>
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
