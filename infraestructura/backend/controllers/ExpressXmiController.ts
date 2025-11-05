// Importamos el contenedor que tiene todas las dependencias
import { ServiceContainer } from "../../../Shared/infraestructura/ServiceContainer";

// Importamos el generador de UUIDs
import { v4 as uuidv4 } from 'uuid';

// Importamos el error de dominio específico para manejarlo
import { SesionXmiDuplicada } from "../../../dominio/xmi/erroresDominio/SesionXmiDuplicada"; // Ajusta esta ruta

export class ExpressXmiController {

    /**
     * Controlador para el caso de uso 'CrearSesionXmi'.
     */
    crearSesion = async (req: any, res: any) => {
        try {
            // 1. Obtener los datos del cuerpo de la petición
            const { userId } = req.body;

            // 2. Validación (siguiendo tu patrón)
            if (!userId) {
                return res.status(400).json({
                    message: 'El userId es requerido'
                });
            }

            // 3. Generar los datos en el backend
            const nuevoId = uuidv4();
            const fecha = new Date();

            // 4. Llamar al caso de uso a través del ServiceContainer
            await ServiceContainer.xmi.crearSesionXmi.run(
                nuevoId,
                userId,
                fecha
            );

            // 5. Devolver la respuesta (201 Creado)
            return res.status(201).json({
                uuid: nuevoId
            });

        } catch (error) {

            // 6. Manejar el error de dominio específico
            if (error instanceof SesionXmiDuplicada) {
                // 409 Conflict es el código ideal para un recurso duplicado
                return res.status(409).json({ message: error.message });
            }

            // 7. Manejar otros errores (siguiendo tu patrón)
            if (error instanceof Error) {
                console.error('Error en crearSesion:', error);
                return res.status(400).json({ message: error.message });
            }

            // 8. Error desconocido
            console.error('Error desconocido en crearSesion:', error);
            return res.status(500).json({ message: 'Error interno al crear la sesión XMI' });
        }
    };

    guardarSesion = async (req: any, res: any) => {
        try {
            // 1. Obtener los datos del frontend
            const { usuarioId, liveData } = req.body;

            // 2. Validación
            if (!usuarioId || !liveData || !Array.isArray(liveData) || liveData.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan datos: usuarioId y liveData (array no vacío) son requeridos'
                });
            }

            // 3. Generar el UUID aquí (Capa de Infraestructura)
            const nuevoIdSesion = uuidv4();

            // 4. Llamar al caso de uso 'GuardarSesionXmi'
            await ServiceContainer.xmi.guardarSesionXmi.run(
                usuarioId,
                nuevoIdSesion, // Se pasa el ID generado
                liveData
            );

            // 5. Devolver la respuesta
            return res.status(201).json({
                success: true,
                message: 'Sesión XMI guardada con éxito',
                sesionId: nuevoIdSesion
            });

        } catch (error: any) {
            console.error('Error en guardarSesion:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error interno al guardar la sesión XMI'
            });
        }
    };
}