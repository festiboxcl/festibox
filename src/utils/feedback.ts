// Utilidades para feedback háptico y efectos especiales
export const hapticFeedback = {
  // Vibración ligera para hover/tap
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  // Vibración media para selección
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },
  
  // Vibración fuerte para éxito/error
  strong: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 10, 50]);
    }
  }
};

// Efectos visuales de confirmación
export const visualEffects = {
  // Efecto de ripple/onda
  createRipple: (element: HTMLElement, color = 'rgba(59, 130, 246, 0.3)') => {
    const ripple = document.createElement('div');
    
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = color;
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.marginLeft = '-10px';
    ripple.style.marginTop = '-10px';
    ripple.style.pointerEvents = 'none';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
};

// CSS para el efecto ripple
export const rippleCSS = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

// Inyectar CSS del ripple si no existe
if (typeof document !== 'undefined' && !document.getElementById('ripple-styles')) {
  const style = document.createElement('style');
  style.id = 'ripple-styles';
  style.textContent = rippleCSS;
  document.head.appendChild(style);
}
