import { ServiceContainer } from "../../../Shared/infraestructura/ServiceContainer";

export class ExpressAlgoritmoController {
    obtenerAlgoritmos = async (req: any, res: any) => {
        try {
            const { usuarioId } = req.params;
            const algoritmos = await ServiceContainer.algoritmo.obtenerAlgoritmosUsuario.run(usuarioId);

            return res.status(200).json({
                usuario: usuarioId,
                algoritmos: algoritmos.map(a => a.mapToPrimitive())
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Error al obtener algoritmos' });
        }
    };

    //   Método actualizado con todos los parámetros
    ejecutar = async (req: any, res: any) => {
        try {
            const { usuarioId, nombreModelo, valores, nPasos } = req.body;
            
            // Validaciones básicas
            if (!usuarioId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'El usuarioId es requerido' 
                });
            }
            
            if (!nombreModelo) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'El nombreModelo es requerido' 
                });
            }
            
            if (!valores || !Array.isArray(valores) || valores.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Los valores son requeridos y deben ser un array' 
                });
            }
            
            //   Pasar todos los parámetros requeridos
            const resultado = await ServiceContainer.algoritmo.ejecutarAlgoritmo.run(
                usuarioId,     // 1er parámetro
                nombreModelo,  // 2do parámetro  
                valores,       // 3er parámetro
                nPasos         // 4to parámetro (opcional)
            );
            
            return res.status(200).json({
                success: true,
                data: resultado
            });
        } catch (error: any) {
            console.error('Error en ejecución:', error);
            return res.status(400).json({ 
                success: false,
                message: error.message 
            });
        }
    };
}