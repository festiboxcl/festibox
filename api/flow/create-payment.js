import { createFlowClient } from './flowClient.js';

// Generar subject del pago
function generateSubject(items) {
  if (items.length === 1) {
    return `FestiBox - ${items[0].product.name} (${items[0].quantity}x)`;
  } else {
    return `FestiBox - Pedido de ${items.length} productos`;
  }
}

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Inicio de create-payment');
    
    // Crear cliente de Flow
    let flowClient;
    try {
      flowClient = createFlowClient();
      console.log('🔍 Flow client creado exitosamente');
    } catch (error) {
      console.error('❌ Error creando Flow client:', error.message);
      return res.status(500).json({ 
        error: 'Credenciales de Flow no configuradas en el servidor',
        details: error.message
      });
    }

    const { orderDetails } = req.body;
    console.log('🔍 OrderDetails recibidos:', JSON.stringify(orderDetails, null, 2));

    if (!orderDetails || !orderDetails.customerEmail || !orderDetails.items?.length) {
      console.error('❌ Datos de pedido incompletos:', {
        hasOrderDetails: !!orderDetails,
        hasEmail: !!orderDetails?.customerEmail,
        hasItems: !!orderDetails?.items?.length
      });
      return res.status(400).json({ 
        error: 'Datos de pedido incompletos' 
      });
    }

    // Crear orden única
    const commerceOrder = `FESTIBOX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Obtener el dominio base de la request
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const baseUrlSite = `${protocol}://${host}`;

    const paymentData = {
      commerceOrder,
      subject: generateSubject(orderDetails.items),
      currency: 'CLP',
      amount: orderDetails.total,
      email: orderDetails.customerEmail,
      urlConfirmation: `${baseUrlSite}/api/flow/confirmation`,
      urlReturn: `${baseUrlSite}/pedido-confirmado?order=${commerceOrder}`,
      optional: {
        items: orderDetails.items.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          photos: item.photos?.length || 0,
          messages: item.messages?.filter(m => m?.trim()).length || 0
        }))
      }
    };

    console.log('Enviando pago a Flow con el cliente:', {
      commerceOrder,
      amount: paymentData.amount,
      email: paymentData.email
    });
    
    try {
      // Usar el cliente para crear el pago
      const result = await flowClient.createPayment(paymentData);
      console.log('Respuesta de Flow procesada:', result);
      
      if (result.status !== 'ok') {
        console.error('Flow respondió con error:', result);
        return res.status(400).json({ 
          error: `Error de Flow: ${result.message || 'Error desconocido'}`,
          details: result
        });
      }

      // Guardar información del pedido (opcional - podrías usar una base de datos)
      console.log('Pago creado exitosamente:', {
        commerceOrder,
        flowOrder: result.flowOrder,
        token: result.token
      });

      // Responder con los datos del pago
      res.status(200).json({
        success: true,
        flowOrder: result.flowOrder,
        url: result.url,
        token: result.token,
        commerceOrder
      });
      
    } catch (flowError) {
      console.error('Error en la comunicación con Flow:', flowError);
      return res.status(500).json({ 
        error: 'Error comunicándose con Flow', 
        details: flowError instanceof Error ? flowError.message : String(flowError)
      });
    }

  } catch (error) {
    console.error('❌ Error en create-payment:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    });
  }
};
