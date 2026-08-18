import { Request, Response, NextFunction } from 'express';
import { DecisionsService } from './decisions.service';
import { sendSuccess } from '../../utils/response.utils';

export class DecisionsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const decisions = await DecisionsService.listDecisions(req.user!.id);
      return sendSuccess(res, decisions);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const decision = await DecisionsService.getDecision(req.user!.id, req.params.id);
      return sendSuccess(res, decision);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const decision = await DecisionsService.createDecision(req.user!.id, req.body);
      return sendSuccess(res, decision, 'Decisão registrada com sucesso', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const decision = await DecisionsService.updateDecision(req.user!.id, req.params.id, req.body);
      return sendSuccess(res, decision, 'Decisão atualizada com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await DecisionsService.deleteDecision(req.user!.id, req.params.id);
      return sendSuccess(res, { id: req.params.id }, 'Decisão excluída com sucesso');
    } catch (error) {
      next(error);
    }
  }
}
