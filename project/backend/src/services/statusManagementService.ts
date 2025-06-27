import { Diligence, DiligenceFinancialData } from '../types';
import diligenceService from './diligenceService';
import financialService from './financialService';
import notificationService from './notificationService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Definição de tipos para o serviço
interface StatusReversion {
  id: string;
  diligenceId: string;
  paymentId?: string;
  type: 'diligence' | 'payment';
  paymentType?: 'client' | 'correspondent';
  previousStatus: string;
  newStatus: string;
  userId: string;
  reason: string;
  timestamp: string;
}

interface StatusReversionResult {
  success: boolean;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
  message: string;
  entity: Diligence | DiligenceFinancialData | null;
}

// Mapa de permissões para reversão de status
const permissionMap = {
  diligence: {
    admin: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
    client: ['pending'],
    correspondent: ['pending', 'in_progress', 'completed']
  },
  payment: {
    admin: ['pending', 'pending_verification', 'paid'],
    client: [],
    correspondent: []
  }
};

// Mapa de transições válidas para diligências
const validDiligenceTransitions: Record<string, string[]> = {
  'completed': ['in_progress'],
  'in_progress': ['assigned'],
  'assigned': ['pending'],
  'cancelled': ['pending', 'assigned', 'in_progress']
};

// Mapa de transições válidas para pagamentos
const validPaymentTransitions: Record<string, string[]> = {
  'paid': ['pending_verification', 'pending'],
  'pending_verification': ['pending']
};

class StatusManagementService {
  private static instance: StatusManagementService;
  private reversions: StatusReversion[] = [];

  private constructor() {
    this.loadData();
  }

  public static getInstance(): StatusManagementService {
    if (!StatusManagementService.instance) {
      StatusManagementService.instance = new StatusManagementService();
    }
    return StatusManagementService.instance;
  }

  private loadData() {
    const storedData = localStorage.getItem('jurisconnect_status_reversions');
    if (storedData) {
      this.reversions = JSON.parse(storedData);
    }
  }

  private saveData() {
    localStorage.setItem('jurisconnect_status_reversions', JSON.stringify(this.reversions));
  }

  /**
   * Reverte o status de uma diligência ou pagamento
   * @param entityId ID da diligência ou pagamento
   * @param type Tipo de entidade (diligência ou pagamento)
   * @param targetStatus Status desejado (se null, reverte para o status anterior)
   * @param userId ID do usuário realizando a operação
   * @param reason Motivo da reversão
   * @param paymentType Tipo de pagamento (client ou correspondent) - obrigatório para pagamentos
   * @returns Resultado da operação
   */
  async revertStatus(
    entityId: string,
    type: 'diligence' | 'payment',
    targetStatus: string | null,
    userId: string,
    reason: string,
    paymentType?: 'client' | 'correspondent'
  ): Promise<StatusReversionResult> {
    try {
      // Verificar se é diligência ou pagamento
      if (type === 'diligence') {
        return await this.revertDiligenceStatus(entityId, targetStatus, userId, reason);
      } else {
        if (!paymentType) {
          throw new Error('Tipo de pagamento é obrigatório para reversão de pagamentos');
        }
        return await this.revertPaymentStatus(entityId, targetStatus, userId, reason, paymentType);
      }
    } catch (error) {
      console.error('Erro ao reverter status:', error);
      return {
        success: false,
        previousStatus: '',
        newStatus: '',
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Erro desconhecido ao reverter status',
        entity: null
      };
    }
  }

