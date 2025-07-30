// Debug temporal para verificar la generación de firmas
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.FLOW_API_KEY;
  const secretKey = process.env.FLOW_SECRET_KEY;

  // Datos de prueba similares a los del log
  const testParams = {
    amount: 12990,
    apiKey: apiKey,
    commerceOrder: 'FESTIBOX-TEST-DEBUG',
    currency: 'CLP',
    email: 'javohv@gmail.com',
    subject: 'Compra FestiBox',
    urlConfirmation: 'https://festibox.vercel.app/api/flow/confirmation',
    urlReturn: 'https://festibox.vercel.app/pedido-confirmado?order=FESTIBOX-TEST-DEBUG'
  };

  // Ordenar parámetros alfabéticamente
  const sortedKeys = Object.keys(testParams).sort();
  
  // Concatenar string a firmar
  let stringToSign = '';
  for (const key of sortedKeys) {
    stringToSign += key + testParams[key];
  }

  // Crear firma
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('hex');

  // Mostrar información de debug
  const result = {
    credenciales: {
      hasApiKey: !!apiKey,
      hasSecretKey: !!secretKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      secretKeyLength: secretKey ? secretKey.length : 0,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'NO_KEY',
      secretKeyHex: secretKey ? Buffer.from(secretKey, 'utf8').toString('hex') : 'NO_KEY'
    },
    parametros: testParams,
    proceso: {
      sortedKeys,
      stringToSign,
      stringLength: stringToSign.length,
      signature
    },
    // Vamos a probar también con diferentes algoritmos
    firmasAlternativas: {
      sha256_utf8: crypto.createHmac('sha256', secretKey).update(stringToSign, 'utf8').digest('hex'),
      sha256_ascii: crypto.createHmac('sha256', secretKey).update(stringToSign, 'ascii').digest('hex'),
      sha256_latin1: crypto.createHmac('sha256', secretKey).update(stringToSign, 'latin1').digest('hex')
    }
  };

  return res.json(result);
}
