import { RepositorioUsuario } from "../../../dominio/RepositorioUsuario";
import { Usuario } from "../../../dominio/usuario/Usuario";
import { UsuarioId } from "../../../dominio/usuario/objetosValor/UsuarioId";
import { Correo } from "../../../dominio/usuario/objetosValor/Correo";
import { Contrasena } from "../../../dominio/usuario/objetosValor/Constrasena";
import { Nombre } from "../../../dominio/usuario/objetosValor/Nombre";
import { CreatedAt } from "../../../dominio/usuario/objetosValor/CreatedAt";
import { UpdatedAt } from "../../../dominio/usuario/objetosValor/UpdatedAt";

export class CrearUsuario {
    constructor(private repositorioUsuario: RepositorioUsuario) {}

   //Instanciaremos un objeto de la clase Usuario y lo guardaremos en el repositorio
   async run(id:number,nombre: string, correo: string, contrasena: string, createdAt:Date, updatedAt:Date): Promise<void> {
        const usuario = new Usuario(
            new UsuarioId(id),
            new Nombre(nombre),
            new Correo(correo),
            new Contrasena(contrasena),
            new CreatedAt(createdAt),
            new UpdatedAt(updatedAt)
        ); 

        await this.repositorioUsuario.crearUsuario(usuario);
    }
}