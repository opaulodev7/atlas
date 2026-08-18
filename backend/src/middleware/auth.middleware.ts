import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { sendError } from '../utils/response.utils';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Token de autenticação não fornecido ou inválido', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (error) {
    return sendError(res, 'Sessão expirada ou token inválido. Por favor faça login novamente.', 401);
  }
}
