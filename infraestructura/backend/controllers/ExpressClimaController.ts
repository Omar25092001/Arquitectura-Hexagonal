import { Request, Response } from "express";
import { ServiceContainer } from "../../../Shared/infraestructura/ServiceContainer";
import { ClimaNoEncontrado } from "../../../dominio/clima/erroresDominio/ClimaNoEncontrado";
type climaExpress = {
    id: number;
    ciudad: string;
    temperatura: number;
    humedad: number;
    velocidadViento: number;
    estado: string;
    createdAt: Date;
};

//La clase Express estara encargada de utilizar todos los casos de usos definidos en la aplicacion
export class ExpressClimaController {

    //Como se puede ver, no tenemos la necesidad de hacer validaciones de los datos ya que ese trabajo se realiza tanto a nivel de capa de aplicacion y dominio
    async obtenerClimas (req:any, res:any ){
        try {
            const climas = await ServiceContainer.clima.obtenerClimas.run();
            if (!climas) {
                return res.status(404).json({ message: "No se encontraron climas" });
            }
            return res.status(200).json(climas.map((clima) => clima.mapToPrimitive()));
        } catch (error) {
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    }

    obtenerClima = async (req:any, res:any) => {
        try {
            const id = parseInt(req.params.id);
            const user = await ServiceContainer.clima.obtenerClima.run(id);
            if (!user) {
                return res.status(404).json({ message: "Clima no encontrado" });
            }
            return res.status(200).json(user.mapToPrimitive());
        } catch (error) {
            if (error instanceof ClimaNoEncontrado) {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    }

    crearClima = async (req:any, res:any) => {
        try {
            const clima: climaExpress = req.body;
            const user = await ServiceContainer.clima.crearClima.run(
                clima.id,
                clima.ciudad,
                clima.temperatura,
                clima.humedad,
                clima.velocidadViento,
                clima.estado,
                clima.createdAt
            );
            return res.status(201).json(user);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            return res.status(500).json({ message: "Error desconocido" });
        }
        
    }

    editarClima = async (req:any, res:any) => {
        try {
            const id = parseInt(req.params.id);
            const clima: climaExpress = req.body;
            const user = await ServiceContainer.clima.editarClima.run(
                id,
                clima.ciudad,
                clima.temperatura,
                clima.humedad,
                clima.velocidadViento,
                clima.estado,
                clima.createdAt
            );
            return res.status(200).json(user);
        } catch (error) {
            if (error instanceof ClimaNoEncontrado) {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    }

    eliminarClima = async (req:any, res:any) => {
        try {
            const id = parseInt(req.params.id);
            await ServiceContainer.clima.eliminarClima.run(id);
            return res.status(204).send();
        } catch (error) {
            if (error instanceof ClimaNoEncontrado) {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    }
}