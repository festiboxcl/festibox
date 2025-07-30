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

  // Crear orden de pago usando nuestro backend
  async createPayment(orderDetails: OrderDetails): Promise<FlowPaymentResponse> {
    console.log('Enviando pedido al backend:', orderDetails);

    const response = await fetch(`${this.baseUrl}/api/flow/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderDetails })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error del backend:', response.status, errorData);
      throw new Error(errorData.error || `Error del servidor: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      console.error('Backend respondió con error:', result);
      throw new Error(result.error || 'Error creando el pago');
    }

    console.log('Pago creado exitosamente:', result);

    return {
      flowOrder: result.flowOrder,
      url: result.url,
      token: result.token
    };
  }

  // Verificar estado del pago usando nuestro backend
  async getPaymentStatus(token: string): Promise<any> {
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

  // Redirigir al usuario a Flow para completar el pago
  redirectToPayment(paymentResponse: FlowPaymentResponse): void {
    const flowUrl = `${paymentResponse.url}?token=${paymentResponse.token}`;
    console.log('Redirigiendo a Flow:', flowUrl);
    window.location.href = flowUrl;
  }
}

export default FlowService;
