import crypto from 'crypto';

// Crear firma HMAC-SHA256 para verificar confirmación de Flow
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

export default async function handler(req, res) {
  // Flow envía POST para confirmaciones
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const secretKey = process.env.FLOW_SECRET_KEY;
    
    if (!secretKey) {
      console.error('Secret Key de Flow no configurada');
      return res.status(500).json({ error: 'Configuración del servidor incompleta' });
    }

    // Flow envía los datos en el body
    const { token, signature: receivedSignature } = req.body;

    if (!token || !receivedSignature) {
      console.error('Datos de confirmación incompletos:', req.body);
      return res.status(400).json({ error: 'Datos de confirmación incompletos' });
    }

    // Verificar la firma enviada por Flow
    const expectedSignature = createSignature({ token }, secretKey);
    
    if (expectedSignature !== receivedSignature) {
      console.error('Firma inválida:', {
        expected: expectedSignature,
        received: receivedSignature
      });
      return res.status(400).json({ error: 'Firma de confirmación inválida' });
    }

    console.log('Confirmación de pago recibida:', {
      token,
      timestamp: new Date().toISOString()
    });

    // Aquí podrías:
    // 1. Verificar el estado del pago con Flow
    // 2. Actualizar la base de datos
    // 3. Enviar emails de confirmación
    // 4. Procesar el pedido

    // Por ahora solo logueamos y confirmamos
    console.log('Pago confirmado exitosamente para token:', token);

    // Flow espera una respuesta HTTP 200 para confirmar que recibimos la notificación
    res.status(200).json({ 
      success: true,
      message: 'Confirmación procesada correctamente',
      token 
    });

  } catch (error) {
    console.error('Error procesando confirmación de Flow:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
