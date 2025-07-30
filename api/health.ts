import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    method: req.method,
    environment: process.env.NODE_ENV || 'unknown'
  });
}
