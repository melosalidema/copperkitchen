import type { Request, Response, NextFunction } from 'express';

/** Minimal request logger middleware (structured single-line output). */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const line = [
      new Date().toISOString(),
      req.method,
      req.originalUrl,
      String(res.statusCode),
      `${durationMs}ms`,
      req.ip ?? '-'
    ].join(' ');
    if (res.statusCode >= 500) {
      console.error(`[http] ${line}`);
    } else {
      console.log(`[http] ${line}`);
    }
  });
  next();
}
