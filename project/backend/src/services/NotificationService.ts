import { Notification } from "../entities/Notification";
import { NotificationRepository } from "../repositories/NotificationRepository"; // Importar o repositório personalizado
import { DeleteResult } from "typeorm"; // Importar DeleteResult para o método delete

class NotificationService {
  private notificationRepository: NotificationRepository; // Usar a instância do repositório personalizado

  constructor() {
    this.notificationRepository = new NotificationRepository(); // Instanciar o repositório personalizado
  }

  async createNotification(data: {
    userId: string;
    type: "diligence_assigned" | "payment_received" | "deadline_reminder" | "feedback_received" | "system_update";
    title: string;
    message: string;
    data?: Record<string, any>;
  }): Promise<Notification> {
    // Chamar o método personalizado do NotificationRepository
    const newNotification = await this.notificationRepository.createNotification({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      read: false,
      createdAt: new Date()
    });
    return newNotification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    // Chamar o método personalizado do NotificationRepository
    return this.notificationRepository.findByUser(userId);
  }

  async markAsRead(notificationId: string): Promise<void> {
    // Chamar o método personalizado do NotificationRepository
    await this.notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    // Chamar o método personalizado do NotificationRepository
    await this.notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(notificationId: string): Promise<DeleteResult> {
    // Chamar o método personalizado do NotificationRepository
    return this.notificationRepository.deleteNotification(notificationId);
  }
}

export default new NotificationService();
