import { createFlowClient } from './flow/flowClient.js';

export default async function handler(req, res) {
  try {
    // Intentar crear el cliente para verificar credenciales
    try {
      const flowClient = createFlowClient();
      console.log('Flow client creado exitosamente con credenciales:', {
        apiKey: flowClient.apiKey?.substring(0, 10) + '...',
        baseUrl: flowClient.baseUrl
      });
    } catch (error) {
      console.error('Error creando Flow client:', error);
    }
    
    return res.status(200).json({
      success: true,
      environment: {
        node: process.version,
        hasApiKey: !!process.env.FLOW_API_KEY,
        hasSecretKey: !!process.env.FLOW_SECRET_KEY,
        hasBaseUrl: !!process.env.FLOW_BASE_URL,
        apiKeyPrefix: process.env.FLOW_API_KEY?.substring(0, 8) + '...',
        baseUrl: process.env.FLOW_BASE_URL
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en test-env-client:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
