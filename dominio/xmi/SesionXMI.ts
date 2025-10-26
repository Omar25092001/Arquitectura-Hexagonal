import { SesionXmiId } from "./objetosValor/SesionXmiId";
import { UsuarioId } from "../usuario/objetosValor/UsuarioId";
import { RutaArchivo } from "./objetosValor/RutaArchivo";
import { CreatedAt } from "./objetosValor/CreatedAt";

// Entidad de Dominio SesionXMI
export class SesionXMI {
    id: SesionXmiId;
    usuarioId: UsuarioId;
    rutaArchivo: RutaArchivo;
    fechaCreacion: CreatedAt;

    constructor(
        id: SesionXmiId,
        usuarioId: UsuarioId,
        rutaArchivo: RutaArchivo,
        fechaCreacion: CreatedAt
    ) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.rutaArchivo = rutaArchivo;
        this.fechaCreacion = fechaCreacion;
    }

    public mapToPrimitive() {
        return {
            id: this.id.value,
            usuarioId: this.usuarioId.value,
            rutaArchivo: this.rutaArchivo.value,
            fechaCreacion: this.fechaCreacion.value
        };
    }
}