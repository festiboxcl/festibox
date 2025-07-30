/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfd',
          100: '#ccfbf7',
          200: '#99f6f0',
          300: '#5eeae5',
          400: '#2dd4d3',
          500: '#14b8b8',
          600: '#0d9d9d', // Turquesa principal del logo
          700: '#0f7d7d',
          800: '#115e5e',
          900: '#134e4e',
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777', // Fucsia del logo
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Naranjo del logo
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        extra: {
          50: '#fef2f2',
          100: '#fee2e2', 
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626', // Rojo extra que te gustó
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-in-left': 'slideInLeft 0.8s ease-out',
        'slide-in-right': 'slideInRight 0.8s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'bounce-in': 'bounceIn 1s ease-out',
      },
      keyframes: {
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
