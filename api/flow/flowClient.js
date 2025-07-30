// Cliente básico de Flow API
import crypto from 'crypto';

class FlowClient {
  constructor(apiKey, secretKey, baseUrl = 'https://sandbox.flow.cl/api') {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
  }

  createSignature(params) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return crypto
      .createHmac('sha256', this.secretKey)
      .update(sortedParams)
      .digest('hex');
  }

  async createPayment(paymentData) {
    const params = {
      apiKey: this.apiKey,
      commerceOrder: paymentData.commerceOrder,
      subject: paymentData.subject,
      currency: paymentData.currency,
      amount: paymentData.amount,
      email: paymentData.email,
      urlConfirmation: paymentData.urlConfirmation,
      urlReturn: paymentData.urlReturn
    };

    // Crear firma
    const signature = this.createSignature(params);

    // Preparar datos para enviar a Flow
    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    formData.append('s', signature);
    
    if (paymentData.optional) {
      formData.append('optional', JSON.stringify(paymentData.optional));
    }

    console.log('Flow Client - Enviando pago:', {
      url: `${this.baseUrl}/payment/create`,
      commerceOrder: params.commerceOrder,
      amount: params.amount,
      apiKey: this.apiKey?.substring(0, 10) + '...'
    });
    
    // Log detallado de parámetros
    console.log('Flow Client - Parámetros completos:', {
      apiKey: this.apiKey,
      apiKeyLength: this.apiKey?.length,
      signature: signature,
      formData: formData.toString()
    });

    // Hacer petición a Flow
    const response = await fetch(`${this.baseUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText} - ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Error parseando respuesta: ${responseText}`);
    }
  }
}

export function createFlowClient() {
  // Obtener credenciales y limpiarlas de posibles espacios
  const apiKey = process.env.FLOW_API_KEY?.trim();
  const secretKey = process.env.FLOW_SECRET_KEY?.trim();
  const baseUrl = (process.env.FLOW_BASE_URL || 'https://sandbox.flow.cl/api').trim();
  
  console.log('Flow Client - Variables sin procesar:', {
    hasApiKey: !!process.env.FLOW_API_KEY,
    hasSecretKey: !!process.env.FLOW_SECRET_KEY,
    hasBaseUrl: !!process.env.FLOW_BASE_URL,
  });
  
  console.log('Flow Client - Credenciales procesadas:', {
    apiKey: apiKey,
    secretKey: secretKey ? '***' : null,
    baseUrl: baseUrl
  });
  
  if (!apiKey || !secretKey) {
    throw new Error('Credenciales de Flow no configuradas');
  }
  
  return new FlowClient(apiKey, secretKey, baseUrl);
}

export default FlowClient;
