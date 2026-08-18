import { Request, Response, NextFunction } from 'express';
import { AIService } from './ai.service';
import { sendSuccess } from '../../utils/response.utils';

export class AIController {
  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, conversationId } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, message: 'A mensagem é obrigatória' });
      }

      const response = await AIService.chat(req.user!.id, message, conversationId);
      return sendSuccess(res, response);
    } catch (error) {
      next(error);
    }
  }

  static async listConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const conversations = await AIService.listConversations(req.user!.id);
      return sendSuccess(res, conversations);
    } catch (error) {
      next(error);
    }
  }

  static async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const conv = await AIService.getConversation(req.user!.id, req.params.id);
      return sendSuccess(res, conv);
    } catch (error) {
      next(error);
    }
  }

  static async deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
      await AIService.deleteConversation(req.user!.id, req.params.id);
      return sendSuccess(res, { id: req.params.id }, 'Conversa excluída com sucesso');
    } catch (error) {
      next(error);
    }
  }

  static async quickAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { actionType } = req.body;
      const result = await AIService.quickAction(req.user!.id, actionType);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
