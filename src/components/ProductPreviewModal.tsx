import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

export function ProductPreviewModal({ isOpen, onClose, product }: ProductPreviewModalProps) {
  const [rotationY, setRotationY] = useState(0);
  const [currentCube, setCurrentCube] = useState(0);
  const [scale, setScale] = useState(1);

  if (!isOpen) return null;

  // Organizar fotos y mensajes por cubos
  const organizeContentByCubes = () => {
    const cubes = [];
    const isTriple = product.name.toLowerCase().includes('triple');
    const cubeCount = isTriple ? 3 : 1;
    const spacesPerCube = 4;

    for (let cubeIndex = 0; cubeIndex < cubeCount; cubeIndex++) {
      const cubeSpaces = [];
      for (let spaceIndex = 0; spaceIndex < spacesPerCube; spaceIndex++) {
        const globalIndex = cubeIndex * spacesPerCube + spaceIndex;
        cubeSpaces.push({
          photo: product.photos[globalIndex] || null,
          message: product.messages[globalIndex] || '',
          face: ['front', 'right', 'back', 'left'][spaceIndex],
        });
      }
      cubes.push(cubeSpaces);
    }
    return cubes;
  };

  const cubes = organizeContentByCubes();
  const totalCubes = cubes.length;

  const handleRotate = () => {
    setRotationY(prev => prev + 90);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
              <h3 className="text-xl font-bold text-gray-900">Vista Previa 3D</h3>
              <p className="text-gray-600 text-sm mt-1">{product.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white/50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-white/30 bg-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {totalCubes > 1 && (
                <>
                  <span className="text-sm font-medium text-gray-700">Cubo:</span>
                  <div className="flex gap-2">
                    {cubes.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentCube(index)}
                        className={`px-3 py-1 rounded-lg text-sm transition-all ${
                          currentCube === index
                            ? 'bg-primary-100 text-primary-700 font-medium'
                            : 'bg-white/70 text-gray-600 hover:bg-white'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 bg-white/70 hover:bg-white rounded-lg transition-colors"
                title="Alejar"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 bg-white/70 hover:bg-white rounded-lg transition-colors"
                title="Acercar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 bg-white/70 hover:bg-white rounded-lg transition-colors"
                title="Rotar"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3D Preview */}
        <div className="p-8 min-h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-50/50 to-gray-100/50">
          <div 
            className="relative"
            style={{
              transform: `scale(${scale})`,
              transition: 'transform 0.3s ease',
            }}
          >
            {/* Cube Container */}
            <div
              className="relative preserve-3d"
              style={{
                width: '200px',
                height: '200px',
                transformStyle: 'preserve-3d',
                transform: `rotateY(${rotationY}deg) rotateX(-10deg)`,
                transition: 'transform 0.6s ease',
              }}
            >
              {/* Cube Faces */}
              {cubes[currentCube]?.map((space, faceIndex) => {
                const faceTransforms = [
                  'translateZ(100px)', // front
                  'rotateY(90deg) translateZ(100px)', // right
                  'rotateY(180deg) translateZ(100px)', // back
                  'rotateY(-90deg) translateZ(100px)', // left
                ];

                return (
                  <div
                    key={faceIndex}
                    className="absolute w-full h-full border-2 border-white/30 rounded-lg overflow-hidden shadow-lg"
                    style={{
                      transform: faceTransforms[faceIndex],
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    {space.photo ? (
                      <div className="relative w-full h-full">
                        <img
                          src={URL.createObjectURL(space.photo)}
                          alt={`Cara ${faceIndex + 1}`}
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
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        {space.message ? (
                          <div className="text-center p-4">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {space.message}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400">
                            <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
                              <span className="text-2xl">📷</span>
                            </div>
                            <p className="text-xs">Sin contenido</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-white/50 border-t border-white/30">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              🎯 Usa los controles para rotar, hacer zoom y navegar entre cubos
            </p>
            {totalCubes > 1 && (
              <p className="text-xs text-gray-500 mt-1">
                Estás viendo el cubo {currentCube + 1} de {totalCubes}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
