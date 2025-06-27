import { DiligenceFinancialData, FinancialSummary, Payment, Diligence, PaymentProof } from '../types';

class FinancialService {
  private static instance: FinancialService;
  private financialData: DiligenceFinancialData[] = [];
  private payments: Payment[] = [];
  private paymentProofs: PaymentProof[] = [];

  private constructor() {
    this.loadMockData();
  }

  public static getInstance(): FinancialService {
    if (!FinancialService.instance) {
      FinancialService.instance = new FinancialService();
    }
    return FinancialService.instance;
  }

  private loadMockData() {
    const storedData = localStorage.getItem('jurisconnect_financial_data');
    if (storedData) {
      const data = JSON.parse(storedData);
      this.financialData = data.financialData || [];
      this.payments = data.payments || [];
      this.paymentProofs = data.paymentProofs || [];
    } else {
      this.generateMockFinancialData();
    }
  }

  private saveData() {
    const data = {
      financialData: this.financialData,
      payments: this.payments,
      paymentProofs: this.paymentProofs
    };
    localStorage.setItem('jurisconnect_financial_data', JSON.stringify(data));
  }

  private generateMockFinancialData() {
    // Gerar dados financeiros mock para demonstração
    const mockDiligenceIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    
    this.financialData = mockDiligenceIds.map(id => {
      const value = Math.floor(Math.random() * 800) + 200; // 200-1000
      const cost = Math.floor(value * 0.7); // 70% para correspondente
      
      return {
        id: `fin-${id}`,
        diligenceId: id,
        faturado: value,
        custo: cost,
        lucro: value - cost,
        clientPaymentStatus: Math.random() > 0.3 ? 'paid' : 'pending' as const,
        correspondentPaymentStatus: Math.random() > 0.4 ? 'paid' : 'pending' as const,
        clientPaymentDate: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        correspondentPaymentDate: Math.random() > 0.4 ? new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    this.generateMockPayments();
    this.saveData();
  }

  private generateMockPayments() {
    this.payments = [];
    
    this.financialData.forEach(finData => {
      // Pagamento do cliente
      if (finData.clientPaymentStatus === 'paid') {
        this.payments.push({
          id: `pay-client-${finData.diligenceId}`,
          diligenceId: finData.diligenceId,
          type: 'client_payment',
          amount: finData.faturado,
          status: 'completed',
          method: 'pix',
          paidDate: finData.clientPaymentDate,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: finData.createdAt,
          updatedAt: finData.updatedAt
        });
      }

      // Pagamento ao correspondente
      if (finData.correspondentPaymentStatus === 'paid') {
        this.payments.push({
          id: `pay-corresp-${finData.diligenceId}`,
          diligenceId: finData.diligenceId,
          type: 'correspondent_payment',
          amount: finData.custo,
          status: 'completed',
          method: 'pix',
          paidDate: finData.correspondentPaymentDate,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: finData.createdAt,
          updatedAt: finData.updatedAt
        });
      }
    });
  }

  // Métodos principais para administradores
  async getFinancialSummary(): Promise<FinancialSummary> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const totalFaturado = this.financialData.reduce((sum, item) => sum + item.faturado, 0);
    const totalCusto = this.financialData.reduce((sum, item) => sum + item.custo, 0);
    const totalLucro = this.financialData.reduce((sum, item) => sum + item.lucro, 0);

    const totalRecebido = this.financialData
      .filter(item => item.clientPaymentStatus === 'paid')
      .reduce((sum, item) => sum + item.faturado, 0);

    const totalPago = this.financialData
      .filter(item => item.correspondentPaymentStatus === 'paid')
      .reduce((sum, item) => sum + item.custo, 0);

    const totalReceberá = this.financialData
      .filter(item => item.clientPaymentStatus === 'pending')
      .reduce((sum, item) => sum + item.faturado, 0);

    const totalPagará = this.financialData
      .filter(item => item.correspondentPaymentStatus === 'pending')
      .reduce((sum, item) => sum + item.custo, 0);

    // Dados do mês atual
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthData = this.financialData.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });

    const faturadoMes = thisMonthData.reduce((sum, item) => sum + item.faturado, 0);
    const lucroMes = thisMonthData.reduce((sum, item) => sum + item.lucro, 0);
    const recebidoMes = thisMonthData
      .filter(item => item.clientPaymentStatus === 'paid')
      .reduce((sum, item) => sum + item.faturado, 0);
    const pagoMes = thisMonthData
      .filter(item => item.correspondentPaymentStatus === 'paid')
      .reduce((sum, item) => sum + item.custo, 0);

    return {
      totalFaturado,
      totalLucro,
      totalCusto,
      totalReceberá,
      totalPagará,
      totalPago,
      totalRecebido,
      margemLucro: totalFaturado > 0 ? (totalLucro / totalFaturado) * 100 : 0,
      ticketMedio: this.financialData.length > 0 ? totalFaturado / this.financialData.length : 0,
      faturadoMes,
      lucroMes,
      recebidoMes,
      pagoMes
    };
  }

