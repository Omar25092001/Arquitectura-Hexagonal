// src/infraestructura/api/controllers/ExpressUsuarioController.ts

import { Request, Response } from "express";
import { ServiceContainer } from "../../../Shared/infraestructura/ServiceContainer";
import { CredencialesInvalidas } from "../../../dominio/usuario/erroresDominio/CredencialesInvalidas";

type credencialesExpress = {
    correo: string;
    contrasena: string;
};

type usuarioExpress = {
    id?: number;
    nombre: string;
    correo: string;
    contrasena: string;
};

//La clase Express estará encargada de utilizar todos los casos de usos definidos en la aplicación
export class ExpressUsuarioController {

    crearUsuario = async (req:any, res:any) => {
        try {
            const usuario: usuarioExpress = req.body;
            
            // Generar un ID si no se proporciona
            const id = usuario.id || Math.floor(Math.random() * 1000000);
            
            // Crear fechas para createdAt y updatedAt
            const createdAt = new Date();
            const updatedAt = new Date();
            
            const nuevoUsuario = await ServiceContainer.usuario.crearUsuario.run(
                id,
                usuario.nombre,
                usuario.correo,
                usuario.contrasena,
                createdAt,
                updatedAt
            );
            
            return res.status(201).json(nuevoUsuario);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Error desconocido" });
        }
    }

    login = async (req:any, res:any) => {
        try {
            const credenciales: credencialesExpress = req.body;
            const usuario = await ServiceContainer.usuario.verificarCredenciales.run(
                credenciales.correo,
                credenciales.contrasena
            );
            
            // Si la verificación fue exitosa, devolvemos los datos del usuario
            return res.status(200).json({
                message: "Login exitoso",
                usuario: usuario.mapToPrimitive()
            });
        } catch (error) {
            if (error instanceof CredencialesInvalidas) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    }
}