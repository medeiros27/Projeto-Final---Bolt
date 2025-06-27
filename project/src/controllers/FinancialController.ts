import { Request, Response } from "express";
import { FinancialRepository } from "../repositories/FinancialRepository";
import { DiligenceRepository } from "../repositories/DiligenceRepository";
import { StatusHistoryRepository } from "../repositories/StatusHistoryRepository";
import { FinancialService } from "../services/FinancialService";
import { StatusManagementService } from "../services/StatusManagementService";
import { AppError } from "../middlewares/errorHandler";

export class FinancialController {
  private financialRepository: FinancialRepository;
  private diligenceRepository: DiligenceRepository;
  private statusHistoryRepository: StatusHistoryRepository;
  private financialService: FinancialService;
  private statusManagementService: StatusManagementService;

  constructor() {
    this.financialRepository = new FinancialRepository();
    this.diligenceRepository = new DiligenceRepository();
    this.statusHistoryRepository = new StatusHistoryRepository();
    this.financialService = new FinancialService();
    this.statusManagementService = new StatusManagementService();
  }

  getFinancialSummary = async (req: Request, res: Response): Promise<Response> => {
    const summary = await this.financialService.getFinancialSummary();
    return res.json(summary);
  };

  getAllFinancialData = async (req: Request, res: Response): Promise<Response> => {
    const financialData = await this.financialService.getAllFinancialData();
    return res.json(financialData);
  };

  getFinancialDataByDiligence = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    // Verificar permissão
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

    const financialData = await this.financialService.getFinancialDataByDiligence(id);
    return res.json(financialData);
  };

  submitPaymentProof = async (req: Request, res: Response): Promise<Response> => {
    const { diligenceId } = req.params;
    const { pixKey, amount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!pixKey) {
      throw new AppError("Chave PIX é obrigatória", 400);
    }

    // Verificar se o usuário é o cliente da diligência
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

    // Verificar se já existe um comprovante
    const existingProof = await this.financialRepository.findPaymentProofByDiligence(diligenceId);
    if (existingProof) {
      throw new AppError("Já existe um comprovante de pagamento para esta diligência", 400);
    }

    // TODO: Implementar upload de arquivo
    // Por enquanto, vamos simular o upload
    const proofImage = "https://example.com/proof-image.jpg";

    const paymentProof = await this.financialService.submitPaymentProof(
      diligenceId,
      pixKey,
      proofImage,
      amount || diligence.value,
      userId
    );

    return res.status(201).json(paymentProof);
  };

  verifyPaymentProof = async (req: Request, res: Response): Promise<Response> => {
    const { proofId } = req.params;
    const { isApproved, rejectionReason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (isApproved === undefined) {
      throw new AppError("É necessário informar se o comprovante foi aprovado", 400);
    }

    if (!isApproved && !rejectionReason) {
      throw new AppError("Motivo da rejeição é obrigatório", 400);
    }

    const result = await this.financialService.verifyPaymentProof(
      proofId,
      isApproved,
      userId,
      rejectionReason
    );

    return res.json(result);
  };

  markClientPaymentAsPaid = async (req: Request, res: Response): Promise<Response> => {
    const { diligenceId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    await this.financialService.markClientPaymentAsPaid(diligenceId, userId);
    return res.json({ message: "Pagamento do cliente marcado como pago" });
  };

  markCorrespondentPaymentAsPaid = async (req: Request, res: Response): Promise<Response> => {
    const { diligenceId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    await this.financialService.markCorrespondentPaymentAsPaid(diligenceId, userId);
    return res.json({ message: "Pagamento ao correspondente marcado como pago" });
  };

  revertPaymentStatus = async (req: Request, res: Response): Promise<Response> => {
    const { diligenceId } = req.params;
    const { targetStatus, reason, paymentType } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!reason) {
      throw new AppError("Motivo da reversão é obrigatório", 400);
    }

    if (!paymentType || !["client", "correspondent"].includes(paymentType)) {
      throw new AppError("Tipo de pagamento inválido", 400);
    }

    const result = await this.statusManagementService.revertStatus(
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
    
    // Filtrar apenas histórico de pagamentos
    const paymentHistory = statusHistory.filter(
      (history) => history.entityType === "payment"
    );
    
    return res.json(paymentHistory);
  };

  getClientFinancialData = async (req: Request, res: Response): Promise<Response> => {
    const clientId = req.user?.id;

    if (!clientId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const financialData = await this.financialService.getClientFinancialData(clientId);
    return res.json(financialData);
  };

  getCorrespondentFinancialData = async (req: Request, res: Response): Promise<Response> => {
    const correspondentId = req.user?.id;

    if (!correspondentId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const financialData = await this.financialService.getCorrespondentFinancialData(correspondentId);
    return res.json(financialData);
  };
}