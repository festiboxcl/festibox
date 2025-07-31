// Servicio de cálculo de envíos Blue Express
// Basado en las tarifas oficiales de Blue Express 2025

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  deliveryTime: string;
  type: 'pickup' | 'home' | 'point';
}

export interface ShippingAddress {
  commune: string;
  address: string;
  reference?: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
}

// Tarifas Blue Express (incluyen IVA)
const BLUE_EXPRESS_RATES = {
  // Entrega a domicilio
  home: {
    'zona-celeste': { XS: 3100, S: 4200, M: 4800, L: 5400 },
    'zona-naranja': { XS: 4300, S: 5600, M: 7300, L: 9200 },
    'zona-verde': { XS: 5200, S: 9500, M: 14500, L: 17000 }
  },
  // Entrega en punto Blue Express
  point: {
    'zona-celeste': { XS: 2600, S: 3700, M: 4300, L: 4900 },
    'zona-naranja': { XS: 3800, S: 5100, M: 6800, L: 8700 },
    'zona-verde': { XS: 4700, S: 9000, M: 14000, L: 16500 }
  }
};

// Clasificación de comunas por zona
const COMMUNE_ZONES = {
  'zona-celeste': [
    'Santiago', 'Providencia', 'Las Condes', 'Vitacura', 'Ñuñoa', 
    'La Reina', 'Macul', 'Peñalolén', 'San Miguel', 'San Joaquín',
    'Pedro Aguirre Cerda', 'Lo Espejo', 'Estación Central', 'Quinta Normal',
    'Independencia', 'Recoleta', 'Conchalí', 'Huechuraba', 'Quilicura',
    'Renca', 'Cerro Navia', 'Lo Prado', 'Pudahuel', 'Maipú',
    'Cerrillos', 'La Cisterna', 'El Bosque', 'La Granja', 'San Ramón',
    'La Pintana', 'Puente Alto', 'La Florida', 'San Bernardo'
  ],
  'zona-naranja': [
    'Colina', 'Lampa', 'Tiltil', 'Pirque', 'San José de Maipo',
    'Calera de Tango', 'Buin', 'Paine', 'Melipilla', 'Curacaví',
    'María Pinto', 'San Pedro', 'Alhué', 'Padre Hurtado', 'Peñaflor',
    'Talagante', 'El Monte', 'Isla de Maipo'
  ],
  'zona-verde': [
    // Todas las demás comunas de Chile (regiones)
    'Valparaíso', 'Viña del Mar', 'Concepción', 'Temuco', 'Valdivia',
    'Osorno', 'Puerto Montt', 'Coquimbo', 'La Serena', 'Antofagasta',
    'Iquique', 'Arica', 'Punta Arenas', 'Copiapó', 'Calama',
    'Rancagua', 'Talca', 'Chillán', 'Los Ángeles', 'Castro'
    // ... (y todas las demás comunas de regiones)
  ]
};

// Determinar talla según tipo de producto (basado en peso volumétrico Blue Express)
export function getProductShippingSize(productCategory: string, productType?: string): 'XS' | 'S' | 'M' | 'L' {
  switch (productCategory) {
    case 'tarjetas':
      // Tarjetas explosivas: 9x18x2 cm = 0.081 kg volumétrico
      return 'XS'; // Caben en sobre, mínimo costo
    
    case 'cajas':
      if (productType?.includes('mini')) {
        // Caja dulce mini: 20x15x5 cm = 0.375 kg volumétrico
        return 'S'; // Tamaño intermedio apropiado
      }
      // Caja dulce normal: 25x20x10 cm = 1.25 kg volumétrico  
      return 'M'; // Tamaño correcto según dimensiones reales
    
    case 'especiales':
      return 'S'; // Ediciones especiales generalmente medianas
    
    default:
      return 'M'; // Por defecto talla M para estar seguros
  }
}

// Determinar zona según comuna
export function getCommuneZone(commune: string): 'zona-celeste' | 'zona-naranja' | 'zona-verde' {
  const normalizedCommune = commune.trim();
  
  if (COMMUNE_ZONES['zona-celeste'].includes(normalizedCommune)) {
    return 'zona-celeste';
  }
  
  if (COMMUNE_ZONES['zona-naranja'].includes(normalizedCommune)) {
    return 'zona-naranja';
  }
  
  // Por defecto, si no está en las listas, es zona verde (regiones)
  return 'zona-verde';
}

// Calcular opciones de envío disponibles
export function calculateShippingOptions(
  productCategory: string,
  productType: string,
  commune?: string
): ShippingOption[] {
  const options: ShippingOption[] = [];
  
  // Opción 1: Retiro en Providencia (GRATIS)
  options.push({
    id: 'pickup-providencia',
    name: 'Retiro en Providencia',
    description: 'Retira tu pedido gratis en nuestra ubicación en Providencia. Te contactaremos para coordinar.',
    price: 0,
    deliveryTime: '2-3 días hábiles',
    type: 'pickup'
  });
  
  // Si no hay comuna, solo mostrar retiro
  if (!commune) {
    return options;
  }
  
  const size = getProductShippingSize(productCategory, productType);
  const zone = getCommuneZone(commune);
  
  // Opción 2: Envío a domicilio
  const homePrice = BLUE_EXPRESS_RATES.home[zone][size];
  options.push({
    id: 'home-delivery',
    name: 'Envío a domicilio',
    description: `Envío directo a tu dirección en ${commune}. Entrega en horario laboral.`,
    price: homePrice,
    deliveryTime: zone === 'zona-verde' ? '3-5 días hábiles' : '1-3 días hábiles',
    type: 'home'
  });
  
  // Opción 3: Envío a Punto Blue Express
  const pointPrice = BLUE_EXPRESS_RATES.point[zone][size];
  options.push({
    id: 'point-delivery',
    name: 'Punto Blue Express',
    description: `Retira en el Punto Blue Express más cercano a ${commune}. Disponible 24/7 en estaciones Copec.`,
    price: pointPrice,
    deliveryTime: zone === 'zona-verde' ? '3-5 días hábiles' : '1-3 días hábiles',
    type: 'point'
  });
  
  return options;
}

// Obtener lista de comunas para el selector
export function getAllCommunes(): string[] {
  return [
    ...COMMUNE_ZONES['zona-celeste'],
    ...COMMUNE_ZONES['zona-naranja'],
    ...COMMUNE_ZONES['zona-verde']
  ].sort();
}

// Validar dirección de envío
export function validateShippingAddress(address: ShippingAddress): string[] {
  const errors: string[] = [];
  
  if (!address.commune.trim()) {
    errors.push('Comuna es requerida');
  }
  
  if (!address.address.trim()) {
    errors.push('Dirección es requerida');
  }
  
  if (!address.receiverName.trim()) {
    errors.push('Nombre del destinatario es requerido');
  }
  
  if (!address.receiverPhone.trim()) {
    errors.push('Teléfono del destinatario es requerido');
  }
  
  if (!address.receiverEmail.trim()) {
    errors.push('Email del destinatario es requerido');
  } else if (!/\S+@\S+\.\S+/.test(address.receiverEmail)) {
    errors.push('Email del destinatario no es válido');
  }
  
  return errors;
}
