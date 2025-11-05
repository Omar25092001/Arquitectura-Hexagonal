import { Router } from 'express';
import { ExpressXmiController } from '../controllers/ExpressXmiController';

// Instanciamos el controlador
const controlador = new ExpressXmiController();

// Creamos el router
export const xmiRouter = Router();

// Definimos la ruta y la conectamos al método del controlador
xmiRouter.post('/iniciar',controlador.crearSesion );
xmiRouter.post('/guardar-sesion', controlador.guardarSesion);
