import { Request, Response } from "express";
import { DiligenceRepository } from "../repositories/DiligenceRepository";
import { AttachmentRepository } from "../repositories/AttachmentRepository";
import { AppError } from "../middlewares/errorHandler";

export class AttachmentController {
  private diligenceRepository: DiligenceRepository;
  private attachmentRepository: AttachmentRepository;

  constructor() {
    this.diligenceRepository = new DiligenceRepository();
    this.attachmentRepository = new AttachmentRepository();
  }

  uploadAttachment = async (req: Request, res: Response): Promise<Response> => {
    const { diligenceId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    // Verificar se a diligência existe
    const diligence = await this.diligenceRepository.findById(diligenceId);
    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }

    // Verificar permissão
    if (
      req.user?.role !== "admin" &&
      diligence.clientId !== userId &&
      diligence.correspondentId !== userId
    ) {
      throw new AppError("Acesso negado", 403);
    }

    // TODO: Implementar upload de arquivo real
    // Por enquanto, vamos simular o upload
    const { name, type, size } = req.body;

    if (!name || !type || !size) {
      throw new AppError("Dados do anexo incompletos", 400);
    }

    const url = `https://example.com/attachments/${Date.now()}-${name}`;

    const attachment = await this.attachmentRepository.create({
      name,
      url,
      type,
      size,
      diligenceId,
      uploadedById: userId,
    });

    return res.status(201).json(attachment);
  };

  getDiligenceAttachments = async (req: Request, res: Response): Promise<Response> => {
    const { diligenceId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    // Verificar se a diligência existe
    const diligence = await this.diligenceRepository.findById(diligenceId);
    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }

    // Verificar permissão
    if (
      req.user?.role !== "admin" &&
      diligence.clientId !== userId &&
      diligence.correspondentId !== userId
    ) {
      throw new AppError("Acesso negado", 403);
    }

    const attachments = await this.attachmentRepository.findByDiligence(diligenceId);
    return res.json(attachments);
  };

  deleteAttachment = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) {
      throw new AppError("Anexo não encontrado", 404);
    }

    // Verificar permissão
    const diligence = await this.diligenceRepository.findById(attachment.diligenceId);
    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }

    if (
      req.user?.role !== "admin" &&
      diligence.clientId !== userId &&
      attachment.uploadedById !== userId
    ) {
      throw new AppError("Acesso negado", 403);
    }

    await this.attachmentRepository.delete(id);
    return res.status(204).send();
  };
}