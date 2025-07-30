// Script temporal para verificar credenciales de Flow
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.FLOW_API_KEY;
  const secretKey = process.env.FLOW_SECRET_KEY;
  const baseUrl = process.env.FLOW_BASE_URL;

  const result = {
    hasApiKey: !!apiKey,
    hasSecretKey: !!secretKey,
    hasBaseUrl: !!baseUrl,
    apiKeyLength: apiKey ? apiKey.length : 0,
    secretKeyLength: secretKey ? secretKey.length : 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'NO_KEY',
    secretKeyPrefix: secretKey ? secretKey.substring(0, 8) + '...' : 'NO_KEY',
    baseUrl: baseUrl || 'NO_URL',
    // También mostramos los caracteres exactos para debug
    secretKeyHex: secretKey ? Buffer.from(secretKey, 'utf8').toString('hex') : 'NO_KEY'
  };

  return res.json(result);
}
