import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Diligence } from "../entities/Diligence";
import { AppError } from "../middlewares/errorHandler";

export class DiligenceRepository {
  private repository: Repository<Diligence>;

  constructor() {
    this.repository = AppDataSource.getRepository(Diligence);
  }

  async findAll(): Promise<Diligence[]> {
    return this.repository.find({
      relations: ["client", "correspondent", "attachments", "statusHistory"],
    });
  }

  async findById(id: string): Promise<Diligence | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["client", "correspondent", "attachments", "statusHistory", "paymentProof"],
    });
  }

  async create(diligenceData: Partial<Diligence>): Promise<Diligence> {
    const diligence = this.repository.create(diligenceData);
    return this.repository.save(diligence);
  }

  async update(id: string, diligenceData: Partial<Diligence>): Promise<Diligence> {
    const diligence = await this.findById(id);
    
    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }
    
    this.repository.merge(diligence, diligenceData);
    return this.repository.save(diligence);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByClient(clientId: string): Promise<Diligence[]> {
    return this.repository.find({
      where: { clientId },
      relations: ["client", "correspondent", "attachments", "statusHistory"],
    });
  }

  async findByCorrespondent(correspondentId: string): Promise<Diligence[]> {
    return this.repository.find({
      where: { correspondentId },
      relations: ["client", "correspondent", "attachments", "statusHistory"],
    });
  }

  async findAvailableDiligences(state?: string, city?: string): Promise<Diligence[]> {
    const query = this.repository
      .createQueryBuilder("diligence")
      .leftJoinAndSelect("diligence.client", "client")
      .where("diligence.status = :status", { status: "pending" });

    if (state) {
      query.andWhere("diligence.state = :state", { state });
    }

    if (city) {
      query.andWhere("diligence.city ILIKE :city", { city: `%${city}%` });
    }

    return query.getMany();
  }
}