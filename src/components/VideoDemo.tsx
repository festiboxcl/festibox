import { useState } from 'react';
import { Play, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSound } from '../hooks/useSound';

export function VideoDemo() {
  const { playClick, playTap } = useSound();
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0);

  // Videos de demostración con simulación visual
  const demoVideos = [
    {
      id: 'CQptRMHC1nC',
      url: 'https://www.instagram.com/p/CQptRMHC1nC/',
      title: 'Tarjeta explosiva clásica',
      description: 'Mira cómo se abre una tarjeta explosiva con fotos familiares',
      previewType: 'opening',
      emoji: '📸'
    },
    {
      id: 'C4gql7YPZMw',
      url: 'https://www.instagram.com/p/C4gql7YPZMw/',
      title: 'Sorpresa especial',
      description: 'Una tarjeta explosiva llena de recuerdos únicos',
      previewType: 'surprise',
      emoji: '🎁'
    },
    {
      id: 'ClMOU3Ytzgm',
      url: 'https://www.instagram.com/p/ClMOU3Ytzgm/',
      title: 'Momento mágico',
      description: 'La reacción perfecta al abrir una tarjeta personalizada',
      previewType: 'reaction',
      emoji: '✨'
    },
    {
      id: 'CjKUfs_K0-a',
      url: 'https://www.instagram.com/p/CjKUfs_K0-a/',
      title: 'Regalo perfecto',
      description: 'Una tarjeta explosiva para ocasiones especiales',
      previewType: 'gift',
      emoji: '💝'
    },
    {
      id: 'Ckurt3NoC2k',
      url: 'https://www.instagram.com/p/Ckurt3NoC2k/',
      title: 'Diseño increíble',
      description: 'Detalles únicos que hacen la diferencia',
      previewType: 'design',
      emoji: '🎨'
    },
    {
      id: 'CUD7FQqpjo6',
      url: 'https://www.instagram.com/p/CUD7FQqpjo6/',
      title: 'Creatividad pura',
      description: 'Ideas originales para personalizar tu tarjeta',
      previewType: 'creative',
      emoji: '💡'
    },
    {
      id: 'CQflBHrLXbz',
      url: 'https://www.instagram.com/p/CQflBHrLXbz/?img_index=1',
      title: 'Resultado final',
      description: 'El resultado espectacular de una tarjeta bien hecha',
      previewType: 'final',
      emoji: '🏆'
    }
  ];

  return (
    <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
          <Play className="w-6 h-6 text-primary-600" />
          ¿Cómo funciona una tarjeta explosiva?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Mira estos videos para entender la magia de las tarjetas explosivas. 
          Cada tarjeta se abre de forma espectacular revelando tus fotos y mensajes más especiales.
        </p>
      </div>

      {/* Carrusel de videos de demostración */}
      <div className="relative max-w-4xl mx-auto">
        <div className="overflow-hidden rounded-lg">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentDemoIndex * 100}%)` }}
          >
            {demoVideos.map((video) => (
              <div key={video.id} className="w-full flex-shrink-0 px-2">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 max-w-md mx-auto">
                  <VideoPreview video={video} onPlay={() => {
                    playClick();
                    window.open(video.url, '_blank', 'noopener,noreferrer');
                  }} />
                  
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{video.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{video.description}</p>
                  
                  <button
                    onClick={() => {
                      playClick();
                      window.open(video.url, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 hover:scale-[1.02] shadow-md hover:shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver video completo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controles de navegación */}
        {demoVideos.length > 1 && (
          <>
            <button
              onClick={() => {
                playClick();
                setCurrentDemoIndex(prev => prev > 0 ? prev - 1 : demoVideos.length - 1);
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all duration-200 border border-gray-200 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                playClick();
                setCurrentDemoIndex(prev => prev < demoVideos.length - 1 ? prev + 1 : 0);
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all duration-200 border border-gray-200 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicadores de página */}
        <div className="flex justify-center gap-2 mt-6">
          {demoVideos.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                playTap();
                setCurrentDemoIndex(index);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentDemoIndex 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div className="text-center mt-6 p-4 bg-white/70 rounded-xl border border-white/50 max-w-2xl mx-auto">
        <p className="text-gray-700 font-medium">
          🎉 <strong>¡Ahora crea la tuya!</strong> Personaliza cada cara del cubo con tus fotos y mensajes favoritos para crear un regalo único e inolvidable.
        </p>
      </div>
    </section>
  );
}

// Componente de vista previa visual que simula el contenido del video
function VideoPreview({ video, onPlay }: { video: any, onPlay: () => void }) {
  const renderPreviewContent = () => {
    switch (video.previewType) {
      case 'opening':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-pink-100 via-white to-blue-100 rounded-lg overflow-hidden">
            {/* Simulación de tarjeta cerrada que se abre */}
            <div className="absolute inset-4 bg-white rounded-lg shadow-lg border-2 border-gray-300 transform transition-transform duration-1000 hover:scale-110 hover:rotate-1">
              <div className="p-3 h-full flex flex-col justify-center items-center">
                <div className="text-3xl mb-2">{video.emoji}</div>
                <div className="w-full h-2 bg-gray-200 rounded mb-2"></div>
                <div className="w-3/4 h-2 bg-gray-200 rounded mb-2"></div>
                <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary-500 rounded"></div>
                </div>
                <div className="absolute bottom-2 left-2 w-4 h-4 bg-secondary-100 rounded"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-accent-100 rounded"></div>
              </div>
            </div>
            {/* Efecto de "explosión" */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-400 rounded-full animate-ping"></div>
              <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-secondary-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-1/4 left-3/4 w-1.5 h-1.5 bg-accent-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        );

      case 'surprise':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-100 rounded-lg overflow-hidden">
            <div className="absolute inset-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-4 transform hover:scale-105 transition-transform">
              <div className="h-full bg-white rounded p-2 relative overflow-hidden">
                <div className="text-center">
                  <div className="text-4xl mb-2">{video.emoji}</div>
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-gray-200 rounded"></div>
                    <div className="w-5/6 h-1.5 bg-gray-200 rounded mx-auto"></div>
                    <div className="w-3/4 h-1.5 bg-gray-200 rounded mx-auto"></div>
                  </div>
                </div>
                {/* Corazones flotantes */}
                <div className="absolute top-1 right-1 text-red-400 animate-bounce">💖</div>
                <div className="absolute bottom-1 left-1 text-yellow-400 animate-pulse">⭐</div>
                <div className="absolute top-1/2 left-1 text-pink-400 animate-bounce" style={{ animationDelay: '0.3s' }}>💝</div>
              </div>
            </div>
          </div>
        );

      case 'reaction':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 rounded-lg overflow-hidden">
            <div className="absolute inset-3 bg-white rounded-lg shadow-inner p-3">
              <div className="text-center h-full flex flex-col justify-center">
                <div className="text-5xl mb-2 animate-pulse">{video.emoji}</div>
                <div className="space-y-2">
                  <div className="w-full h-2 bg-gradient-to-r from-primary-200 to-secondary-200 rounded"></div>
                  <div className="w-4/5 h-2 bg-gradient-to-r from-secondary-200 to-accent-200 rounded mx-auto"></div>
                </div>
                {/* Emojis de reacción */}
                <div className="absolute top-2 left-2 animate-spin text-xl">😍</div>
                <div className="absolute top-2 right-2 animate-bounce text-xl">🥺</div>
                <div className="absolute bottom-2 left-2 animate-pulse text-xl">😭</div>
                <div className="absolute bottom-2 right-2 animate-bounce text-xl" style={{ animationDelay: '0.5s' }}>🤗</div>
              </div>
            </div>
          </div>
        );

      case 'gift':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 rounded-lg overflow-hidden">
            <div className="absolute inset-2 bg-gradient-to-b from-red-400 to-red-600 rounded-lg p-1">
              <div className="h-full bg-white rounded p-3 relative">
                <div className="text-center">
                  <div className="text-4xl mb-3">{video.emoji}</div>
                  <div className="space-y-1">
                    <div className="w-full h-1 bg-red-200 rounded"></div>
                    <div className="w-5/6 h-1 bg-red-200 rounded mx-auto"></div>
                    <div className="w-2/3 h-1 bg-red-200 rounded mx-auto"></div>
                  </div>
                </div>
                {/* Lazo del regalo */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-yellow-400 rounded-b"></div>
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-8 bg-yellow-400"></div>
                {/* Brillos */}
                <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
                <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0.7s' }}></div>
              </div>
            </div>
          </div>
        );

      case 'design':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-lg overflow-hidden">
            <div className="absolute inset-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg p-1">
              <div className="h-full bg-white rounded p-2 relative">
                <div className="grid grid-cols-2 gap-1 h-full">
                  <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded flex items-center justify-center">
                    <div className="text-lg">{video.emoji}</div>
                  </div>
                  <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 rounded flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div className="bg-gradient-to-br from-accent-100 to-accent-200 rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded"></div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded flex items-center justify-center">
                    <div className="w-2 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                {/* Detalles decorativos */}
                <div className="absolute top-1 right-1 w-2 h-2 bg-gold-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1 left-1 w-1 h-1 bg-silver-400 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        );

      case 'creative':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100 rounded-lg overflow-hidden">
            <div className="absolute inset-2 bg-white rounded-lg shadow-lg p-3">
              <div className="text-center h-full flex flex-col justify-center relative">
                <div className="text-4xl mb-2 animate-bounce">{video.emoji}</div>
                <div className="space-y-1">
                  <div className="w-full h-1 bg-gradient-to-r from-yellow-300 to-orange-300 rounded"></div>
                  <div className="w-3/4 h-1 bg-gradient-to-r from-orange-300 to-red-300 rounded mx-auto"></div>
                  <div className="w-1/2 h-1 bg-gradient-to-r from-red-300 to-pink-300 rounded mx-auto"></div>
                </div>
                {/* Ideas creativas */}
                <div className="absolute top-1 left-1 text-yellow-400 animate-spin text-sm">💡</div>
                <div className="absolute top-1 right-1 text-blue-400 animate-pulse text-sm">🎨</div>
                <div className="absolute bottom-1 left-1 text-green-400 animate-bounce text-sm">✨</div>
                <div className="absolute bottom-1 right-1 text-purple-400 animate-pulse text-sm">🌟</div>
              </div>
            </div>
          </div>
        );

      case 'final':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-gold-100 via-yellow-50 to-orange-100 rounded-lg overflow-hidden">
            <div className="absolute inset-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-lg p-1">
              <div className="h-full bg-white rounded p-2 relative">
                <div className="text-center h-full flex flex-col justify-center">
                  <div className="text-5xl mb-2 animate-pulse">{video.emoji}</div>
                  <div className="text-xs font-bold text-gray-700 mb-2">RESULTADO</div>
                  <div className="space-y-1">
                    <div className="w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded"></div>
                    <div className="w-4/5 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded mx-auto"></div>
                    <div className="w-3/5 h-1 bg-gradient-to-r from-red-400 to-pink-400 rounded mx-auto"></div>
                  </div>
                </div>
                {/* Confetti effect */}
                <div className="absolute top-0 left-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                <div className="absolute bottom-0 right-1/3 w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-2xl">{video.emoji}</div>
          </div>
        );
    }
  };

  return (
    <div className="aspect-square bg-gray-50 rounded-lg mb-4 relative overflow-hidden cursor-pointer group" onClick={onPlay}>
      {renderPreviewContent()}
      
      {/* Overlay de play */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
        <div className="w-16 h-16 bg-white/90 group-hover:bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
          <Play className="w-8 h-8 text-primary-600 ml-1" />
        </div>
      </div>
      
      {/* Badge de Instagram */}
      <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
        Instagram
      </div>
    </div>
  );
}
