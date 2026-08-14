import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JwtPayload } from '../lib/jwt.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/** Require a valid admin JWT bearer token. */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res
      .status(401)
      .json({ error: { code: 'UNAUTHORIZED', message: 'Missing bearer token' } });
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyToken(token);
    if (payload.role !== 'admin') {
      res
        .status(403)
        .json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
      return;
    }
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch {
    res
      .status(401)
      .json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }
}
