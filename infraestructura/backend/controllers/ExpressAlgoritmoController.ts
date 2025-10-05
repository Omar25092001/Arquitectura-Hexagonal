import { Request, Response } from 'express';

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

    ejecutar = async (req: any, res: any) => {
        try {
            const { nombreModelo, valores } = req.body;
            const resultado = await ServiceContainer.algoritmo.ejecutarAlgoritmo.run(nombreModelo, valores);
            return res.status(200).json(resultado);
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    };
    
}