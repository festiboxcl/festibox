import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEO({ 
  title = "FestiBox - Regalos Únicos Personalizados Chile | Ideas de Regalo Perfectas",
  description = "¿Buscas el regalo perfecto? FestiBox crea regalos únicos personalizados con tus fotos favoritas. Ideas de regalo para cumpleaños, aniversarios, día de la madre, san valentín. ¡El regalo que nunca olvidarán!",
  keywords = "regalo único, regalo personalizado, ideas de regalo, regalo cumpleaños, regalo aniversario, regalo san valentín, regalo día de la madre, regalo especial, regalo con fotos, regalo sorpresa, regalo original Chile, regalos únicos, caja regalo, regalo para ella, regalo para él",
  image = "https://www.festibox.cl/images/Banner%201.png",
  url = "https://www.festibox.cl",
  type = "website"
}: SEOProps) {
  
  useEffect(() => {
    // Actualizar title
    document.title = title;
    
    // Actualizar meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ];
    
    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (name) meta.setAttribute('name', name);
        if (property) meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    });
    
    // Actualizar canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
    
  }, [title, description, keywords, image, url, type]);
  
  return null;
}

// Hook para SEO basado en productos
export function useProductSEO(product: any) {
  if (!product) return {};
  
  const productTitles: Record<string, string> = {
    'ex01-simple': 'Regalo Único Personalizado con Fotos | Ideas Regalo Cumpleaños - FestiBox',
    'ex01-triple': 'Regalo Sorpresa Especial para Aniversario | Caja Regalo Triple - FestiBox',
    'd01-dulce': 'Caja Regalo Dulce Personalizada | Regalo Cumpleaños con Chocolates - FestiBox',
    'd01-dulce-mini': 'Caja Dulce Mini | Regalo Único con Dulces Chilenos - FestiBox',
    's01-salada': 'Caja Regalo con Cervezas y Snacks | Regalo Especial para Él - FestiBox',
    'ee01-conejito': 'Regalo Temático Adorable | Ideas Regalo Especial - FestiBox'
  };
  
  const productDescriptions: Record<string, string> = {
    'ex01-simple': 'El regalo perfecto y personalizado que estás buscando. Regalo único con hasta 12 fotos especiales, ideal para cumpleaños, aniversarios y ocasiones que merecen ser recordadas.',
    'ex01-triple': 'Regalo sorpresa con 3 niveles de emociones y hasta 12 fotos personalizadas. La idea de regalo más especial para aniversarios y momentos únicos que nunca olvidarán.',
    'd01-dulce': 'Caja regalo dulce con chocolates premium, Ferrero Rocher y sorpresa personalizable. El regalo perfecto que combina dulzura y momentos especiales en uno solo.',
    'd01-dulce-mini': 'Caja regalo mini con los dulces chilenos más queridos: Sapito, Chokita, Baton y más. Regalo nostálgico perfecto para cualquier ocasión especial.',
    's01-salada': 'Caja regalo con cervezas/champańa, snacks gourmet y espacios personalizables. El regalo ideal para él o para compartir en ocasiones especiales.',
    'ee01-conejito': 'Regalo temático adorable con diseño único de conejito. Ideas de regalo especiales para sorprender con ternura y originalidad.'
  };
  
  return {
    title: productTitles[product.id] || `${product.name} - Regalo Único Personalizado | FestiBox Chile`,
    description: productDescriptions[product.id] || `${product.name} - ${product.description}. El regalo perfecto que estás buscando en FestiBox Chile.`,
    keywords: `${product.name}, regalo único, regalo personalizado, ideas de regalo, regalo ${product.category}, FestiBox Chile, ${product.id}`,
    image: product.image || "https://www.festibox.cl/images/Banner%201.png",
    url: `https://www.festibox.cl/#${product.id}`
  };
}
