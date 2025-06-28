import { Router } from "express";
import { DiligenceController } from "../controllers/DiligenceController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const router = Router();
const diligenceController = new DiligenceController();

// Rotas de acesso público ou para todos os usuários autenticados
router.use(authMiddleware); // Aplica o middleware de autenticação a todas as rotas abaixo

// Rotas para todos os usuários autenticados
router.get("/", diligenceController.getAllDiligences); // Corrigido de getAll para getAllDiligences
router.get("/:id", diligenceController.getDiligenceById); // Corrigido de getById para getDiligenceById

// Rotas específicas para clientes
router.post(
  "/",
  checkRole(["admin", "client"]),
  diligenceController.createDiligence // Corrigido de create para createDiligence
);
router.get(
  "/client/my-diligences",
  checkRole(["client"]),
  diligenceController.getClientDiligences
);

// Rotas específicas para correspondentes
router.get(
  "/correspondent/my-diligences",
  checkRole(["correspondent"]),
  diligenceController.getCorrespondentDiligences
);
router.get(
  "/available",
  checkRole(["correspondent"]),
  diligenceController.getAvailableDiligences
);
router.patch(
  "/:id/assign",
  checkRole(["admin"]),
  diligenceController.assignDiligence // Corrigido de assign para assignDiligence
);
router.patch(
  "/:id/accept",
  checkRole(["correspondent"]),
  diligenceController.acceptDiligence // Corrigido de accept para acceptDiligence
);
router.patch(
  "/:id/start",
  checkRole(["correspondent"]),
  diligenceController.startDiligence
);
router.patch(
  "/:id/complete",
  checkRole(["correspondent"]),
  diligenceController.completeDiligence
);

// Rotas para administradores (ou usuários com permissão para alterar status)
router.patch(
  "/:id/status",
  checkRole(["admin", "client", "correspondent"]),
  diligenceController.updateDiligenceStatus
);
router.patch(
  "/:id/revert-status",
  checkRole(["admin"]),
  diligenceController.revertDiligenceStatus
);
router.get(
  "/:id/history",
  checkRole(["admin", "client", "correspondent"]),
  diligenceController.getDiligenceStatusHistory
);

export default router;
