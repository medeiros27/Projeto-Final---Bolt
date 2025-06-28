import { AppDataSource } from "../data-source";
import { Diligence } from "../entities/Diligence";
import { Payment } from "../entities/Payment";
import { StatusHistory } from "../entities/StatusHistory";
import { DiligenceRepository } from "../repositories/DiligenceRepository";
import { PaymentRepository } from "../repositories/PaymentRepository";
import { StatusHistoryRepository } from "../repositories/StatusHistoryRepository";
import { AppError } from "../middlewares/errorHandler";

class StatusManagementService {
  private diligenceRepository: DiligenceRepository;
  private paymentRepository: PaymentRepository;
  private statusHistoryRepository: StatusHistoryRepository;

  constructor() {
    this.diligenceRepository = new DiligenceRepository();
    this.paymentRepository = new PaymentRepository();
    this.statusHistoryRepository = new StatusHistoryRepository();
  }

  async addStatusHistory(data: {
    diligenceId?: string;
    paymentId?: string;
    entityType: "diligence" | "payment";
    previousStatus: string;
    newStatus: string;
    userId: string;
    reason?: string;
  }): Promise<StatusHistory> {
    const statusHistory = await this.statusHistoryRepository.createStatusHistory({
      diligenceId: data.diligenceId,
      paymentId: data.paymentId,
      entityType: data.entityType,
      previousStatus: data.previousStatus,
      newStatus: data.newStatus,
      userId: data.userId,
      reason: data.reason,
    });
    return statusHistory;
  }

  async updateDiligenceStatus(diligenceId: string, targetStatus: string, userId: string, reason?: string): Promise<Diligence> {
    const diligence = await this.diligenceRepository.findById(diligenceId);
    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }

    const newStatus = targetStatus as "pending" | "assigned" | "in_progress" | "completed" | "cancelled" | "disputed";

    await this.diligenceRepository.updateDiligence(diligenceId, { status: newStatus });

    await this.addStatusHistory({
      diligenceId: diligenceId,
      entityType: "diligence",
      previousStatus: diligence.status,
      newStatus: newStatus,
      userId: userId,
      reason: reason || `Status atualizado para ${newStatus}`,
    });

    const updatedDiligence = await this.diligenceRepository.findById(diligenceId);
    if (!updatedDiligence) {
      throw new AppError("Erro ao buscar diligência atualizada", 500);
    }
    return updatedDiligence;
  }

  async updatePaymentStatus(paymentId: string, targetStatus: string, userId: string, reason?: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new AppError("Pagamento não encontrado", 404);
    }

    const newStatus = targetStatus as "pending" | "processing" | "completed" | "failed" | "cancelled";

    await this.paymentRepository.update(paymentId, { status: newStatus });

    await this.addStatusHistory({
      paymentId: paymentId,
      entityType: "payment",
      previousStatus: payment.status,
      newStatus: newStatus,
      userId: userId,
      reason: reason || `Status atualizado para ${newStatus}`,
    });

    const updatedPayment = await this.paymentRepository.findById(paymentId);
    if (!updatedPayment) {
      throw new AppError("Erro ao buscar pagamento atualizado", 500);
    }
    return updatedPayment;
  }

  async revertStatus(
    entityId: string,
    entityType: 'diligence' | 'payment',
    targetStatus: string | null,
    userId: string,
    reason: string,
    paymentType?: 'client' | 'correspondent'
  ) {
    if (entityType === 'diligence') {
      const diligence = await this.diligenceRepository.findById(entityId);
      if (!diligence) throw new AppError('Diligência não encontrada', 404);
      
      await this.statusHistoryRepository.createStatusHistory({
        diligenceId: entityId,
        entityType,
        previousStatus: diligence.status,
        newStatus: targetStatus || "reverted",
        userId,
        reason
      });

      await this.diligenceRepository.updateDiligence(entityId, { 
        status: (targetStatus || "pending") as "pending" | "assigned" | "in_progress" | "completed" | "cancelled" | "disputed"
      });
    } else if (entityType === 'payment') {
      const payment = await this.paymentRepository.findById(entityId);
      if (!payment) throw new AppError('Pagamento não encontrado', 404);
      
      await this.statusHistoryRepository.createStatusHistory({
        paymentId: entityId,
        entityType,
        previousStatus: payment.status,
        newStatus: targetStatus || "reverted",
        userId,
        reason
      });

      await this.paymentRepository.update(entityId, { 
        status: (targetStatus || "pending") as "pending" | "processing" | "completed" | "failed" | "cancelled"
      });
    }
  }
}

export default new StatusManagementService();
