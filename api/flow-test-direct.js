// Endpoint de prueba con credenciales directas
import crypto from 'crypto';

export default async function handler(req, res) {
  try {
    console.log('🔍 Test directo de Flow');
    
    // Valores hardcodeados para pruebas (usar tu API key real)
    const apiKey = process.env.FLOW_API_KEY?.trim();
    const secretKey = process.env.FLOW_SECRET_KEY?.trim();
    const baseUrl = 'https://sandbox.flow.cl/api';

    // Crear orden única
    const commerceOrder = `FESTIBOX-TEST-${Date.now()}`;
    
    // Crear firma para Flow
    const params = {
      apiKey,
      commerceOrder,
      subject: "Test de integración Flow",
      currency: "CLP",
      amount: 1000,
      email: "test@festibox.cl",
      urlConfirmation: `https://festibox.cl/api/flow/confirmation`,
      urlReturn: `https://festibox.cl/pedido-confirmado?order=${commerceOrder}`
    };
    
    // Ordenar parámetros y crear string para firma
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    // Generar firma
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(sortedParams)
      .digest('hex');
    
    // Preparar formulario
    const formData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    formData.append('s', signature);
    
    // Mostrar datos que vamos a enviar
    console.log('Test directo - Enviando:', {
      url: `${baseUrl}/payment/create`,
      formString: formData.toString()
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
    console.log('Test directo - Respuesta:', responseText);
    
    // Responder al cliente
    return res.status(200).json({
      success: response.ok,
      status: response.status,
      responseData: responseText,
      sentParams: params
    });
    
  } catch (error) {
    console.error('Error en test directo:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
