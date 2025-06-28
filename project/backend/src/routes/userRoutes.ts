import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const router = Router();
const userController = new UserController();

// Rotas protegidas
router.use(authMiddleware);

// Rotas para administradores
router.get("/", checkRole(["admin"]), userController.getAllUsers);
router.post("/", checkRole(["admin"]), userController.createUser);
router.get("/correspondents", checkRole(["admin"]), userController.getCorrespondents);
router.get("/correspondents/pending", checkRole(["admin"]), userController.getPendingCorrespondents);
router.patch("/correspondents/:id/approve", checkRole(["admin"]), userController.approveCorrespondent);
router.patch("/correspondents/:id/reject", checkRole(["admin"]), userController.rejectCorrespondent);

// Rotas para todos os usuários autenticados
router.get("/profile", userController.getProfile);
router.patch("/profile", userController.updateProfile);
router.get("/:id", userController.getUserById);

export default router;
