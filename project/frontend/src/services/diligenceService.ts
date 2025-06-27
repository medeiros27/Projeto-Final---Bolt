import { Diligence } from '../types';
import { DiligenceFormData } from '../components/Forms/DiligenceForm';
import { mockDiligences, mockUsers } from '../data/mockData';
import financialService from './financialService';
import userService from './userService';
import notificationService from './notificationService';

// Simulação de API - em produção, isso seria substituído por chamadas HTTP reais
class DiligenceService {
  private static instance: DiligenceService;
  private diligences: Diligence[] = [];
  private statusHistory: Map<string, string[]> = new Map(); // Armazenar histórico de status

  private constructor() {
    // Inicializar com dados mock se necessário
    this.loadMockData();
  }

  public static getInstance(): DiligenceService {
    if (!DiligenceService.instance) {
      DiligenceService.instance = new DiligenceService();
    }
    return DiligenceService.instance;
  }

  private loadMockData() {
    // Carregar dados mock iniciais
    const mockData = localStorage.getItem('jurisconnect_diligences');
    const statusHistoryData = localStorage.getItem('jurisconnect_status_history');
    
    if (mockData) {
      this.diligences = JSON.parse(mockData);
    } else {
      // Inicializar com dados mock padrão
      this.diligences = [...mockDiligences];
      this.saveMockData();
    }

    // Carregar histórico de status
    if (statusHistoryData) {
      const historyArray = JSON.parse(statusHistoryData);
      this.statusHistory = new Map(historyArray);
    } else {
      // Inicializar histórico de status para diligências existentes
      this.diligences.forEach(diligence => {
        this.statusHistory.set(diligence.id, [diligence.status]);
      });
      this.saveStatusHistory();
    }
  }

  private saveMockData() {
    localStorage.setItem('jurisconnect_diligences', JSON.stringify(this.diligences));
    this.saveStatusHistory();
  }

  private saveStatusHistory() {
    // Converter Map para array para salvar no localStorage
    const historyArray = Array.from(this.statusHistory.entries());
    localStorage.setItem('jurisconnect_status_history', JSON.stringify(historyArray));
  }

