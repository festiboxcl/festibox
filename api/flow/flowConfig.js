// Configuración explícita para Flow API
export default {
  apiKey: process.env.FLOW_API_KEY,
  secretKey: process.env.FLOW_SECRET_KEY,
  baseUrl: process.env.FLOW_BASE_URL || 'https://sandbox.flow.cl/api'
};
