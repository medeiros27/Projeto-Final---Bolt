import { Router } from "express";
import { StatusManagementController } from "../controllers/StatusManagementController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const router = Router();
const statusController = new StatusManagementController();

// Todas as rotas de status requerem autenticação
router.use(authMiddleware);

// Rotas para verificar possibilidade de reversão
router.get("/can-revert", statusController.canRevertStatus);

// Rotas para reversão de status
router.post("/revert", statusController.revertStatus);

// Rotas para histórico de status
router.get("/history/diligence/:id", statusController.getDiligenceStatusHistory);
router.get("/history/payment/:id", statusController.getPaymentStatusHistory);
router.get("/history/all", checkRole(["admin"]), statusController.getAllStatusHistory);

export { router as statusRoutes };