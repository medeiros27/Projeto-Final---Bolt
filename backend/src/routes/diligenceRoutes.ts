import { Router } from "express";
import { DiligenceController } from "../controllers/DiligenceController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const diligenceRoutes = Router();
const diligenceController = new DiligenceController();

// Aplica a autenticação a todas as rotas de diligência
diligenceRoutes.use(authMiddleware);

/**
 * ROTA PRINCIPAL E UNIFICADA
 * GET /diligences -> Retorna a lista de diligências apropriada para o utilizador logado.
 */
diligenceRoutes.get("/", diligenceController.getAllDiligences);

/**
 * GET /diligences/available -> Rota específica para correspondentes
 */
// A rota original para availableDiligences pode ser mantida se houver lógica específica
diligenceRoutes.get("/available", checkRole(["correspondent"]), diligenceController.getAvailableDiligences);


// Rota para criar diligência
diligenceRoutes.post("/", checkRole(["admin", "client"]), diligenceController.createDiligence);

// Rotas com ID devem vir depois
diligenceRoutes.get("/:id", diligenceController.getDiligenceById);
diligenceRoutes.patch("/:id/assign", checkRole(["admin"]), diligenceController.assignDiligence);
diligenceRoutes.patch("/:id/accept", checkRole(["correspondent"]), diligenceController.acceptDiligence);
diligenceRoutes.patch("/:id/start", checkRole(["correspondent"]), diligenceController.startDiligence);
diligenceRoutes.patch("/:id/complete", checkRole(["correspondent"]), diligenceController.completeDiligence);
diligenceRoutes.patch("/:id/status", diligenceController.updateDiligenceStatus);
diligenceRoutes.post("/:id/revert-status", diligenceController.revertDiligenceStatus);
diligenceRoutes.get("/:id/status-history", diligenceController.getDiligenceStatusHistory);

export { diligenceRoutes };