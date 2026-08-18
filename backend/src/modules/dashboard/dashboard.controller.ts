import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response.utils';

export class DashboardController {
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getDashboardData(req.user!.id);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}
