import { Request, Response, NextFunction } from 'express';
import { TimelineService } from './timeline.service';
import { sendSuccess } from '../../utils/response.utils';

export class TimelineController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, limit, offset } = req.query;
      const result = await TimelineService.listEvents(req.user!.id, {
        type: type as string,
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
