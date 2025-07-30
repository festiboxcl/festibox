export default async function handler(req, res) {
  try {
    // Probar directamente con la API key original
    const apiKey = '1F35DEE4-1B10-49E6-A226-55845L8E1A12';
    const secretKey = 'f6944874c7b8a70c8da78c14f03f853b50019c31';
    const baseUrl = 'https://sandbox.flow.cl/api';
    
    // Imprimir para verificar
    console.log('API Key original:', apiKey);
    
    // Crear copia corregida reemplazando posible L por 1
    const correctedApiKey = apiKey.replace('55845L8E1A12', '5584518E1A12');
    console.log('API Key corregida:', correctedApiKey);
    
    // Crear firma para test simple
    const testParams = {
      apiKey: apiKey,
      subject: 'Test payment',
      amount: 1990
    };
    
    // Preparar datos para test simple
    const formData = new URLSearchParams();
    Object.entries(testParams).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    
    console.log('Datos de formulario:', formData.toString());
    
    return res.status(200).json({
      success: true,
      apiKeyDetails: {
        original: apiKey,
        corrected: correctedApiKey,
        originalLength: apiKey.length,
        correctedLength: correctedApiKey.length
      },
      environment: {
        node: process.version,
        hasApiKey: !!process.env.FLOW_API_KEY,
        hasSecretKey: !!process.env.FLOW_SECRET_KEY,
        envApiKey: process.env.FLOW_API_KEY,
        matchesProvided: process.env.FLOW_API_KEY === apiKey
      },
      formData: formData.toString(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en key-test:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
