import { Router } from "express";
import { DiligenceController } from "../controllers/DiligenceController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const router = Router();
const diligenceController = new DiligenceController();

// Todas as rotas de diligência requerem autenticação
router.use(authMiddleware);

// Rotas para todos os usuários autenticados
router.get("/:id", diligenceController.getDiligenceById);

// Rotas para clientes e administradores
router.post("/", checkRole(["admin", "client"]), diligenceController.createDiligence);

// Rotas específicas para administradores
router.get("/", checkRole(["admin"]), diligenceController.getAllDiligences);
router.patch("/:id/assign", checkRole(["admin"]), diligenceController.assignDiligence);

// Rotas específicas para clientes
router.get("/client/my", checkRole(["client"]), diligenceController.getClientDiligences);

// Rotas específicas para correspondentes
router.get("/correspondent/my", checkRole(["correspondent"]), diligenceController.getCorrespondentDiligences);
router.get("/correspondent/available", checkRole(["correspondent"]), diligenceController.getAvailableDiligences);
router.patch("/:id/accept", checkRole(["correspondent"]), diligenceController.acceptDiligence);
router.patch("/:id/start", checkRole(["correspondent"]), diligenceController.startDiligence);
router.patch("/:id/complete", checkRole(["correspondent"]), diligenceController.completeDiligence);

// Rotas para gerenciamento de status
router.patch("/:id/status", diligenceController.updateDiligenceStatus);
router.post("/:id/revert-status", diligenceController.revertDiligenceStatus);
router.get("/:id/status-history", diligenceController.getDiligenceStatusHistory);

export { router as diligenceRoutes };