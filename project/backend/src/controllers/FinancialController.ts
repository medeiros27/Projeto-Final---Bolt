import { Request, Response } from "express";
import { FinancialRepository } from "../repositories/FinancialRepository";
import { DiligenceRepository } from "../repositories/DiligenceRepository";
import { StatusHistoryRepository } from "../repositories/StatusHistoryRepository";
// SOLUÇÃO: Os serviços devem ser importados como padrão
import financialService from "../services/FinancialService";
import statusManagementService from "../services/StatusManagementService";
import { AppError } from "../middlewares/errorHandler";
// SOLUÇÃO: Importar a interface para requisições autenticadas
import { IAuthRequest } from "../middlewares/authMiddleware";

export class FinancialController {
  private financialRepository: FinancialRepository;
  private diligenceRepository: DiligenceRepository;
  private statusHistoryRepository: StatusHistoryRepository;
  
  // SOLUÇÃO: Remover a inicialização dos serviços aqui, pois vamos usar as instâncias importadas
  constructor() {
    this.financialRepository = new FinancialRepository();
    this.diligenceRepository = new DiligenceRepository();
    this.statusHistoryRepository = new StatusHistoryRepository();
  }

  getFinancialSummary = async (req: Request, res: Response): Promise<Response> => {
    const summary = await financialService.getFinancialSummary();
    return res.json(summary);
  };

  getAllFinancialData = async (req: Request, res: Response): Promise<Response> => {
    const financialData = await financialService.getAllFinancialData();
    return res.json(financialData);
  };

  getFinancialDataByDiligence = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { id } = req.params;
    const userId = authRequest.user?.id;
    const userRole = authRequest.user?.role;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const diligence = await this.diligenceRepository.findById(id);
    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }

    if (
      userRole !== "admin" &&
      diligence.clientId !== userId &&
      diligence.correspondentId !== userId
    ) {
      throw new AppError("Acesso negado", 403);
    }

    const financialData = await financialService.getFinancialDataByDiligence(id);
    return res.json(financialData);
  };

  submitPaymentProof = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { diligenceId } = req.params;
    const { pixKey, amount } = req.body;
    const userId = authRequest.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!pixKey) {
      throw new AppError("Chave PIX é obrigatória", 400);
    }

    const diligence = await this.diligenceRepository.findById(diligenceId);
    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }

    if (diligence.clientId !== userId) {
      throw new AppError("Apenas o cliente pode enviar comprovante de pagamento", 403);
    }

    if (diligence.status !== "completed") {
      throw new AppError("Apenas diligências concluídas podem receber pagamento", 400);
    }

    const existingProof = await this.financialRepository.findPaymentProofByDiligence(diligenceId);
    if (existingProof) {
      throw new AppError("Já existe um comprovante de pagamento para esta diligência", 400);
    }
    
    // Simulação de upload de arquivo
    const proofImage = "https://example.com/proof-image.jpg";

    const paymentProof = await financialService.submitPaymentProof(
      diligenceId,
      pixKey,
      proofImage,
      amount || diligence.value,
      userId
    );

    return res.status(201).json(paymentProof);
  };

  verifyPaymentProof = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { proofId } = req.params;
    const { isApproved, rejectionReason } = req.body;
    const userId = authRequest.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (isApproved === undefined) {
      throw new AppError("É necessário informar se o comprovante foi aprovado", 400);
    }

    if (!isApproved && !rejectionReason) {
      throw new AppError("Motivo da rejeição é obrigatório", 400);
    }

    const result = await financialService.verifyPaymentProof(
      proofId,
      isApproved,
      userId,
      rejectionReason
    );

    return res.json(result);
  };

  markClientPaymentAsPaid = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { diligenceId } = req.params;
    const userId = authRequest.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    await financialService.markClientPaymentAsPaid(diligenceId, userId);
    return res.json({ message: "Pagamento do cliente marcado como pago" });
  };

  markCorrespondentPaymentAsPaid = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { diligenceId } = req.params;
    const userId = authRequest.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    await financialService.markCorrespondentPaymentAsPaid(diligenceId, userId);
    return res.json({ message: "Pagamento ao correspondente marcado como pago" });
  };

  revertPaymentStatus = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { diligenceId } = req.params;
    const { targetStatus, reason, paymentType } = req.body;
    const userId = authRequest.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!reason) {
      throw new AppError("Motivo da reversão é obrigatório", 400);
    }

    if (!paymentType || !["client", "correspondent"].includes(paymentType)) {
      throw new AppError("Tipo de pagamento inválido", 400);
    }

    const result = await statusManagementService.revertStatus(
      diligenceId,
      "payment",
      targetStatus,
      userId,
      reason,
      paymentType
    );
    
    return res.json(result);
  };

  getPaymentStatusHistory = async (req: Request, res: Response): Promise<Response> => {
    const { diligenceId } = req.params;
    
    const statusHistory = await this.statusHistoryRepository.findByDiligenceId(diligenceId);
    
    const paymentHistory = statusHistory.filter(
      (history) => history.entityType === "payment"
    );
    
    return res.json(paymentHistory);
  };

  getClientFinancialData = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const clientId = authRequest.user?.id;

    if (!clientId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const financialData = await financialService.getClientFinancialData(clientId);
    return res.json(financialData);
  };

  getCorrespondentFinancialData = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const correspondentId = authRequest.user?.id;

    if (!correspondentId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const financialData = await financialService.getCorrespondentFinancialData(correspondentId);
    return res.json(financialData);
  };
}
