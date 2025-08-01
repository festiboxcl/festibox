// API endpoint para enviar confirmación de pedido con Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método no permitido' 
    });
  }

  try {
    const { orderDetails } = req.body;

    console.log('📧 Procesando envío de confirmación de pedido:', {
      orderId: orderDetails?.commerceOrder,
      customerEmail: orderDetails?.customerEmail,
      itemsCount: orderDetails?.items?.length || 0,
      hasOrderDetails: !!orderDetails,
      orderDetailsKeys: orderDetails ? Object.keys(orderDetails) : []
    });

    // Validar datos requeridos
    if (!orderDetails) {
      console.error('❌ No se recibieron orderDetails');
      return res.status(400).json({
        success: false,
        error: 'No se recibieron datos del pedido'
      });
    }

    if (!orderDetails.customerEmail) {
      console.error('❌ Falta email del cliente');
      return res.status(400).json({
        success: false,
        error: 'Email del cliente es requerido'
      });
    }

    if (!orderDetails.items || !Array.isArray(orderDetails.items)) {
      console.error('❌ Falta información de items o no es un array');
      return res.status(400).json({
        success: false,
        error: 'Items del pedido son requeridos y deben ser un array'
      });
    }

    if (!orderDetails.totals) {
      console.error('❌ Falta información de totales');
      return res.status(400).json({
        success: false,
        error: 'Totales del pedido son requeridos'
      });
    }

    console.log('✅ Validación básica completada, generando adjuntos...');

    // Generar adjuntos de fotos
    const attachments = generatePhotoAttachments(orderDetails.items);

    console.log('✅ Adjuntos generados, preparando emails...');

    // Email al cliente
    const customerEmailHtml = generateCustomerEmailHtml(orderDetails);
    const customerEmail = await resend.emails.send({
      from: 'FestiBox <onboarding@resend.dev>',
      to: orderDetails.customerEmail,
      subject: 'Tu pedido FestiBox ha sido confirmado',
      html: customerEmailHtml,
    });

    console.log('✅ Email de confirmación enviado al cliente:', customerEmail.data?.id);

    // Email al equipo con fotos
    const teamEmailHtml = generateTeamEmailHtml(orderDetails);
    const teamEmail = await resend.emails.send({
      from: 'FestiBox <onboarding@resend.dev>',
      to: 'clfestibox@gmail.com',
      subject: `NUEVO PEDIDO: ${orderDetails.commerceOrder}`,
      html: teamEmailHtml,
      attachments: attachments
    });

    console.log('✅ Email de notificación enviado al equipo:', teamEmail.data?.id);

    return res.status(200).json({
      success: true,
      message: 'Emails de confirmación enviados exitosamente',
      customerEmailId: customerEmail.data?.id,
      teamEmailId: teamEmail.data?.id
    });

  } catch (error) {
    console.error('❌ Error enviando emails de confirmación:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor enviando emails',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Generar HTML para email de confirmación al cliente
 */
function generateCustomerEmailHtml(orderDetails) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido FestiBox</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      </style>
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); min-height: 100vh;">
      <div style="max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.95); padding: 0; border-radius: 20px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
        
        <!-- Header -->
        <div style="text-align: center; background: linear-gradient(135deg, #de5a16 0%, #f97316 100%); color: white; padding: 40px 30px; border-radius: 20px 20px 0 0; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);"></div>
          <div style="position: relative; z-index: 1;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">✅ Pedido Confirmado</h1>
            <p style="color: rgba(255, 255, 255, 0.9); font-size: 18px; margin: 15px 0 0 0; font-weight: 500;">Tu FestiBox está siendo preparado con amor</p>
          </div>
        </div>
        
        <div style="padding: 30px;">
          <!-- Orden Info -->
          <div style="background: rgba(248, 250, 252, 0.8); backdrop-filter: blur(10px); padding: 25px; border-radius: 16px; margin-bottom: 25px; border: 1px solid rgba(222, 90, 22, 0.1);">
            <h3 style="margin: 0 0 20px 0; color: #de5a16; font-size: 20px; font-weight: 600;">📋 Detalles del Pedido</h3>
            <div style="display: grid; gap: 12px;">
              <p style="margin: 0; color: #374151;"><strong>Número de Pedido:</strong> <span style="color: #de5a16; font-weight: 600;">${orderDetails.commerceOrder}</span></p>
              <p style="margin: 0; color: #374151;"><strong>Fecha:</strong> ${new Date(orderDetails.createdAt).toLocaleDateString('es-CL')}</p>
              <p style="margin: 0; color: #374151;"><strong>Email:</strong> ${orderDetails.customerEmail}</p>
            </div>
          </div>
          
          <!-- Items -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin-bottom: 20px; font-size: 20px; font-weight: 600;">🛍️ Productos Pedidos</h3>
            ${orderDetails.items.map(item => `
              <div style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); padding: 20px; border-radius: 12px; margin-bottom: 15px; border: 1px solid rgba(2, 132, 199, 0.1); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #1f2937; font-size: 16px;">${item.product.name}</p>
                <div style="display: grid; gap: 8px;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Cantidad:</strong> ${item.quantity}</p>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Fotos subidas:</strong> ${item.photos?.length || 0}</p>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Mensajes:</strong> ${item.messages?.length || 0}</p>
                  <p style="margin: 10px 0 0 0; color: #de5a16; font-weight: 700; font-size: 16px;">${formatPrice(item.price)}</p>
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- Total -->
          <div style="background: linear-gradient(135deg, #de5a16 0%, #f97316 100%); color: white; padding: 25px; border-radius: 16px; text-align: center; margin-bottom: 25px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);"></div>
            <div style="position: relative; z-index: 1;">
              <h3 style="margin: 0 0 10px 0; font-size: 18px; opacity: 0.9;">💰 Total Pagado</h3>
              <p style="font-size: 28px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${formatPrice(orderDetails.total)}</p>
            </div>
          </div>
          
          <!-- Next Steps -->
          <div style="background: rgba(34, 197, 94, 0.05); backdrop-filter: blur(10px); padding: 25px; border-radius: 16px; border: 1px solid rgba(34, 197, 94, 0.2);">
            <h3 style="margin: 0 0 20px 0; color: #059669; font-size: 20px; font-weight: 600;">✨ ¿Qué sigue?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.7;">
              <li style="margin-bottom: 8px;">Nuestro equipo revisará tu pedido y comenzará la producción</li>
              <li style="margin-bottom: 8px;">Te enviaremos actualizaciones por email sobre el progreso</li>
              <li style="margin-bottom: 8px;">Una vez listo, coordinaremos la entrega según el método elegido</li>
              <li>¡Prepárate para sorprender con tu FestiBox único!</li>
            </ul>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; background: rgba(240, 240, 240, 0.8); backdrop-filter: blur(10px); padding: 25px; border-radius: 0 0 20px 20px; border-top: 1px solid rgba(0,0,0,0.05);">
          <p style="color: #6b7280; margin: 0 0 10px 0;">¿Tienes preguntas? Contáctanos a <a href="mailto:clfestibox@gmail.com" style="color: #de5a16; text-decoration: none; font-weight: 500;">clfestibox@gmail.com</a></p>
          <p style="color: #6b7280; margin: 0; font-weight: 500;">¡Gracias por elegir FestiBox! 💝</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generar HTML para email del equipo
 */
function generateTeamEmailHtml(orderDetails) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuevo Pedido FestiBox</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 700px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #de5a16 0%, #f97316 100%); color: white; padding: 30px; border-radius: 16px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);"></div>
          <div style="position: relative; z-index: 1;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🚨 NUEVO PEDIDO</h1>
            <p style="margin: 15px 0 0 0; font-size: 20px; font-weight: 600; opacity: 0.95;">${orderDetails.commerceOrder}</p>
          </div>
        </div>
        
        <!-- Cliente Info -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px 0; color: #333;">👤 Información del Cliente</h3>
          <p><strong>Email:</strong> ${orderDetails.customerEmail}</p>
          <p><strong>Fecha del Pedido:</strong> ${new Date(orderDetails.createdAt).toLocaleDateString('es-CL')} ${new Date(orderDetails.createdAt).toLocaleTimeString('es-CL')}</p>
          <p><strong>Total Pagado:</strong> ${formatPrice(orderDetails.total)}</p>
        </div>
        
        <!-- Productos -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #333; margin-bottom: 15px;">📦 Productos a Producir</h3>
          ${orderDetails.items.map((item, index) => `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 5px solid #de5a16;">
              <h4 style="margin: 0 0 10px 0; color: #de5a16;">Producto ${index + 1}: ${item.product.name}</h4>
              <p><strong>Cantidad:</strong> ${item.quantity}</p>
              <p><strong>Precio unitario:</strong> ${formatPrice(item.price)}</p>
              <p><strong>Fotos subidas:</strong> ${item.photos?.length || 0} (adjuntas en este email)</p>
              
              ${item.photos && item.photos.length > 0 ? `
                <div style="margin-top: 15px;">
                  <p><strong>📷 Orden de las fotos (según subida del cliente):</strong></p>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); gap: 8px; margin: 10px 0; background: #f0f0f0; padding: 15px; border-radius: 5px;">
                    ${item.photos.map((photo, photoIndex) => `
                      <div style="text-align: center; padding: 8px; background: white; border-radius: 4px; border: 2px solid #de5a16;">
                        <div style="font-weight: bold; color: #de5a16; font-size: 14px;">📷 ${photoIndex + 1}</div>
                        <div style="font-size: 11px; color: #666; margin-top: 2px;">${photo.name || `foto-${photoIndex + 1}.jpg`}</div>
                      </div>
                    `).join('')}
                  </div>
                  ${getPhotoDistributionGuide(item.product, item.photos.length)}
                </div>
              ` : ''}
              
              ${item.messages && item.messages.length > 0 ? `
                <div style="margin-top: 15px;">
                  <p><strong>📝 Mensajes personalizados:</strong></p>
                  <ul style="margin: 5px 0; padding-left: 20px;">
                    ${item.messages.map(msg => `<li style="margin: 5px 0;">"${msg}"</li>`).join('')}
                  </ul>
                </div>
              ` : '<p><strong>📝 Mensajes:</strong> Sin mensajes personalizados</p>'}
              
              ${item.boxMessage ? `
                <p><strong>📮 Mensaje de la caja:</strong> "${item.boxMessage}"</p>
              ` : ''}
            </div>
          `).join('')}
        </div>
        
        <!-- Envío -->
        ${orderDetails.shippingOption ? `
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">🚚 Información de Envío</h3>
            <p><strong>Método:</strong> ${orderDetails.shippingOption.name}</p>
            <p><strong>Costo de envío:</strong> ${formatPrice(orderDetails.shipping)}</p>
            
            ${orderDetails.shippingAddress ? `
              <div style="margin-top: 15px; background: white; padding: 15px; border-radius: 5px;">
                <p style="margin: 0 0 10px 0;"><strong>📍 Dirección de entrega:</strong></p>
                <p style="margin: 5px 0;">${orderDetails.shippingAddress.address}</p>
                <p style="margin: 5px 0;">${orderDetails.shippingAddress.commune}</p>
                <p style="margin: 10px 0 5px 0;"><strong>Destinatario:</strong> ${orderDetails.shippingAddress.receiverName}</p>
                <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${orderDetails.shippingAddress.receiverPhone}</p>
              </div>
            ` : '<p style="margin: 15px 0;"><em>Retiro en tienda</em></p>'}
          </div>
        ` : ''}
        
        <!-- Acciones importantes -->
        <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px;">
          <h3 style="margin: 0 0 15px 0; color: #856404;">⚡ Acciones Inmediatas</h3>
          <ul style="margin: 0; padding-left: 20px; color: #856404;">
            <li>Descargar y revisar las fotos adjuntas</li>
            <li>Verificar que todas las fotos estén en buena calidad</li>
            <li>Comenzar la producción según especificaciones</li>
            <li>Contactar al cliente si hay alguna duda</li>
          </ul>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0;">📧 Email generado automáticamente desde FestiBox</p>
          <p style="color: #666; margin: 10px 0 0 0;">Las fotos del cliente están adjuntas a este email</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generar guía de distribución de fotos según el producto
 */
function getPhotoDistributionGuide(product, totalPhotos) {
  if (!product || !totalPhotos) return '';
  
  console.log('🔍 Detectando tipo de producto para distribución:', {
    productName: product.name,
    productId: product.id,
    configuration: product.configuration,
    totalPhotos: totalPhotos
  });
  
  // Detectar si es un producto de 3 cubos - mejorar detección
  const productNameLower = (product.name || '').toLowerCase();
  const productIdLower = (product.id || '').toLowerCase();
  
  const isTripleCubes = productNameLower.includes('triple') || 
                       productNameLower.includes('tres') ||
                       productNameLower.includes('3') ||
                       productIdLower.includes('triple') ||
                       productIdLower.includes('tres') ||
                       (product.configuration && product.configuration.cardType === 'triple');
  
  console.log('🎯 Resultado detección:', { isTripleCubes, productName: product.name });

  if (isTripleCubes) {
    // Para CUALQUIER tarjeta de 3 cubos - siempre mostrar distribución
    const photosPerCube = Math.floor(totalPhotos / 3);
    const extraPhotos = totalPhotos % 3;
    
    // Calcular rangos para cada cubo
    const cube1End = photosPerCube + (extraPhotos > 0 ? 1 : 0);
    const cube2Start = cube1End + 1;
    const cube2End = cube1End + photosPerCube + (extraPhotos > 1 ? 1 : 0);
    const cube3Start = cube2End + 1;
    
    console.log('📊 Distribución calculada:', {
      photosPerCube,
      extraPhotos,
      cube1: `1-${cube1End}`,
      cube2: `${cube2Start}-${cube2End}`,
      cube3: `${cube3Start}-${totalPhotos}`
    });
    
    return `
      <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin-top: 10px; border-left: 4px solid #4caf50;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #2e7d32;">📋 Distribución OBLIGATORIA para 3 cubos (${totalPhotos} fotos):</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center;">
          <div style="background: white; padding: 10px; border-radius: 4px; border: 2px solid #4caf50;">
            <strong>🎁 CUBO 1</strong><br>
            <span style="font-size: 14px; color: #2e7d32; font-weight: bold;">Fotos ${1} - ${cube1End}</span>
          </div>
          <div style="background: white; padding: 10px; border-radius: 4px; border: 2px solid #4caf50;">
            <strong>🎁 CUBO 2</strong><br>
            <span style="font-size: 14px; color: #2e7d32; font-weight: bold;">Fotos ${cube2Start} - ${cube2End}</span>
          </div>
          <div style="background: white; padding: 10px; border-radius: 4px; border: 2px solid #4caf50;">
            <strong>🎁 CUBO 3</strong><br>
            <span style="font-size: 14px; color: #2e7d32; font-weight: bold;">Fotos ${cube3Start} - ${totalPhotos}</span>
          </div>
        </div>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #666; text-align: center;">
          💡 <strong>IMPORTANTE:</strong> Mantener el orden cronológico de las fotos según las subió el cliente
        </p>
        ${totalPhotos < 9 ? `
          <div style="background: #fff3e0; padding: 10px; border-radius: 4px; margin-top: 10px; border: 1px solid #ff9800;">
            <p style="margin: 0; font-size: 12px; color: #f57c00; font-weight: bold;">⚠️ ATENCIÓN: Solo ${totalPhotos} fotos para 3 cubos - distribuir según criterio del equipo</p>
          </div>
        ` : ''}
      </div>
    `;
  } else if (totalPhotos > 0) {
    // Para tarjeta simple, mostrar orden de fotos como lista numerada
    return `
      <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 10px; border-left: 4px solid #2196f3;">
        <p style="margin: 0 0 5px 0; font-weight: bold; color: #1976d2;">📋 Orden de las fotos subidas:</p>
        <ol style="margin: 0; padding-left: 20px;">
          ${Array.from({length: totalPhotos}, (_, i) => `<li style='font-size:13px; color:#333;'>Foto ${i+1}</li>`).join('')}
        </ol>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">💡 El orden corresponde al que subió el cliente</p>
      </div>
    `;
  }
}

/**
 * Generar adjuntos de fotos desde los items del pedido
 */
function generatePhotoAttachments(items) {
  const attachments = [];
  
  console.log('📎 Generando adjuntos para items:', {
    itemsCount: items?.length || 0,
    firstItemHasPhotos: items?.[0]?.photos?.length > 0,
    firstItemPhotosCount: items?.[0]?.photos?.length || 0
  });
  
  if (!items || !Array.isArray(items)) {
    console.warn('⚠️ Items no válidos para generar adjuntos');
    return attachments;
  }
  
  items.forEach((item, itemIndex) => {
    console.log(`📦 Procesando item ${itemIndex + 1}:`, {
      hasPhotos: !!item.photos,
      photosLength: item.photos?.length || 0,
      itemName: item.product?.name || 'Sin nombre'
    });
    
    if (item.photos && Array.isArray(item.photos) && item.photos.length > 0) {
      item.photos.forEach((photo, photoIndex) => {
        console.log(`📸 Procesando foto ${photoIndex + 1} del item ${itemIndex + 1}:`, {
          hasBase64: !!photo?.base64,
          photoType: typeof photo,
          photoKeys: photo ? Object.keys(photo) : [],
          name: photo?.name || 'Sin nombre'
        });
        
        if (photo && photo.base64) {
          // Extraer el tipo MIME y los datos base64
          const matches = photo.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            
            // Determinar extensión del archivo
            const extension = mimeType.includes('jpeg') ? 'jpg' : 
                            mimeType.includes('png') ? 'png' : 
                            mimeType.includes('webp') ? 'webp' : 'jpg';
            
            // Crear adjunto en formato Resend
            const attachment = {
              filename: `Producto${itemIndex + 1}_Foto${photoIndex + 1}_${photo.name || `imagen.${extension}`}`,
              content: Buffer.from(base64Data, 'base64'),
              contentType: mimeType
            };
            
            attachments.push(attachment);
            console.log(`✅ Adjunto creado: ${attachment.filename} (${mimeType})`);
          } else {
            console.warn(`⚠️ Formato base64 no válido en foto ${photoIndex + 1} del item ${itemIndex + 1}`);
          }
        } else {
          console.warn(`⚠️ Foto ${photoIndex + 1} del item ${itemIndex + 1} no tiene base64`);
        }
      });
    } else {
      console.warn(`⚠️ Item ${itemIndex + 1} no tiene fotos válidas`);
    }
  });
  
  console.log(`📎 Total de adjuntos generados: ${attachments.length}`);
  return attachments;
}
