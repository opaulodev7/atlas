import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response.utils';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Unhandled Error:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Erro de validação dos dados', 422, formattedErrors);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Ocorreu um erro interno no servidor.';

  return sendError(res, message, statusCode);
}
