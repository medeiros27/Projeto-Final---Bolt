import { AppDataSource } from "../data-source";
import { Notification } from "../entities/Notification";
import { Repository, DeleteResult } from "typeorm";

export class NotificationRepository extends Repository<Notification> {
  constructor() {
    super(Notification, AppDataSource.manager);
  }

  // Renomeado de 'create' para 'createNotification' para evitar conflito com o método base do TypeORM
  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    const notification = this.create(notificationData); // Usa o método 'create' da classe base Repository
    return this.save(notification); // Usa o método 'save' da classe base Repository
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

  // Renomeado de 'delete' para 'deleteNotification' para evitar conflito e corrigida a implementação
  async deleteNotification(id: string): Promise<DeleteResult> {
    const result = await super.delete(id); // Chama o método 'delete' da classe pai (Repository)
    return result;
  }
}
