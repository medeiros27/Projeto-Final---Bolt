import { Request, Response } from "express";
import { NotificationService } from "../services/NotificationService";
import { AppError } from "../middlewares/errorHandler";

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getUserNotifications = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const notifications = await this.notificationService.getNotifications(userId);
    return res.json(notifications);
  };

  markAsRead = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    await this.notificationService.markAsRead(id);
    return res.json({ message: "Notificação marcada como lida" });
  };

  markAllAsRead = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    await this.notificationService.markAllAsRead(userId);
    return res.json({ message: "Todas as notificações marcadas como lidas" });
  };

  deleteNotification = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    await this.notificationService.deleteNotification(id);
    return res.status(204).send();
  };
}