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

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('festibox-cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(parsed);
      } catch (error) {
        console.error('Error cargando carrito:', error);
        localStorage.removeItem('festibox-cart');
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('festibox-cart', JSON.stringify(cartItems));
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
