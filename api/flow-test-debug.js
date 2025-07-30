// Test directo de credenciales Flow
import crypto from 'crypto';

export default async function handler(req, res) {
  try {
    console.log('🧪 TEST DIRECTO FLOW - Verificando credenciales');
    
    // Credenciales exactas de la imagen
    const apiKey = '1F35DEE4-1B10-49E6-A226-55845L8E1A12';
    const secretKey = '1f47dd2ce362449c28a2c6805f8495b74cd684a1';
    
    // Test más simple posible
    const params = {
      amount: 1000,
      apiKey: apiKey,
      commerceOrder: `TEST-${Date.now()}`,
      currency: 'CLP',
      email: 'test@test.com',
      subject: 'Test mínimo',
      urlConfirmation: 'https://festibox.cl/test',
      urlReturn: 'https://festibox.cl/test'
    };
    
    // Crear firma exacta según Flow
    const sortedKeys = Object.keys(params).sort();
    let stringToSign = '';
    for (const key of sortedKeys) {
      stringToSign += key + params[key];
    }
    
    console.log('String para firmar:', stringToSign);
    
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(stringToSign)
      .digest('hex');
    
    console.log('Firma generada:', signature);
    
    // Preparar FormData
    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    formData.append('s', signature);
    
    console.log('FormData completo:', formData.toString());
    
    // Test a sandbox Flow
    const response = await fetch('https://sandbox.flow.cl/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
    
    const responseText = await response.text();
    
    console.log('Respuesta Flow:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      result = { parseError: true, rawText: responseText };
    }
    
    return res.status(200).json({
      success: true,
      test: 'Test directo Flow API',
      request: {
        url: 'https://sandbox.flow.cl/api/payment/create',
        stringToSign: stringToSign,
        signature: signature
      },
      response: {
        status: response.status,
        result: result
      }
    });
    
  } catch (error) {
    console.error('Error en test:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
