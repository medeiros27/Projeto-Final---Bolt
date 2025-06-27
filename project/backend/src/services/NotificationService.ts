import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Notification } from "../entities/Notification";

export class NotificationService {
  private repository: Repository<Notification>;

  constructor() {
    this.repository = AppDataSource.getRepository(Notification);
  }

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  }): Promise<Notification> {
    const notification = this.repository.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      read: false,
    });

    return this.repository.save(notification);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.repository.update(notificationId, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true })
      .where("userId = :userId AND read = :read", { userId, read: false })
      .execute();
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.repository.delete(notificationId);
  }
}