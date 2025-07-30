// Cliente básico de Flow API
import crypto from 'crypto';

class FlowClient {
  constructor(apiKey, secretKey, baseUrl = 'https://sandbox.flow.cl/api') {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
    
    console.log('Flow Client inicializado con:', {
      apiKey: this.apiKey?.substring(0, 10) + '...',
      apiKeyFull: this.apiKey,
      baseUrl: this.baseUrl
    });
  }

  createSignature(params) {
    // Ordenar parámetros alfabéticamente por nombre
    const sortedKeys = Object.keys(params).sort();
    
    // Concatenar como: key1value1key2value2key3value3... (sin separadores)
    // Según la documentación de Flow
    let toSign = '';
    for (const key of sortedKeys) {
      toSign += key + params[key];
    }
    
    console.log('String para firmar:', toSign);

    return crypto
      .createHmac('sha256', this.secretKey)
      .update(toSign)
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
      amount: params.amount
    });
    
    console.log('Flow Client - Parámetros exactos:', {
      apiKey: this.apiKey,
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
    console.log('Flow Client - Respuesta bruta:', responseText);
    
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
  // Usar credenciales exactas en lugar de variables de entorno
  const apiKey = '1F35DEE4-1B10-49E6-A226-55845L8E1A12';
  const secretKey = 'f6944874c7b8a70c8da78c14f03f853b50019c31';
  const baseUrl = 'https://sandbox.flow.cl/api';
  
  console.log('Usando credenciales exactas de Flow (hardcoded)');
  
  return new FlowClient(apiKey, secretKey, baseUrl);
}

export default FlowClient;
