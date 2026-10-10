import type { Request, Response } from 'express';
import app from '../server';

// Vercel Serverless Function entry point
export default function handler(req: Request, res: Response) {
  // Normalize URL in case Vercel rewrites stripped the '/api' prefix
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/sitemap.xml')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
}
