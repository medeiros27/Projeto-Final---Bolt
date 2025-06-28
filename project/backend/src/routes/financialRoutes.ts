import { Router } from "express";
import { FinancialController } from "../controllers/FinancialController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const router = Router(); // CORREÇÃO: Declaração e inicialização da variável router
const financialController = new FinancialController();

// Middleware de autenticação para todas as rotas financeiras
router.use(authMiddleware);

// Rotas para clientes
router.post(
  "/proof/upload",
  checkRole(["client"]),
  financialController.uploadPaymentProof
);
router.get(
  "/proof/diligence/:diligenceId",
  checkRole(["client", "correspondent", "admin"]),
  financialController.getPaymentProofByDiligenceId
);

// Rotas para correspondentes
router.get(
  "/correspondent/payments",
  checkRole(["correspondent"]),
  financialController.getCorrespondentPayments
);
router.put(
  "/correspondent/payments/:id/status",
  checkRole(["correspondent"]),
  financialController.updatePaymentStatusByCorrespondent
);

// Rotas para administradores
router.get(
  "/admin/payments",
  checkRole(["admin"]),
  financialController.getAllPayments
);
router.put(
  "/admin/payments/:id/status",
  checkRole(["admin"]),
  financialController.updatePaymentStatusByAdmin
);

export default router;