  /**
   * Reverte o status de uma diligência
   * @param diligenceId ID da diligência
   * @param targetStatus Status desejado (se null, reverte para o status anterior)
   * @param userId ID do usuário realizando a operação
   * @param reason Motivo da reversão
   * @returns Resultado da operação
   */
  private async revertDiligenceStatus(
    diligenceId: string,
    targetStatus: string | null,
    userId: string,
    reason: string
  ): Promise<StatusReversionResult> {
    // Buscar diligência
    const diligence = await diligenceService.getDiligenceById(diligenceId);
    if (!diligence) {
      throw new Error('Diligência não encontrada');
    }

    // Buscar usuário (em produção, isso seria feito via userService)
    const userRole = userId === '1' ? 'admin' : 
                    userId === diligence.clientId ? 'client' : 
                    userId === diligence.correspondentId ? 'correspondent' : null;

    if (!userRole) {
      throw new Error('Usuário não tem permissão para esta operação');
    }

    // Verificar permissões
    const allowedStatuses = permissionMap.diligence[userRole as keyof typeof permissionMap.diligence];
    if (!allowedStatuses.includes(diligence.status)) {
      throw new Error(`Usuários com perfil ${userRole} não podem reverter diligências com status ${diligence.status}`);
    }

    // Determinar o novo status
    let newStatus: string;
    
    if (targetStatus) {
      // Se um status alvo foi especificado, verificar se é uma transição válida
      const validTransitions = validDiligenceTransitions[diligence.status];
      if (!validTransitions || !validTransitions.includes(targetStatus)) {
        throw new Error(`Não é possível reverter de ${diligence.status} para ${targetStatus}`);
      }
      newStatus = targetStatus;
    } else {
      // Se nenhum status alvo foi especificado, usar o histórico
      if (!diligence.statusHistory || diligence.statusHistory.length <= 1) {
        throw new Error('Não há status anterior para reverter');
      }
      
      // Obter o status anterior do histórico
      const previousStatus = diligence.statusHistory[diligence.statusHistory.length - 2];
      newStatus = previousStatus;
    }

    // Registrar a reversão
    const reversion: StatusReversion = {
      id: Date.now().toString(),
      diligenceId,
      type: 'diligence',
      previousStatus: diligence.status,
      newStatus,
      userId,
      reason,
      timestamp: new Date().toISOString()
    };

    this.reversions.push(reversion);
    this.saveData();

    // Executar a reversão
    const updatedDiligence = await diligenceService.revertDiligenceStatus(diligenceId);

    // Se estamos revertendo de 'completed', verificar se precisamos reverter pagamentos
    if (diligence.status === 'completed') {
      try {
        const financialData = await financialService.getFinancialDataByDiligence(diligenceId);
        if (financialData && financialData.clientPaymentStatus === 'pending') {
          // Apenas reverter se o pagamento ainda não foi processado
          await financialService.updatePaymentStatus(diligenceId, 'client', 'pending');
        }
      } catch (error) {
        console.error('Erro ao reverter dados financeiros:', error);
        // Não falhar a operação principal se a reversão financeira falhar
      }
    }

    // Notificar usuários relevantes
    this.notifyStatusChange(diligence, updatedDiligence);

    return {
      success: true,
      previousStatus: diligence.status,
      newStatus,
      timestamp: reversion.timestamp,
      message: `Status revertido com sucesso de ${diligence.status} para ${newStatus}`,
      entity: updatedDiligence
    };
  }

  /**
   * Reverte o status de um pagamento
   * @param diligenceId ID da diligência associada ao pagamento
   * @param targetStatus Status desejado (se null, reverte para o status anterior)
   * @param userId ID do usuário realizando a operação
   * @param reason Motivo da reversão
   * @param paymentType Tipo de pagamento (client ou correspondent)
   * @returns Resultado da operação
   */
  private async revertPaymentStatus(
    diligenceId: string,
    targetStatus: string | null,
    userId: string,
    reason: string,
    paymentType: 'client' | 'correspondent'
  ): Promise<StatusReversionResult> {
    // Buscar dados financeiros
    const financialData = await financialService.getFinancialDataByDiligence(diligenceId);
    if (!financialData) {
      throw new Error('Dados financeiros não encontrados');
    }

    // Apenas administradores podem reverter pagamentos
    if (userId !== '1') { // Assumindo que '1' é o ID do admin
      throw new Error('Apenas administradores podem reverter status de pagamentos');
    }

    // Obter o status atual do pagamento específico
    const currentStatus = paymentType === 'client' ? financialData.clientPaymentStatus : financialData.correspondentPaymentStatus;

    // Verificar se o status atual pode ser revertido
    if (currentStatus === 'pending') {
      throw new Error(`O pagamento ${paymentType === 'client' ? 'do cliente' : 'do correspondente'} já está pendente e não pode ser revertido`);
    }

    // Determinar o novo status
    let newStatus: string;
    
    if (targetStatus) {
      // Se um status alvo foi especificado, verificar se é uma transição válida
      const validTransitions = validPaymentTransitions[currentStatus];
      if (!validTransitions || !validTransitions.includes(targetStatus)) {
        throw new Error(`Não é possível reverter de ${currentStatus} para ${targetStatus}`);
      }
      newStatus = targetStatus;
    } else {
      // Se nenhum status alvo foi especificado, usar uma lógica padrão
      if (currentStatus === 'paid') {
        newStatus = 'pending_verification';
      } else if (currentStatus === 'pending_verification') {
        newStatus = 'pending';
      } else {
        throw new Error(`Não é possível reverter o status ${currentStatus}`);
      }
    }

    // Registrar a reversão
    const reversion: StatusReversion = {
      id: Date.now().toString(),
      diligenceId,
      type: 'payment',
      paymentType,
      previousStatus: currentStatus,
      newStatus,
      userId,
      reason,
      timestamp: new Date().toISOString()
    };

    this.reversions.push(reversion);
    this.saveData();

    // Executar a reversão
    await financialService.updatePaymentStatus(diligenceId, paymentType, newStatus as any);
    
    // Buscar dados atualizados
    const updatedFinancialData = await financialService.getFinancialDataByDiligence(diligenceId);

    // Notificar usuários relevantes
    this.notifyPaymentStatusChange(diligenceId, paymentType, newStatus);

    return {
      success: true,
      previousStatus: currentStatus,
      newStatus,
      timestamp: reversion.timestamp,
      message: `Status de pagamento ${paymentType === 'client' ? 'do cliente' : 'do correspondente'} revertido com sucesso de ${currentStatus} para ${newStatus}`,
      entity: updatedFinancialData
    };
  }

