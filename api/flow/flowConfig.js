// Configuración de Flow API con validación
const flowConfig = {
  apiKey: process.env.FLOW_API_KEY,
  secretKey: process.env.FLOW_SECRET_KEY,
  baseUrl: process.env.FLOW_BASE_URL || 'https://sandbox.flow.cl/api'
};

// Validar que las credenciales estén configuradas
if (!flowConfig.apiKey || !flowConfig.secretKey) {
  console.error('❌ Error: Variables de entorno de Flow no configuradas');
  console.error('❌ Asegúrate de configurar FLOW_API_KEY y FLOW_SECRET_KEY');
}

console.log('📋 Flow Config cargado:', {
  hasApiKey: !!flowConfig.apiKey,
  hasSecretKey: !!flowConfig.secretKey,
  baseUrl: flowConfig.baseUrl,
  apiKeyPrefix: flowConfig.apiKey ? flowConfig.apiKey.substring(0, 8) + '...' : 'NO CONFIGURADO'
});

export default flowConfig;
