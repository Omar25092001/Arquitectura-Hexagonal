//Definir cada objeto de valor del dominio Clima nos ayudara en la semantica del codigo y en la facilidad de lectura.
//Tambien nos permitira asignar validaciones a cada tipo de dato.
import { UsuarioId } from "./objetosValor/UsuarioId";
import { Nombre } from "./objetosValor/Nombre";
import { Correo } from "./objetosValor/Correo";
import { Contrasena } from "./objetosValor/Constrasena";
import { CreatedAt } from "./objetosValor/CreatedAt";
import { UpdatedAt } from "./objetosValor/UpdatedAt";

//Entidad de Dominio Clima
export class Usuario {
    id: UsuarioId;
    nombre: Nombre;
    correo: Correo;
    contrasena: Contrasena;
    createdAt: CreatedAt;
    updatedAt: UpdatedAt;

    constructor(id: UsuarioId, nombre: Nombre, correo: Correo,contrasena:Contrasena, createdAt: CreatedAt, updatedAt: UpdatedAt) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.contrasena = contrasena;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public mapToPrimitive() { //Esto se utiliza para que a la hora de devolver el clima desde la base de datos, no se devuelva como objeto desde el repositorio
        return {
            id: this.id.value,
            nombre: this.nombre.value,
            correo: this.correo.value,
            createdAt: this.createdAt.value,
            updatedAt: this.updatedAt.value
        };
    }

}
