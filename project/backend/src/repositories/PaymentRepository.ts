import { AppDataSource } from "../data-source";
import { Payment } from "../entities/Payment";
import { Repository, DeleteResult } from "typeorm";

export class PaymentRepository extends Repository<Payment> {
  constructor() {
    super(Payment, AppDataSource.manager);
  }

  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    const payment = this.create(paymentData);
    return this.save(payment);
  }

  async findById(id: string): Promise<Payment | null> {
    return this.findOne({
      where: { id },
      relations: ["diligence", "paymentProof"],
    });
  }

  async findAll(): Promise<Payment[]> {
    return this.find({
      relations: ["diligence", "paymentProof"],
    });
  }

  async updatePayment(id: string, paymentData: Partial<Payment>): Promise<Payment | null> {
    const payment = await this.findById(id);
    if (!payment) {
      return null;
    }
    this.merge(payment, paymentData);
    return this.save(payment);
  }

  async deletePayment(id: string): Promise<DeleteResult> {
    return this.delete(id);
  }

  async findByDiligence(diligenceId: string): Promise<Payment[]> {
    return this.find({
      where: { diligence: { id: diligenceId } },
      relations: ["diligence", "paymentProof"],
    });
  }

  async findByClient(clientId: string): Promise<Payment[]> {
    return this.find({
      where: { diligence: { client: { id: clientId } } },
      relations: ["diligence", "paymentProof"],
    });
  }

  async findByCorrespondent(correspondentId: string): Promise<Payment[]> {
    return this.find({
      where: { diligence: { correspondent: { id: correspondentId } } },
      relations: ["diligence", "paymentProof"],
    });
  }

  async findByStatus(status: "pending" | "completed" | "cancelled" | "processing" | "failed"): Promise<Payment[]> {
    return this.find({
      where: { status }, // CORREÇÃO: O tipo do status agora é explícito
      relations: ["diligence", "paymentProof"],
    });
  }
}
