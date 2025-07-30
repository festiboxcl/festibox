// Servicio de notificaciones por email para FestiBox
import nodemailer from 'nodemailer';

/**
 * Configuración del transportador de email
 */
function createEmailTransporter() {
  // Usar un servicio como Gmail, SendGrid, o similar
  // Para producción, usar variables de entorno
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'clfestibox@gmail.com',
      pass: process.env.EMAIL_PASSWORD // App password de Gmail
    }
  });
}

/**
 * Enviar email de confirmación de pedido al administrador
 * @param {Object} orderData - Datos del pedido
 * @param {Object} paymentData - Datos del pago de Flow
 */
export async function sendOrderNotificationToAdmin(orderData, paymentData) {
  try {
    const transporter = createEmailTransporter();
    
    // Generar HTML con los detalles del pedido
    const emailHtml = generateOrderEmailHtml(orderData, paymentData);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'clfestibox@gmail.com',
      to: 'clfestibox@gmail.com',
      subject: `🎉 Nuevo Pedido FestiBox - ${orderData.commerceOrder}`,
      html: emailHtml,
      attachments: await generateAttachments(orderData)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado al administrador:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('❌ Error enviando email al administrador:', error);
    throw error;
  }
}

/**
 * Enviar email de confirmación personalizado al cliente
 * @param {Object} orderData - Datos del pedido
 * @param {Object} paymentData - Datos del pago de Flow
 */
export async function sendConfirmationToCustomer(orderData, paymentData) {
  try {
    const transporter = createEmailTransporter();
    
    const customerEmailHtml = generateCustomerEmailHtml(orderData, paymentData);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'clfestibox@gmail.com',
      to: orderData.customerEmail,
      subject: '🎁 ¡Tu pedido FestiBox ha sido confirmado!',
      html: customerEmailHtml
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado al cliente:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('❌ Error enviando email al cliente:', error);
    throw error;
  }
}

/**
 * Generar HTML para el email del administrador
 */
function generateOrderEmailHtml(orderData, paymentData) {
  const items = orderData.items || [];
  
  let itemsHtml = '';
  let photosHtml = '';
  let messagesHtml = '';
  
  items.forEach((item, index) => {
    // Información del producto
    itemsHtml += `
      <div style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px;">
        <h3 style="color: #de5a16;">${item.product.name}</h3>
        <p><strong>Precio:</strong> $${item.price.toLocaleString('es-CL')} CLP</p>
        <p><strong>Cantidad:</strong> ${item.quantity}</p>
        <p><strong>Descripción:</strong> ${item.product.description}</p>
    `;
    
    // Fotos adjuntas
    if (item.photos && item.photos.length > 0) {
      photosHtml += `<h4>📸 Fotos para ${item.product.name}:</h4>`;
      item.photos.forEach((photo, photoIndex) => {
        if (photo.file || photo.url) {
          photosHtml += `<p>• Foto ${photoIndex + 1}: ${photo.name || `Imagen_${photoIndex + 1}`}</p>`;
        }
      });
    }
    
    // Mensajes personalizados
    if (item.messages && item.messages.length > 0) {
      messagesHtml += `<h4>💌 Mensajes para ${item.product.name}:</h4>`;
      item.messages.forEach((message, msgIndex) => {
        if (message.text) {
          messagesHtml += `<p><strong>Mensaje ${msgIndex + 1}:</strong> ${message.text}</p>`;
        }
      });
    }
    
    itemsHtml += '</div>';
  });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Nuevo Pedido FestiBox</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; background: linear-gradient(135deg, #de5a16, #0284c7); color: white; padding: 20px; border-radius: 10px;">
        <h1>🎉 ¡Nuevo Pedido FestiBox!</h1>
        <h2>Orden: ${orderData.commerceOrder}</h2>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3>📊 Detalles del Pago</h3>
        <p><strong>Estado:</strong> ${paymentData.status === 2 ? '✅ PAGADO' : '⏳ Pendiente'}</p>
        <p><strong>Token Flow:</strong> ${paymentData.token}</p>
        <p><strong>Orden Flow:</strong> ${paymentData.flowOrder}</p>
        <p><strong>Monto:</strong> $${paymentData.amount?.toLocaleString('es-CL')} CLP</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
      </div>
      
      <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd;">
        <h3>👤 Datos del Cliente</h3>
        <p><strong>Email:</strong> ${orderData.customerEmail}</p>
        <p><strong>Total Pedido:</strong> $${orderData.total?.toLocaleString('es-CL')} CLP</p>
        <p><strong>Subtotal:</strong> $${orderData.subtotal?.toLocaleString('es-CL')} CLP</p>
        <p><strong>Envío:</strong> $${orderData.shipping?.toLocaleString('es-CL')} CLP</p>
      </div>
      
      <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd;">
        <h3>🛍️ Productos Pedidos</h3>
        ${itemsHtml}
      </div>
      
      ${photosHtml ? `
      <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd;">
        ${photosHtml}
      </div>
      ` : ''}
      
      ${messagesHtml ? `
      <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd;">
        ${messagesHtml}
      </div>
      ` : ''}
      
      <div style="text-align: center; background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 30px;">
        <p style="color: #666;">
          Este pedido fue generado automáticamente desde FestiBox<br>
          <a href="https://festibox.cl" style="color: #de5a16;">www.festibox.cl</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generar HTML para el email del cliente
 */
function generateCustomerEmailHtml(orderData, paymentData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Confirmación de Pedido FestiBox</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; background: linear-gradient(135deg, #de5a16, #0284c7); color: white; padding: 30px; border-radius: 10px;">
        <h1>🎁 ¡Gracias por tu compra!</h1>
        <h2>Tu pedido ha sido confirmado</h2>
      </div>
      
      <div style="background: #fff; padding: 30px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd;">
        <h3 style="color: #de5a16;">📋 Resumen de tu pedido</h3>
        <p><strong>Número de orden:</strong> ${orderData.commerceOrder}</p>
        <p><strong>Total pagado:</strong> $${orderData.total?.toLocaleString('es-CL')} CLP</p>
        <p><strong>Estado:</strong> ✅ Pago confirmado</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3>📦 ¿Qué sigue?</h3>
        <ol>
          <li>Recibiremos tu pedido y verificaremos tus fotos y mensajes</li>
          <li>Comenzaremos la producción de tu tarjeta explosiva personalizada</li>
          <li>Te contactaremos para coordinar la entrega</li>
          <li>¡Disfrutarás de tu FestiBox único!</li>
        </ol>
      </div>
      
      <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd;">
        <h3 style="color: #de5a16;">📞 ¿Necesitas ayuda?</h3>
        <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos:</p>
        <p>📧 Email: clfestibox@gmail.com</p>
        <p>🌐 Web: <a href="https://festibox.cl" style="color: #de5a16;">www.festibox.cl</a></p>
      </div>
      
      <div style="text-align: center; background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 30px;">
        <p style="color: #666;">
          ¡Gracias por elegir FestiBox! 🎉<br>
          Creamos momentos únicos e inolvidables
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generar adjuntos para el email (fotos del cliente)
 * Nota: Esto requiere que las fotos estén almacenadas en el servidor
 */
async function generateAttachments(orderData) {
  const attachments = [];
  
  // Por ahora retornamos array vacío
  // En el futuro, aquí procesaremos las fotos subidas por el cliente
  // y las adjuntaremos al email
  
  return attachments;
}

export default {
  sendOrderNotificationToAdmin,
  sendConfirmationToCustomer
};
