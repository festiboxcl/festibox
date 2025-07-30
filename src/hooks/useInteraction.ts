import { useSound } from './useSound';
import { hapticFeedback } from '../utils/feedback';

export const useInteraction = () => {
  const sounds = useSound();

  const interact = {
    // Interacción suave (hover)
    hover: () => {
      sounds.playHover();
      hapticFeedback.light();
    },

    // Clic normal
    click: () => {
      sounds.playClick();
      hapticFeedback.medium();
    },

    // Selección importante
    select: () => {
      sounds.playSelect();
      hapticFeedback.medium();
    },

    // Acción exitosa
    success: () => {
      sounds.playSuccess();
      hapticFeedback.strong();
    },

    // Error o cancelación
    error: () => {
      sounds.playError();
      hapticFeedback.strong();
    },

    // Tap ligero
    tap: () => {
      sounds.playTap();
      hapticFeedback.light();
    }
  };

  return interact;
};