  async getFinancialDataByDiligence(diligenceId: string): Promise<DiligenceFinancialData | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.financialData.find(item => item.diligenceId === diligenceId) || null;
  }

  async getAllFinancialData(): Promise<DiligenceFinancialData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.financialData];
  }

  async createFinancialData(data: Omit<DiligenceFinancialData, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiligenceFinancialData> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newFinancialData: DiligenceFinancialData = {
      ...data,
      id: `fin-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.financialData.push(newFinancialData);
    this.saveData();
    return newFinancialData;
  }

  async updateFinancialData(id: string, updates: Partial<DiligenceFinancialData>): Promise<DiligenceFinancialData> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.financialData.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Dados financeiros não encontrados');
    }

    this.financialData[index] = {
      ...this.financialData[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveData();
    return this.financialData[index];
  }

  async updatePaymentStatus(diligenceId: string, type: 'client' | 'correspondent', status: 'pending' | 'pending_verification' | 'paid'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const finData = this.financialData.find(item => item.diligenceId === diligenceId);
    if (!finData) {
      throw new Error('Dados financeiros não encontrados');
    }

    if (type === 'client') {
      finData.clientPaymentStatus = status === 'pending_verification' ? 'pending' : status;
      if (status === 'paid') {
        finData.clientPaymentDate = new Date().toISOString();
      }
    } else {
      finData.correspondentPaymentStatus = status === 'pending_verification' ? 'pending' : status;
      if (status === 'paid') {
        finData.correspondentPaymentDate = new Date().toISOString();
      }
    }

    finData.updatedAt = new Date().toISOString();
    this.saveData();
  }

  async markClientPaymentAsPaid(diligenceId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const finData = this.financialData.find(item => item.diligenceId === diligenceId);
    if (finData) {
      finData.clientPaymentStatus = 'paid';
      finData.clientPaymentDate = new Date().toISOString();
      finData.updatedAt = new Date().toISOString();

      // Criar registro de pagamento
      const payment: Payment = {
        id: `pay-client-${diligenceId}-${Date.now()}`,
        diligenceId,
        type: 'client_payment',
        amount: finData.faturado,
        status: 'completed',
        method: 'pix',
        paidDate: new Date().toISOString(),
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.payments.push(payment);
      this.saveData();
    }
  }

  async markCorrespondentPaymentAsPaid(diligenceId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const finData = this.financialData.find(item => item.diligenceId === diligenceId);
    if (finData) {
      finData.correspondentPaymentStatus = 'paid';
      finData.correspondentPaymentDate = new Date().toISOString();
      finData.updatedAt = new Date().toISOString();

      // Criar registro de pagamento
      const payment: Payment = {
        id: `pay-corresp-${diligenceId}-${Date.now()}`,
        diligenceId,
        type: 'correspondent_payment',
        amount: finData.custo,
        status: 'completed',
        method: 'pix',
        paidDate: new Date().toISOString(),
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.payments.push(payment);
      this.saveData();
    }
  }

  // Métodos para clientes (apenas suas diligências)
  async getClientFinancialData(clientId: string, diligences: Diligence[]): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const clientDiligences = diligences.filter(d => d.clientId === clientId);
    const totalValue = clientDiligences.reduce((sum, d) => sum + d.value, 0);
    const paidCount = clientDiligences.filter(d => d.status === 'completed').length;
    const pendingCount = clientDiligences.filter(d => ['pending', 'assigned', 'in_progress'].includes(d.status)).length;

    return {
      totalDiligences: clientDiligences.length,
      totalValue,
      paidDiligences: paidCount,
      pendingDiligences: pendingCount,
      averageValue: clientDiligences.length > 0 ? totalValue / clientDiligences.length : 0
    };
  }

  // Métodos para correspondentes (apenas suas diligências)
  async getCorrespondentFinancialData(correspondentId: string, diligences: Diligence[]): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const correspondentDiligences = diligences.filter(d => d.correspondentId === correspondentId);
    const totalEarnings = correspondentDiligences.reduce((sum, d) => sum + d.value, 0);
    const completedCount = correspondentDiligences.filter(d => d.status === 'completed').length;
    const activeCount = correspondentDiligences.filter(d => ['assigned', 'in_progress'].includes(d.status)).length;

    return {
      totalDiligences: correspondentDiligences.length,
      totalEarnings,
      completedDiligences: completedCount,
      activeDiligences: activeCount,
      averageEarning: correspondentDiligences.length > 0 ? totalEarnings / correspondentDiligences.length : 0
    };
  }

  async getPayments(): Promise<Payment[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.payments];
  }

  async getPaymentsByDiligence(diligenceId: string): Promise<Payment[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.payments.filter(payment => payment.diligenceId === diligenceId);
  }

  async registerPaymentProof(
    diligenceId: string, 
    pixKey: string, 
    proofImage: File, 
    userId: string
  ): Promise<PaymentProof> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const diligenceFinancial = this.financialData.find(item => item.diligenceId === diligenceId);
    if (!diligenceFinancial) {
      throw new Error('Diligência não encontrada');
    }

    const newProof: PaymentProof = {
      id: `proof-${Date.now()}`,
      diligenceId,
      type: 'client_payment',
      amount: diligenceFinancial.faturado,
      pixKey,
      proofImage: URL.createObjectURL(proofImage), // Em produção, seria o URL do servidor após upload
      status: 'pending_verification',
      uploadedBy: userId,
      uploadedAt: new Date().toISOString()
    };

    this.paymentProofs.push(newProof);
    this.saveData();

    // Atualizar status do pagamento para verificação pendente
    await this.updatePaymentStatus(diligenceId, 'client', 'pending_verification');

    return newProof;
  }

  async verifyPaymentProof(proofId: string, isApproved: boolean, adminId: string): Promise<PaymentProof> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.paymentProofs.findIndex(proof => proof.id === proofId);
    if (index === -1) {
      throw new Error('Comprovante não encontrado');
    }

    const proof = this.paymentProofs[index];
    
    const updatedProof: PaymentProof = {
      ...proof,
      status: isApproved ? 'verified' : 'rejected',
      verifiedBy: adminId,
      verifiedAt: new Date().toISOString(),
      rejectionReason: isApproved ? undefined : 'Comprovante inválido ou ilegível'
    };

    this.paymentProofs[index] = updatedProof;
    this.saveData();

    // Se aprovado, atualizar status do pagamento
    if (isApproved) {
      await this.updatePaymentStatus(proof.diligenceId, proof.type === 'client_payment' ? 'client' : 'correspondent', 'paid');
    }

    return updatedProof;
  }
}

export default FinancialService.getInstance();