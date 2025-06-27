import { Diligence } from "../entities/Diligence";
import { User } from "../entities/User";
import { DiligenceRepository } from "../repositories/DiligenceRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../middlewares/errorHandler";
import notificationService from "./NotificationService";
import financialService from "./FinancialService";
import statusManagementService from "./StatusManagementService";

// Interface para os dados do formulário, definida aqui para desacoplar do frontend.
interface DiligenceFormData {
  title: string;
  description: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  value: number;
  correspondentValue?: number;
  deadline: string | Date; // Permite string ou Date
  city: string;
  state: string;
  attachments?: any[];
  clientId: string;
  correspondentId?: string;
}

class DiligenceService {
  private diligenceRepository: DiligenceRepository;
  private userRepository: UserRepository;

  constructor() {
    this.diligenceRepository = new DiligenceRepository();
    this.userRepository = new UserRepository();
  }

  async createDiligence(data: DiligenceFormData, creatorId: string): Promise<Diligence> {
    const client = await this.userRepository.findById(data.clientId);
    if (!client) {
      throw new AppError('Cliente não encontrado', 404);
    }

    if (data.correspondentId) {
        const correspondent = await this.userRepository.findById(data.correspondentId);
        if(!correspondent) {
            throw new AppError('Correspondente não encontrado', 404);
        }
    }

    const correspondentValue = data.correspondentValue ?? data.value * 0.7;

    // SOLUÇÃO: Converter a `deadline` para um objeto Date antes de criar
    const diligenceToCreate = {
        ...data,
        deadline: new Date(data.deadline), // Garante que seja um objeto Date
        status: data.correspondentId ? 'assigned' : 'pending',
    };

    const newDiligence = await this.diligenceRepository.create(diligenceToCreate);
    
    await financialService.createFinancialDataForDiligence(newDiligence, correspondentValue);

    if (newDiligence.correspondentId) {
      await notificationService.createNotification({
          userId: newDiligence.correspondentId,
          type: 'diligence_assigned',
          title: 'Nova diligência atribuída',
          message: `Você foi atribuído à diligência: "${newDiligence.title}".`,
          data: { diligenceId: newDiligence.id }
      });
    }

    return newDiligence;
  }
  
  async assignDiligence(diligenceId: string, correspondentId: string): Promise<Diligence> {
    const diligence = await this.diligenceRepository.findById(diligenceId);
    if (!diligence) {
        throw new AppError("Diligência não encontrada.", 404);
    }

    const correspondent = await this.userRepository.findById(correspondentId);
    if (!correspondent || correspondent.role !== 'correspondent') {
        throw new AppError("Correspondente inválido.", 404);
    }
    
    await statusManagementService.addStatusHistory({
        diligenceId: diligence.id,
        entityType: 'diligence',
        previousStatus: diligence.status,
        newStatus: 'assigned',
        reason: 'Atribuído pelo administrador',
        userId: 'admin-system'
    });

    return this.diligenceRepository.update(diligenceId, {
        correspondentId: correspondentId,
        status: 'assigned',
    });
  }
  
  async acceptDiligence(diligenceId: string, correspondentId: string): Promise<Diligence> {
    const diligence = await this.diligenceRepository.findById(diligenceId);
    if (!diligence || diligence.correspondentId !== correspondentId) {
        throw new AppError("Diligência não encontrada ou não atribuída a este correspondente.", 404);
    }

    if (diligence.status !== 'assigned') {
        throw new AppError("Esta diligência não pode ser aceite.", 400);
    }
    
    await statusManagementService.addStatusHistory({
        diligenceId: diligence.id,
        entityType: 'diligence',
        previousStatus: diligence.status,
        newStatus: 'in_progress',
        reason: 'Aceite pelo correspondente',
        userId: correspondentId
    });

    return this.updateDiligenceStatus(diligenceId, "in_progress", correspondentId);
  }

  async updateDiligenceStatus(diligenceId: string, status: string, userId: string): Promise<Diligence> {
    const diligence = await this.diligenceRepository.findById(diligenceId);
    if (!diligence) {
        throw new AppError("Diligência não encontrada", 404);
    }
    
    await statusManagementService.addStatusHistory({
        diligenceId: diligence.id,
        entityType: 'diligence',
        previousStatus: diligence.status,
        newStatus: status,
        reason: `Estado alterado por utilizador ${userId}`,
        userId: userId
    });

    return this.diligenceRepository.update(diligenceId, { status });
  }
}

export default new DiligenceService();