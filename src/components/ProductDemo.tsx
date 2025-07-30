import { useState } from 'react';
import { Play, Volume2, VolumeX, ExternalLink } from 'lucide-react';

interface DemoVideo {
  id: string;
  title: string;
  description: string;
  instagramUrl: string;
  embedUrl: string;
  thumbnail: string;
}

interface ProductDemoProps {
  product: {
    name: string;
    description: string;
  };
}

export function ProductDemo({ product }: ProductDemoProps) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);

  // Videos de demostración - aquí puedes agregar las URLs reales de Instagram
  const demoVideos: DemoVideo[] = [
    {
      id: 'demo1',
      title: 'Momento de la explosión',
      description: 'Mira cómo se abren las fotos de forma espectacular',
      instagramUrl: 'https://www.instagram.com/p/EJEMPLO1', // URL real de Instagram
      embedUrl: 'https://www.instagram.com/p/EJEMPLO1/embed', // URL de embed
      thumbnail: '/src/assets/images/Banner 1.png' // Imagen temporal
    },
    {
      id: 'demo2',
      title: 'Reacción de sorpresa',
      description: 'La cara de felicidad al recibir la tarjeta',
      instagramUrl: 'https://www.instagram.com/p/EJEMPLO2',
      embedUrl: 'https://www.instagram.com/p/EJEMPLO2/embed',
      thumbnail: '/src/assets/images/Banner 2.png'
    },
    {
      id: 'demo3',
      title: 'Proceso completo',
      description: 'Desde el primer momento hasta la explosión final',
      instagramUrl: 'https://www.instagram.com/p/EJEMPLO3',
      embedUrl: 'https://www.instagram.com/p/EJEMPLO3/embed',
      thumbnail: '/src/assets/images/Banner 3.png'
    }
  ];

  const handleVideoClick = (videoId: string) => {
    setActiveVideo(activeVideo === videoId ? null : videoId);
  };

  const openInstagram = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          ¿Cómo funciona tu {product.name}?
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Mira estos videos reales de nuestros clientes experimentando la magia de las tarjetas explosivas. 
          ¡La sorpresa y alegría son garantizadas! 🎉
        </p>
      </div>

      {/* Grid de videos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {demoVideos.map((video) => (
          <div key={video.id} className="group relative">
            {/* Contenedor del video */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              {activeVideo === video.id ? (
                // Video embed de Instagram
                <div className="aspect-[9/16] relative">
                  <iframe
                    src={video.embedUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    title={video.title}
                  />
                  
                  {/* Controles superpuestos */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => setMuted(!muted)}
                      className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
                    >
                      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openInstagram(video.instagramUrl)}
                      className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // Thumbnail con botón de play
                <div 
                  className="aspect-[9/16] relative cursor-pointer bg-gradient-to-br from-gray-100 to-gray-200"
                  onClick={() => handleVideoClick(video.id)}
                >
                  {/* Imagen de fondo temporal */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 to-secondary-100/30 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-primary-600 ml-1" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 bg-white/80 rounded-full px-3 py-1">
                        Ver demo
                      </p>
                    </div>
                  </div>
                  
                  {/* Etiqueta de Instagram */}
                  <div className="absolute top-3 left-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      📷 Instagram
                    </div>
                  </div>
                </div>
              )}
              
              {/* Información del video */}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1">{video.title}</h4>
                <p className="text-sm text-gray-600">{video.description}</p>
                
                {/* Botón para ver en Instagram */}
                <button
                  onClick={() => openInstagram(video.instagramUrl)}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver en Instagram
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
          <h4 className="text-lg font-bold text-gray-900 mb-2">
            ¡Crea tu propia sorpresa!
          </h4>
          <p className="text-gray-600 mb-4">
            Personaliza tu {product.name} con fotos y mensajes únicos. 
            La reacción de alegría será inolvidable.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Fácil de personalizar
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Momentos únicos
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Sorpresa garantizada
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
