import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './lib/logger.js';
import { rateLimiter } from './middleware/rateLimit.js';

const DEFAULT_FRONTEND_URL = 'http://localhost:3000';

function buildCorsAllowlist(): string[] {
  const allowlist = new Set<string>([
    DEFAULT_FRONTEND_URL,
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
  ]);
  const configured = process.env.FRONTEND_URL?.trim();
  if (configured) {
    allowlist.add(configured);
  }
  return Array.from(allowlist);
}

export function createApp(): express.Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());

  const corsAllowlist = buildCorsAllowlist();
  app.use(
    cors({
      origin(origin, callback) {
        // Allow server-to-server / non-browser requests without an Origin header.
        if (!origin) return callback(null, true);
        if (corsAllowlist.includes(origin)) return callback(null, true);
        return callback(null, false);
      },
      credentials: true
    })
  );

  app.use(express.json({ limit: '100kb' }));
  app.use(requestLogger);
  app.use(rateLimiter);

  // Health check (public).
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'copperkitchen-api',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api', apiRouter);

  // 404 for unknown routes.
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  app.use(errorHandler);

  return app;
}

export const app = createApp();
