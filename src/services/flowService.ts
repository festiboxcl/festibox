import type { 
  FlowPaymentResponse, 
  OrderDetails 
} from '../types';

class FlowService {
  private baseUrl: string;

  constructor() {
    // En desarrollo usa localhost, en producción usa el dominio actual
    this.baseUrl = window.location.origin;
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
   * Verificar estado del pago usando nuestro backend
   * @param token - Token del pago
   * @returns Promise con estado del pago
   */
  async getPaymentStatus(token: string): Promise<any> {
    if (!token) {
      throw new Error('Token es requerido');
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
   * Redirigir al usuario a Flow para completar el pago
   * @param paymentResponse - Respuesta de creación de pago
   */
  redirectToPayment(paymentResponse: FlowPaymentResponse): void {
    const flowUrl = `${paymentResponse.url}?token=${paymentResponse.token}`;
    console.log('🚀 Redirigiendo a Flow:', flowUrl);
    
    // Agregar el token a localStorage para debugging
    localStorage.setItem('festibox-last-payment-token', paymentResponse.token);
    
    // Redirigir a Flow
    window.location.href = flowUrl;
  }
}

export default FlowService;
