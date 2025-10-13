// src/routes/ExpressUsuarioRouter.ts
import { Router } from 'express';
import { ExpressUsuarioController } from '../controllers/ExpressUsuarioController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();
const controller = new ExpressUsuarioController();

// Definir rutas para usuarios
router.post('/', authMiddleware,controller.crearUsuario);
router.get('/usuarios',authMiddleware, controller.listarUsuarios);
router.post('/login', controller.login);
router.put('/:id',authMiddleware ,controller.editarUsuario);
router.patch('/estado/:id',authMiddleware , controller.editarEstadoUsuario);
router.patch('/primeraVez/:id',authMiddleware , controller.editarPrimeraVezUsuario);

export const ExpressUsuarioRouter = router;