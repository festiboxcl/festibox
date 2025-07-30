import crypto from 'crypto';

export default async function handler(req, res) {
  try {
    console.log('🔍 Test Flow Basic - Inicio');
    
    // 1. Credenciales exactas de Flow (hardcoded)
    const apiKey = '1F35DEE4-1B10-49E6-A226-55845L8E1A12';
    const secretKey = '1f47dd2ce362449c28a2c6805f8495b74cd684a1'; // Nueva Secret Key
    const baseUrl = 'https://sandbox.flow.cl/api';
    
    // 2. Datos básicos de prueba
    const commerceOrder = `TEST-${Date.now()}`;
    
    // 3. Parámetros en orden alfabético (esto es crítico para Flow)
    const params = {
      amount: 1000,
      apiKey: apiKey,
      commerceOrder: commerceOrder,
      currency: 'CLP',
      email: 'test@example.com',
      subject: 'Prueba básica',
      urlConfirmation: 'https://festibox.cl/api/flow/confirmation',
      urlReturn: 'https://festibox.cl/pedido-confirmado'
    };
    
    // 4. Crear string para firmar (según documentación Flow)
    const sortedKeys = Object.keys(params).sort();
    let stringToSign = '';
    for (const key of sortedKeys) {
      stringToSign += key + params[key];
    }
    console.log('String para firmar:', stringToSign);
    
    // 5. Firmar con HMAC-SHA256
    const signature = crypto.createHmac('sha256', secretKey)
      .update(stringToSign)
      .digest('hex');
    console.log('Signature generada:', signature);
    
    // 6. Crear formData como lo haría PHP (siguiendo documentación)
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      formData.append(key, value.toString());
    }
    formData.append('s', signature);
    
    console.log('FormData completo:', formData.toString());
    
    // 7. Enviando la solicitud a Flow
    console.log('Enviando solicitud a:', `${baseUrl}/payment/create`);
    
    const response = await fetch(`${baseUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
    
    const responseText = await response.text();
    console.log('Respuesta bruta de Flow:', responseText);
    
    try {
      const result = JSON.parse(responseText);
      
      return res.status(200).json({
        success: true,
        flowResponse: result,
        testDetails: {
          apiKey: apiKey.substring(0, 10) + '...',
          signatureString: stringToSign,
          signature: signature,
          formData: formData.toString()
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error parseando respuesta',
        rawResponse: responseText
      });
    }
  } catch (error) {
    console.error('Error en test-basic:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
