import { Usuario } from "./usuario/Usuario";
import { UsuarioId } from "./usuario/objetosValor/UsuarioId";
import { Correo } from "./usuario/objetosValor/Correo";
import {Estado} from "./usuario/objetosValor/Estado";
import { Nombre } from "./usuario/objetosValor/Nombre";
import { CreatedAt } from "./usuario/objetosValor/CreatedAt";
import { UpdatedAt } from "./usuario/objetosValor/UpdatedAt";
import { Contrasena } from "./usuario/objetosValor/Constrasena";
//Repositorio Clima seria el puerto de la arquitectura hexagonal
//El repositorio es la interfaz que define los métodos para interactuar con la base de datos

export interface RepositorioUsuario{
    crearUsuario(usuairo:Usuario): Promise<void>;
    obtenerUsuarios(): Promise<Usuario[] | null>;
    obtenerUsuario(id: UsuarioId): Promise<Usuario | null>;
    editarUsuario(clima:Usuario): Promise<void>;
    editarEstadoUsuario(id: UsuarioId, estado: Estado, updatedAt: UpdatedAt): Promise<void>;
    eliminarUsuario(id: UsuarioId): Promise<void>;
    obtenerUsuarioPorCorreo(correo: Correo): Promise<Usuario | null>;
}