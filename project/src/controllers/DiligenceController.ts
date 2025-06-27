import { Request, Response } from "express";
import { DiligenceRepository } from "../repositories/DiligenceRepository";
import { UserRepository } from "../repositories/UserRepository";
import { StatusHistoryRepository } from "../repositories/StatusHistoryRepository";
import { DiligenceService } from "../services/DiligenceService";
import { StatusManagementService } from "../services/StatusManagementService";
import { AppError } from "../middlewares/errorHandler";

export class DiligenceController {
  private diligenceRepository: DiligenceRepository;
  private userRepository: UserRepository;
  private statusHistoryRepository: StatusHistoryRepository;
  private diligenceService: DiligenceService;
  private statusManagementService: StatusManagementService;

  constructor() {
    this.diligenceRepository = new DiligenceRepository();
    this.userRepository = new UserRepository();
    this.statusHistoryRepository = new StatusHistoryRepository();
    this.diligenceService = new DiligenceService();
    this.statusManagementService = new StatusManagementService();
  }

  getAllDiligences = async (req: Request, res: Response): Promise<Response> => {
    const diligences = await this.diligenceRepository.findAll();
    return res.json(diligences);
  };

  getDiligenceById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const diligence = await this.diligenceRepository.findById(id);

    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }

    // Verificar permissão
    if (
      req.user?.role !== "admin" &&
      diligence.clientId !== req.user?.id &&
      diligence.correspondentId !== req.user?.id
    ) {
      throw new AppError("Acesso negado", 403);
    }

    return res.json(diligence);
  };

  createDiligence = async (req: Request, res: Response): Promise<Response> => {
    const {
      title,
      description,
      type,
      priority,
      value,
      deadline,
      city,
      state,
      clientId,
      correspondentId,
    } = req.body;

    if (!title || !description || !type || !value || !deadline || !city || !state) {
      throw new AppError("Dados obrigatórios não fornecidos", 400);
    }

    // Determinar o ID do cliente
    let actualClientId = clientId;
    
    // Se não for admin, o criador é o cliente
    if (req.user?.role !== "admin") {
      actualClientId = req.user?.id;
    } else if (!clientId) {
      throw new AppError("ID do cliente é obrigatório para administradores", 400);
    }

    // Verificar se o cliente existe
    const client = await this.userRepository.findById(actualClientId);
    if (!client) {
      throw new AppError("Cliente não encontrado", 404);
    }

    // Verificar correspondente se fornecido
    let correspondent = null;
    if (correspondentId) {
      correspondent = await this.userRepository.findById(correspondentId);
      if (!correspondent) {
        throw new AppError("Correspondente não encontrado", 404);
      }
    }

    const diligence = await this.diligenceService.createDiligence({
      title,
      description,
      type,
      priority,
      value,
      deadline: new Date(deadline),
      city,
      state,
      clientId: actualClientId,
      correspondentId,
    });

    return res.status(201).json(diligence);
  };

  getClientDiligences = async (req: Request, res: Response): Promise<Response> => {
    const clientId = req.user?.id;

    if (!clientId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const diligences = await this.diligenceRepository.findByClient(clientId);
    return res.json(diligences);
  };

  getCorrespondentDiligences = async (req: Request, res: Response): Promise<Response> => {
    const correspondentId = req.user?.id;

    if (!correspondentId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const diligences = await this.diligenceRepository.findByCorrespondent(correspondentId);
    return res.json(diligences);
  };

  getAvailableDiligences = async (req: Request, res: Response): Promise<Response> => {
    const { state, city } = req.query;
    
    const diligences = await this.diligenceRepository.findAvailableDiligences(
      state as string,
      city as string
    );
    
    return res.json(diligences);
  };

  assignDiligence = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { correspondentId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!correspondentId) {
      throw new AppError("ID do correspondente é obrigatório", 400);
    }

    const diligence = await this.diligenceService.assignDiligence(id, correspondentId);
    return res.json(diligence);
  };

  acceptDiligence = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const correspondentId = req.user?.id;

    if (!correspondentId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const diligence = await this.diligenceService.acceptDiligence(id, correspondentId);
    return res.json(diligence);
  };

  startDiligence = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const correspondentId = req.user?.id;

    if (!correspondentId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const diligence = await this.diligenceService.updateDiligenceStatus(
      id,
      "in_progress",
      correspondentId,
      "Diligência iniciada pelo correspondente"
    );
    
    return res.json(diligence);
  };

  completeDiligence = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const correspondentId = req.user?.id;

    if (!correspondentId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    // TODO: Implementar upload de arquivos de conclusão
    const diligence = await this.diligenceService.updateDiligenceStatus(
      id,
      "completed",
      correspondentId,
      "Diligência concluída pelo correspondente"
    );
    
    return res.json(diligence);
  };

  updateDiligenceStatus = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!status) {
      throw new AppError("Status é obrigatório", 400);
    }

    const diligence = await this.diligenceService.updateDiligenceStatus(
      id,
      status,
      userId,
      reason || `Status atualizado para ${status}`
    );
    
    return res.json(diligence);
  };

  revertDiligenceStatus = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { targetStatus, reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!reason) {
      throw new AppError("Motivo da reversão é obrigatório", 400);
    }

    const result = await this.statusManagementService.revertStatus(
      id,
      "diligence",
      targetStatus,
      userId,
      reason
    );
    
    return res.json(result);
  };

  getDiligenceStatusHistory = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    
    const statusHistory = await this.statusHistoryRepository.findByDiligenceId(id);
    
    return res.json(statusHistory);
  };
}