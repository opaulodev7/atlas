import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../utils/response.utils';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return sendSuccess(res, result, 'Conta criada com sucesso!', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return sendSuccess(res, result, 'Login realizado com sucesso!');
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getCurrentUser(req.user!.id);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
}
