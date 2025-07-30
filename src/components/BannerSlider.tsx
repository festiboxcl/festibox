import { useState, useEffect } from 'react';
import { assets } from '../assets';

export function BannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const banners = assets.banners;

  // Auto-play del slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000); // Cambia cada 6 segundos para dar más tiempo a las animaciones

    return () => clearInterval(interval);
  }, [banners.length]);

  // Manejo de animaciones cuando cambia el slide
  useEffect(() => {
    setIsImageLoaded(false);
    setShowContent(false);
    
    // Simular carga de imagen y mostrar contenido con delay
    const imageTimer = setTimeout(() => {
      setIsImageLoaded(true);
    }, 100);
    
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 400);

    return () => {
      clearTimeout(imageTimer);
      clearTimeout(contentTimer);
    };
  }, [currentSlide]);

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[450px] overflow-hidden rounded-none md:rounded-xl shadow-2xl">
      {/* Slides */}
      <div className="relative h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            {/* Imagen de fondo optimizada para móvil - mejor visibilidad */}
            <div className={`w-full h-full transition-all duration-1000 ${
              index === currentSlide && isImageLoaded 
                ? 'scale-100 opacity-100' 
                : 'scale-110 opacity-0'
            }`}>
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover object-center md:object-top"
                onLoad={() => index === currentSlide && setIsImageLoaded(true)}
              />
            </div>
            
            {/* Overlay más sutil en móvil para destacar mejor las fotos */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent"></div>
            
            {/* Contenido del texto mejor posicionado para móvil */}
            <div className="absolute inset-0 flex items-end md:items-center">
              <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 w-full">
                <div className="max-w-xl lg:max-w-2xl mb-10 md:mb-0">
                  {/* Título con mejor contraste en móvil */}
                  <h2 className={`text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight transition-all duration-800 text-center md:text-left drop-shadow-lg ${
                    index === currentSlide && showContent
                      ? 'translate-x-0 opacity-100'
                      : '-translate-x-10 opacity-0'
                  }`}>
                    {banner.title}
                  </h2>
                  
                  {/* Subtítulo con mejor legibilidad en móvil */}
                  <p className={`text-lg md:text-xl text-white/95 mb-6 md:mb-8 transition-all duration-800 delay-200 text-center md:text-left drop-shadow-md ${
                    index === currentSlide && showContent
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-5 opacity-0'
                  }`}>
                    {banner.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
