import { Request, Response } from "express";
// SOLUÇÃO: Importar a instância padrão do serviço
import notificationService from "../services/NotificationService";
import { AppError } from "../middlewares/errorHandler";
// SOLUÇÃO: Importar a interface para requisições autenticadas
import { IAuthRequest } from "../middlewares/authMiddleware";

export class NotificationController {
  // O construtor não é mais necessário, pois o serviço é importado como uma instância.

  getUserNotifications = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const userId = authRequest.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const notifications = await notificationService.getNotifications(userId);
    return res.json(notifications);
  };

  markAsRead = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { id } = req.params;
    const userId = authRequest.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    await notificationService.markAsRead(id);
    return res.json({ message: "Notificação marcada como lida" });
  };

  markAllAsRead = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const userId = authRequest.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    await notificationService.markAllAsRead(userId);
    return res.json({ message: "Todas as notificações marcadas como lidas" });
  };

  deleteNotification = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { id } = req.params;
    const userId = authRequest.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    await notificationService.deleteNotification(id);
    return res.status(204).send();
  };
}
