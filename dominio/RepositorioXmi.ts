import { SesionXMI } from "./xmi/SesionXMI";
import { SesionXmiId } from "./xmi/objetosValor/SesionXmiId";
import { UsuarioId } from "../dominio/usuario/objetosValor/UsuarioId"; // Revisa esta ruta

export interface RepositorioXmi {
    
    /**
     * Guarda la nueva sesión (creando el archivo XMI).
     */
    crear(sesion: SesionXMI): Promise<void>;

    /**
     * Busca una sesión (comprobando si el archivo XMI existe).
     * Necesita ambos IDs para construir la ruta 'usuarioId/sesionId.xmi'.
     */
    buscarPorId(id: SesionXmiId, usuarioId: UsuarioId): Promise<SesionXMI | null>;

    guardarArchivo(sesion: SesionXMI, nombreArchivo: string, liveData: any[]): Promise<void>;

}