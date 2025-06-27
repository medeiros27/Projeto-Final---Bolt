import api from './api';
import { Diligence } from '../types';

interface RevertStatusPayload {
  entityId: string;
  type: 'diligence' | 'payment';
  reason: string;
  targetStatus?: string | null;
  paymentType?: 'client' | 'correspondent';
}

interface RevertStatusResponse {
  success: boolean;
  message: string;
  entity: Diligence; // O backend retornará a entidade atualizada
}

class StatusManagementService {
  private static instance: StatusManagementService;

  public static getInstance(): StatusManagementService {
    if (!StatusManagementService.instance) {
      StatusManagementService.instance = new StatusManagementService();
    }
    return StatusManagementService.instance;
  }

  /**
   * Envia um pedido para reverter o estado de uma entidade (diligência ou pagamento).
   * O backend validará as permissões e executará a lógica.
   */
  async revertStatus(payload: RevertStatusPayload): Promise<RevertStatusResponse> {
    return api.post('/status/revert', payload);
  }
}

export default StatusManagementService.getInstance();
