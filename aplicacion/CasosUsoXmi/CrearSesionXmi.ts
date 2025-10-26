// Eliminamos la importación de 'SistemaArchivos'
import { RepositorioXmi } from "../../dominio/RepositorioXmi";
import { SesionXMI } from "../../dominio/xmi/SesionXMI";
import { SesionXmiId } from "../../dominio/xmi/objetosValor/SesionXmiId";
import { UsuarioId } from "../../dominio/usuario/objetosValor/UsuarioId"; // Ajusta ruta
import { RutaArchivo } from "../../dominio/xmi/objetosValor/RutaArchivo";
import { CreatedAt } from "../../dominio/xmi/objetosValor/CreatedAt";
import { SesionXmiDuplicada } from "../../dominio/xmi/erroresDominio/SesionXmiDuplicada";

export class CrearSesionXmi {
    
    constructor(
        // ¡Solo inyectamos un repositorio!
        private readonly repositorioXmi: RepositorioXmi
    ) {}

    async run(id: string, usuarioId: string, fechaCreacion: Date): Promise<void> {

        // 1. Convertir primitivos a VOs
        const idObj = new SesionXmiId(id);
        const usuarioIdObj = new UsuarioId(usuarioId);
        
        // 2. Regla de Negocio: Verificar duplicados
        // Pasamos ambos IDs para que el repositorio pueda construir la ruta
        const sesionExistente = await this.repositorioXmi.buscarPorId(idObj, usuarioIdObj);
        if (sesionExistente) {
            throw new SesionXmiDuplicada(id);
        }

        const fechaObj = new CreatedAt(fechaCreacion);

        // 3. Lógica de Negocio: Construir la ruta (¡NUEVA ESTRUCTURA!)
        // La ruta ahora es: "id_usuario/id_sesion.xmi"
        const nombreArchivo = `${idObj.value}.xmi`;
        const rutaString = `${usuarioIdObj.value}/${nombreArchivo}`;
        const rutaObj = new RutaArchivo(rutaString);

        // 4. Crear la Entidad de Dominio
        const nuevaSesion = new SesionXMI(
            idObj,
            usuarioIdObj,
            rutaObj,
            fechaObj
        );

        // 5. Persistir (crear el archivo) usando el puerto
        // El repositorio se encargará de copiar la plantilla
        await this.repositorioXmi.crear(nuevaSesion);
    }
}