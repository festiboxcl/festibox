import { useState, useCallback, useEffect } from 'react';
import FlowService from '../services/flowService';
import type { 
  ShoppingCartItem, 
  OrderDetails 
} from '../types';
import type { ShippingOption, ShippingAddress } from '../services/shippingService';

export function useShoppingCart() {
  const [cartItems, setCartItems] = useState<ShoppingCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const flowService = new FlowService();

  // Convertir File a Base64 para persistencia
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Convertir Base64 a File
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
        const photoPromises = item.photos.map(async (photo, index) => ({
          base64: await fileToBase64(photo),
          name: photo.name || `photo-${index}.jpg`,
          type: photo.type || 'image/jpeg'
        }));
        
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
    return storedData.map((item) => ({
      ...item,
      photos: item.photos.map((photoData: any) => {
        if (typeof photoData === 'string') {
          // Backward compatibility: si es string, asumir que es base64
          return base64ToFile(photoData, 'restored-photo.jpg');
        } else if (photoData.base64) {
          // Nuevo formato con metadata
          return base64ToFile(photoData.base64, photoData.name);
        } else {
          // Fallback para formatos no reconocidos
          console.warn('Formato de foto no reconocido:', photoData);
          return null;
        }
      }).filter(Boolean) // Filtrar elementos null
    }));
  };

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('festibox-cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const restoredItems = restoreCartFromStorage(parsed);
        setCartItems(restoredItems);
      } catch (error) {
        console.error('Error cargando carrito:', error);
        localStorage.removeItem('festibox-cart');
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    const saveCart = async () => {
      if (cartItems.length > 0) {
        try {
          const preparedItems = await prepareCartForStorage(cartItems);
          localStorage.setItem('festibox-cart', JSON.stringify(preparedItems));
        } catch (error) {
          console.error('Error guardando carrito:', error);
        }
      } else {
        localStorage.removeItem('festibox-cart');
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
