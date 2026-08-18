import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { sendSuccess } from '../../utils/response.utils';

export class ReportsController {
  static async getWeeklyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportsService.generateWeeklyReport(req.user!.id);
      return sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
}
