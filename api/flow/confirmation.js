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
  console.log('🔔 Query:', req.query);

  // Flow puede usar GET para verificación de conectividad y POST para confirmaciones reales
  if (req.method === 'GET') {
    // Respuesta para verificación de conectividad
    console.log('✅ Verificación de conectividad Flow - Respondiendo OK');
    return res.status(200).json({ 
      success: true,
      message: 'Endpoint de confirmación Flow activo',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const secretKey = flowConfig.secretKey;
    
    if (!secretKey) {
      console.error('❌ Secret Key de Flow no configurada');
      return res.status(500).json({ error: 'Configuración del servidor incompleta' });
    }

    // Flow puede enviar el token de diferentes formas
    let token = null;
    
    // Buscar token en diferentes lugares
    if (req.body && typeof req.body === 'object') {
      token = req.body.token;
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }
    
    // Si el body es form-data, intentar parsearlo
    if (!token && req.body && typeof req.body === 'string') {
      try {
        const parsed = new URLSearchParams(req.body);
        token = parsed.get('token');
      } catch (e) {
        console.log('No se pudo parsear body como form-data');
      }
    }

    if (!token) {
      console.error('❌ Token faltante en confirmación. Body:', req.body, 'Query:', req.query);
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

        // Obtener datos del pedido desde el commerceOrder
        try {
          const orderData = await getOrderDataFromCommerce(paymentStatus.commerceOrder);
          
          if (orderData) {
            // Enviar notificación simple (siempre funciona)
            try {
              const { sendSimpleNotification } = await import('../services/simpleEmailService.js');
              await sendSimpleNotification(orderData, paymentStatus);
              console.log('✅ Notificación simple enviada');
            } catch (notificationError) {
              console.error('❌ Error enviando notificación simple:', notificationError);
            }
            
            // Intentar enviar emails si está configurado
            try {
              const { sendOrderNotificationToAdmin, sendConfirmationToCustomer } = await import('../services/emailService.js');
              
              // Email al administrador
              if (process.env.EMAIL_PASSWORD || process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY) {
                await sendOrderNotificationToAdmin(orderData, paymentStatus);
                console.log('✅ Email enviado al administrador');
              } else {
                console.log('⚠️ Email no configurado - solo notificación simple enviada');
              }
              
              // Email al cliente
              if (process.env.EMAIL_PASSWORD || process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY) {
                await sendConfirmationToCustomer(orderData, paymentStatus);
                console.log('✅ Email de confirmación enviado al cliente');
              }
              
            } catch (emailError) {
              console.error('❌ Error enviando emails (usando fallback):', emailError);
            }
          }
        } catch (orderError) {
          console.error('❌ Error obteniendo datos del pedido:', orderError);
        }
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

/**
 * Obtener datos del pedido desde el commerceOrder
 * Por ahora simularemos los datos, pero en el futuro esto debería
 * conectarse a una base de datos o sistema de almacenamiento
 * @param {string} commerceOrder - ID de la orden de comercio
 * @returns {Object|null} - Datos del pedido
 */
async function getOrderDataFromCommerce(commerceOrder) {
  try {
    // Por ahora retornamos datos simulados
    // En el futuro, esto debería consultar una base de datos
    // donde se almacenen los pedidos por commerceOrder
    
    console.log('🔍 Buscando datos del pedido para:', commerceOrder);
    
    // Simular datos del pedido
    // TODO: Implementar búsqueda real en base de datos
    const mockOrderData = {
      commerceOrder: commerceOrder,
      customerEmail: 'javohv@gmail.com', // Este debería venir de la BD
      total: 12990,
      subtotal: 7990,
      shipping: 5000,
      items: [
        {
          product: {
            name: 'Tarjeta Explosiva Simple',
            description: 'Tarjeta explosiva con 1 cubo de 4 espacios para fotos y mensajes',
            id: 'ex01-simple'
          },
          price: 7990,
          quantity: 1,
          photos: [
            // Aquí deberían estar las fotos reales subidas por el cliente
            { name: 'Foto_1.jpg' },
            { name: 'Foto_2.jpg' },
            { name: 'Foto_3.jpg' },
            { name: 'Foto_4.jpg' }
          ],
          messages: [
            // Aquí deberían estar los mensajes personalizados
            { text: 'Mensaje personalizado del cliente' }
          ]
        }
      ]
    };
    
    console.log('📦 Datos del pedido encontrados:', {
      commerceOrder: mockOrderData.commerceOrder,
      customerEmail: mockOrderData.customerEmail,
      total: mockOrderData.total,
      itemsCount: mockOrderData.items.length
    });
    
    return mockOrderData;
    
  } catch (error) {
    console.error('❌ Error obteniendo datos del pedido:', error);
    return null;
  }
}
