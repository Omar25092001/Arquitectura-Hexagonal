import { Router } from 'express';
import { ExpressEjecucionAlgoritmoController } from '../controllers/ExpressEjecucionAlgoritmoController';

const router = Router();
const controller = new ExpressEjecucionAlgoritmoController();

// POST /api/ejecuciones - Crear nueva ejecución
router.post('/', controller.crearEjecucion);

// GET /api/ejecuciones - Obtener todas las ejecuciones
router.get('/', controller.obtenerEjecuciones);

// GET /api/ejecuciones/:id - Obtener ejecución por ID
router.get('/:id', controller.obtenerEjecucionPorId);

// GET /api/ejecuciones/usuario/:usuarioId - Obtener ejecuciones por usuario
router.get('/usuario/:usuarioId', controller.obtenerEjecucionesPorUsuario);

export default router;