import { Request, Response, NextFunction } from 'express';
import { HabitsService } from './habits.service';
import { sendSuccess } from '../../utils/response.utils';

export class HabitsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const habits = await HabitsService.listHabits(req.user!.id);
      return sendSuccess(res, habits);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const habit = await HabitsService.getHabit(req.user!.id, req.params.id);
      return sendSuccess(res, habit);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const habit = await HabitsService.createHabit(req.user!.id, req.body);
      return sendSuccess(res, habit, 'Hábito criado com sucesso', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const habit = await HabitsService.updateHabit(req.user!.id, req.params.id, req.body);
      return sendSuccess(res, habit, 'Hábito atualizado com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async log(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await HabitsService.toggleHabitLog(req.user!.id, req.params.id, req.body);
      return sendSuccess(res, log, 'Registro do hábito salvo com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await HabitsService.deleteHabit(req.user!.id, req.params.id);
      return sendSuccess(res, { id: req.params.id }, 'Hábito excluído com sucesso');
    } catch (error) {
      next(error);
    }
  }
}
