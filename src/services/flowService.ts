import type { 
  FlowPaymentResponse, 
  OrderDetails 
} from '../types';

class FlowService {
  private baseUrl: string;
  private isDemoMode: boolean;

  constructor() {
    // En desarrollo usa localhost:3001, en producción usa el dominio actual
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
    
    if (isDevelopment && window.location.hostname === 'localhost') {
      // En desarrollo, usar el servidor proxy en puerto 3001
      this.baseUrl = 'http://localhost:3001';
      console.log('🔧 DESARROLLO: Usando servidor proxy en localhost:3001');
    } else {
      this.baseUrl = window.location.origin;
    }
    
    // Modo demo para testing - actívalo temporalmente
    this.isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || false;
    
    console.log('⚙️ FlowService configurado:', {
      baseUrl: this.baseUrl,
      isDevelopment,
      isDemoMode: this.isDemoMode
    });
    
    if (this.isDemoMode) {
      console.log('🎮 MODO DEMO ACTIVADO - No se procesarán pagos reales');
    }
  }

  /**
   * Crear orden de pago usando nuestro backend
   * @param orderDetails - Detalles del pedido
   * @returns Promise con respuesta de Flow
   */
  async createPayment(orderDetails: OrderDetails): Promise<FlowPaymentResponse> {
    console.log('💳 Enviando pedido al backend:', orderDetails);

    // Validaciones básicas en frontend
    if (!orderDetails.customerEmail || !orderDetails.items?.length || !orderDetails.total) {
      throw new Error('Datos del pedido incompletos');
    }

    if (orderDetails.total < 100) {
      throw new Error('El monto mínimo para un pago es $100 CLP');
    }

    // 🎮 MODO DEMO: Simular respuesta exitosa
    if (this.isDemoMode) {
      console.log('🎮 DEMO: Simulando creación de pago exitosa');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay de red
      
      return {
        url: '#demo-payment', // URL falsa para demo
        token: `demo-token-${Date.now()}`,
        flowOrder: Math.floor(Math.random() * 1000000)
      };
    }

    const response = await fetch(`${this.baseUrl}/api/flow/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderDetails })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error del servidor' }));
      console.error('❌ Error del backend:', response.status, errorData);
      
      // Manejar errores específicos
      if (response.status === 400) {
        throw new Error(errorData.error || 'Datos del pedido inválidos');
      } else if (response.status === 500) {
        throw new Error(errorData.error || 'Error interno del servidor');
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    }

    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ Backend respondió con error:', result);
      throw new Error(result.error || 'Error creando el pago');
    }

    console.log('✅ Pago creado exitosamente:', result);

    return {
      flowOrder: result.flowOrder,
      url: result.url,
      token: result.token
    };
  }

    /**
   * Verificar estado de un pago
   * @param token - Token del pago
   * @returns Promise con estado del pago
   */
  async getPaymentStatus(token: string): Promise<any> {
    if (!token) {
      throw new Error('Token es requerido');
    }

    // 🎮 MODO DEMO: Simular pago exitoso
    if (this.isDemoMode && token.startsWith('demo-token-')) {
      console.log('🎮 DEMO: Simulando verificación de pago exitosa');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      
      return {
        status: 'PAID',
        amount: 1000, // Monto simulado
        flowOrder: Math.floor(Math.random() * 1000000),
        paymentDate: new Date().toISOString()
      };
    }

    const response = await fetch(`${this.baseUrl}/api/flow/payment-status?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Error verificando pago: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Error verificando estado del pago');
    }

    return result.paymentStatus;
  }

  /**
   * Enviar emails de confirmación de pedido
   * @param orderDetails - Detalles del pedido
   * @returns Promise con resultado del envío
   */
  async sendOrderConfirmation(orderDetails: any): Promise<any> {
    console.log('📧 Enviando confirmación de pedido...');
    
    // 🎮 MODO DEMO: Aún enviar emails reales para testing
    if (this.isDemoMode) {
      console.log('🎮 DEMO: Modo demo activo, pero enviando emails reales para testing');
    }

    try {
      // Para emails, necesitamos los datos originales sin conversión a File objects
      // Ya que las fotos pueden venir en formato base64 desde localStorage
      console.log('📋 Datos del pedido para email:', {
        itemsCount: orderDetails.items?.length || 0,
        firstItemPhotos: orderDetails.items?.[0]?.photos?.length || 0,
        firstPhotoType: typeof orderDetails.items?.[0]?.photos?.[0]
      });
      
      const response = await fetch(`${this.baseUrl}/api/order-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderDetails })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error del servidor' }));
        console.error('❌ Error del endpoint de confirmación:', response.status, errorData);
        throw new Error(`Error enviando confirmación: ${response.status} - ${errorData.error}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        console.error('❌ Endpoint respondió con error:', result);
        throw new Error(result.error || 'Error enviando emails de confirmación');
      }

      console.log('✅ Emails de confirmación enviados exitosamente');
      return result;
    } catch (error) {
      console.error('❌ Error enviando emails de confirmación:', error);
      
      // En modo demo, no fallar por errores de email
      if (this.isDemoMode) {
        console.log('🎮 DEMO: Continuando a pesar del error de email');
        return {
          success: true,
          message: 'Demo mode: Email error ignored'
        };
      }
      
      throw error;
    }
  }

  /**
   * Redirigir al usuario a Flow para completar el pago
   * @param paymentResponse - Respuesta de creación de pago
   */
  redirectToPayment(paymentResponse: FlowPaymentResponse): void {
    // 🎮 MODO DEMO: Simular pago exitoso sin redirección
    if (this.isDemoMode) {
      console.log('🎮 DEMO: Simulando redirección a Flow y pago exitoso');
      
      // Agregar el token a localStorage para debugging
      localStorage.setItem('festibox-last-payment-token', paymentResponse.token);
      
      // Simular que el usuario completó el pago exitosamente
      setTimeout(() => {
        const mockSuccessUrl = `${window.location.origin}/?status=success&token=${paymentResponse.token}`;
        console.log('🎮 DEMO: Simulando retorno exitoso de Flow');
        window.location.href = mockSuccessUrl;
      }, 2000); // Simular 2 segundos de "procesamiento"
      
      return;
    }
    
    const flowUrl = `${paymentResponse.url}?token=${paymentResponse.token}`;
    console.log('🚀 Redirigiendo a Flow:', flowUrl);
    
    // Agregar el token a localStorage para debugging
    localStorage.setItem('festibox-last-payment-token', paymentResponse.token);
    
    // Redirigir a Flow
    window.location.href = flowUrl;
  }

}

export default FlowService;
