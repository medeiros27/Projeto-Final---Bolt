import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Attachment } from "../entities/Attachment";
import { AppError } from "../middlewares/errorHandler";

export class AttachmentRepository {
  private repository: Repository<Attachment>;

  constructor() {
    this.repository = AppDataSource.getRepository(Attachment);
  }

  async create(attachmentData: Partial<Attachment>): Promise<Attachment> {
    const attachment = this.repository.create(attachmentData);
    return this.repository.save(attachment);
  }

  async findById(id: string): Promise<Attachment | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["diligence", "uploadedBy"],
    });
  }

  async findByDiligence(diligenceId: string): Promise<Attachment[]> {
    return this.repository.find({
      where: { diligenceId },
      relations: ["uploadedBy"],
      order: { uploadedAt: "DESC" },
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}