// Importa tu logo real y animado
import logoImg from './images/products/Festibox-logo.png';
import logoGif from './images/logogif.gif';

// Importa todos los banners
import banner1 from './images/Banner 1.png';
import banner2 from './images/Banner 2.png';
import banner3 from './images/Banner 3.png';
import banner4 from './images/Banner 4.png';
import banner5 from './images/Banner 5.png';
import banner6 from './images/Banner 6.png';
import banner7 from './images/Banner 7.png';

// Importa productos
import explosiveSimple from './images/products/EX01 - Tarjeta Explosiva Simple.png';
import explosiveTriple from './images/products/EX01 - Tarjeta Explosiva triple.png';
import festiboxDulce from './images/products/D01 - Festibox dulce.png';
import festiboxSalada from './images/products/S01 - Festibox Salada.png';
import festiboxConejito from './images/products/EE01 - Festibox Conejito.png';

// Importar nuevas imágenes para las opciones de tarjeta
import dulceSimple from './images/products/dulce y simple.png';
import dulceTriple from './images/products/dulce y triple.png';
import dulceMiniSimple from './images/products/dulce mini y simple.png';
import dulceMiniTriple from './images/products/dulce mini y triple.png';

export const assets = {
  // Tu logo real (estático y animado)
  logo: logoImg,
  logoAnimated: logoGif,
  
  // Productos disponibles con nueva estructura
  products: {
    explosiveSimple: {
      id: 'ex01-simple',
      name: 'Tarjeta Explosiva Simple',
      baseImage: explosiveSimple,
      basePrice: 7990,
      originalPrice: 15990,
      description: 'Tarjeta explosiva con 1 cubo de 4 espacios para fotos y mensajes',
      category: 'tarjetas',
      badge: {
        text: '50% OFF',
        type: 'discount' as const,
        color: 'bg-red-500'
      },
      isAvailable: true,
      // Campos calculados para compatibilidad
      get image() { return this.baseImage; },
      get price() { return this.basePrice; },
      get imageCount() { return 4; },
      get cubes() { return 1; },
      get spacesPerCube() { return 4; }
    },
    explosiveTriple: {
      id: 'ex01-triple',
      name: 'Tarjeta Explosiva Triple',
      baseImage: explosiveTriple,
      basePrice: 12990,
      originalPrice: 24990,
      description: 'Versión premium con 3 cubos, cada uno con 4 espacios para fotos y mensajes',
      category: 'tarjetas',
      badge: {
        text: '48% OFF',
        type: 'discount' as const,
        color: 'bg-red-500'
      },
      isAvailable: true,
      // Campos calculados para compatibilidad
      get image() { return this.baseImage; },
      get price() { return this.basePrice; },
      get imageCount() { return 12; },
      get cubes() { return 3; },
      get spacesPerCube() { return 4; }
    },
    festiboxDulce: {
      id: 'd01-dulce',
      name: 'Festibox Dulce',
      baseImage: festiboxDulce,
      basePrice: 19990,
      description: 'Caja sorpresa con dulces y tarjeta explosiva personalizable',
      category: 'cajas',
      badge: {
        text: 'TOP VENTAS',
        type: 'bestseller' as const,
        color: 'bg-yellow-500'
      },
      isAvailable: true,
      cardOptions: [
        {
          id: 'simple',
          name: 'Con Tarjeta Simple',
          cubes: 1,
          spacesPerCube: 4,
          priceModifier: 0,
          image: dulceSimple
        },
        {
          id: 'triple', 
          name: 'Con Tarjeta Triple',
          cubes: 3,
          spacesPerCube: 4,
          priceModifier: 5000, // +$5000 por la tarjeta triple
          image: dulceTriple
        }
      ],
      defaultCardOption: 'simple',
      // Campos calculados para compatibilidad
      get image() { 
        const defaultOption = this.cardOptions?.find(opt => opt.id === this.defaultCardOption);
        return defaultOption?.image || this.baseImage; 
      },
      get price() { 
        const defaultOption = this.cardOptions?.find(opt => opt.id === this.defaultCardOption);
        return this.basePrice + (defaultOption?.priceModifier || 0);
      },
      get imageCount() { 
        const defaultOption = this.cardOptions?.find(opt => opt.id === this.defaultCardOption);
        return (defaultOption?.cubes || 1) * (defaultOption?.spacesPerCube || 4);
      },
      get cubes() { 
        const defaultOption = this.cardOptions?.find(opt => opt.id === this.defaultCardOption);
        return defaultOption?.cubes || 1;
      },
      get spacesPerCube() { 
        const defaultOption = this.cardOptions?.find(opt => opt.id === this.defaultCardOption);
        return defaultOption?.spacesPerCube || 4;
      }
    },
    festiboxDulceMini: {
      id: 'd01-dulce-mini',
      name: 'Festibox Dulce Mini',
      baseImage: festiboxDulce, // Usamos la base normal por ahora, pero las opciones tendrán imágenes diferentes
      basePrice: 12990,
      description: 'Versión compacta de la caja dulce con tarjeta explosiva personalizable',
      category: 'cajas',
      badge: {
        text: 'TOP VENTAS',
        type: 'bestseller' as const,
        color: 'bg-yellow-500'
      },
      isAvailable: true,
      cardOptions: [
        {
          id: 'simple',
          name: 'Con Tarjeta Simple',
          cubes: 1,
          spacesPerCube: 4,
          priceModifier: 0,
          image: dulceMiniSimple
        },
        {
          id: 'triple', 
          name: 'Con Tarjeta Triple',
          cubes: 3,
          spacesPerCube: 4,
          priceModifier: 2000, // +$2000 por la tarjeta triple (menos que la normal)
          image: dulceMiniTriple
        }
      ],
      defaultCardOption: 'simple',
      // Campos calculados para compatibilidad
      get image() { 
        const defaultOption = this.cardOptions?.find(opt => opt.id === this.defaultCardOption);
        return defaultOption?.image || this.baseImage; 
      },
      get price() { 
        const defaultOption = this.cardOptions?.find(opt => opt.id === this.defaultCardOption);
        return this.basePrice + (defaultOption?.priceModifier || 0);
      },
      get imageCount() { 
        const defaultOption = this.cardOptions?.find(opt => opt.id === this.defaultCardOption);
        return (defaultOption?.cubes || 1) * (defaultOption?.spacesPerCube || 4);
      },
      get cubes() { 
        const defaultOption = this.cardOptions?.find(opt => opt.id === this.defaultCardOption);
        return defaultOption?.cubes || 1;
      },
      get spacesPerCube() { 
        const defaultOption = this.cardOptions?.find(opt => opt.id === this.defaultCardOption);
        return defaultOption?.spacesPerCube || 4;
      }
    },
    festiboxSalada: {
      id: 's01-salada',
      name: 'Festibox Salada',
      baseImage: festiboxSalada,
      basePrice: 21990, // Dulce (19.990) + 2.000
      description: 'Caja gourmet con snacks salados y espacios personalizables',
      category: 'cajas',
      isAvailable: true,
      // Campos calculados para compatibilidad
      get image() { return this.baseImage; },
      get price() { return this.basePrice; },
      get imageCount() { return 10; },
      get cubes() { return 1; },
      get spacesPerCube() { return 10; }
    },
    festiboxConejito: {
      id: 'ee01-conejito',
      name: 'Festibox Conejito',
      baseImage: festiboxConejito,
      basePrice: 9990,
      description: 'Edición especial estacional - Disponible solo en época de Pascua',
      category: 'cajas',
      badge: {
        text: 'AGOTADO',
        type: 'soldout' as const,
        color: 'bg-gray-500'
      },
      isAvailable: false,
      // Campos calculados para compatibilidad
      get image() { return this.baseImage; },
      get price() { return this.basePrice; },
      get imageCount() { return 15; },
      get cubes() { return 1; },
      get spacesPerCube() { return 15; }
    }
  },
  
  // Banners para el slider
  banners: [
    {
      id: 1,
      image: banner1,
      title: "Sorprende con un regalo único",
      subtitle: "Tarjetas explosivas personalizadas"
    },
    {
      id: 2,
      image: banner2,
      title: "Una tarjeta que sorprende",
      subtitle: "Momentos especiales en cada explosión"
    },
    {
      id: 3,
      image: banner3,
      title: "Momentos únicos",
      subtitle: "El regalo perfecto para ocasiones especiales"
    },
    {
      id: 4,
      image: banner4,
      title: "Recuerdos que duran",
      subtitle: "Personaliza con tus fotos más especiales"
    },
    {
      id: 5,
      image: banner5,
      title: "Un regalo que explota de amor",
      subtitle: "La sorpresa perfecta"
    },
    {
      id: 6,
      image: banner6,
      title: "Cada foto cuenta una historia",
      subtitle: "Tu historia, tu tarjeta explosiva"
    },
    {
      id: 7,
      image: banner7,
      title: "Regala momentos",
      subtitle: "Tarjetas que tocan el corazón"
    }
  ]
};
