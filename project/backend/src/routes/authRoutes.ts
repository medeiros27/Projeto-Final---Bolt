import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const router = Router();
const authController = new AuthController();

router.post("/login", authController.login);
router.post("/register/client", authController.registerClient);
router.post("/register/correspondent", authController.registerCorrespondent);

export default router; // CORREÇÃO: Exportação padrão
