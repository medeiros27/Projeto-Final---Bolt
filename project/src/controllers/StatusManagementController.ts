import { Request, Response } from "express";
import { StatusManagementService } from "../services/StatusManagementService";
import { StatusHistoryRepository } from "../repositories/StatusHistoryRepository";
import { AppError } from "../middlewares/errorHandler";

export class StatusManagementController {
  private statusManagementService: StatusManagementService;
  private statusHistoryRepository: StatusHistoryRepository;

  constructor() {
    this.statusManagementService = new StatusManagementService();
    this.statusHistoryRepository = new StatusHistoryRepository();
  }

  canRevertStatus = async (req: Request, res: Response): Promise<Response> => {
    const { 
      entityId, 
      entityType, 
      paymentType 
    } = req.query as { 
      entityId: string; 
      entityType: 'diligence' | 'payment'; 
      paymentType?: 'client' | 'correspondent';
    };

    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!entityId || !entityType) {
      throw new AppError("Parâmetros obrigatórios não fornecidos", 400);
    }

    const result = await this.statusManagementService.canRevertStatus(
      entityId,
      entityType,
      userRole as any,
      userId,
      paymentType
    );

    return res.json(result);
  };

  revertStatus = async (req: Request, res: Response): Promise<Response> => {
    const { 
      entityId, 
      entityType, 
      targetStatus, 
      reason, 
      paymentType 
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!entityId || !entityType || !reason) {
      throw new AppError("Parâmetros obrigatórios não fornecidos", 400);
    }

    if (entityType === 'payment' && !paymentType) {
      throw new AppError("Tipo de pagamento é obrigatório para reversão de pagamentos", 400);
    }

    const result = await this.statusManagementService.revertStatus(
      entityId,
      entityType,
      targetStatus,
      userId,
      reason,
      paymentType
    );

    return res.json(result);
  };

  getDiligenceStatusHistory = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    
    const statusHistory = await this.statusHistoryRepository.findByDiligenceId(id);
    
    // Filtrar apenas histórico de diligências
    const diligenceHistory = statusHistory.filter(
      (history) => history.entityType === "diligence"
    );
    
    return res.json(diligenceHistory);
  };

  getPaymentStatusHistory = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    
    const statusHistory = await this.statusHistoryRepository.findByDiligenceId(id);
    
    // Filtrar apenas histórico de pagamentos
    const paymentHistory = statusHistory.filter(
      (history) => history.entityType === "payment"
    );
    
    return res.json(paymentHistory);
  };

  getAllStatusHistory = async (req: Request, res: Response): Promise<Response> => {
    const statusHistory = await this.statusHistoryRepository.findAll();
    return res.json(statusHistory);
  };
}