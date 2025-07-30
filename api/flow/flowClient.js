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
   * Basado en la implementación PHP oficial de Flow
   * @param {Object} params - Parámetros a firmar (DEBE incluir apiKey)
   * @returns {string} - Firma hexadecimal
   */
  createSignature(params) {
    // Según el código oficial PHP, el apiKey SÍ debe incluirse en la firma
    // Línea PHP: $params = array("apiKey" => $this->apiKey) + $params;
    
    // Ordenar parámetros alfabéticamente por nombre (igual que sort($keys) en PHP)
    const sortedKeys = Object.keys(params).sort();
    
    // Concatenar como: parametro1valor1parametro2valor2...
    // Según PHP: foreach ($keys as $key) { $toSign .= $key . $params[$key]; }
    let stringToSign = '';
    for (const key of sortedKeys) {
      // Convertir todo a string y concatenar directamente
      stringToSign += key + String(params[key]);
    }

    console.log('Flow Debug - Params to sign:', Object.keys(params).sort());
    console.log('Flow Debug - String to sign:', stringToSign);
    console.log('Flow Debug - String length:', stringToSign.length);
    console.log('Flow Debug - Secret key length:', this.secretKey.length);
    
    // Firmar con HMAC-SHA256 igual que PHP: hash_hmac('sha256', $toSign , $this->secretKey)
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(stringToSign, 'utf8')
      .digest('hex');
      
    console.log('Flow Debug - Generated signature:', signature);
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

    // Replicar exactamente el comportamiento de FlowApi.class.php
    // Línea PHP: $params = array("apiKey" => $this->apiKey) + $params;
    const params = {
      apiKey: this.apiKey,
      ...paymentData
    };

    // Crear firma exactamente como en PHP
    // Línea PHP: $params["s"] = $this->sign($params);
    const signature = this.createSignature(params);
    params.s = signature;

    console.log('Flow Client - Parámetros finales:', Object.keys(params).sort());
    console.log('Flow Client - Creando pago:', {
      url: `${this.baseUrl}/payment/create`,
      commerceOrder: params.commerceOrder,
      amount: params.amount,
      email: params.email
    });

    // Replicar httpPost de PHP: curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
    // En PHP esto convierte automáticamente el array a form-urlencoded
    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    // Enviar request a Flow API exactamente como en PHP
    const response = await fetch(`${this.baseUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'FestiBox/1.0'
      },
      body: formData
    });

    const responseText = await response.text();
    console.log('Flow Client - Respuesta raw:', responseText);
    
    // Validar respuesta HTTP
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText} - ${responseText}`);
    }

    // Parsear respuesta JSON como en PHP: json_decode($response["output"], true)
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

    // Replicar exactamente el comportamiento de FlowApi.class.php
    const params = {
      apiKey: this.apiKey,
      token: token
    };

    // Crear firma exactamente como en PHP
    const signature = this.createSignature(params);
    params.s = signature;

    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

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
  
  console.log('Creando Flow client desde variables de entorno (PRODUCCIÓN):', {
    hasApiKey: !!apiKey,
    hasSecretKey: !!secretKey,
    baseUrl: baseUrl,
    apiKeyPrefix: apiKey.substring(0, 8) + '...'
  });
  
  return new FlowClient(apiKey, secretKey, baseUrl);
}

export default FlowClient;
