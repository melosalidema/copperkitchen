import jwt from 'jsonwebtoken';

export const JWT_EXPIRES_IN = '8h';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

function secret(): string {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 16) {
    // Refuse to sign tokens with a weak/known secret in production.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set to a strong value in production');
    }
    console.warn('[jwt] WARNING: JWT_SECRET is missing or weak — using dev fallback.');
  }
  return value || 'dev-only-insecure-secret-do-not-use-in-production';
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, secret()) as JwtPayload;
}
