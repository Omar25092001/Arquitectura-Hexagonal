import { promises as fs } from 'fs';
import path from 'path';
import { RepositorioXmi } from '../../../dominio/RepositorioXmi'; // Ajusta ruta
import { SesionXMI } from '../../../dominio/xmi/SesionXMI';
import { SesionXmiId } from '../../../dominio/xmi/objetosValor/SesionXmiId';
import { UsuarioId } from '../../../dominio/usuario/objetosValor/UsuarioId';
import { RutaArchivo } from '../../../dominio/xmi/objetosValor/RutaArchivo';
import { CreatedAt } from '../../../dominio/xmi/objetosValor/CreatedAt';
import { generarXmi } from '../servicios/generarXmi'; // Función para generar contenido XMI
export class RepositorioXmiFileSystem implements RepositorioXmi {

    private readonly PROYECTO_ROOT = process.cwd();
    // RUTA_BASE_XMI ahora apunta a la carpeta 'xmi'
    private readonly RUTA_BASE_XMI = path.resolve(this.PROYECTO_ROOT, "xmi");

    // Eliminamos la plantilla, ya que solo creamos carpetas
    // private readonly RUTA_PLANTILLA = ...

    constructor() {
        // Asegurarnos de que la carpeta 'xmi' base exista al iniciar
        this.asegurarCarpetaBase();
    }

    private async asegurarCarpetaBase(): Promise<void> {
        try {
            await fs.mkdir(this.RUTA_BASE_XMI, { recursive: true });
        } catch (error) {
            console.error("Error al crear la carpeta XMI base:", error);
        }
    }



    /**
     * Crea la estructura de carpetas anidada para la sesión.
     */
    async crear(sesion: SesionXMI): Promise<void> {

        // Asumimos que rutaArchivo.value es "ID_USUARIO/ID_SESION"
        const rutaRelativa = sesion.rutaArchivo.value;

        // Esto será "C:\...\proyecto\xmi\ID_USUARIO\ID_SESION"
        const rutaDestinoAbsoluta = path.join(this.RUTA_BASE_XMI, rutaRelativa);

        // Problema anterior: path.dirname(rutaDestinoAbsoluta) solo creaba "C:\...\proyecto\xmi\ID_USUARIO"
        // const dirDestino = path.dirname(rutaDestinoAbsoluta); 

        try {
            // 1. --- ¡CAMBIO CLAVE! ---
            // Usamos la ruta absoluta directa. { recursive: true }
            // creará "ID_USUARIO" y "ID_SESION" si no existen.
            await fs.mkdir(rutaDestinoAbsoluta, { recursive: true });

            console.log(`[RepositorioXmiFileSystem] Directorio de sesión creado: ${rutaDestinoAbsoluta}`);

        } catch (error) { // 'error' es 'unknown'
            console.error("[RepositorioXmiFileSystem] Error al crear directorio:", error);

            if (error instanceof Error) {
                throw new Error(`Error de sistema de archivos al crear: ${error.message}`);
            }
            throw new Error(`Error de sistema de archivos al crear: ${String(error)}`);
        }
    }

    /**
     * Busca si un directorio de sesión ya existe.
     */
    async buscarPorId(id: SesionXmiId, usuarioId: UsuarioId): Promise<SesionXMI | null> {

        // --- ¡CAMBIO CLAVE! ---
        // Ya no buscamos un archivo ".xmi", buscamos la carpeta de sesión.
        // rutaString será "ID_USUARIO/ID_SESION"
        const rutaString = path.join(usuarioId.value, id.value);
        const rutaAbsoluta = path.join(this.RUTA_BASE_XMI, rutaString);

        try {
            // Esto comprueba si la RUTA (carpeta) existe
            const stats = await fs.stat(rutaAbsoluta);

            // Verificamos que sea un directorio
            if (!stats.isDirectory()) {
                console.warn(`[RepositorioXmiFileSystem] Se encontró una ruta pero no es un directorio: ${rutaAbsoluta}`);
                return null;
            }

            return new SesionXMI(
                id,
                usuarioId,
                new RutaArchivo(rutaString), // Guardamos la ruta relativa "ID_USUARIO/ID_SESION"
                new CreatedAt(stats.birthtime)
            );

        } catch (error) { // 'error' es 'unknown'

            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
                return null; // El directorio no existe
            }

            console.error("[RepositorioXmiFileSystem] Error al buscar directorio:", error);
            throw error;
        }
    }


    async guardarArchivo(sesion: SesionXMI, nombreArchivo: string, liveData: any[]): Promise<void> {

        // 2. Generar el contenido XMI (Lógica de Infraestructura)
        // (Esto convierte el any[] en un string)
        const contenidoXmi = generarXmi(liveData);

        // 3. Definir rutas (Lógica de Infraestructura)
        // Usa 'sesion.rutaArchivo.value' (ej: 'ID_USUARIO/ID_SESION')
        const rutaDirectorioSesion = path.join(this.RUTA_BASE_XMI, sesion.rutaArchivo.value);
        const rutaArchivoCompleta = path.join(rutaDirectorioSesion, nombreArchivo);

        try {
            // 4. Asegurar carpeta y escribir archivo
            await fs.mkdir(rutaDirectorioSesion, { recursive: true });

            // 5. Escribir el 'contenidoXmi' (string) en el archivo
            await fs.writeFile(rutaArchivoCompleta, contenidoXmi, 'utf-8');

            console.log(`[RepositorioXmiFileSystem] Archivo XMI guardado: ${rutaArchivoCompleta}`);

        } catch (error) {
            console.error("[RepositorioXmiFileSystem] Error al guardar archivo XMI:", error);
            // ... (manejo de error)
        }
    }
}