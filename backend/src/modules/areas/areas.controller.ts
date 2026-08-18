import { Request, Response, NextFunction } from 'express';
import { AreasService } from './areas.service';
import { sendSuccess } from '../../utils/response.utils';

export class AreasController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const areas = await AreasService.listAreas(req.user!.id);
      return sendSuccess(res, areas);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const area = await AreasService.getArea(req.user!.id, req.params.id);
      return sendSuccess(res, area);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const area = await AreasService.createArea(req.user!.id, req.body);
      return sendSuccess(res, area, 'Área criada com sucesso', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await AreasService.updateArea(req.user!.id, req.params.id, req.body);
      return sendSuccess(res, updated, 'Área atualizada com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await AreasService.deleteArea(req.user!.id, req.params.id);
      return sendSuccess(res, { id: req.params.id }, 'Área excluída com sucesso');
    } catch (error) {
      next(error);
    }
  }
}
