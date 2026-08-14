import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

interface PrismaErrorLike {
  code?: string;
}

function isPrismaError(err: unknown): err is PrismaErrorLike {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string'
  );
}

/** Central JSON error handler. Response shape: { error: { code, message } } */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    const message = err.issues
      .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
      .join('; ');
    res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: message || 'Invalid input' } });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res
      .status(400)
      .json({ error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } });
    return;
  }

  if (isPrismaError(err)) {
    // P2002 = unique constraint violation.
    if (err.code === 'P2002') {
      res
        .status(409)
        .json({ error: { code: 'CONFLICT', message: 'A record with that value already exists' } });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Record not found' } });
      return;
    }
  }

  console.error('[error]', err);
  res
    .status(500)
    .json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
}
