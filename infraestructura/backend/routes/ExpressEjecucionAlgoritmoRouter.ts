import { Router } from 'express';
import { ExpressEjecucionAlgoritmoController } from '../controllers/ExpressEjecucionAlgoritmoController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();
const controller = new ExpressEjecucionAlgoritmoController();

// POST /api/ejecuciones - Crear nueva ejecución
router.post('/',authMiddleware, controller.crearEjecucion);

// GET /api/ejecuciones - Obtener todas las ejecuciones
router.get('/', authMiddleware, controller.obtenerEjecuciones);

// GET /api/ejecuciones/:id - Obtener ejecución por ID
router.get('/:id',authMiddleware, controller.obtenerEjecucionPorId);

// GET /api/ejecuciones/usuario/:usuarioId - Obtener ejecuciones por usuario
router.get('/usuario/:usuarioId',authMiddleware, controller.obtenerEjecucionesPorUsuario);

export default router;