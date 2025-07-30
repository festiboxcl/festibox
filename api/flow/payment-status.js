import { createFlowClient } from './flowClient.js';

export default async function handler(req, res) {
  // Solo permitir GET para verificar estado
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Crear cliente Flow
    let flowClient;
    try {
      flowClient = createFlowClient();
    } catch (error) {
      console.error('❌ Error configurando Flow client:', error);
      return res.status(500).json({ 
        error: 'Credenciales de Flow no configuradas en el servidor',
        details: error.message
      });
    }

    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ 
        error: 'Token requerido' 
      });
    }

    console.log('🔍 Verificando estado de pago para token:', token);

    // Usar el cliente para verificar estado
    const paymentStatus = await flowClient.getPaymentStatus(token);
    
    console.log('📊 Estado del pago:', {
      token,
      status: paymentStatus.status,
      flowOrder: paymentStatus.flowOrder
    });

    res.status(200).json({
      success: true,
      paymentStatus
    });

  } catch (error) {
    console.error('❌ Error verificando estado del pago:', error);
    res.status(500).json({ 
      error: 'Error verificando estado del pago',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
