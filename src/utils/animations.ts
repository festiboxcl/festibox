// Utilidades para animaciones estilo Apple
export const animations = {
  // Transiciones de entrada
  slideIn: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { 
      type: "spring" as const, 
      stiffness: 400, 
      damping: 25,
      mass: 0.8
    }
  },
  
  slideInFromBottom: {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 30, scale: 0.95 },
    transition: { 
      type: "spring" as const, 
      stiffness: 500, 
      damping: 30,
      mass: 0.6
    }
  },

  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { 
      type: "spring" as const, 
      stiffness: 600, 
      damping: 30
    }
  },

  // Efectos hover estilo Apple
  hoverScale: {
    whileHover: { 
      scale: 1.02,
      transition: { type: "spring" as const, stiffness: 400, damping: 25 }
    },
    whileTap: { 
      scale: 0.98,
      transition: { type: "spring" as const, stiffness: 400, damping: 25 }
    }
  },

  // Efectos para botones
  buttonPress: {
    whileHover: { 
      scale: 1.02,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
      transition: { type: "spring" as const, stiffness: 400, damping: 25 }
    },
    whileTap: { 
      scale: 0.98,
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring" as const, stiffness: 400, damping: 25 }
    }
  },

  // Efectos para tarjetas de producto
  cardHover: {
    whileHover: { 
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
      transition: { type: "spring" as const, stiffness: 400, damping: 25 }
    },
    whileTap: { 
      scale: 0.98,
      transition: { type: "spring" as const, stiffness: 400, damping: 25 }
    }
  },

  // Modal animations
  modalOverlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },

  modalContent: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
    transition: { 
      type: "spring" as const, 
      stiffness: 500, 
      damping: 30,
      mass: 0.8
    }
  },

  // Stagger animations para listas
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

// Clases CSS para transiciones suaves
export const transitionClasses = {
  smooth: "transition-all duration-300 ease-out",
  spring: "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
  bounce: "transition-all duration-400 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]",
  apple: "transition-all duration-350 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
};
