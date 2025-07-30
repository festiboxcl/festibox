// Script minimal para probar conexión con Flow con parámetros mínimos
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = '1F35DEE4-1B10-49E6-A226-55845L8E1A12';
  const secretKey = '1f47dd2ce362449c28a2c6805f8495b74cd684a1';

  // Probar con parámetros mínimos según documentación
  const params = {
    amount: 1000,
    apiKey: apiKey,
    commerceOrder: 'TEST-MINIMAL-' + Date.now(),
    currency: 'CLP',
    email: 'test@example.com',
    subject: 'Test minimal',
    urlConfirmation: 'https://festibox.cl/api/flow/confirmation',
    urlReturn: 'https://festibox.cl/'
  };

  console.log('=== PRUEBA MINIMAL FLOW ===');
  console.log('Parámetros:', params);

  // Firmar según algoritmo oficial
  const sortedKeys = Object.keys(params).sort();
  let stringToSign = '';
  for (const key of sortedKeys) {
    stringToSign += key + String(params[key]);
  }

  console.log('String para firmar:', stringToSign);
  console.log('Longitud string:', stringToSign.length);

  // Probar múltiples variantes de firma
  const signatures = {
    normal: crypto.createHmac('sha256', secretKey).update(stringToSign, 'utf8').digest('hex'),
    noEncoding: crypto.createHmac('sha256', secretKey).update(stringToSign).digest('hex'),
    secretUppercase: crypto.createHmac('sha256', secretKey.toUpperCase()).update(stringToSign, 'utf8').digest('hex'),
    secretBuffer: crypto.createHmac('sha256', Buffer.from(secretKey, 'utf8')).update(stringToSign, 'utf8').digest('hex')
  };

  console.log('Firmas generadas:', signatures);

  // Probar cada firma
  const results = [];
  
  for (const [method, signature] of Object.entries(signatures)) {
    try {
      const formData = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      formData.append('s', signature);

      console.log(`Probando método ${method} con firma: ${signature}`);

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
      
      results.push({
        method,
        signature,
        status: response.status,
        response: responseText
      });

      console.log(`Resultado ${method}:`, {
        status: response.status,
        response: responseText
      });

    } catch (error) {
      results.push({
        method,
        signature,
        error: error.message
      });
      console.log(`Error ${method}:`, error.message);
    }
  }

  return res.json({
    params,
    stringToSign,
    signatures,
    results
  });
}
