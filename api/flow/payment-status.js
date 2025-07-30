const crypto = require('crypto');

// Crear firma HMAC-SHA256 para Flow
function createSignature(params, secretKey) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHmac('sha256', secretKey)
    .update(sortedParams)
    .digest('hex');
}

module.exports = async function handler(req, res) {
  // Solo permitir GET para verificar estado
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const apiKey = process.env.FLOW_API_KEY;
    const secretKey = process.env.FLOW_SECRET_KEY;
    const baseUrl = process.env.FLOW_BASE_URL || 'https://sandbox.flow.cl/api';

    if (!apiKey || !secretKey) {
      return res.status(500).json({ 
        error: 'Credenciales de Flow no configuradas' 
      });
    }

    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ 
        error: 'Token requerido' 
      });
    }

    // Preparar parámetros para verificar estado
    const params = {
      apiKey,
      token
    };

    const signature = createSignature(params, secretKey);

    // Preparar datos para Flow
    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    formData.append('s', signature);

    console.log('Verificando estado de pago:', { token });

    // Hacer petición a Flow
    const response = await fetch(`${baseUrl}/payment/getStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    if (!response.ok) {
      console.error('Error verificando estado en Flow:', response.status);
      return res.status(500).json({ 
        error: `Error verificando pago: ${response.status}` 
      });
    }

    const result = await response.json();
    
    console.log('Estado del pago:', {
      token,
      status: result.status,
      paymentData: result.paymentData
    });

    res.status(200).json({
      success: true,
      paymentStatus: result
    });

  } catch (error) {
    console.error('Error en payment-status:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
