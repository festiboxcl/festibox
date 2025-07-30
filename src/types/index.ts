export interface CardOption {
  id: string;
  name: string;
  cubes: number;
  spacesPerCube: number;
  priceModifier: number; // Precio adicional o descuento
  image: string; // Imagen específica de esta opción
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  baseImage: string; // Imagen base del producto
  cardOptions?: CardOption[]; // Opciones de tarjeta (solo para productos con tarjeta)
  defaultCardOption?: string; // ID de la opción por defecto
  badge?: {
    text: string;
    type: 'discount' | 'bestseller' | 'soldout';
    color?: string;
  };
  originalPrice?: number; // Para mostrar precio tachado en descuentos
  isAvailable?: boolean; // Para productos agotados
  // Campos de compatibilidad hacia atrás
  price: number; // Se calculará dinámicamente
  imageCount: number; // Se calculará dinámicamente
  image: string; // Se calculará dinámicamente
  cubes: number; // Se calculará dinámicamente
  spacesPerCube: number; // Se calculará dinámicamente
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  position: number; // Posición en la tarjeta (1-12)
  cubeNumber?: number; // En qué cubo va esta imagen
}

export interface CubeConfiguration {
  cubeNumber: number;
  photos: number;
  messages: number;
  totalSpaces: number; // Siempre 4
}

export interface ProductConfiguration {
  productId: string;
  cubes: CubeConfiguration[];
  totalPhotos: number;
  totalMessages: number;
  isComplete: boolean;
  boxMessage?: string; // Mensaje opcional para el exterior de la caja (productos dulce, dulce mini, salada)
}

export interface CartItem {
  id: string;
  product: Product;
  images: UploadedImage[];
  quantity: number;
  customizations?: Record<string, any>;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  customerInfo: CustomerInfo;
  createdAt: Date;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
}

// Tipos para el sistema de carrito y pagos con Flow
export interface FlowConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

export interface FlowPayment {
  commerceOrder: string;
  subject: string;
  currency: string;
  amount: number;
  email: string;
  paymentMethod?: number;
  urlConfirmation: string;
  urlReturn: string;
  optional?: Record<string, any>;
}

export interface FlowPaymentResponse {
  flowOrder: number;
  url: string;
  token: string;
}

export interface ShoppingCartItem {
  id: string;
  product: Product;
  configuration: ProductConfiguration;
  photos: File[];
  messages: string[];
  quantity: number;
  price: number;
}

export interface OrderDetails {
  items: ShoppingCartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customerEmail: string;
}

export interface OrderInfo {
  commerceOrder: string;
  items: ShoppingCartItem[];
  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  customerEmail: string;
  flowOrder: number;
  token: string;
  createdAt: string;
}
