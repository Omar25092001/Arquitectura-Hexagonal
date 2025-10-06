// src/routes/ExpressUsuarioRouter.ts
import { Router } from 'express';
import { ExpressUsuarioController } from '../controllers/ExpressUsuarioController';

const router = Router();
const controller = new ExpressUsuarioController();

// Definir rutas para usuarios
router.post('/', controller.crearUsuario);
router.get('/usuarios', controller.listarUsuarios);
router.post('/login', controller.login);
router.put('/:id', controller.editarUsuario);
router.patch('/estado/:id', controller.editarEstadoUsuario);

export const ExpressUsuarioRouter = router;