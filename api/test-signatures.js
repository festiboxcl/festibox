// Implementación de prueba para verificar diferentes algoritmos de firma Flow
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.FLOW_API_KEY;
  const secretKey = process.env.FLOW_SECRET_KEY;

  // Parámetros de prueba (usando los mismos del log)
  const params = {
    amount: 12990,
    apiKey: apiKey,
    commerceOrder: 'FESTIBOX-TEST-SIGNATURE',
    currency: 'CLP',
    email: 'javohv@gmail.com',
    subject: 'FestiBox - Tarjeta Explosiva Simple (1x)',
    urlConfirmation: 'https://festibox.cl/api/flow/confirmation',
    urlReturn: 'https://festibox.cl/pedido-confirmado?order=FESTIBOX-TEST-SIGNATURE'
  };

  // Según el código oficial PHP de Flow, el apiKey SÍ debe incluirse en la firma
  // Método 1: Nuestro algoritmo según implementación oficial
  const sortedKeys1 = Object.keys(params).sort();
  let stringToSign1 = '';
  for (const key of sortedKeys1) {
    stringToSign1 += key + String(params[key]);
  }
  const signature1 = crypto.createHmac('sha256', secretKey).update(stringToSign1, 'utf8').digest('hex');

  // Método 2: Intentar con encoding latin1
  const signature2 = crypto.createHmac('sha256', secretKey).update(stringToSign1, 'latin1').digest('hex');

  // Método 3: Sin encoding específico
  const signature3 = crypto.createHmac('sha256', secretKey).update(stringToSign1).digest('hex');

  // Método 4: Usar secretKey como buffer
  const secretBuffer = Buffer.from(secretKey, 'utf8');
  const signature4 = crypto.createHmac('sha256', secretBuffer).update(stringToSign1, 'utf8').digest('hex');

  // Método 5: Probar ordenamiento diferente (por valor en lugar de clave)
  const entries = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
  let stringToSign5 = '';
  for (const [key, value] of entries) {
    stringToSign5 += key + String(value);
  }
  const signature5 = crypto.createHmac('sha256', secretKey).update(stringToSign5, 'utf8').digest('hex');

  // Método 6: Probar con formato key=value&
  let stringToSign6 = '';
  for (const key of sortedKeys1) {
    stringToSign6 += key + '=' + String(params[key]) + '&';
  }
  stringToSign6 = stringToSign6.slice(0, -1); // Remover último &
  const signature6 = crypto.createHmac('sha256', secretKey).update(stringToSign6, 'utf8').digest('hex');

  // Probar ahora con Flow API
  const testResult = await testWithFlow(params, signature1, secretKey);

  return res.json({
    credenciales: {
      apiKeyLength: apiKey?.length || 0,
      secretKeyLength: secretKey?.length || 0,
      apiKey: apiKey?.substring(0, 20) + '...',
      secretKey: secretKey?.substring(0, 10) + '...'
    },
    paramsOriginal: Object.keys(params).sort(),
    stringToSign: stringToSign1,
    stringLength: stringToSign1.length,
    signatures: {
      utf8: signature1,
      latin1: signature2,
      default: signature3,
      buffer: signature4,
      localSort: signature5,
      keyValue: signature6
    },
    testResult
  });
}

async function testWithFlow(params, signature, secretKey) {
  try {
    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    formData.append('s', signature);

    const response = await fetch('https://www.flow.cl/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'FestiBox/1.0'
      },
      body: formData
    });

    const responseText = await response.text();
    
    return {
      status: response.status,
      statusText: response.statusText,
      response: responseText
    };
  } catch (error) {
    return {
      error: error.message
    };
  }
}
