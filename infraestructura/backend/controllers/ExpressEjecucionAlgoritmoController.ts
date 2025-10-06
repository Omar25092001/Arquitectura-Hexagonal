import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ServiceContainer } from '../../../Shared/infraestructura/ServiceContainer';

export class ExpressEjecucionAlgoritmoController {

    // POST /ejecuciones - Crear nueva ejecución
    async crearEjecucion(req: Request, res: Response): Promise<void> {
        try {
            const {
                usuarioId,
                nombreAlgoritmo,
                tipoAlgoritmo,
                valoresEntrada,
                variableSeleccionada,
                fechaEjecucion,
                resultado,
                tiempoEjecucion
            } = req.body;

            // Validaciones básicas (sin id)
            if (!usuarioId || !nombreAlgoritmo || !tipoAlgoritmo ||
                !valoresEntrada || !variableSeleccionada || !fechaEjecucion ||
                !resultado || tiempoEjecucion === undefined) {
                res.status(400).json({
                    error: 'Todos los campos son requeridos',
                    campos: ['usuarioId', 'nombreAlgoritmo', 'tipoAlgoritmo',
                        'valoresEntrada', 'variableSeleccionada', 'fechaEjecucion',
                        'resultado', 'tiempoEjecucion']
                });
                return;
            }

            // ... otras validaciones ...

            // GENERAR ID AQUÍ IGUAL QUE EN USUARIO
            const id = uuidv4();

            // Ejecutar caso de uso CON id generado
            await ServiceContainer.ejecucionAlgoritmo.crearEjecucion.run(
                id, // ← PASAR EL ID GENERADO
                usuarioId,
                nombreAlgoritmo,
                tipoAlgoritmo,
                valoresEntrada,
                variableSeleccionada,
                new Date(fechaEjecucion),
                resultado,
                tiempoEjecucion
            );

            res.status(201).json({
                message: 'Ejecución creada exitosamente',
                data: {
                    id, // ← DEVOLVER EL ID GENERADO
                    usuarioId,
                    nombreAlgoritmo,
                    tipoAlgoritmo,
                    fechaEjecucion: new Date(fechaEjecucion),
                    estado: 'creada'
                }
            });

        } catch (error: any) {
            console.error('Error al crear ejecución:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
    // GET /ejecuciones - Obtener todas las ejecuciones
    async obtenerEjecuciones(req: Request, res: Response): Promise<void> {
        try {
            const ejecuciones = await ServiceContainer.ejecucionAlgoritmo.obtenerEjecuciones.run();

            if (!ejecuciones || ejecuciones.length === 0) {
                res.status(200).json({
                    message: 'No se encontraron ejecuciones',
                    data: [],
                    total: 0
                });
                return;
            }

            // Convertir a primitivos para la respuesta
            const ejecucionesPrimitivas = ejecuciones.map(ejecucion => ejecucion.mapToPrimitive());

            res.status(200).json({
                message: 'Ejecuciones obtenidas exitosamente',
                data: ejecucionesPrimitivas,
                total: ejecuciones.length
            });

        } catch (error: any) {
            console.error('Error al obtener ejecuciones:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    // GET /ejecuciones/:id - Obtener ejecución por ID (para futuro)
    async obtenerEjecucionPorId(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    error: 'ID de ejecución requerido'
                });
                return;
            }

            // Por ahora, obtener todas y filtrar por ID
            const ejecuciones = await ServiceContainer.ejecucionAlgoritmo.obtenerEjecuciones.run();

            if (!ejecuciones) {
                res.status(404).json({
                    error: 'Ejecución no encontrada'
                });
                return;
            }

            const ejecucion = ejecuciones.find(e => e.id.value === id);

            if (!ejecucion) {
                res.status(404).json({
                    error: 'Ejecución no encontrada'
                });
                return;
            }

            res.status(200).json({
                message: 'Ejecución encontrada',
                data: ejecucion.mapToPrimitive()
            });

        } catch (error: any) {
            console.error('Error al obtener ejecución:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }

    // GET /ejecuciones/usuario/:usuarioId - Obtener ejecuciones por usuario (para futuro)
    async obtenerEjecucionesPorUsuario(req: Request, res: Response): Promise<void> {
        try {
            const { usuarioId } = req.params;

            if (!usuarioId) {
                res.status(400).json({
                    error: 'ID de usuario requerido'
                });
                return;
            }

            // Por ahora, obtener todas y filtrar por usuarioId
            const todasLasEjecuciones = await ServiceContainer.ejecucionAlgoritmo.obtenerEjecuciones.run();

            if (!todasLasEjecuciones) {
                res.status(200).json({
                    message: 'No se encontraron ejecuciones para el usuario',
                    data: [],
                    total: 0
                });
                return;
            }

            const ejecucionesUsuario = todasLasEjecuciones.filter(e => e.usuarioId.value === usuarioId);

            res.status(200).json({
                message: `Ejecuciones del usuario ${usuarioId}`,
                data: ejecucionesUsuario.map(e => e.mapToPrimitive()),
                total: ejecucionesUsuario.length
            });

        } catch (error: any) {
            console.error('Error al obtener ejecuciones del usuario:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: error.message
            });
        }
    }
}