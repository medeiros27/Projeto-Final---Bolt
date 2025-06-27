import { Diligence } from "../entities/Diligence";
import { Payment } from "../entities/Payment";
import { PaymentProof } from "../entities/PaymentProof";
import { FinancialRepository } from "../repositories/FinancialRepository";
import { AppError } from "../middlewares/errorHandler";

class FinancialService {
  private financialRepository: FinancialRepository;

  constructor() {
    this.financialRepository = new FinancialRepository();
  }

  // SOLUÇÃO: Adicionar o método que estava em falta
  async createFinancialDataForDiligence(diligence: Diligence, correspondentValue: number): Promise<void> {
    // Cria o registo de pagamento para o cliente
    await this.financialRepository.createPayment({
      diligenceId: diligence.id,
      clientId: diligence.clientId,
      amount: diligence.value,
      type: 'client_payment',
      status: 'pending'
    });
    
    // Se um correspondente foi atribuído, cria o registo de pagamento para ele
    if(diligence.correspondentId) {
        await this.financialRepository.createPayment({
            diligenceId: diligence.id,
            correspondentId: diligence.correspondentId,
            amount: correspondentValue,
            type: 'correspondent_payment',
            status: 'pending'
        });
    }
  }

  async getFinancialSummary(): Promise<any> {
    // A implementação real dependeria de queries complexas. Mantendo simulação por agora.
    return { totalFaturado: 0, totalLucro: 0, totalCusto: 0 };
  }

  async getAllFinancialData(): Promise<Payment[]> {
    return this.financialRepository.findAllPayments();
  }

  async getFinancialDataByDiligence(diligenceId: string): Promise<Payment[]> {
    return this.financialRepository.findPaymentsByDiligence(diligenceId);
  }

  async submitPaymentProof(diligenceId: string, pixKey: string, proofImage: string, amount: number, userId: string): Promise<PaymentProof> {
    return this.financialRepository.createPaymentProof({
      diligenceId,
      pixKey,
      proofImage,
      amount,
      uploadedById: userId,
      type: 'client_payment',
      status: 'pending_verification'
    });
  }

  async verifyPaymentProof(proofId: string, isApproved: boolean, adminId: string, rejectionReason?: string): Promise<PaymentProof> {
    const proof = await this.financialRepository.findPaymentProofById(proofId);
    if (!proof) {
      throw new AppError("Comprovativo de pagamento não encontrado", 404);
    }

    const status = isApproved ? 'verified' : 'rejected';
    return this.financialRepository.updatePaymentProof(proofId, { 
        status, 
        verifiedById: adminId, 
        verifiedAt: new Date(), 
        rejectionReason: isApproved ? undefined : rejectionReason 
    });
  }

  async markClientPaymentAsPaid(diligenceId: string, userId: string): Promise<Payment> {
     const payments = await this.financialRepository.findPaymentsByDiligence(diligenceId);
     const clientPayment = payments.find(p => p.type === 'client_payment');
     if(!clientPayment) throw new AppError('Pagamento do cliente não encontrado', 404);

     return this.financialRepository.updatePayment(clientPayment.id, { status: 'completed', paidDate: new Date() });
  }

  async markCorrespondentPaymentAsPaid(diligenceId: string, userId: string): Promise<Payment> {
    const payments = await this.financialRepository.findPaymentsByDiligence(diligenceId);
    const correspondentPayment = payments.find(p => p.type === 'correspondent_payment');
    if(!correspondentPayment) throw new AppError('Pagamento do correspondente não encontrado', 404);

    return this.financialRepository.updatePayment(correspondentPayment.id, { status: 'completed', paidDate: new Date() });
  }
  
  async getClientFinancialData(clientId: string): Promise<Payment[]> {
      return this.financialRepository.findPaymentsByClient(clientId);
  }
  
  async getCorrespondentFinancialData(correspondentId: string): Promise<Payment[]> {
      return this.financialRepository.findPaymentsByCorrespondent(correspondentId);
  }
}

export default new FinancialService();