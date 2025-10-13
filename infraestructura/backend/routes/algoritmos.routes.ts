import { Router } from 'express';
import { ExpressAlgoritmoController } from '../controllers/ExpressAlgoritmoController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();
const controller = new ExpressAlgoritmoController();

// Ejemplo: proteger la ruta de ejecución con el middleware
router.post('/ejecutar', authMiddleware, controller.ejecutar);

export default router;
