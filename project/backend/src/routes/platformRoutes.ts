import { Router } from 'express';
import { PlatformController } from '../controllers/PlatformController';
import { authMiddleware, checkRole } from '../middlewares/authMiddleware';

const platformRoutes = Router();
const platformController = new PlatformController();

// Apenas administradores podem aceder às análises da plataforma
platformRoutes.get(
  '/analytics', 
  authMiddleware, 
  checkRole(['admin']), 
  platformController.getAnalytics
);

export { platformRoutes };
