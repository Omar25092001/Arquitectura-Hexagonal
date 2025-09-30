import { RepositorioUsuario } from "../../dominio/RepositorioUsuario";
import { Usuario } from "../../dominio/usuario/Usuario";
import { Correo } from "../../dominio/usuario/objetosValor/Correo";
import { Contrasena } from "../../dominio/usuario/objetosValor/Constrasena";
import { CredencialesInvalidas } from "../../dominio/usuario/erroresDominio/CredencialesInvalidas";
import {Hasheo} from "../../dominio/usuario/servicios/Hasheo";
import { Token } from "../../dominio/usuario/servicios/Token";

export interface RespuestaVerificarCredenciales {
    usuario: {
        id: string;
        nombre: string;
        correo: string;
        estado: boolean
        token: string;
    };
    
}

export class VerificarCredenciales {
    constructor(
        private repositorioUsuario: RepositorioUsuario,
        private servicioHasheo: Hasheo,
        private servicioToken: Token // Inyectamos el servicio de token para generar el JWT 
    ) {}

    async run(correoStr: string, contrasenaStr: string): Promise<RespuestaVerificarCredenciales> {
        try {
            // Crear objetos de valor a partir de los strings
            const correo = new Correo(correoStr);
            
            // Verificar credenciales en una sola llamada
            const usuario = await this.repositorioUsuario.obtenerUsuarioPorCorreo(correo);

            if (!usuario) {
                throw new CredencialesInvalidas("Credenciales inválidas");
            }

            const contrasenaValida = await this.servicioHasheo.verificar(contrasenaStr, usuario.contrasena.value);
            if (!contrasenaValida) {
                throw new CredencialesInvalidas("Credenciales inválidas");
            }

            const tokenGenerado = await this.servicioToken.generar(usuario);

            return {
                usuario: {
                    id: usuario.id.value,
                    nombre: usuario.nombre.value,
                    correo: usuario.correo.value,
                    estado: usuario.estado.value,
                    token: tokenGenerado
                },
                
            };
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