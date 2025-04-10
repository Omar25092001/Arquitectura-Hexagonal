import {Router} from 'express';
import {ExpressClimaController} from '../controllers/ExpressClimaController';

const controller = new ExpressClimaController();
const ExpressClimaRouter = Router();

ExpressClimaRouter.get('/clima/:id', controller.obtenerClima);
ExpressClimaRouter.get('/clima/', controller.obtenerClimas);
ExpressClimaRouter.post('/clima/', controller.crearClima);
ExpressClimaRouter.put('/clima/:id', controller.editarClima);
ExpressClimaRouter.delete('/clima/:id', controller.eliminarClima);


export {ExpressClimaRouter};