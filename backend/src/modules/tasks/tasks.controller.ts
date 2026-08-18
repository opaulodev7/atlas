import { Request, Response, NextFunction } from 'express';
import { TasksService } from './tasks.service';
import { sendSuccess } from '../../utils/response.utils';

export class TasksController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, priority, goalId, projectId, areaId, today } = req.query;
      const tasks = await TasksService.listTasks(req.user!.id, {
        status: status as string,
        priority: priority as string,
        goalId: goalId as string,
        projectId: projectId as string,
        areaId: areaId as string,
        today: today === 'true',
      });
      return sendSuccess(res, tasks);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TasksService.getTask(req.user!.id, req.params.id);
      return sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TasksService.createTask(req.user!.id, req.body);
      return sendSuccess(res, task, 'Tarefa criada com sucesso', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TasksService.updateTask(req.user!.id, req.params.id, req.body);
      return sendSuccess(res, task, 'Tarefa atualizada com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TasksService.toggleTask(req.user!.id, req.params.id);
      return sendSuccess(res, task, 'Status da tarefa atualizado com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await TasksService.deleteTask(req.user!.id, req.params.id);
      return sendSuccess(res, { id: req.params.id }, 'Tarefa excluída com sucesso');
    } catch (error) {
      next(error);
    }
  }
}
