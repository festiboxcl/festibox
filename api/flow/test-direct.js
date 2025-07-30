import crypto from 'crypto';

// Crear firma HMAC-SHA256 para Flow directamente con las credenciales exactas
function createSignature(params, secretKey) {
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
    .createHmac('sha256', secretKey)
    .update(toSign)
    .digest('hex');
}

export default async function handler(req, res) {
  try {
    // Usar las credenciales exactas como se muestran en Flow
    const apiKey = '1F35DEE4-1B10-49E6-A226-55845L8E1A12';
    const secretKey = '1f47dd2ce362449c28a2c6805f8495b74cd684a1'; // Nueva Secret Key
    const baseUrl = 'https://sandbox.flow.cl/api';
    
    // Crear datos de prueba básicos
    const testData = {
      commerceOrder: `TEST-${Date.now()}`,
      subject: 'Prueba directa de API Flow',
      currency: 'CLP',
      amount: 1000,
      email: 'test@example.com',
      urlConfirmation: `https://festibox.cl/api/flow/confirmation`,
      urlReturn: `https://festibox.cl/pedido-confirmado?order=test`
    };

    // Preparar parámetros para la firma
    const params = {
      apiKey,
      commerceOrder: testData.commerceOrder,
      subject: testData.subject,
      currency: testData.currency,
      amount: testData.amount,
      email: testData.email,
      urlConfirmation: testData.urlConfirmation,
      urlReturn: testData.urlReturn
    };

    // Crear firma
    const signature = createSignature(params, secretKey);

    // Preparar datos para enviar a Flow
    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    formData.append('s', signature);

    console.log('Test directo - Enviando a Flow:', {
      apiKey,
      signature,
      formData: formData.toString()
    });

    // Hacer petición a Flow directamente
    const response = await fetch(`${baseUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    const responseText = await response.text();
    console.log('Respuesta bruta de Flow:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (error) {
      console.error('Error parseando respuesta:', error);
      return res.status(500).json({
        success: false,
        error: 'Error parseando respuesta de Flow',
        rawResponse: responseText
      });
    }

    return res.status(200).json({
      success: true,
      testParams: {
        apiKey: apiKey,
        formData: formData.toString()
      },
      flowResponse: result
    });
  } catch (error) {
    console.error('Error en test directo:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