  private async findUserById(id: string) {
    try {
      return await userService.getUserById(id);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  async createDiligence(data: DiligenceFormData, creatorId: string): Promise<Diligence> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Determinar o ID do cliente
    let clientId = data.clientId;
    
    // Se não for admin, o criador é o cliente
    if (!clientId) {
      clientId = creatorId;
    }

    // Buscar dados do cliente
    const client = await this.findUserById(clientId);
    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    // Buscar dados do correspondente (se fornecido)
    let correspondent = null;
    if (data.correspondentId) {
      correspondent = await this.findUserById(data.correspondentId);
      if (!correspondent) {
        throw new Error('Correspondente não encontrado');
      }
    }

    // Calcular valor do correspondente se não foi fornecido (apenas para admin)
    const correspondentValue = data.correspondentValue !== undefined 
      ? data.correspondentValue 
      : data.value * 0.7; // 70% para o correspondente por padrão

    const newDiligence: Diligence = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.correspondentId ? 'assigned' : 'pending',
      priority: data.priority,
      value: data.value,
      deadline: data.deadline,
      clientId,
      correspondentId: data.correspondentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      city: data.city,
      state: data.state,
      attachments: data.attachments.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file), // Em produção, seria a URL do servidor
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: clientId
      })),
      client
    };

    // Adicionar correspondente se fornecido
    if (correspondent) {
      newDiligence.correspondent = correspondent;
    }

    this.diligences.push(newDiligence);
    
    // Inicializar histórico de status
    this.statusHistory.set(newDiligence.id, [newDiligence.status]);
    
    this.saveMockData();

    // Criar dados financeiros
    await financialService.createFinancialData({
      diligenceId: newDiligence.id,
      faturado: data.value,
      custo: correspondentValue, // Valor que o correspondente receberá
      lucro: data.value - correspondentValue, // Lucro da plataforma
      clientPaymentStatus: 'pending',
      correspondentPaymentStatus: 'pending'
    });

    // Notificar correspondente se foi atribuído
    if (data.correspondentId) {
      await notificationService.notifyDiligenceAssigned(
        newDiligence.id,
        data.correspondentId,
        newDiligence.title
      );
    }

    return newDiligence;
  }

  async updateDiligence(id: string, data: Partial<DiligenceFormData>): Promise<Diligence> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const index = this.diligences.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Diligência não encontrada');
    }

    const diligence = this.diligences[index];
    
    // Verificar se houve mudança no correspondente
    const correspondentChanged = data.correspondentId && data.correspondentId !== diligence.correspondentId;
    
    // Atualizar apenas os campos permitidos
    const updatedDiligence = {
      ...diligence,
      title: data.title || diligence.title,
      description: data.description || diligence.description,
      type: data.type || diligence.type,
      priority: data.priority || diligence.priority,
      value: data.value !== undefined ? data.value : diligence.value,
      deadline: data.deadline || diligence.deadline,
      city: data.city || diligence.city,
      state: data.state || diligence.state,
      updatedAt: new Date().toISOString()
    };

    // Atualizar cliente se fornecido (apenas para admin)
    if (data.clientId && data.clientId !== diligence.clientId) {
      const newClient = await this.findUserById(data.clientId);
      if (newClient) {
        updatedDiligence.clientId = data.clientId;
        updatedDiligence.client = newClient;
      }
    }

    // Atualizar correspondente se fornecido (apenas para admin)
    if (correspondentChanged) {
      const newCorrespondent = await this.findUserById(data.correspondentId!);
      if (newCorrespondent) {
        updatedDiligence.correspondentId = data.correspondentId;
        updatedDiligence.correspondent = newCorrespondent;
        
        // Se a diligência estava pendente, atualizar status para atribuída
        if (diligence.status === 'pending') {
          updatedDiligence.status = 'assigned';
          
          // Atualizar histórico de status
          const history = this.statusHistory.get(diligence.id) || [];
          this.statusHistory.set(diligence.id, [...history, 'assigned']);
        }
        
        // Notificar novo correspondente
        await notificationService.notifyDiligenceAssigned(
          diligence.id,
          data.correspondentId!,
          diligence.title
        );
      }
    }

    // Adicionar novos anexos, se houver
    if (data.attachments && data.attachments.length > 0) {
      const newAttachments = data.attachments.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: diligence.clientId
      }));

      updatedDiligence.attachments = [...diligence.attachments, ...newAttachments];
    }

    this.diligences[index] = updatedDiligence;
    this.saveMockData();

    // Atualizar dados financeiros se o valor foi alterado
    if (data.value !== undefined || data.correspondentValue !== undefined) {
      const financialData = await financialService.getFinancialDataByDiligence(id);
      if (financialData) {
        // Apenas atualizar se o status de pagamento ainda for pendente
        if (financialData.clientPaymentStatus === 'pending') {
          // Obter os valores atuais ou novos
          const newValue = data.value !== undefined ? data.value : diligence.value;
          
          // Calcular o novo valor do correspondente
          let newCorrespondentValue;
          if (data.correspondentValue !== undefined) {
            // Se o valor do correspondente foi explicitamente definido
            newCorrespondentValue = data.correspondentValue;
          } else if (data.value !== undefined && financialData.custo) {
            // Se apenas o valor total mudou, manter a mesma proporção
            const oldRatio = financialData.custo / diligence.value;
            newCorrespondentValue = newValue * oldRatio;
          } else {
            // Manter o valor atual
            newCorrespondentValue = financialData.custo;
          }
          
          // Calcular o novo lucro
          const newLucro = newValue - newCorrespondentValue;
          
          await financialService.updateFinancialData(financialData.id, {
            faturado: newValue,
            custo: newCorrespondentValue,
            lucro: newLucro
          });
        }
      }
    }

    return updatedDiligence;
  }

  async updateDiligenceStatus(id: string, status: Diligence['status'], correspondentId?: string): Promise<Diligence> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.diligences.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Diligência não encontrada');
    }

    const diligence = this.diligences[index];
    
    // Salvar status anterior no histórico
    const history = this.statusHistory.get(diligence.id) || [];
    this.statusHistory.set(diligence.id, [...history, status]);

    const updatedDiligence = {
      ...diligence,
      status,
      correspondentId,
      updatedAt: new Date().toISOString()
    };

    // Se estiver atribuindo a um correspondente, buscar dados do correspondente
    if (correspondentId && status === 'assigned') {
      const correspondent = await this.findUserById(correspondentId);
      if (correspondent) {
        updatedDiligence.correspondent = correspondent;
      }
    }

    this.diligences[index] = updatedDiligence;
    this.saveMockData();

    return updatedDiligence;
  }

  async assignDiligence(diligenceId: string, correspondentId: string): Promise<Diligence> {
    const updatedDiligence = await this.updateDiligenceStatus(diligenceId, 'assigned', correspondentId);
    
    // Notificar correspondente
    await notificationService.notifyDiligenceAssigned(
      diligenceId,
      correspondentId,
      updatedDiligence.title
    );
    
    return updatedDiligence;
  }

  async acceptDiligence(diligenceId: string, correspondentId: string): Promise<Diligence> {
    return this.updateDiligenceStatus(diligenceId, 'in_progress', correspondentId);
  }

  async completeDiligence(diligenceId: string, attachments?: File[]): Promise<Diligence> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const index = this.diligences.findIndex(d => d.id === diligenceId);
    if (index === -1) {
      throw new Error('Diligência não encontrada');
    }

    const diligence = this.diligences[index];
    
    // Salvar status anterior no histórico
    const history = this.statusHistory.get(diligence.id) || [];
    this.statusHistory.set(diligence.id, [...history, 'completed']);

    const updatedDiligence = {
      ...diligence,
      status: 'completed' as const,
      updatedAt: new Date().toISOString()
    };

    // Adicionar anexos de conclusão se fornecidos
    if (attachments && attachments.length > 0) {
      const newAttachments = attachments.map((file, index) => ({
        id: `completion-${Date.now()}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: updatedDiligence.correspondentId || 'unknown'
      }));

      updatedDiligence.attachments = [...updatedDiligence.attachments, ...newAttachments];
    }

    this.diligences[index] = updatedDiligence;
    this.saveMockData();

    return updatedDiligence;
  }

  async revertDiligenceStatus(diligenceId: string): Promise<Diligence> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.diligences.findIndex(d => d.id === diligenceId);
    if (index === -1) {
      throw new Error('Diligência não encontrada');
    }

    const diligence = this.diligences[index];
    
    // Obter histórico de status
    const history = this.statusHistory.get(diligence.id) || [];
    
    // Se não houver histórico ou apenas um status, não é possível reverter
    if (history.length <= 1) {
      throw new Error('Não é possível reverter o status desta diligência');
    }
    
    // Remover o status atual do histórico
    history.pop();
    
    // Obter o status anterior
    const previousStatus = history[history.length - 1];
    
    // Atualizar o histórico
    this.statusHistory.set(diligence.id, history);
    
    const updatedDiligence = {
      ...diligence,
      status: previousStatus as Diligence['status'],
      updatedAt: new Date().toISOString()
    };

    this.diligences[index] = updatedDiligence;
    this.saveMockData();

    // Se o status anterior era 'completed', reverter também os dados financeiros
    if (diligence.status === 'completed') {
      try {
        const financialData = await financialService.getFinancialDataByDiligence(diligenceId);
        if (financialData && financialData.clientPaymentStatus === 'pending') {
          // Apenas reverter se o pagamento ainda não foi processado
          await financialService.updatePaymentStatus(diligenceId, 'client', 'pending');
        }
      } catch (error) {
        console.error('Erro ao reverter dados financeiros:', error);
      }
    }

    return updatedDiligence;
  }

  async deleteDiligence(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.diligences.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Diligência não encontrada');
    }

    this.diligences.splice(index, 1);
    this.statusHistory.delete(id);
    this.saveMockData();
  }

  async getDiligences(): Promise<Diligence[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.diligences];
  }

  async getDiligenceById(id: string): Promise<Diligence | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const diligence = this.diligences.find(d => d.id === id);
    
    if (!diligence) {
      return null;
    }

    // Attach status history to the diligence
    const statusHistory = this.statusHistory.get(id) || [];
    
    return {
      ...diligence,
      statusHistory: [...statusHistory] // Create a copy to avoid mutations
    };
  }

  async getDiligencesByClient(clientId: string): Promise<Diligence[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.diligences.filter(d => d.clientId === clientId);
  }

  async getDiligencesByCorrespondent(correspondentId: string): Promise<Diligence[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.diligences.filter(d => d.correspondentId === correspondentId);
  }

  async getAvailableDiligences(state?: string, city?: string): Promise<Diligence[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let available = this.diligences.filter(d => d.status === 'pending');
    
    if (state) {
      available = available.filter(d => d.state === state);
    }
    
    if (city) {
      available = available.filter(d => d.city.toLowerCase().includes(city.toLowerCase()));
    }
    
    return available;
  }

  async submitPaymentProof(diligenceId: string, pixKey: string, proofImage: File, userId: string): Promise<Diligence> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const index = this.diligences.findIndex(d => d.id === diligenceId);
    if (index === -1) {
      throw new Error('Diligência não encontrada');
    }

    const diligence = this.diligences[index];
    
    // Criar prova de pagamento
    const paymentProof = {
      id: `payment-${Date.now()}`,
      diligenceId,
      type: 'client_payment' as const,
      amount: diligence.value,
      pixKey,
      proofImage: URL.createObjectURL(proofImage), // Em produção, seria o URL do servidor após upload
      status: 'pending_verification' as const,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString()
    };

    const updatedDiligence = {
      ...diligence,
      paymentProof,
      updatedAt: new Date().toISOString()
    };

    this.diligences[index] = updatedDiligence;
    this.saveMockData();

    // Atualizar dados financeiros
    await financialService.updatePaymentStatus(diligenceId, 'client', 'pending_verification');

    return updatedDiligence;
  }

  async verifyPaymentProof(diligenceId: string, isApproved: boolean, adminId: string): Promise<Diligence> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.diligences.findIndex(d => d.id === diligenceId);
    if (index === -1) {
      throw new Error('Diligência não encontrada');
    }

    const diligence = this.diligences[index];
    if (!diligence.paymentProof) {
      throw new Error('Comprovante de pagamento não encontrado');
    }

    const updatedPaymentProof = {
      ...diligence.paymentProof,
      status: isApproved ? 'verified' as const : 'rejected' as const,
      verifiedBy: adminId,
      verifiedAt: new Date().toISOString(),
      rejectionReason: isApproved ? undefined : 'Comprovante inválido ou ilegível'
    };

    const updatedDiligence = {
      ...diligence,
      paymentProof: updatedPaymentProof,
      updatedAt: new Date().toISOString()
    };

    this.diligences[index] = updatedDiligence;
    this.saveMockData();

    // Atualizar dados financeiros
    if (isApproved) {
      await financialService.updatePaymentStatus(diligenceId, 'client', 'paid');
      
      // Notificar correspondente sobre pagamento confirmado
      if (diligence.correspondentId) {
        await notificationService.notifyPaymentReceived(
          diligence.correspondentId,
          diligence.value,
          diligence.title
        );
      }
    }

    return updatedDiligence;
  }
}

export default DiligenceService.getInstance();