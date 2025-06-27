import api from './api';
import { User, Diligence, Payment, QualityMetrics, AssignmentCriteria } from '../types';

/**
 * PlatformService é responsável por toda a comunicação com a API
 * relacionada com a gestão geral da plataforma, utilizadores e análises.
 */
class PlatformService {
  private static instance: PlatformService;

  private constructor() {
    // O construtor está vazio, pois não há mais estado local para gerir.
  }

  public static getInstance(): PlatformService {
    if (!PlatformService.instance) {
      PlatformService.instance = new PlatformService();
    }
    return PlatformService.instance;
  }

  // --- Gestão de Clientes e Correspondentes ---

  async registerClient(clientData: Partial<User>): Promise<User> {
    return api.post('/auth/register/client', clientData);
  }

  async registerCorrespondent(correspondentData: Partial<User>): Promise<User> {
    return api.post('/auth/register/correspondent', correspondentData);
  }

  async credentialCorrespondent(correspondentId: string, documents: File[]): Promise<boolean> {
    const formData = new FormData();
    documents.forEach(doc => formData.append('documents', doc));
    return api.post(`/users/${correspondentId}/credential`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // --- Sistema Inteligente de Atribuição ---

  async findBestCorrespondent(criteria: AssignmentCriteria): Promise<User | null> {
    return api.post('/diligences/find-correspondent', criteria);
  }

  async autoAssignDiligence(diligenceId: string): Promise<boolean> {
    return api.post(`/diligences/${diligenceId}/auto-assign`);
  }

  // --- Processamento de Pagamentos ---

  async processClientPayment(diligenceId: string, paymentMethod: string): Promise<Payment> {
    return api.post(`/financial/process-payment/${diligenceId}`, { paymentMethod });
  }

  // --- Controlo de Qualidade ---

  async submitFeedback(feedbackData: { diligenceId: string; fromUserId: string; toUserId: string; rating: number; comment: string }): Promise<void> {
    return api.post('/feedback', feedbackData);
  }

  async getQualityMetrics(correspondentId: string): Promise<QualityMetrics | null> {
    return api.get(`/users/${correspondentId}/quality-metrics`);
  }

  // --- Análises e Relatórios ---

  async getPlatformAnalytics(): Promise<any> {
    return api.get('/platform/analytics');
  }

  // --- Gestão de Documentos ---

  async uploadDocument(fileData: { userId: string; file: File; type: string }): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', fileData.file);
    formData.append('userId', fileData.userId);
    formData.append('type', fileData.type);

    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  
  // --- Comunicação ---
  
  async sendMessage(messageData: { diligenceId: string; content: string }): Promise<void> {
    // O backend identificará fromUserId pelo token
    return api.post(`/diligences/${messageData.diligenceId}/messages`, { content: messageData.content });
  }

  // --- Getters ---

  async getClients(): Promise<User[]> {
    return api.get('/users/role/client');
  }

  async getCorrespondents(): Promise<User[]> {
    return api.get('/users/role/correspondent');
  }

  async getPayments(): Promise<Payment[]> {
    return api.get('/financial/payments');
  }

  async getDiligences(): Promise<Diligence[]> {
    return api.get('/diligences');
  }
}

export default PlatformService.getInstance();
