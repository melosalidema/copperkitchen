import type { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory sliding-window rate limiter keyed by IP + path.
 * Suitable for a single-instance deployment. For multi-instance production,
 * replace with Redis-backed limiting.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_REQUESTS = 300; // per window, per IP per route
const AUTH_MAX_REQUESTS = 20; // stricter for login

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function isSensitivePath(path: string): boolean {
  return path.includes('/admin/auth/login') || path.includes('/api/reservations');
}

// Periodically evict expired buckets to avoid unbounded memory growth.
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 5 * 60 * 1000);
cleanupTimer.unref();

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const key = `${req.ip ?? 'unknown'}:${req.method}:${req.path}`;
  const maxRequests = isSensitivePath(req.path) ? AUTH_MAX_REQUESTS : DEFAULT_MAX_REQUESTS;

  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  const remaining = maxRequests - bucket.count;
  res.setHeader('X-RateLimit-Limit', String(maxRequests));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(remaining, 0)));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > maxRequests) {
    res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
    res
      .status(429)
      .json({
        error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' }
      });
    return;
  }

  next();
}
