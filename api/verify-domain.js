// Test final específico para verificar dominio principal
export default async function handler(req, res) {
  try {
    const apiKey = process.env.FLOW_API_KEY;
    const secretKey = process.env.FLOW_SECRET_KEY;
    
    // Test simple para verificar credenciales desde dominio principal
    const testParams = {
      amount: 1000,
      apiKey: apiKey,
      commerceOrder: 'VERIFY-' + Date.now(),
      currency: 'CLP',
      email: 'javohv@gmail.com',
      subject: 'Verificacion FestiBox',
      urlConfirmation: 'https://festibox.cl/api/flow/confirmation',
      urlReturn: 'https://festibox.cl/pedido-confirmado'
    };
    
    // Calcular firma
    const sortedKeys = Object.keys(testParams).sort();
    let stringToSign = '';
    for (const key of sortedKeys) {
      stringToSign += key + testParams[key];
    }
    
    const crypto = await import('crypto');
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(stringToSign, 'utf8')
      .digest('hex');
    
    // Preparar FormData
    const formData = new URLSearchParams();
    Object.entries(testParams).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    formData.append('s', signature);
    
    // Llamar a Flow
    const response = await fetch('https://www.flow.cl/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData
    });
    
    const responseText = await response.text();
    const result = JSON.parse(responseText);
    
    return res.status(200).json({
      success: true,
      message: '🎉 DOMINIO PRINCIPAL FUNCIONANDO',
      domain: req.headers.host,
      credentials: {
        secretKeyLength: secretKey?.length,
        apiKeyPrefix: apiKey?.substring(0, 8) + '...'
      },
      flowTest: {
        status: response.status,
        working: response.status === 200,
        hasToken: !!result.token,
        result: result
      }
    });
    
  } catch (error) {
    console.error('❌ Error verificando dominio principal:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message,
      domain: req.headers.host
    });
  }
}
