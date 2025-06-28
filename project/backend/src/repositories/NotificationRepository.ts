import { AppDataSource } from "../data-source";
import { Notification } from "../entities/Notification";
import { Repository } from "typeorm";

export class NotificationRepository extends Repository<Notification> {
  constructor() {
    super(Notification, AppDataSource.manager);
  }

  async create(notificationData: Partial<Notification>): Promise<Notification> {
    const notification = this.create(notificationData);
    return this.save(notification);
  }

  async findById(id: string): Promise<Notification | null> {
    return this.findOne({
      where: { id },
      relations: ["user"],
    });
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.update(id, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true })
      .where("userId = :userId AND read = :read", { userId, read: false })
      .execute();
  }

  async delete(id: string): Promise<void> {
    await this.delete(id);
  }
}
