import { useCallback } from 'react';

// Reproductor de audio usando el archivo descargado
const playAudioFile = (volume: number = 0.05, playbackRate: number = 1) => {
  try {
    const audio = new Audio('/abrio-select.mp3');
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    audio.play().catch(err => {
      console.log('Error reproduciendo audio:', err);
    });
  } catch (error) {
    console.log('Error creando audio:', error);
  }
};

export const useSound = () => {
  // Sonido principal para clics normales
  const playClick = useCallback(() => {
    playAudioFile(0.05, 1);
  }, []);

  // Sonido más suave para hover/tap
  const playTap = useCallback(() => {
    playAudioFile(0.02, 1.2);
  }, []);

  // Sonido de éxito con tono más grave
  const playSuccess = useCallback(() => {
    playAudioFile(0.07, 0.8);
  }, []);

  // Sonido de error (más agudo)
  const playError = useCallback(() => {
    playAudioFile(0.04, 1.5);
  }, []);

  // Sonido muy suave para hover
  const playHover = useCallback(() => {
    playAudioFile(0.015, 1.3);
  }, []);

  // Sonido para selecciones importantes
  const playSelect = useCallback(() => {
    playAudioFile(0.06, 0.9);
  }, []);

  return {
    playClick,
    playTap,
    playSuccess,
    playError,
    playHover,
    playSelect
  };
};
