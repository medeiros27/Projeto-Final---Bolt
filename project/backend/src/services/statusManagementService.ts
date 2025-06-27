import { StatusHistoryRepository } from "../repositories/StatusHistoryRepository";
import { DiligenceRepository } from "../repositories/DiligenceRepository";
import { FinancialRepository } from "../repositories/FinancialRepository";
import { AppError } from "../middlewares/errorHandler";
import notificationService from "./NotificationService";

interface StatusHistoryData {
    diligenceId?: string;
    paymentId?: string;
    entityType: 'diligence' | 'payment';
    paymentType?: 'client' | 'correspondent';
    previousStatus: string;
    newStatus: string;
    userId: string;
    reason: string;
}

class StatusManagementService {
    private statusHistoryRepository: StatusHistoryRepository;
    private diligenceRepository: DiligenceRepository;
    private financialRepository: FinancialRepository;

    constructor() {
        this.statusHistoryRepository = new StatusHistoryRepository();
        this.diligenceRepository = new DiligenceRepository();
        this.financialRepository = new FinancialRepository();
    }
    
    // SOLUÇÃO: Adicionar o método que estava em falta.
    async addStatusHistory(data: StatusHistoryData): Promise<void> {
        await this.statusHistoryRepository.create(data);
    }

    async revertStatus(
        entityId: string,
        entityType: 'diligence' | 'payment',
        targetStatus: string | null,
        userId: string,
        reason: string,
        paymentType?: 'client' | 'correspondent'
    ) {
        // A lógica de reversão existente...
        // Esta função precisaria de ser implementada com base nas regras de negócio.
        // Por agora, vamos garantir que ela exista.
        if (entityType === 'diligence') {
            const diligence = await this.diligenceRepository.findById(entityId);
            if (!diligence) throw new AppError('Diligência não encontrada', 404);
            
            await this.addStatusHistory({
                diligenceId: entityId,
                entityType,
                previousStatus: diligence.status,
                newStatus: targetStatus || "reverted",
                userId,
                reason
            });

            await this.diligenceRepository.update(entityId, { status: targetStatus || "reverted" });

        } else if (entityType === 'payment' && paymentType) {
            // Lógica para reverter o pagamento
        }
        
        return { success: true, message: "Estado revertido com sucesso (lógica a ser implementada)." };
    }

    async canRevertStatus(
        entityId: string, 
        type: 'diligence' | 'payment',
        userRole: 'admin' | 'client' | 'correspondent',
        userId: string,
        paymentType?: 'client' | 'correspondent'
      ): Promise<{possible: boolean, message: string}> {
        // Lógica para verificar se a reversão é possível
        return { possible: true, message: 'Verificação de reversão a ser implementada.' };
      }
}

export default new StatusManagementService();
