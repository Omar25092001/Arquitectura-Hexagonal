// src/aplicacion/verificarCredenciales/VerificarCredenciales.ts

import { RepositorioUsuario } from "../../dominio/RepositorioUsuario";
import { Usuario } from "../../dominio/usuario/Usuario";
import { Correo } from "../../dominio/usuario/objetosValor/Correo";
import { Contrasena } from "../../dominio/usuario/objetosValor/Constrasena";
import { CredencialesInvalidas } from "../../dominio/usuario/erroresDominio/CredencialesInvalidas";

export class VerificarCredenciales {
    constructor(private repositorioUsuario: RepositorioUsuario) {}

    async run(correoStr: string, contrasenaStr: string): Promise<Usuario> {
        try {
            // Crear objetos de valor a partir de los strings
            const correo = new Correo(correoStr);
            const contrasena = new Contrasena(contrasenaStr);
            
            // Buscar usuario por correo, usando el objeto Correo
            const usuario = await this.repositorioUsuario.obtenerUsuarioPorCorreo(correo);

            if (!usuario) {
                throw new CredencialesInvalidas("Credenciales inválidas");
            }

            // Verificar contraseña, usando el objeto Contrasena
            const contrasenaValida = await this.repositorioUsuario.verificarContrasena(usuario, contrasena);

            if (!contrasenaValida) {
                throw new CredencialesInvalidas("Credenciales inválidas");
            }

            return usuario;
        } catch (error) {
            // Capturar errores de validación de los objetos de valor
            if (error instanceof CredencialesInvalidas) {
                throw error;
            }
            // Si hay otro tipo de error (como formato inválido de correo o contraseña)
            throw new CredencialesInvalidas("Credenciales inválidas");
        }
    }
}