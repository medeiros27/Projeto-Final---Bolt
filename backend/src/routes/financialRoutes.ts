import { Router } from "express";
import { FinancialController } from "../controllers/FinancialController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const financialRoutes = Router();
const financialController = new FinancialController();

// Todas as rotas financeiras requerem autenticação, aplicado a todo o router.
financialRoutes.use(authMiddleware);

// --- Rotas para Administradores ---
financialRoutes.get("/summary", checkRole(["admin"]), financialController.getFinancialSummary);
financialRoutes.get("/data", checkRole(["admin"]), financialController.getAllFinancialData);

// Rota para verificar comprovativo de pagamento
financialRoutes.patch(
    "/payment-proof/:proofId/verify", 
    checkRole(["admin"]), 
    financialController.verifyPaymentProof
);

// --- Rotas para Utilizadores Autenticados (com lógica de permissão no serviço) ---
financialRoutes.get(
    "/diligence/:id", 
    financialController.getFinancialDataByDiligence
);

// Rota para cliente submeter comprovativo
financialRoutes.post(
    "/payment-proof/:diligenceId", 
    checkRole(["client"]), 
    financialController.submitPaymentProof
);

// --- Rotas Específicas de Perfil ---
financialRoutes.get(
    "/client-data", 
    checkRole(["client"]), 
    // Supondo que você terá um método para isto no seu controlador
    // financialController.getClientFinancialData 
);

financialRoutes.get(
    "/correspondent-data", 
    checkRole(["correspondent"]), 
    // Supondo que você terá um método para isto no seu controlador
    // financialController.getCorrespondentFinancialData 
);

export { financialRoutes };