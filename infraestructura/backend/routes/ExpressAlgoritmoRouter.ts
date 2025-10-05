import { Router } from 'express';
import { ExpressAlgoritmoController } from '../controllers/ExpressAlgoritmoController';
import { EjecutarAlgoritmo } from '../../../aplicacion/CasosUsoAlgoritmo/EjecutarAlgoritmo';
const router = Router();
const controller = new ExpressAlgoritmoController();

router.get('/:usuarioId', controller.obtenerAlgoritmos);
router.post('/ejecutar', controller.ejecutar);

export const ExpressAlgoritmoRouter = router;