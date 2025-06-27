import { Router } from "express";
import { FinancialController } from "../controllers/FinancialController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const router = Router();
const financialController = new FinancialController();

// Todas as rotas financeiras requerem autenticação
router.use(authMiddleware);

// Rotas para administradores
router.get("/summary", checkRole(["admin"]), financialController.getFinancialSummary);
router.get("/data", checkRole(["admin"]), financialController.getAllFinancialData);
router.get("/diligence/:id", financialController.getFinancialDataByDiligence);

// Rotas para pagamentos
router.post("/payment-proof/:diligenceId", checkRole(["client"]), financialController.submitPaymentProof);
router.patch("/payment-proof/:proofId/verify", checkRole(["admin"]), financialController.verifyPaymentProof);
router.patch("/payment/:diligenceId/client", checkRole(["admin"]), financialController.markClientPaymentAsPaid);
router.patch("/payment/:diligenceId/correspondent", checkRole(["admin"]), financialController.markCorrespondentPaymentAsPaid);

// Rotas para reversão de status de pagamento
router.post("/payment/:diligenceId/revert-status", checkRole(["admin"]), financialController.revertPaymentStatus);
router.get("/payment/:diligenceId/status-history", checkRole(["admin"]), financialController.getPaymentStatusHistory);

// Rotas para clientes e correspondentes
router.get("/client", checkRole(["client"]), financialController.getClientFinancialData);
router.get("/correspondent", checkRole(["correspondent"]), financialController.getCorrespondentFinancialData);

export { router as financialRoutes };