// Cliente Flow API según documentación oficial
import crypto from 'crypto';

class FlowClient {
  constructor(apiKey, secretKey, baseUrl = 'https://www.flow.cl/api') {
    if (!apiKey || !secretKey) {
      throw new Error('Flow API Key y Secret Key son requeridos');
    }
    
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
    
    console.log('Flow Client inicializado:', {
      apiKey: this.apiKey.substring(0, 8) + '...',
      baseUrl: this.baseUrl
    });
  }

  /**
   * Crear firma HMAC-SHA256 según documentación oficial de Flow
   * @param {Object} params - Parámetros a firmar (sin el parámetro 's')
   * @returns {string} - Firma hexadecimal
   */
  createSignature(params) {
    // Ordenar parámetros alfabéticamente por nombre
    const sortedKeys = Object.keys(params).sort();
    
    // Concatenar como: nombre_parametrovalorparam1valorparam2...
    // Ejemplo: "amount5000apiKeyXXXXcurrencyCLP"
    let stringToSign = '';
    for (const key of sortedKeys) {
      stringToSign += key + params[key];
    }
    
    console.log('String para firmar:', stringToSign);

    // Firmar con HMAC-SHA256 y secretKey
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(stringToSign)
      .digest('hex');
      
    console.log('Firma generada:', signature);
    return signature;
  }

  /**
   * Crear pago en Flow según API oficial
   * @param {Object} paymentData - Datos del pago
   * @returns {Object} - Respuesta de Flow
   */
  async createPayment(paymentData) {
    // Validar datos requeridos
    const requiredFields = ['commerceOrder', 'subject', 'currency', 'amount', 'email', 'urlConfirmation', 'urlReturn'];
    for (const field of requiredFields) {
      if (!paymentData[field]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    // Preparar parámetros base (ordenados alfabéticamente para facilitar debug)
    const params = {
      amount: paymentData.amount,
      apiKey: this.apiKey,
      commerceOrder: paymentData.commerceOrder,
      currency: paymentData.currency,
      email: paymentData.email,
      subject: paymentData.subject,
      urlConfirmation: paymentData.urlConfirmation,
      urlReturn: paymentData.urlReturn
    };

    // Crear firma (excluyendo el parámetro 's' que contendrá la firma)
    const signature = this.createSignature(params);

    // Preparar FormData para envío a Flow
    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    formData.append('s', signature);
    
    // Agregar parámetros opcionales si existen
    if (paymentData.optional) {
      formData.append('optional', JSON.stringify(paymentData.optional));
    }

    console.log('Flow Client - Creando pago:', {
      url: `${this.baseUrl}/payment/create`,
      commerceOrder: params.commerceOrder,
      amount: params.amount,
      email: params.email
    });

    // Enviar request a Flow API
    const response = await fetch(`${this.baseUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    const responseText = await response.text();
    console.log('Flow Client - Respuesta raw:', responseText);
    
    // Validar respuesta HTTP
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText} - ${responseText}`);
    }

    // Parsear respuesta JSON
    try {
      const result = JSON.parse(responseText);
      
      // Validar respuesta de Flow
      if (result.code && result.code !== 0) {
        throw new Error(`Error Flow (${result.code}): ${result.message || 'Error desconocido'}`);
      }

      return result;
    } catch (parseError) {
      throw new Error(`Error parseando respuesta de Flow: ${responseText}`);
    }
  }

  /**
   * Verificar estado de pago
   * @param {string} token - Token del pago
   * @returns {Object} - Estado del pago
   */
  async getPaymentStatus(token) {
    if (!token) {
      throw new Error('Token es requerido');
    }

    const params = {
      apiKey: this.apiKey,
      token: token
    };

    const signature = this.createSignature(params);

    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    formData.append('s', signature);

    const response = await fetch(`${this.baseUrl}/payment/getStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Error parseando respuesta: ${responseText}`);
    }
  }
}

/**
 * Factory function para crear cliente Flow con configuración del entorno
 * @returns {FlowClient} - Instancia configurada del cliente Flow
 */
export function createFlowClient() {
  const apiKey = process.env.FLOW_API_KEY;
  const secretKey = process.env.FLOW_SECRET_KEY;
  const baseUrl = process.env.FLOW_BASE_URL || 'https://www.flow.cl/api';
  
  if (!apiKey || !secretKey) {
    throw new Error('Variables de entorno FLOW_API_KEY y FLOW_SECRET_KEY son requeridas');
  }
  
  console.log('Creando Flow client desde variables de entorno:', {
    hasApiKey: !!apiKey,
    hasSecretKey: !!secretKey,
    baseUrl: baseUrl,
    apiKeyPrefix: apiKey.substring(0, 8) + '...'
  });
  
  return new FlowClient(apiKey, secretKey, baseUrl);
}

export default FlowClient;
