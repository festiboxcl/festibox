import { useState, useCallback, useEffect } from 'react';
import FlowService from '../services/flowService';
import { compressImageForPrint } from '../utils/imageProcessing';
import type { 
  ShoppingCartItem, 
  OrderDetails 
} from '../types';
import type { ShippingOption, ShippingAddress } from '../services/shippingService';

interface PhotoData {
  base64: string;
  name: string;
  type: string;
  size: number;
}

export function useShoppingCart() {
  const [cartItems, setCartItems] = useState<ShoppingCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const flowService = new FlowService();

  // Convertir File a Base64 comprimido
  const fileToBase64 = async (file: File): Promise<PhotoData> => {
    try {
      // Comprimir con mayor calidad para productos impresos
      const compressedFile = await compressImageForPrint(file, 0.92);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            base64: reader.result as string,
            name: file.name,
            type: file.type,
            size: compressedFile.size
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error('Error comprimiendo imagen:', error);
      // Fallback a conversión normal
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            base64: reader.result as string,
            name: file.name,
            type: file.type,
            size: file.size
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  };  // Convertir Base64 a File
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Preparar carrito para localStorage (convertir Files a Base64)
  const prepareCartForStorage = async (items: ShoppingCartItem[]) => {
    const processedItems = await Promise.all(
      items.map(async (item) => {
        const photoPromises = item.photos.map(async (photo, index) => {
          const photoData = await fileToBase64(photo);
          return {
            base64: photoData.base64,
            name: photoData.name || photo.name || `photo-${index}.jpg`,
            type: photoData.type || photo.type || 'image/jpeg',
            size: photoData.size
          };
        });
        
        const photosData = await Promise.all(photoPromises);
        
        return {
          ...item,
          photos: photosData // Reemplazar Files con data serializable
        };
      })
    );
    
    return processedItems;
  };

  // Restaurar carrito desde localStorage (convertir Base64 a Files)
  const restoreCartFromStorage = (storedData: any[]): ShoppingCartItem[] => {
    console.log('🔄 Restaurando carrito desde localStorage:', storedData.length, 'items');
    return storedData.map((item, itemIndex) => {
      console.log(`📦 Restaurando item ${itemIndex + 1}:`, item.product?.name);
      console.log(`📸 Fotos a restaurar:`, item.photos?.length || 0);
      
      const restoredPhotos = item.photos.map((photoData: any, index: number) => {
        console.log(`🔍 Procesando foto ${index + 1}:`, {
          type: typeof photoData,
          hasBase64: !!(photoData && photoData.base64),
          isString: typeof photoData === 'string',
          structure: photoData
        });
        
        try {
          if (typeof photoData === 'string') {
            // Backward compatibility: si es string, asumir que es base64
            console.log(`📄 Convirtiendo foto ${index + 1} de string base64`);
            return base64ToFile(photoData, `restored-photo-${index}.jpg`);
          } else if (photoData && photoData.base64) {
            // Nuevo formato con metadata
            console.log(`📄 Convirtiendo foto ${index + 1} de objeto con base64:`, {
              name: photoData.name,
              type: photoData.type,
              size: photoData.size
            });
            return base64ToFile(photoData.base64, photoData.name || `photo-${index}.jpg`);
          } else {
            // Fallback para formatos no reconocidos
            console.warn('⚠️ Formato de foto no reconocido:', photoData);
            return null;
          }
        } catch (error) {
          console.error('❌ Error restaurando foto:', error, photoData);
          return null;
        }
      }).filter(Boolean); // Filtrar elementos null
      
      console.log(`✅ Item ${itemIndex + 1} restaurado con ${restoredPhotos.length} fotos`);
      
      return {
        ...item,
        photos: restoredPhotos
      };
    });
  };

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const loadCart = () => {
      console.log('🔄 Iniciando carga del carrito desde localStorage...');
      
      // Intentar cargar carrito completo primero
      const savedCart = localStorage.getItem('festibox-cart');
      console.log('💾 ¿Hay carrito completo guardado?', !!savedCart);
      
      if (savedCart) {
        try {
          console.log('📏 Tamaño del carrito guardado:', (savedCart.length / 1024).toFixed(2), 'KB');
          const parsed = JSON.parse(savedCart);
          console.log('📦 Estructura del carrito guardado:', parsed.length, 'items');
          console.log('🔍 Primer item del carrito guardado:', parsed[0]);
          console.log('📸 Fotos en primer item:', parsed[0]?.photos?.length || 0);
          console.log('📸 Estructura de primera foto:', parsed[0]?.photos?.[0]);
          
          const restoredItems = restoreCartFromStorage(parsed);
          setCartItems(restoredItems);
          console.log('✅ Carrito completo restaurado:', restoredItems.length, 'items');
          console.log('📋 Items restaurados:', restoredItems.map(item => ({
            id: item.id,
            productName: item.product.name,
            photosCount: item.photos.length,
            messagesCount: item.messages.length
          })));
          return;
        } catch (error) {
          console.error('❌ Error cargando carrito completo:', error);
        }
      }
      
      // Fallback a metadatos
      const metaCart = localStorage.getItem('festibox-cart-meta');
      if (metaCart) {
        try {
          const parsed = JSON.parse(metaCart);
          console.warn('⚠️ Carrito restaurado sin imágenes (metadatos únicamente)');
          // Mostrar advertencia al usuario que las fotos se perdieron
          setCartItems(parsed.map((item: any) => ({
            ...item,
            photos: [] // Sin fotos, usuario tendrá que subirlas de nuevo
          })));
          return;
        } catch (error) {
          console.error('Error cargando metadatos del carrito:', error);
        }
      }
      
      // Último fallback - solo datos esenciales
      const essentialCart = localStorage.getItem('festibox-cart-essential');
      if (essentialCart) {
        try {
          const parsed = JSON.parse(essentialCart);
          console.warn('⚠️ Solo datos esenciales del carrito restaurados');
          setCartItems(parsed.map((item: any) => ({
            ...item,
            photos: [],
            images: [],
            configuration: null
          })));
        } catch (error) {
          console.error('Error cargando datos esenciales:', error);
          // Limpiar localStorage corrupto
          localStorage.removeItem('festibox-cart');
          localStorage.removeItem('festibox-cart-meta');
          localStorage.removeItem('festibox-cart-essential');
        }
      }
    };
    
    loadCart();
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    const saveCart = async () => {
      if (cartItems.length > 0) {
        try {
          const preparedItems = await prepareCartForStorage(cartItems);
          const cartData = JSON.stringify(preparedItems);
          
          // Verificar tamaño antes de guardar
          const sizeMB = new Blob([cartData]).size / (1024 * 1024);
          console.log(`💾 Tamaño del carrito: ${sizeMB.toFixed(2)}MB`);
          
          if (sizeMB > 8) { // Aumentado límite de 4MB a 8MB para mejor calidad
            console.warn('⚠️ Carrito muy grande, guardando solo metadatos');
            // Guardar solo la estructura sin las imágenes como fallback
            const lightweightCart = cartItems.map(item => ({
              ...item,
              photos: item.photos.map(photo => ({
                name: photo.name,
                type: photo.type,
                size: photo.size
              }))
            }));
            localStorage.setItem('festibox-cart-meta', JSON.stringify(lightweightCart));
          } else {
            localStorage.setItem('festibox-cart', cartData);
            // Limpiar fallback si existe
            localStorage.removeItem('festibox-cart-meta');
          }
        } catch (error) {
          console.error('Error guardando carrito:', error);
          
          if (error instanceof DOMException && error.code === 22) {
            // QuotaExceededError - localStorage lleno
            console.warn('📦 LocalStorage lleno, guardando solo metadatos del carrito');
            try {
              // Limpiar localStorage de otros datos si es necesario
              const essentialData = cartItems.map(item => ({
                id: item.id,
                product: item.product,
                quantity: item.quantity,
                price: item.price,
                photoCount: item.photos.length,
                messages: item.messages
              }));
              localStorage.setItem('festibox-cart-essential', JSON.stringify(essentialData));
            } catch (fallbackError) {
              console.error('Error guardando datos esenciales:', fallbackError);
            }
          }
        }
      } else {
        // Limpiar todos los tipos de datos del carrito
        localStorage.removeItem('festibox-cart');
        localStorage.removeItem('festibox-cart-meta');
        localStorage.removeItem('festibox-cart-essential');
      }
    };
    
    saveCart();
  }, [cartItems]);

  // Agregar item al carrito
  const addToCart = useCallback((item: Omit<ShoppingCartItem, 'id' | 'quantity'>) => {
    const newItem: ShoppingCartItem = {
      ...item,
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      quantity: 1
    };

    setCartItems(prev => [...prev, newItem]);
    setIsCartOpen(true);
  }, []);

  // Actualizar cantidad de un item
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, []);

  // Eliminar item del carrito
  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // Limpiar carrito
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('festibox-cart');
  }, []);

  // Calcular totales con envío dinámico
  const getCartTotals = useCallback((shippingCost = 0) => ({
    subtotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    shipping: shippingCost,
    total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + shippingCost
  }), [cartItems]);

  // Mantener compatibilidad con el cálculo anterior
  const cartTotals = {
    subtotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    get shipping() {
      return this.subtotal > 50000 ? 0 : 5000; // Envío gratis sobre $50.000
    },
    get total() {
      return this.subtotal + this.shipping;
    }
  };

  // Procesar checkout con Flow y datos de envío
  const processCheckout = useCallback(async (
    customerEmail: string, 
    shippingOption: ShippingOption, 
    shippingAddress?: ShippingAddress
  ) => {
    if (cartItems.length === 0) {
      throw new Error('El carrito está vacío');
    }

    if (!customerEmail.trim()) {
      throw new Error('Email del cliente es requerido');
    }

    if (!shippingOption) {
      throw new Error('Método de envío es requerido');
    }

    setIsProcessingPayment(true);

    try {
      const totals = getCartTotals(shippingOption.price);

      const orderDetails: OrderDetails = {
        items: cartItems,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total,
        customerEmail: customerEmail.trim(),
        shippingOption,
        shippingAddress
      };

      // Crear pago en Flow
      const paymentResponse = await flowService.createPayment(orderDetails);

      // Guardar información del pedido para confirmación posterior
      const orderInfo = {
        commerceOrder: `FESTIBOX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        items: cartItems,
        totals,
        customerEmail,
        shippingOption,
        shippingAddress,
        flowOrder: paymentResponse.flowOrder,
        token: paymentResponse.token,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('festibox-current-order', JSON.stringify(orderInfo));

      // Redirigir a Flow
      flowService.redirectToPayment(paymentResponse);

    } catch (error) {
      console.error('Error en checkout:', error);
      throw error;
    } finally {
      setIsProcessingPayment(false);
    }
  }, [cartItems, flowService, getCartTotals]);

  // Verificar estado del pago
  const verifyPayment = useCallback(async (token: string) => {
    try {
      const paymentStatus = await flowService.getPaymentStatus(token);
      
      if (paymentStatus.status === 'PAID') {
        // Pago exitoso - limpiar carrito
        clearCart();
        localStorage.removeItem('festibox-current-order');
      }

      return paymentStatus;
    } catch (error) {
      console.error('Error verificando pago:', error);
      throw error;
    }
  }, [flowService, clearCart]);

  return {
    // Estado del carrito
    cartItems,
    isCartOpen,
    isProcessingPayment,
    cartTotals,
    
    // Acciones del carrito
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setIsCartOpen,
    
    // Checkout
    processCheckout,
    verifyPayment
  };
}
