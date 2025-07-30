import { useEffect, useRef, useState } from 'react';

export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return { ref, isVisible };
};

export const useHoverSound = () => {
  const [audio] = useState(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/abrio-select.mp3');
      audio.volume = 0.02; // Más suave para hover
      return audio;
    }
    return null;
  });

  const playHoverSound = () => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignorar errores de reproducción
      });
    }
  };

  return playHoverSound;
};
