import api from './api'; // Importa o nosso cliente de API centralizado
import { Diligence } from '../types';
import { DiligenceFormData } from '../components/Forms/DiligenceForm';

// O serviço agora atua como uma camada fina para fazer chamadas HTTP.
class DiligenceService {
  private static instance: DiligenceService;

  private constructor() {
    // O construtor está vazio. Não há mais necessidade de carregar dados locais.
  }

  public static getInstance(): DiligenceService {
    if (!DiligenceService.instance) {
      DiligenceService.instance = new DiligenceService();
    }
    return DiligenceService.instance;
  }

  /**
   * Busca todas as diligências da API.
   * @returns Uma promessa com a lista de diligências.
   */
  async getDiligences(): Promise<Diligence[]> {
    return api.get('/diligences');
  }

  /**
   * Busca uma única diligência pelo seu ID.
   * @param id - O ID da diligência.
   * @returns Uma promessa com os dados da diligência ou null se não encontrada.
   */
  async getDiligenceById(id: string): Promise<Diligence | null> {
    return api.get(`/diligences/${id}`);
  }

  /**
   * Cria uma nova diligência no backend.
   * O backend será responsável por criar dados financeiros e notificações associadas.
   * @param data - Os dados do formulário de criação.
   * @returns Uma promessa com a nova diligência criada.
   */
  async createDiligence(data: DiligenceFormData): Promise<Diligence> {
    // Para uploads de ficheiros, usamos FormData.
    const formData = new FormData();
    
    // Adiciona todos os campos de texto/numéricos ao formData
    Object.keys(data).forEach(key => {
      const value = data[key as keyof DiligenceFormData];
      if (key !== 'attachments') {
        formData.append(key, String(value));
      }
    });

    // Adiciona os ficheiros de anexo
    data.attachments.forEach(file => {
      formData.append('attachments', file);
    });

    return api.post('/diligences', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Atualiza uma diligência existente.
   * @param id - O ID da diligência a ser atualizada.
   * @param data - Os dados a serem atualizados.
   * @returns Uma promessa com a diligência atualizada.
   */
  async updateDiligence(id: string, data: Partial<DiligenceFormData>): Promise<Diligence> {
    // A lógica de upload de novos ficheiros também usaria FormData aqui.
    return api.put(`/diligences/${id}`, data);
  }

  /**
   * Elimina uma diligência.
   * @param id - O ID da diligência a ser eliminada.
   */
  async deleteDiligence(id: string): Promise<void> {
    return api.delete(`/diligences/${id}`);
  }

  /**
   * Atualiza o estado de uma diligência.
   * @param id - O ID da diligência.
   * @param status - O novo estado.
   * @returns Uma promessa com a diligência atualizada.
   */
  async updateDiligenceStatus(id: string, status: Diligence['status']): Promise<Diligence> {
    return api.patch(`/diligences/${id}/status`, { status });
  }

  /**
   * Atribui uma diligência a um correspondente.
   * @param diligenceId - O ID da diligência.
   * @param correspondentId - O ID do correspondente.
   * @returns Uma promessa com a diligência atualizada.
   */
  async assignDiligence(diligenceId: string, correspondentId: string): Promise<Diligence> {
    return api.post(`/diligences/${diligenceId}/assign`, { correspondentId });
  }
  
  /**
   * Reverte o estado de uma diligência para o estado anterior.
   * @param diligenceId - O ID da diligência.
   * @returns Uma promessa com a diligência atualizada.
   */
  async revertDiligenceStatus(diligenceId: string): Promise<Diligence> {
    return api.post(`/diligences/${diligenceId}/revert-status`);
  }

  /**
   * Submete um comprovativo de pagamento para uma diligência.
   * @param diligenceId - O ID da diligência.
   * @param proofData - Dados do comprovativo.
   * @returns Uma promessa com a diligência atualizada.
   */
  async submitPaymentProof(diligenceId: string, proofData: { pixKey: string; proofImage: File }): Promise<Diligence> {
    const formData = new FormData();
    formData.append('pixKey', proofData.pixKey);
    formData.append('proofImage', proofData.proofImage);

    return api.post(`/diligences/${diligenceId}/payment-proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Verifica (aprova ou rejeita) um comprovativo de pagamento.
   * @param diligenceId - O ID da diligência.
   * @param isApproved - Booleano indicando se o comprovativo foi aprovado.
   * @returns Uma promessa com a diligência atualizada.
   */
  async verifyPaymentProof(diligenceId: string, isApproved: boolean): Promise<Diligence> {
    return api.post(`/diligences/${diligenceId}/verify-proof`, { isApproved });
  }
}

export default DiligenceService.getInstance();
