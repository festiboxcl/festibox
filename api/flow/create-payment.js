import { createFlowClient } from './flowClient.js';

/**
 * Generar subject del pago según el tipo de productos
 * @param {Array} items - Items del carrito
 * @returns {string} - Subject del pago
 */
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
    console.log('� Iniciando creación de pago Flow');
    
    // Crear cliente de Flow
    let flowClient;
    try {
      flowClient = createFlowClient();
      console.log('✅ Flow client creado exitosamente');
    } catch (error) {
      console.error('❌ Error creando Flow client:', error.message);
      return res.status(500).json({ 
        error: 'Credenciales de Flow no configuradas en el servidor',
        details: error.message
      });
    }

    const { orderDetails } = req.body;
    console.log('� Detalles del pedido:', JSON.stringify(orderDetails, null, 2));

    // Validar datos del pedido
    if (!orderDetails || !orderDetails.customerEmail || !orderDetails.items?.length || !orderDetails.total) {
      console.error('❌ Datos de pedido incompletos:', {
        hasOrderDetails: !!orderDetails,
        hasEmail: !!orderDetails?.customerEmail,
        hasItems: !!orderDetails?.items?.length,
        hasTotal: !!orderDetails?.total
      });
      return res.status(400).json({ 
        error: 'Datos de pedido incompletos. Se requiere: customerEmail, items y total' 
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderDetails.customerEmail)) {
      return res.status(400).json({ 
        error: 'Email del cliente no es válido' 
      });
    }

    // Validar monto mínimo
    if (orderDetails.total < 100) {
      return res.status(400).json({ 
        error: 'El monto mínimo para un pago es $100 CLP' 
      });
    }

    // Crear orden única con timestamp más preciso
    const commerceOrder = `FESTIBOX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Usar dominio fijo para producción (compatible con custom domain)
    const baseUrlSite = process.env.VERCEL_ENV === 'production' 
      ? 'https://festibox.vercel.app'
      : `https://${req.headers.host}`;

    console.log('🌐 Configuración de URLs:', {
      vercelEnv: process.env.VERCEL_ENV,
      host: req.headers.host,
      baseUrlSite: baseUrlSite
    });

    // Preparar datos para Flow
    const paymentData = {
      commerceOrder,
      subject: generateSubject(orderDetails.items),
      currency: 'CLP',
      amount: Math.round(orderDetails.total), // Asegurar que sea entero
      email: orderDetails.customerEmail.trim().toLowerCase(),
      urlConfirmation: `${baseUrlSite}/api/flow/confirmation`,
      urlReturn: `${baseUrlSite}/pedido-confirmado?order=${commerceOrder}`,
      optional: {
        customer: {
          email: orderDetails.customerEmail
        },
        items: orderDetails.items.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          photos: item.photos?.length || 0,
          messages: item.messages?.filter(m => m?.trim()).length || 0
        })),
        totals: {
          subtotal: orderDetails.subtotal,
          shipping: orderDetails.shipping,
          total: orderDetails.total
        }
      }
    };

    console.log('🚀 Enviando pago a Flow:', {
      commerceOrder,
      amount: paymentData.amount,
      email: paymentData.email,
      urlConfirmation: paymentData.urlConfirmation,
      urlReturn: paymentData.urlReturn
    });
    
    try {
      // Crear el pago en Flow
      const result = await flowClient.createPayment(paymentData);
      console.log('✅ Respuesta exitosa de Flow:', result);
      
      // Validar respuesta de Flow
      if (!result.url || !result.token) {
        console.error('❌ Respuesta incompleta de Flow:', result);
        return res.status(500).json({ 
          error: 'Respuesta incompleta de Flow',
          details: result
        });
      }

      // Log del pago creado
      console.log('💰 Pago creado exitosamente:', {
        commerceOrder,
        flowOrder: result.flowOrder,
        token: result.token,
        url: result.url
      });

      // Responder con datos del pago
      res.status(200).json({
        success: true,
        flowOrder: result.flowOrder,
        url: result.url,
        token: result.token,
        commerceOrder
      });
      
    } catch (flowError) {
      console.error('❌ Error comunicándose con Flow:', flowError);
      
      // Determinar tipo de error
      if (flowError.message.includes('Error HTTP 400')) {
        return res.status(400).json({ 
          error: 'Datos inválidos para Flow', 
          details: flowError.message
        });
      } else if (flowError.message.includes('Error Flow')) {
        return res.status(400).json({ 
          error: 'Error reportado por Flow', 
          details: flowError.message
        });
      } else {
        return res.status(500).json({ 
          error: 'Error de comunicación con Flow', 
          details: flowError.message
        });
      }
    }

  } catch (error) {
    console.error('❌ Error crítico en create-payment:', error);
    console.error('❌ Stack trace:', error.stack);
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
