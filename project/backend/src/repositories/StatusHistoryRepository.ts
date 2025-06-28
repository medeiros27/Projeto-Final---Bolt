import { AppDataSource } from "../data-source";
import { StatusHistory } from "../entities/StatusHistory";
import { Repository } from "typeorm";

export class StatusHistoryRepository extends Repository<StatusHistory> {
  constructor() {
    super(StatusHistory, AppDataSource.manager);
  }

  async create(statusHistoryData: Partial<StatusHistory>): Promise<StatusHistory> {
    const statusHistory = this.create(statusHistoryData);
    return this.save(statusHistory);
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
    return this.find({
      relations: ["user"],
      order: {
        timestamp: "DESC",
      },
    });
  }
}
