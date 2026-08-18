import { Request, Response, NextFunction } from 'express';
import { PlansService } from './plans.service';
import { sendSuccess } from '../../utils/response.utils';

export class PlansController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, goalId } = req.query;
      const plans = await PlansService.listPlans(req.user!.id, {
        status: status as string,
        goalId: goalId as string,
      });
      return sendSuccess(res, plans);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await PlansService.getPlan(req.user!.id, req.params.id);
      return sendSuccess(res, plan);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await PlansService.createPlan(req.user!.id, req.body);
      return sendSuccess(res, plan, 'Plano de ação criado com sucesso', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await PlansService.updatePlan(req.user!.id, req.params.id, req.body);
      return sendSuccess(res, plan, 'Plano de ação atualizado com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async toggleStep(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await PlansService.toggleStep(req.user!.id, req.params.id, req.params.stepId);
      return sendSuccess(res, plan, 'Status da etapa atualizado com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await PlansService.deletePlan(req.user!.id, req.params.id);
      return sendSuccess(res, { id: req.params.id }, 'Plano excluído com sucesso');
    } catch (error) {
      next(error);
    }
  }
}