  /**
   * Notifica usuários sobre mudança de status de diligência
   */
  private async notifyStatusChange(oldDiligence: Diligence, newDiligence: Diligence) {
    // Notificar cliente
    if (oldDiligence.clientId) {
      await notificationService.createNotification({
        userId: oldDiligence.clientId,
        type: 'diligence_assigned',
        title: 'Status de Diligência Revertido',
        message: `A diligência "${oldDiligence.title}" teve seu status revertido de ${oldDiligence.status} para ${newDiligence.status}.`,
        data: { diligenceId: oldDiligence.id }
      });
    }

    // Notificar correspondente
    if (oldDiligence.correspondentId) {
      await notificationService.createNotification({
        userId: oldDiligence.correspondentId,
        type: 'diligence_assigned',
        title: 'Status de Diligência Revertido',
        message: `A diligência "${oldDiligence.title}" teve seu status revertido de ${oldDiligence.status} para ${newDiligence.status}.`,
        data: { diligenceId: oldDiligence.id }
      });
    }
  }

  /**
   * Notifica usuários sobre mudança de status de pagamento
   */
  private async notifyPaymentStatusChange(diligenceId: string, paymentType: 'client' | 'correspondent', newStatus: string) {
    const diligence = await diligenceService.getDiligenceById(diligenceId);
    if (!diligence) return;

    const statusLabel = newStatus === 'paid' ? 'pago' : 
                        newStatus === 'pending_verification' ? 'aguardando verificação' : 'pendente';

    if (paymentType === 'client' && diligence.clientId) {
      await notificationService.createNotification({
        userId: diligence.clientId,
        type: 'payment_received',
        title: 'Status de Pagamento Alterado',
        message: `O pagamento da diligência "${diligence.title}" foi alterado para "${statusLabel}".`,
        data: { diligenceId }
      });
    } else if (paymentType === 'correspondent' && diligence.correspondentId) {
      await notificationService.createNotification({
        userId: diligence.correspondentId,
        type: 'payment_received',
        title: 'Status de Pagamento Alterado',
        message: `O pagamento da diligência "${diligence.title}" foi alterado para "${statusLabel}".`,
        data: { diligenceId }
      });
    }
  }

