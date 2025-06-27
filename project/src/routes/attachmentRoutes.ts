import { Router } from "express";
import { AttachmentController } from "../controllers/AttachmentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const attachmentController = new AttachmentController();

// Todas as rotas de anexos requerem autenticação
router.use(authMiddleware);

router.post("/:diligenceId", attachmentController.uploadAttachment);
router.get("/:diligenceId", attachmentController.getDiligenceAttachments);
router.delete("/:id", attachmentController.deleteAttachment);

export { router as attachmentRoutes };