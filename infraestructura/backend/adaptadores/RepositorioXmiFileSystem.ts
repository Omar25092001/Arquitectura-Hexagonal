import { promises as fs } from 'fs';
import path from 'path';
import { RepositorioXmi } from '../../../dominio/RepositorioXmi'; // Ajusta ruta
import { SesionXMI } from '../../../dominio/xmi/SesionXMI';
import { SesionXmiId } from '../../../dominio/xmi/objetosValor/SesionXmiId';
import { UsuarioId } from '../../../dominio/usuario/objetosValor/UsuarioId';
import { RutaArchivo } from '../../../dominio/xmi/objetosValor/RutaArchivo';
import { CreatedAt } from '../../../dominio/xmi/objetosValor/CreatedAt';

export class RepositorioXmiFileSystem implements RepositorioXmi {

    private readonly PROYECTO_ROOT = process.cwd();
    private readonly RUTA_PLANTILLA = path.resolve(this.PROYECTO_ROOT, "xmi/plantilla.xmi");
    private readonly RUTA_BASE_XMI = path.resolve(this.PROYECTO_ROOT, "xmi");

    constructor() {}

    /**
     * Crea la carpeta del usuario.
     */
    async crear(sesion: SesionXMI): Promise<void> {
        // rutaRelativa es "id_usuario/id_sesion.xmi"
        const rutaRelativa = sesion.rutaArchivo.value;
        const rutaDestinoAbsoluta = path.join(this.RUTA_BASE_XMI, rutaRelativa);
        // dirDestino es "C:\...\src\xmi\id_usuario"
        const dirDestino = path.dirname(rutaDestinoAbsoluta);

        try {
            // 1. Asegurar que el directorio del usuario exista
            await fs.mkdir(dirDestino, { recursive: true });

            // 2. Línea de copiar archivo ELIMINADA
            // await fs.copyFile(this.RUTA_PLANTILLA, rutaDestinoAbsoluta);

            console.log(`[RepositorioXmiFileSystem] Directorio creado/verificado: ${dirDestino}`);

        } catch (error) { // 'error' es 'unknown'
            console.error("[RepositorioXmiFileSystem] Error al crear directorio:", error);
            
            if (error instanceof Error) {
                throw new Error(`Error de sistema de archivos al crear: ${error.message}`);
            }
            throw new Error(`Error de sistema de archivos al crear: ${String(error)}`);
        }
    }

    /**
     * Busca si un archivo XMI ya existe.
     */
    async buscarPorId(id: SesionXmiId, usuarioId: UsuarioId): Promise<SesionXMI | null> {
        
        const nombreArchivo = `${id.value}.xmi`;
        const rutaString = `${usuarioId.value}/${nombreArchivo}`;
        const rutaAbsoluta = path.join(this.RUTA_BASE_XMI, rutaString);

        try {
            // Esto comprueba si el ARCHIVO existe
            const stats = await fs.stat(rutaAbsoluta);
            
            return new SesionXMI(
                id,
                usuarioId,
                new RutaArchivo(rutaString),
                new CreatedAt(stats.birthtime) 
            );

        } catch (error) { // 'error' es 'unknown'
            
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
                return null; // El archivo no existe
            }
            
            console.error("[RepositorioXmiFileSystem] Error al buscar archivo:", error);
            throw error; 
        }
    }
}