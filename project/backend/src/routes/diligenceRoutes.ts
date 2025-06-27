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
diligenceRoutes.get("/", diligenceController.getAll);

/**
 * GET /diligences/available -> Rota específica para correspondentes
 */
// A rota original para availableDiligences pode ser mantida se houver lógica específica
// diligenceRoutes.get("/available", checkRole(["correspondent"]), diligenceController.getAvailableDiligences);


// Rota para criar diligência
diligenceRoutes.post("/", checkRole(["admin", "client"]), diligenceController.create);

// Rotas com ID devem vir depois
diligenceRoutes.get("/:id", diligenceController.getById);
diligenceRoutes.patch("/:id/assign", checkRole(["admin"]), diligenceController.assign);
diligenceRoutes.patch("/:id/accept", checkRole(["correspondent"]), diligenceController.accept);

// ... Adicione aqui as outras rotas PATCH, POST, GET com :id que você tinha ...

export { diligenceRoutes };
