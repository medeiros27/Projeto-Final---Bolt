import { Request, Response } from "express";
// SOLUÇÃO: Os serviços devem ser importados como padrão
import statusManagementService from "../services/StatusManagementService";
import { StatusHistoryRepository } from "../repositories/StatusHistoryRepository";
import { AppError } from "../middlewares/errorHandler";
// SOLUÇÃO: Importar a interface para requisições autenticadas
import { IAuthRequest } from "../middlewares/authMiddleware";

export class StatusManagementController {
  private statusHistoryRepository: StatusHistoryRepository;

  constructor() {
    this.statusHistoryRepository = new StatusHistoryRepository();
  }

  canRevertStatus = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { 
      entityId, 
      entityType, 
      paymentType 
    } = req.query as { 
      entityId: string; 
      entityType: 'diligence' | 'payment'; 
      paymentType?: 'client' | 'correspondent';
    };

    const userId = authRequest.user?.id;
    const userRole = authRequest.user?.role;

    if (!userId || !userRole) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!entityId || !entityType) {
      throw new AppError("Parâmetros obrigatórios não fornecidos", 400);
    }

    const result = await statusManagementService.canRevertStatus(
      entityId,
      entityType,
      userRole,
      userId,
      paymentType
    );

    return res.json(result);
  };

  revertStatus = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { 
      entityId, 
      entityType, 
      targetStatus, 
      reason, 
      paymentType 
    } = req.body;

    const userId = authRequest.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!entityId || !entityType || !reason) {
      throw new AppError("Parâmetros obrigatórios não fornecidos", 400);
    }

    if (entityType === 'payment' && !paymentType) {
      throw new AppError("Tipo de pagamento é obrigatório para reversão de pagamentos", 400);
    }

    const result = await statusManagementService.revertStatus(
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
