import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { StatusHistory } from "../entities/StatusHistory";

export class StatusHistoryRepository {
  private repository: Repository<StatusHistory>;

  constructor() {
    this.repository = AppDataSource.getRepository(StatusHistory);
  }

  async create(statusHistoryData: Partial<StatusHistory>): Promise<StatusHistory> {
    const statusHistory = this.repository.create(statusHistoryData);
    return this.repository.save(statusHistory);
  }

  async findByDiligenceId(diligenceId: string): Promise<StatusHistory[]> {
    return this.repository.find({
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
    return this.repository.find({
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
    return this.repository.find({
      relations: ["user"],
      order: {
        timestamp: "DESC",
      },
    });
  }
}