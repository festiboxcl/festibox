import crypto from 'crypto';
import flowConfig from './flowConfig.js';

/**
 * Crear firma HMAC-SHA256 para verificar notificaciones de Flow
 * Según documentación oficial: concatenar nombre_parametro + valor
 * @param {Object} params - Parámetros a firmar
 * @param {string} secretKey - Secret Key de Flow
 * @returns {string} - Firma hexadecimal
 */
function createSignature(params, secretKey) {
  // Ordenar parámetros alfabéticamente
  const sortedKeys = Object.keys(params).sort();
  
  // Concatenar como: nombre_parametrovalor (sin separadores)
  let stringToSign = '';
  for (const key of sortedKeys) {
    stringToSign += key + params[key];
  }
  
  console.log('Verificando firma - String:', stringToSign);

  return crypto
    .createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('hex');
}

export default async function handler(req, res) {
  console.log('🔔 Confirmación Flow - Método:', req.method);
  console.log('🔔 Headers:', req.headers);
  console.log('🔔 Body:', req.body);

  // Flow envía confirmaciones via POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const secretKey = flowConfig.secretKey;
    
    if (!secretKey) {
      console.error('❌ Secret Key de Flow no configurada');
      return res.status(500).json({ error: 'Configuración del servidor incompleta' });
    }

    // Flow puede enviar el token en el body o como form-data
    const token = req.body.token || req.body.get?.('token');

    if (!token) {
      console.error('❌ Token faltante en confirmación:', req.body);
      return res.status(400).json({ error: 'Token requerido' });
    }

    console.log('✅ Confirmación recibida para token:', token);

    // Verificar el pago directamente con Flow usando nuestro cliente
    try {
      const { createFlowClient } = await import('./flowClient.js');
      const flowClient = createFlowClient();
      
      const paymentStatus = await flowClient.getPaymentStatus(token);
      console.log('📊 Estado del pago verificado:', paymentStatus);

      // Aquí puedes agregar lógica específica según el estado:
      // - Actualizar base de datos
      // - Enviar emails de confirmación  
      // - Procesar el pedido
      // - etc.

      if (paymentStatus.status === 2) { // 2 = PAID en Flow
        console.log('💰 Pago confirmado exitosamente:', {
          token,
          flowOrder: paymentStatus.flowOrder,
          amount: paymentStatus.amount
        });
      }

      // Flow espera respuesta HTTP 200 para confirmar recepción
      res.status(200).json({ 
        success: true,
        message: 'Confirmación procesada correctamente',
        token,
        paymentStatus: paymentStatus.status
      });

    } catch (flowError) {
      console.error('❌ Error verificando pago con Flow:', flowError);
      // Aún así responder 200 para que Flow no reintente
      res.status(200).json({ 
        success: false,
        message: 'Error verificando pago pero confirmación recibida',
        token,
        error: flowError.message
      });
    }

  } catch (error) {
    console.error('❌ Error procesando confirmación:', error);
    
    // Importante: siempre responder 200 a Flow para evitar reintentos
    res.status(200).json({ 
      success: false,
      message: 'Error procesando confirmación',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
