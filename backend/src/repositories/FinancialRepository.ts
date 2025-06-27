import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Payment } from "../entities/Payment";
import { PaymentProof } from "../entities/PaymentProof";
import { AppError } from "../middlewares/errorHandler";

export class FinancialRepository {
  private paymentRepository: Repository<Payment>;
  private paymentProofRepository: Repository<PaymentProof>;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.paymentProofRepository = AppDataSource.getRepository(PaymentProof);
  }

  // Métodos para Pagamentos
  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    const payment = this.paymentRepository.create(paymentData);
    return this.paymentRepository.save(payment);
  }

  async updatePayment(id: string, paymentData: Partial<Payment>): Promise<Payment> {
    const payment = await this.paymentRepository.findOneBy({ id });
    
    if (!payment) {
      throw new AppError("Pagamento não encontrado", 404);
    }
    
    this.paymentRepository.merge(payment, paymentData);
    return this.paymentRepository.save(payment);
  }

  async findPaymentById(id: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({
      where: { id },
      relations: ["diligence", "client", "correspondent"],
    });
  }
    
  // SOLUÇÃO: Adicionar o método que estava faltando.
  async findAllPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({
        relations: ["diligence", "client", "correspondent"],
        order: { createdAt: "DESC" }
    });
  }

  async findPaymentsByDiligence(diligenceId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { diligenceId },
      relations: ["diligence", "client", "correspondent"],
    });
  }

  async findPaymentsByClient(clientId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { clientId },
      relations: ["diligence"],
    });
  }

  async findPaymentsByCorrespondent(correspondentId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { correspondentId },
      relations: ["diligence"],
    });
  }

  // Métodos para Comprovantes de Pagamento
  async createPaymentProof(proofData: Partial<PaymentProof>): Promise<PaymentProof> {
    const proof = this.paymentProofRepository.create(proofData);
    return this.paymentProofRepository.save(proof);
  }

  async updatePaymentProof(id: string, proofData: Partial<PaymentProof>): Promise<PaymentProof> {
    const proof = await this.paymentProofRepository.findOneBy({ id });
    
    if (!proof) {
      throw new AppError("Comprovante não encontrado", 404);
    }
    
    this.paymentProofRepository.merge(proof, proofData);
    return this.paymentProofRepository.save(proof);
  }

  async findPaymentProofById(id: string): Promise<PaymentProof | null> {
    return this.paymentProofRepository.findOne({
      where: { id },
      relations: ["diligence", "uploadedBy", "verifiedBy"],
    });
  }

  async findPaymentProofByDiligence(diligenceId: string): Promise<PaymentProof | null> {
    return this.paymentProofRepository.findOne({
      where: { diligenceId },
      relations: ["diligence", "uploadedBy", "verifiedBy"],
    });
  }

  async findPendingPaymentProofs(): Promise<PaymentProof[]> {
    return this.paymentProofRepository.find({
      where: { status: "pending_verification" },
      relations: ["diligence", "uploadedBy"],
    });
  }
}