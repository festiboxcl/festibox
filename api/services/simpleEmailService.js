// Servicio de email alternativo usando Resend (más fácil de configurar)
// Resend es gratuito hasta 3000 emails/mes y muy fácil de usar

/**
 * Enviar email usando Resend API (alternativa a nodemailer)
 * @param {Object} emailData - Datos del email
 */
async function sendEmailWithResend(emailData) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY no configurada');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'FestiBox <noreply@festibox.cl>',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      reply_to: 'clfestibox@gmail.com'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error enviando email: ${error}`);
  }

  return await response.json();
}

/**
 * Enviar email usando EmailJS (alternativa frontend)
 * @param {Object} emailData - Datos del email
 */
async function sendEmailWithEmailJS(emailData) {
  // EmailJS permite enviar emails desde el frontend sin backend
  // Esto sería más para el futuro si necesitas una solución simple
  console.log('EmailJS no implementado aún');
}

/**
 * Enviar notificación simple usando webhook/Discord (para testing)
 * @param {Object} orderData - Datos del pedido
 * @param {Object} paymentData - Datos del pago
 */
export async function sendSimpleNotification(orderData, paymentData) {
  try {
    console.log('📧 Enviando notificación simple del pedido');
    
    // Por ahora, solo loguear la información
    // En el futuro, esto puede conectarse a Discord, Slack, etc.
    const notification = {
      titulo: '🎉 Nuevo Pedido FestiBox',
      orden: orderData.commerceOrder,
      cliente: orderData.customerEmail,
      monto: `$${orderData.total?.toLocaleString('es-CL')} CLP`,
      estado: paymentData.status === 2 ? '✅ PAGADO' : '⏳ Pendiente',
      fecha: new Date().toLocaleString('es-CL'),
      productos: orderData.items?.map(item => item.product.name).join(', '),
      fotos: orderData.items?.reduce((total, item) => total + (item.photos?.length || 0), 0),
      mensajes: orderData.items?.reduce((total, item) => total + (item.messages?.length || 0), 0)
    };

    console.log('📋 RESUMEN DEL PEDIDO:', JSON.stringify(notification, null, 2));
    
    // Si tienes un webhook de Discord/Slack configurado, enviarlo ahí
    if (process.env.DISCORD_WEBHOOK_URL) {
      await sendToDiscord(notification);
    }
    
    return { success: true, method: 'simple_log' };
    
  } catch (error) {
    console.error('❌ Error enviando notificación simple:', error);
    throw error;
  }
}

/**
 * Enviar notificación a Discord webhook
 * @param {Object} notification - Datos de la notificación
 */
async function sendToDiscord(notification) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    const discordMessage = {
      embeds: [{
        title: notification.titulo,
        color: 0xde5a16, // Color FestiBox
        fields: [
          { name: 'Orden', value: notification.orden, inline: true },
          { name: 'Cliente', value: notification.cliente, inline: true },
          { name: 'Monto', value: notification.monto, inline: true },
          { name: 'Estado', value: notification.estado, inline: true },
          { name: 'Productos', value: notification.productos, inline: false },
          { name: 'Fotos', value: notification.fotos.toString(), inline: true },
          { name: 'Mensajes', value: notification.mensajes.toString(), inline: true }
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'FestiBox - Sistema de Pedidos' }
      }]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage)
    });

    if (response.ok) {
      console.log('✅ Notificación enviada a Discord');
    } else {
      console.error('❌ Error enviando a Discord:', await response.text());
    }
    
  } catch (error) {
    console.error('❌ Error en Discord webhook:', error);
  }
}

export default {
  sendSimpleNotification
};
