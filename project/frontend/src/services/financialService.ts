import api from './api';
import { FinancialSummary, DiligenceFinancialData, Payment } from '../types';

class FinancialService {
  private static instance: FinancialService;

  public static getInstance(): FinancialService {
    if (!FinancialService.instance) {
      FinancialService.instance = new FinancialService();
    }
    return FinancialService.instance;
  }

  /**
   * Busca o resumo financeiro geral da API.
   */
  async getFinancialSummary(): Promise<FinancialSummary> {
    return api.get('/financial/summary');
  }

  /**
   * Busca todos os registos financeiros da API.
   */
  async getAllFinancialData(): Promise<DiligenceFinancialData[]> {
    return api.get('/financial');
  }

  /**
   * Busca os dados financeiros de uma diligência específica.
   */
  async getFinancialDataByDiligence(diligenceId: string): Promise<DiligenceFinancialData | null> {
    return api.get(`/financial/diligence/${diligenceId}`);
  }

  /**
   * Marca o pagamento de um cliente como pago.
   */
  async markClientPaymentAsPaid(diligenceId: string): Promise<void> {
    return api.post(`/financial/diligence/${diligenceId}/pay-client`);
  }

  /**
   * Marca o pagamento de um correspondente como pago.
   */
  async markCorrespondentPaymentAsPaid(diligenceId: string): Promise<void> {
    return api.post(`/financial/diligence/${diligenceId}/pay-correspondent`);
  }
}

export default FinancialService.getInstance();
