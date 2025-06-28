import { Request, Response } from "express";
import { DiligenceRepository } from "../repositories/DiligenceRepository";
import { UserRepository } from "../repositories/UserRepository";
import { StatusHistoryRepository } from "../repositories/StatusHistoryRepository";
import { AppError } from "../middlewares/errorHandler";
import { IAuthRequest } from "../middlewares/authMiddleware";

// Importar as instâncias de serviço
import diligenceService from "../services/diligenceService"; // CORREÇÃO: nome correto do arquivo
import statusManagementService from "../services/statusManagementService"; // CORREÇÃO: nome correto do arquivo

const ALLOWED_DILIGENCE_STATUSES = ["pending", "assigned", "in_progress", "completed", "cancelled", "disputed"];

export class DiligenceController {
  private diligenceRepository: DiligenceRepository;
  private userRepository: UserRepository;
  private statusHistoryRepository: StatusHistoryRepository;

  constructor() {
    this.diligenceRepository = new DiligenceRepository();
    this.userRepository = new UserRepository();
    this.statusHistoryRepository = new StatusHistoryRepository();
  }

  createDiligence = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const userId = authRequest.user?.id;
    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const diligence = await diligenceService.createDiligence(req.body, userId);
    return res.status(201).json(diligence);
  };

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
    
    return res.json(diligence);
  };

  getDiligencesByClient = async (req: Request, res: Response): Promise<Response> => {
    const { clientId } = req.params;
    const diligences = await this.diligenceRepository.findByClient(clientId);
    return res.json(diligences);
  };

  getDiligencesByCorrespondent = async (req: Request, res: Response): Promise<Response> => {
    const { correspondentId } = req.params;
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
    
    if (!correspondentId) {
      throw new AppError("ID do correspondente é obrigatório", 400);
    }

    const diligence = await diligenceService.assignDiligence(id, correspondentId);
    return res.json(diligence);
  };

  acceptDiligence = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { id } = req.params;
    const correspondentId = authRequest.user?.id;
    if (!correspondentId) {
      throw new AppError("Usuário não autenticado", 401);
    }
    const diligence = await diligenceService.acceptDiligence(id, correspondentId);
    return res.json(diligence);
  };

  startDiligence = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { id } = req.params;
    const correspondentId = authRequest.user?.id;
    if (!correspondentId) {
      throw new AppError("Usuário não autenticado", 401);
    }
    const diligence = await diligenceService.updateDiligenceStatus(
      id,
      "in_progress",
      correspondentId
    );
    return res.json(diligence);
  };

  completeDiligence = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { id } = req.params;
    const correspondentId = authRequest.user?.id;
    if (!correspondentId) {
      throw new AppError("Usuário não autenticado", 401);
    }
    const diligence = await diligenceService.updateDiligenceStatus(
      id,
      "completed",
      correspondentId
    );
    return res.json(diligence);
  };

  updateDiligenceStatus = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { id } = req.params;
    const { status } = req.body;
    const userId = authRequest.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }
    if (!status) {
      throw new AppError("Status é obrigatório", 400);
    }
    if (!ALLOWED_DILIGENCE_STATUSES.includes(status)) {
        throw new AppError(`Status inválido: ${status}`, 400);
    }

    const diligence = await diligenceService.updateDiligenceStatus(
      id,
      status,
      userId
    );
    return res.json(diligence);
  };

  revertDiligenceStatus = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { id } = req.params;
    const { targetStatus, reason } = req.body;
    const userId = authRequest.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }
    if (!reason) {
      throw new AppError("Motivo da reversão é obrigatório", 400);
    }

    await statusManagementService.revertStatus(
      id,
      "diligence",
      targetStatus,
      userId,
      reason
    );

    const updatedDiligence = await this.diligenceRepository.findById(id);
    return res.json(updatedDiligence);
  };

  getDiligenceStatusHistory = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const statusHistory = await this.statusHistoryRepository.findByDiligenceId(id);
    return res.json(statusHistory);
  };
}

