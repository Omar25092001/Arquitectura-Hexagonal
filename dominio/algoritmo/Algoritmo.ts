// Definir cada objeto de valor del dominio Algoritmo nos ayudará en la semántica del código y en la facilidad de lectura.
// También nos permitirá asignar validaciones a cada tipo de dato.
import { AlgoritmoId } from "./objetosValor/AlgoritmoId";
import { NombreAlgoritmo } from "./objetosValor/NombreAlgoritmo";
import { UsuarioId } from "../usuario/objetosValor/UsuarioId";
import { RutaArchivo } from "./objetosValor/RutaArchivo";
import { FechaCreacion } from "./objetosValor/FechaCreacion";

// Entidad de Dominio Algoritmo
export class Algoritmo {
    id: AlgoritmoId;
    nombre: NombreAlgoritmo;
    usuarioId: UsuarioId;
    rutaArchivo: RutaArchivo;
    fechaCreacion: FechaCreacion;

    constructor(
        id: AlgoritmoId,
        nombre: NombreAlgoritmo,
        usuarioId: UsuarioId,
        rutaArchivo: RutaArchivo,
        fechaCreacion: FechaCreacion
    ) {
        this.id = id;
        this.nombre = nombre;
        this.usuarioId = usuarioId;
        this.rutaArchivo = rutaArchivo;
        this.fechaCreacion = fechaCreacion;
    }

    public mapToPrimitive() {
        // Esto se utiliza para que a la hora de devolver el algoritmo desde la base de datos,
        // no se devuelva como objeto desde el repositorio
        return {
            id: this.id.value,
            nombre: this.nombre.value,
            usuarioId: this.usuarioId.value,
            rutaArchivo: this.rutaArchivo.value,
            fechaCreacion: this.fechaCreacion.value
        };
    }
}