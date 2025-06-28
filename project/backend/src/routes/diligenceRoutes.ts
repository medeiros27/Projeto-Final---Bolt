import { Router } from "express";
import { DiligenceController } from "../controllers/DiligenceController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const router = Router();
const diligenceController = new DiligenceController();

// Middleware de autenticação para todas as rotas de diligência
router.use(authMiddleware);

// Rotas para Admin e Cliente
router.post(
  "/",
  checkRole(["admin", "client"]),
  diligenceController.createDiligence
);
router.get(
  "/client/my-diligences",
  checkRole(["client"]),
  diligenceController.getDiligencesByClient // CORREÇÃO: Nome do método
);

// Rotas específicas para correspondentes
router.get(
  "/correspondent/my-diligences",
  checkRole(["correspondent"]),
  diligenceController.getDiligencesByCorrespondent // CORREÇÃO: Nome do método
);
router.get(
  "/available",
  checkRole(["correspondent"]),
  diligenceController.getAvailableDiligences
);

// Rotas para Admin (gerenciamento geral)
router.get(
  "/all",
  checkRole(["admin"]),
  diligenceController.getAllDiligences
);

// Rotas para todos os usuários autenticados (visualização de detalhes)
router.get(
  "/:id",
  diligenceController.getDiligenceById
);

// Rotas para atualização de status e atribuição
router.put(
  "/:id/assign",
  checkRole(["admin"]),
  diligenceController.assignDiligence
);
router.put(
  "/:id/accept",
  checkRole(["correspondent"]),
  diligenceController.acceptDiligence
);
router.put(
  "/:id/start",
  checkRole(["correspondent"]),
  diligenceController.startDiligence
);
router.put(
  "/:id/complete",
  checkRole(["correspondent"]),
  diligenceController.completeDiligence
);
router.put(
  "/:id/status",
  checkRole(["admin", "client", "correspondent"]),
  diligenceController.updateDiligenceStatus
);
router.put(
  "/:id/revert-status",
  checkRole(["admin"]),
  diligenceController.revertDiligenceStatus
);

// Rota para histórico de status
router.get(
  "/:id/history",
  diligenceController.getDiligenceStatusHistory
);

export default router;