  /**
   * Obtém o histórico de reversões
   * @param entityId ID da entidade (diligência ou pagamento)
   * @param type Tipo de entidade
   * @returns Lista de reversões
   */
  async getReversionHistory(entityId: string, type: 'diligence' | 'payment'): Promise<StatusReversion[]> {
    return this.reversions.filter(rev => 
      rev.diligenceId === entityId && rev.type === type
    ).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Verifica se uma reversão é possível
   * @param entityId ID da entidade
   * @param type Tipo de entidade
   * @param userRole Perfil do usuário
   * @param userId ID do usuário
   * @param paymentType Tipo de pagamento (obrigatório para pagamentos)
   * @returns Objeto indicando se a reversão é possível e mensagem
   */
  async canRevertStatus(
    entityId: string, 
    type: 'diligence' | 'payment',
    userRole: 'admin' | 'client' | 'correspondent',
    userId: string,
    paymentType?: 'client' | 'correspondent'
  ): Promise<{possible: boolean, message: string}> {
    try {
      if (type === 'diligence') {
        const diligence = await diligenceService.getDiligenceById(entityId);
        if (!diligence) {
          return { possible: false, message: 'Diligência não encontrada' };
        }

        // Verificar se o usuário tem relação com a diligência
        if (userRole === 'client' && diligence.clientId !== userId) {
          return { possible: false, message: 'Você não tem permissão para reverter esta diligência' };
        }
        
        if (userRole === 'correspondent' && diligence.correspondentId !== userId) {
          return { possible: false, message: 'Você não tem permissão para reverter esta diligência' };
        }

        // Verificar permissões de status
        const allowedStatuses = permissionMap.diligence[userRole];
        if (!allowedStatuses.includes(diligence.status)) {
          return { 
            possible: false, 
            message: `Usuários com perfil ${userRole} não podem reverter diligências com status ${diligence.status}` 
          };
        }

        // Verificar se há histórico para reverter
        if (!diligence.statusHistory || diligence.statusHistory.length <= 1) {
          return { possible: false, message: 'Não há status anterior para reverter' };
        }

        return { possible: true, message: 'Reversão possível' };
      } else {
        // Apenas administradores podem reverter pagamentos
        if (userRole !== 'admin') {
          return { possible: false, message: 'Apenas administradores podem reverter status de pagamentos' };
        }

        if (!paymentType) {
          return { possible: false, message: 'Tipo de pagamento é obrigatório' };
        }

        const financialData = await financialService.getFinancialDataByDiligence(entityId);
        if (!financialData) {
          return { possible: false, message: 'Dados financeiros não encontrados' };
        }

        // Verificar o status específico do tipo de pagamento
        const currentStatus = paymentType === 'client' ? financialData.clientPaymentStatus : financialData.correspondentPaymentStatus;

        // Não permitir reversão se já está pendente
        if (currentStatus === 'pending') {
          return { 
            possible: false, 
            message: `O pagamento ${paymentType === 'client' ? 'do cliente' : 'do correspondente'} já está pendente e não pode ser revertido` 
          };
        }

        // Verificar se o status atual permite reversão
        const validTransitions = validPaymentTransitions[currentStatus];
        if (!validTransitions || validTransitions.length === 0) {
          return { 
            possible: false, 
            message: `O status ${currentStatus} não pode ser revertido` 
          };
        }

        return { possible: true, message: 'Reversão possível' };
      }
    } catch (error) {
      console.error('Erro ao verificar possibilidade de reversão:', error);
      return { 
        possible: false, 
        message: error instanceof Error ? error.message : 'Erro ao verificar possibilidade de reversão' 
      };
    }
  }

  /**
   * Obtém o histórico completo de reversões
   * @returns Lista de todas as reversões
   */
  async getAllReversions(): Promise<StatusReversion[]> {
    return [...this.reversions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Formata o histórico de reversões para exibição
   * @param reversions Lista de reversões
   * @returns Lista formatada para exibição
   */
  formatReversionHistory(reversions: StatusReversion[]): any[] {
    return reversions.map(rev => ({
      id: rev.id,
      date: format(new Date(rev.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      type: rev.type === 'diligence' ? 'Diligência' : `Pagamento ${rev.paymentType === 'client' ? 'Cliente' : 'Correspondente'}`,
      from: this.formatStatus(rev.previousStatus, rev.type),
      to: this.formatStatus(rev.newStatus, rev.type),
      reason: rev.reason,
      userId: rev.userId
    }));
  }

  /**
   * Formata um status para exibição
   * @param status Status a ser formatado
   * @param type Tipo de entidade
   * @returns Status formatado
   */
  private formatStatus(status: string, type: 'diligence' | 'payment'): string {
    if (type === 'diligence') {
      const statusMap: Record<string, string> = {
        'pending': 'Pendente',
        'assigned': 'Atribuída',
        'in_progress': 'Em Andamento',
        'completed': 'Concluída',
        'cancelled': 'Cancelada'
      };
      return statusMap[status] || status;
    } else {
      const statusMap: Record<string, string> = {
        'pending': 'Pendente',
        'pending_verification': 'Aguardando Verificação',
        'paid': 'Pago'
      };
      return statusMap[status] || status;
    }
  }
}

export default StatusManagementService.getInstance();