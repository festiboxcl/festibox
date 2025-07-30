import crypto from 'crypto';

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
    console.log('🔍 Variables de entorno disponibles:', {
      hasApiKey: !!process.env.FLOW_API_KEY,
      hasSecretKey: !!process.env.FLOW_SECRET_KEY,
      hasBaseUrl: !!process.env.FLOW_BASE_URL,
      apiKeyStart: process.env.FLOW_API_KEY?.substring(0, 10) + '...',
      baseUrl: process.env.FLOW_BASE_URL
    });

    // Obtener credenciales de las variables de entorno
    const apiKey = process.env.FLOW_API_KEY;
    const secretKey = process.env.FLOW_SECRET_KEY;
    const baseUrl = process.env.FLOW_BASE_URL || 'https://sandbox.flow.cl/api';

    if (!apiKey || !secretKey) {
      console.error('❌ Credenciales de Flow no configuradas:', {
        hasApiKey: !!apiKey,
        hasSecretKey: !!secretKey
      });
      return res.status(500).json({ 
        error: 'Credenciales de Flow no configuradas en el servidor' 
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

    // Preparar parámetros para la firma
    const params = {
      apiKey,
      commerceOrder: paymentData.commerceOrder,
      subject: paymentData.subject,
      currency: paymentData.currency,
      amount: paymentData.amount,
      email: paymentData.email,
      urlConfirmation: paymentData.urlConfirmation,
      urlReturn: paymentData.urlReturn
    };

    // Crear firma
    const signature = createSignature(params, secretKey);

    // Preparar datos para enviar a Flow
    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    formData.append('s', signature);
    formData.append('optional', JSON.stringify(paymentData.optional));

    console.log('Enviando pago a Flow:', {
      url: `${baseUrl}/payment/create`,
      commerceOrder,
      amount: paymentData.amount,
      email: paymentData.email
    });

    // Hacer petición a Flow
    const response = await fetch(`${baseUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    const responseText = await response.text();
    console.log('Respuesta de Flow (raw):', responseText);

    if (!response.ok) {
      console.error('Error HTTP de Flow:', response.status, response.statusText);
      return res.status(500).json({ 
        error: `Error de Flow: ${response.status} ${response.statusText}`,
        details: responseText
      });
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parseando respuesta de Flow:', parseError);
      return res.status(500).json({ 
        error: 'Respuesta inválida de Flow',
        details: responseText
      });
    }

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
