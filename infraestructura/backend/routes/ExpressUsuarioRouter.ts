// src/routes/ExpressUsuarioRouter.ts

import { Router } from 'express';
import { ExpressUsuarioController } from '../controllers/ExpressUsuarioController';

const router = Router();
const controller = new ExpressUsuarioController();

// Definir rutas para usuarios
router.post('/', controller.crearUsuario);
router.get('/usuarios', controller.listarUsuarios);
router.post('/login', controller.login);

export const ExpressUsuarioRouter = router;