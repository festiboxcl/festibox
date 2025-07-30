import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    success: true,
    environment: {
      hasApiKey: !!process.env.FLOW_API_KEY,
      hasSecretKey: !!process.env.FLOW_SECRET_KEY,
      hasBaseUrl: !!process.env.FLOW_BASE_URL,
      apiKeyPrefix: process.env.FLOW_API_KEY?.substring(0, 8) + '...',
      baseUrl: process.env.FLOW_BASE_URL
    },
    timestamp: new Date().toISOString()
  });
}
