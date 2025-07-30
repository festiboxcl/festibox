// Servicio de email usando Resend - Simple y efectivo
// Resend es mucho más fácil que nodemailer y perfecto para proyectos modernos

/**
 * Enviar email usando Resend API
 * @param {Object} emailData - Datos del email
 */
async function sendEmailWithResend(emailData) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY no configurada');
  }

  console.log('📧 Enviando email con Resend a:', emailData.to);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'FestiBox <pedidos@festibox.cl>', // Dominio verificado en Resend
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      reply_to: 'clfestibox@gmail.com'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error enviando email con Resend: ${error}`);
  }

  const result = await response.json();
  console.log('✅ Email enviado con Resend:', result.id);
  return result;
}

/**
 * Enviar email de notificación al administrador
 * @param {Object} orderData - Datos del pedido
 * @param {Object} paymentData - Datos del pago de Flow
 */
export async function sendAdminNotification(orderData, paymentData) {
  try {
    const emailHtml = generateAdminEmailHtml(orderData, paymentData);
    
    return await sendEmailWithResend({
      to: 'clfestibox@gmail.com',
      subject: `🎉 Nuevo Pedido FestiBox - ${orderData.commerceOrder}`,
      html: emailHtml
    });
    
  } catch (error) {
    console.error('❌ Error enviando email al administrador:', error);
    throw error;
  }
}

/**
 * Enviar email de confirmación al cliente
 * @param {Object} orderData - Datos del pedido
 * @param {Object} paymentData - Datos del pago de Flow
 */
export async function sendCustomerConfirmation(orderData, paymentData) {
  try {
    const emailHtml = generateCustomerEmailHtml(orderData, paymentData);
    
    return await sendEmailWithResend({
      to: orderData.customerEmail,
      subject: '🎁 ¡Tu pedido FestiBox ha sido confirmado!',
      html: emailHtml
    });
    
  } catch (error) {
    console.error('❌ Error enviando email al cliente:', error);
    throw error;
  }
}

/**
 * Generar HTML para email del administrador
 */
function generateAdminEmailHtml(orderData, paymentData) {
  const items = orderData.items || [];
  
  let itemsHtml = '';
  let photosHtml = '';
  let messagesHtml = '';
  
  items.forEach((item, index) => {
    itemsHtml += `
      <div style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; background: #fff;">
        <h3 style="color: #de5a16; margin-top: 0;">${item.product.name}</h3>
        <p><strong>Precio:</strong> $${item.price.toLocaleString('es-CL')} CLP</p>
        <p><strong>Cantidad:</strong> ${item.quantity}</p>
        <p><strong>Descripción:</strong> ${item.product.description}</p>
      </div>
    `;
    
    // Fotos
    if (item.photos && item.photos.length > 0) {
      photosHtml += `<p><strong>📸 Fotos para ${item.product.name}:</strong> ${item.photos.length} fotos subidas</p>`;
      item.photos.forEach((photo, photoIndex) => {
        if (photo.name) {
          photosHtml += `<p style="margin-left: 20px;">• ${photo.name}</p>`;
        }
      });
    }
    
    // Mensajes
    if (item.messages && item.messages.length > 0) {
      messagesHtml += `<p><strong>💌 Mensajes para ${item.product.name}:</strong></p>`;
      item.messages.forEach((message, msgIndex) => {
        if (message.text) {
          messagesHtml += `<p style="margin-left: 20px; background: #f9f9f9; padding: 10px; border-radius: 5px;"><em>"${message.text}"</em></p>`;
        }
      });
    }
  });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Nuevo Pedido FestiBox</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #de5a16, #0284c7); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 20px; }
        .section { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd; }
        .footer { text-align: center; background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 30px; color: #666; }
        .status-paid { color: #22c55e; font-weight: bold; }
        .status-pending { color: #f59e0b; font-weight: bold; }
      </style>
    </head>
    <body style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <div class="header">
        <h1>🎉 ¡Nuevo Pedido FestiBox!</h1>
        <h2>Orden: ${orderData.commerceOrder}</h2>
      </div>
      
      <div class="section">
        <h3>📊 Estado del Pago</h3>
        <p><strong>Estado:</strong> <span class="${paymentData.status === 2 ? 'status-paid' : 'status-pending'}">${paymentData.status === 2 ? '✅ PAGADO' : '⏳ Pendiente'}</span></p>
        <p><strong>Token Flow:</strong> ${paymentData.token}</p>
        <p><strong>Orden Flow:</strong> ${paymentData.flowOrder || 'N/A'}</p>
        <p><strong>Monto:</strong> $${paymentData.amount?.toLocaleString('es-CL') || orderData.total?.toLocaleString('es-CL')} CLP</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
      </div>
      
      <div class="section">
        <h3>👤 Datos del Cliente</h3>
        <p><strong>Email:</strong> ${orderData.customerEmail}</p>
        <p><strong>Total Pedido:</strong> $${orderData.total?.toLocaleString('es-CL')} CLP</p>
        <p><strong>Subtotal:</strong> $${orderData.subtotal?.toLocaleString('es-CL')} CLP</p>
        <p><strong>Envío:</strong> $${orderData.shipping?.toLocaleString('es-CL')} CLP</p>
      </div>
      
      <div class="section">
        <h3>🛍️ Productos Pedidos</h3>
        ${itemsHtml}
      </div>
      
      ${photosHtml ? `
      <div class="section">
        <h3>📸 Fotos del Cliente</h3>
        ${photosHtml}
      </div>
      ` : ''}
      
      ${messagesHtml ? `
      <div class="section">
        <h3>💌 Mensajes Personalizados</h3>
        ${messagesHtml}
      </div>
      ` : ''}
      
      <div class="footer">
        <p>Este pedido fue generado automáticamente desde FestiBox<br>
        <a href="https://festibox.cl" style="color: #de5a16;">www.festibox.cl</a></p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generar HTML para email del cliente
 */
function generateCustomerEmailHtml(orderData, paymentData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Confirmación de Pedido FestiBox</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #de5a16, #0284c7); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 20px; }
        .section { background: #fff; padding: 30px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd; }
        .steps { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 30px; color: #666; }
        .order-number { font-size: 1.2em; font-weight: bold; color: #de5a16; }
      </style>
    </head>
    <body style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <div class="header">
        <h1>🎁 ¡Gracias por tu compra!</h1>
        <h2>Tu pedido ha sido confirmado</h2>
      </div>
      
      <div class="section">
        <h3 style="color: #de5a16;">📋 Resumen de tu pedido</h3>
        <p><strong>Número de orden:</strong> <span class="order-number">${orderData.commerceOrder}</span></p>
        <p><strong>Total pagado:</strong> $${orderData.total?.toLocaleString('es-CL')} CLP</p>
        <p><strong>Estado:</strong> ✅ Pago confirmado</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
      </div>
      
      <div class="steps">
        <h3>📦 ¿Qué sigue?</h3>
        <ol style="padding-left: 20px;">
          <li style="margin-bottom: 10px;">Recibiremos tu pedido y verificaremos tus fotos y mensajes</li>
          <li style="margin-bottom: 10px;">Comenzaremos la producción de tu tarjeta explosiva personalizada</li>
          <li style="margin-bottom: 10px;">Te contactaremos para coordinar la entrega</li>
          <li style="margin-bottom: 10px;">¡Disfrutarás de tu FestiBox único!</li>
        </ol>
      </div>
      
      <div class="section">
        <h3 style="color: #de5a16;">📞 ¿Necesitas ayuda?</h3>
        <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos:</p>
        <p>📧 <strong>Email:</strong> clfestibox@gmail.com</p>
        <p>🌐 <strong>Web:</strong> <a href="https://festibox.cl" style="color: #de5a16;">www.festibox.cl</a></p>
      </div>
      
      <div class="footer">
        <p><strong>¡Gracias por elegir FestiBox! 🎉</strong><br>
        Creamos momentos únicos e inolvidables</p>
      </div>
    </body>
    </html>
  `;
}

export default {
  sendAdminNotification,
  sendCustomerConfirmation
};
