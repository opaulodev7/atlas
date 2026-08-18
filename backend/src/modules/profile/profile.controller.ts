import { Request, Response, NextFunction } from 'express';
import { ProfileService } from './profile.service';
import { sendSuccess } from '../../utils/response.utils';

export class ProfileController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await ProfileService.getProfile(req.user!.id);
      return sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await ProfileService.updateProfile(req.user!.id, req.body);
      return sendSuccess(res, updated, 'Perfil atualizado com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async completeOnboarding(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await ProfileService.completeOnboarding(req.user!.id, req.body);
      return sendSuccess(res, updated, 'Onboarding concluído com sucesso');
    } catch (error) {
      next(error);
    }
  }
}
