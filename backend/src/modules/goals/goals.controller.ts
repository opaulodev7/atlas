import { Request, Response, NextFunction } from 'express';
import { GoalsService } from './goals.service';
import { sendSuccess } from '../../utils/response.utils';

export class GoalsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, areaId } = req.query;
      const goals = await GoalsService.listGoals(req.user!.id, {
        status: status as string,
        areaId: areaId as string,
      });
      return sendSuccess(res, goals);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await GoalsService.getGoal(req.user!.id, req.params.id);
      return sendSuccess(res, goal);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await GoalsService.createGoal(req.user!.id, req.body);
      return sendSuccess(res, goal, 'Objetivo criado com sucesso', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await GoalsService.updateGoal(req.user!.id, req.params.id, req.body);
      return sendSuccess(res, goal, 'Objetivo atualizado com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await GoalsService.updateProgress(req.user!.id, req.params.id, req.body);
      return sendSuccess(res, goal, 'Progresso atualizado com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await GoalsService.deleteGoal(req.user!.id, req.params.id);
      return sendSuccess(res, { id: req.params.id }, 'Objetivo excluído com sucesso');
    } catch (error) {
      next(error);
    }
  }
}
