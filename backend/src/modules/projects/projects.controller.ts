import { Request, Response, NextFunction } from 'express';
import { ProjectsService } from './projects.service';
import { sendSuccess } from '../../utils/response.utils';

export class ProjectsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, goalId, areaId } = req.query;
      const projects = await ProjectsService.listProjects(req.user!.id, {
        status: status as string,
        goalId: goalId as string,
        areaId: areaId as string,
      });
      return sendSuccess(res, projects);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectsService.getProject(req.user!.id, req.params.id);
      return sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectsService.createProject(req.user!.id, req.body);
      return sendSuccess(res, project, 'Projeto criado com sucesso', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectsService.updateProject(req.user!.id, req.params.id, req.body);
      return sendSuccess(res, project, 'Projeto atualizado com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ProjectsService.deleteProject(req.user!.id, req.params.id);
      return sendSuccess(res, { id: req.params.id }, 'Projeto excluído com sucesso');
    } catch (error) {
      next(error);
    }
  }
}
