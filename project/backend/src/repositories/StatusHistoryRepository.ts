import { AppDataSource } from "../data-source";
import { StatusHistory } from "../entities/StatusHistory";
import { Repository } from "typeorm";

export class StatusHistoryRepository extends Repository<StatusHistory> {
  constructor() {
    super(StatusHistory, AppDataSource.manager);
  }

  // Renomeado de 'create' para 'createStatusHistory' para evitar conflito com o método base do TypeORM
  async createStatusHistory(statusHistoryData: Partial<StatusHistory>): Promise<StatusHistory> {
    const statusHistory = this.create(statusHistoryData); // Usa o método 'create' da classe base Repository
    return this.save(statusHistory); // Usa o método 'save' da classe base Repository
  }

  async findByDiligenceId(diligenceId: string): Promise<StatusHistory[]> {
    return this.find({
      where: {
        diligenceId,
        entityType: "diligence",
      },
      relations: ["user"],
      order: {
        timestamp: "DESC",
      },
    });
  }

  async findByPaymentId(paymentId: string): Promise<StatusHistory[]> {
    return this.find({
      where: {
        paymentId,
        entityType: "payment",
      },
      relations: ["user"],
      order: {
        timestamp: "DESC",
      },
    });
  }

  async findAll(): Promise<StatusHistory[]> {
    return this.find();
  }
}
