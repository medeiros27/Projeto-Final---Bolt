import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Notification } from "../entities/Notification";

export class NotificationRepository {
  private repository: Repository<Notification>;

  constructor() {
    this.repository = AppDataSource.getRepository(Notification);
  }

  async create(notificationData: Partial<Notification>): Promise<Notification> {
    const notification = this.repository.create(notificationData);
    return this.repository.save(notification);
  }

  async findById(id: string): Promise<Notification | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["user"],
    });
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.repository.update(id, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true })
      .where("userId = :userId AND read = :read", { userId, read: false })
      .execute();
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}