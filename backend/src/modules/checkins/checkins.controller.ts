import { Request, Response, NextFunction } from 'express';
import { CheckinsService } from './checkins.service';
import { sendSuccess } from '../../utils/response.utils';

export class CheckinsController {
  static async getToday(req: Request, res: Response, next: NextFunction) {
    try {
      const checkin = await CheckinsService.getTodayCheckin(req.user!.id);
      return sendSuccess(res, checkin);
    } catch (error) {
      next(error);
    }
  }

  static async getByDate(req: Request, res: Response, next: NextFunction) {
    try {
      const checkin = await CheckinsService.getCheckinByDate(req.user!.id, req.params.date);
      return sendSuccess(res, checkin);
    } catch (error) {
      next(error);
    }
  }

  static async save(req: Request, res: Response, next: NextFunction) {
    try {
      const checkin = await CheckinsService.saveCheckin(req.user!.id, req.body);
      return sendSuccess(res, checkin, 'Check-in diário salvo com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const history = await CheckinsService.listHistory(req.user!.id, days);
      const averages = await CheckinsService.getAverages(req.user!.id, days);
      return sendSuccess(res, { history, averages });
    } catch (error) {
      next(error);
    }
  }
}
