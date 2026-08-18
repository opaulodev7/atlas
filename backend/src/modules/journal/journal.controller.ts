import { Request, Response, NextFunction } from 'express';
import { JournalService } from './journal.service';
import { sendSuccess } from '../../utils/response.utils';

export class JournalController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, areaId } = req.query;
      const entries = await JournalService.listEntries(req.user!.id, {
        search: search as string,
        areaId: areaId as string,
      });
      return sendSuccess(res, entries);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await JournalService.getEntry(req.user!.id, req.params.id);
      return sendSuccess(res, entry);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await JournalService.createEntry(req.user!.id, req.body);
      return sendSuccess(res, entry, 'Entrada registrada no diário com sucesso', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await JournalService.updateEntry(req.user!.id, req.params.id, req.body);
      return sendSuccess(res, entry, 'Entrada do diário atualizada com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await JournalService.deleteEntry(req.user!.id, req.params.id);
      return sendSuccess(res, { id: req.params.id }, 'Entrada excluída com sucesso');
    } catch (error) {
      next(error);
    }
  }
}
