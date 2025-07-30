import crypto from 'crypto';

export default async function handler(req, res) {
  try {
    console.log('🔍 Test Flow con API Key alternativa');
    
    // Esta es una versión distinta de la API Key para probar
    // Intenta reemplazar guiones y posible error L/1
    // También prueba con versiones sin espacios en blanco
    const apiKeys = [
      '1F35DEE4-1B10-49E6-A226-55845L8E1A12', // Original
      '1F35DEE41B1049E6A22655845L8E1A12', // Sin guiones
      '1F35DEE4-1B10-49E6-A226-5584518E1A12', // L por 1
      '1F35DEE41B1049E6A2265584518E1A12' // Sin guiones y L por 1
    ];
    
    const secretKey = 'f6944874c7b8a70c8da78c14f03f853b50019c31';
    const baseUrl = 'https://sandbox.flow.cl/api';
    
    const results = [];
    
    for (const apiKey of apiKeys) {
      const commerceOrder = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      // Parámetros básicos para la prueba
      const params = {
        amount: 1000,
        apiKey: apiKey,
        commerceOrder: commerceOrder,
        currency: 'CLP',
        email: 'test@example.com',
        subject: 'Prueba API Key',
        urlConfirmation: 'https://festibox.cl/api/flow/confirmation',
        urlReturn: 'https://festibox.cl/pedido-confirmado'
      };
      
      // Crear string para firmar (según documentación Flow)
      const sortedKeys = Object.keys(params).sort();
      let stringToSign = '';
      for (const key of sortedKeys) {
        stringToSign += key + params[key];
      }
      
      // Firmar con HMAC-SHA256
      const signature = crypto.createHmac('sha256', secretKey)
        .update(stringToSign)
        .digest('hex');
      
      // Crear formData
      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        formData.append(key, value.toString());
      }
      formData.append('s', signature);
      
      try {
        // Enviando la solicitud a Flow
        const response = await fetch(`${baseUrl}/payment/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData
        });
        
        const responseText = await response.text();
        console.log(`Respuesta para API Key ${apiKey.substring(0, 10)}...: ${responseText}`);
        
        let resultJson;
        try {
          resultJson = JSON.parse(responseText);
        } catch (e) {
          resultJson = { parseError: true, text: responseText };
        }
        
        results.push({
          apiKey: apiKey.substring(0, 10) + '...',
          status: response.status,
          result: resultJson
        });
      } catch (error) {
        results.push({
          apiKey: apiKey.substring(0, 10) + '...',
          error: error.message
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error en test-keys:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
