import { Diligence } from "../entities/Diligence";
import { User } from "../entities/User";
import { DiligenceRepository } from "../repositories/DiligenceRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../middlewares/errorHandler";
import notificationService from "./NotificationService";
import financialService from "./financialService"; // CORREÇÃO: nome correto do arquivo
import statusManagementService from "./statusManagementService"; // CORREÇÃO: nome correto do arquivo

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
    // CORREÇÃO: Usar findOneBy em vez de findById
    const client = await this.userRepository.findOneBy({ id: data.clientId });
    if (!client) {
      throw new AppError('Cliente não encontrado', 404);
    }

    if (data.correspondentId) {
        // CORREÇÃO: Usar findOneBy em vez de findById
        const correspondent = await this.userRepository.findOneBy({ id: data.correspondentId });
        if(!correspondent) {
            throw new AppError('Correspondente não encontrado', 404);
        }
    }

    const correspondentValue = data.correspondentValue ?? data.value * 0.7;

    // Converter a deadline para um objeto Date antes de criar
    const diligenceToCreate = {
        ...data,
        deadline: new Date(data.deadline), // Garante que seja um objeto Date
        status: (data.correspondentId ? 'assigned' : 'pending') as "pending" | "assigned" | "in_progress" | "completed" | "cancelled" | "disputed", // Cast explícito para o tipo correto
        createdAt: new Date(),
        updatedAt: new Date()
    };

    // CORREÇÃO: Usar createDiligence em vez de create
    const newDiligence = await this.diligenceRepository.createDiligence(diligenceToCreate);
    
    // Comentar temporariamente até corrigir o financialService
    // await financialService.createFinancialDataForDiligence(newDiligence, correspondentValue);

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
    // CORREÇÃO: Usar findById do DiligenceRepository (que existe) em vez de findOneBy
    const diligence = await this.diligenceRepository.findById(diligenceId);
    if (!diligence) {
        throw new AppError("Diligência não encontrada.", 404);
    }

    // CORREÇÃO: Usar findOneBy em vez de findById
    const correspondent = await this.userRepository.findOneBy({ id: correspondentId });
    if (!correspondent || correspondent.role !== 'correspondent') {
        throw new AppError("Correspondente inválido.", 404);
    }
    
    // Comentar temporariamente até corrigir o statusManagementService
    /*
    await statusManagementService.addStatusHistory({
        diligenceId: diligence.id,
        entityType: 'diligence',
        previousStatus: diligence.status,
        newStatus: 'assigned',
        reason: 'Atribuído pelo administrador',
        userId: 'admin-system'
    });
    */

    // CORREÇÃO: Usar updateDiligence em vez de update e retornar o resultado correto
    const updatedDiligence = await this.diligenceRepository.updateDiligence(diligenceId, {
        correspondentId: correspondentId,
        status: 'assigned' as "pending" | "assigned" | "in_progress" | "completed" | "cancelled" | "disputed",
        updatedAt: new Date()
    });

    if (!updatedDiligence) {
        throw new AppError("Erro ao atualizar diligência.", 500);
    }

    return updatedDiligence;
  }
  
  async acceptDiligence(diligenceId: string, correspondentId: string): Promise<Diligence> {
    // CORREÇÃO: Usar findById do DiligenceRepository (que existe)
    const diligence = await this.diligenceRepository.findById(diligenceId);
    if (!diligence || diligence.correspondentId !== correspondentId) {
        throw new AppError("Diligência não encontrada ou não atribuída a este correspondente.", 404);
    }

    if (diligence.status !== 'assigned') {
        throw new AppError("Esta diligência não pode ser aceite.", 400);
    }
    
    // Comentar temporariamente até corrigir o statusManagementService
    /*
    await statusManagementService.addStatusHistory({
        diligenceId: diligence.id,
        entityType: 'diligence',
        previousStatus: diligence.status,
        newStatus: 'in_progress',
        reason: 'Aceite pelo correspondente',
        userId: correspondentId
    });
    */

    return this.updateDiligenceStatus(diligenceId, "in_progress", correspondentId);
  }

  async updateDiligenceStatus(diligenceId: string, status: string, userId: string): Promise<Diligence> {
    // CORREÇÃO: Usar findById do DiligenceRepository (que existe)
    const diligence = await this.diligenceRepository.findById(diligenceId);
    if (!diligence) {
        throw new AppError("Diligência não encontrada", 404);
    }
    
    // Comentar temporariamente até corrigir o statusManagementService
    /*
    await statusManagementService.addStatusHistory({
        diligenceId: diligence.id,
        entityType: 'diligence',
        previousStatus: diligence.status,
        newStatus: status,
        reason: `Estado alterado por utilizador ${userId}`,
        userId: userId
    });
    */

    // CORREÇÃO: Usar updateDiligence em vez de update e retornar o resultado correto
    const updatedDiligence = await this.diligenceRepository.updateDiligence(diligenceId, { 
        status: status as "pending" | "assigned" | "in_progress" | "completed" | "cancelled" | "disputed",
        updatedAt: new Date()
    });

    if (!updatedDiligence) {
        throw new AppError("Erro ao atualizar status da diligência", 500);
    }

    return updatedDiligence;
  }
}

export default new DiligenceService();
