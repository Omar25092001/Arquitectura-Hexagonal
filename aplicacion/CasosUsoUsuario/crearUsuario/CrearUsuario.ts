import { RepositorioUsuario } from "../../../dominio/RepositorioUsuario";
import { Usuario } from "../../../dominio/usuario/Usuario";
import { UsuarioId } from "../../../dominio/usuario/objetosValor/UsuarioId";
import { Correo } from "../../../dominio/usuario/objetosValor/Correo";
import { Contrasena } from "../../../dominio/usuario/objetosValor/Constrasena";
import { Nombre } from "../../../dominio/usuario/objetosValor/Nombre";
import { CreatedAt } from "../../../dominio/usuario/objetosValor/CreatedAt";
import { UpdatedAt } from "../../../dominio/usuario/objetosValor/UpdatedAt";
import { CorreoDuplicado } from "../../../dominio/usuario/erroresDominio/CorreoDuplicado";
import { Hasheo } from "../../../dominio/usuario/servicios/Hasheo";
export class CrearUsuario {
    constructor(
        private repositorioUsuario: RepositorioUsuario,// Inyectamos el repositorio de usuario para que pueda ser utilizado en la creación del usuario
        private servicioHasheo: Hasheo // Inyectamos el servicio de hasheo para que pueda ser utilizado en la creación del usuario
    ) {}

   //Instanciaremos un objeto de la clase Usuario y lo guardaremos en el repositorio
   async run(id:string,nombre: string, correo: string, contrasena: string, createdAt:Date, updatedAt:Date): Promise<void> {

        const correoObj = new Correo(correo);
        const contrasenaObj = new Contrasena(contrasena);
        // VERIFICAR QUE EL CORREO NO EXISTA
        const usuarioExistente = await this.repositorioUsuario.obtenerUsuarioPorCorreo(correoObj);
        if (usuarioExistente) {
            throw new CorreoDuplicado(correo); // Lanzamos el error de dominio
        }

        const contrasenaHasheada = await this.servicioHasheo.hashear(contrasenaObj); // Hasheamos la contraseña

        const usuario = new Usuario(
            new UsuarioId(id),
            new Nombre(nombre),
            new Correo(correo),
            new Contrasena(contrasenaHasheada),
            new CreatedAt(createdAt),
            new UpdatedAt(updatedAt)
        ); 

        await this.repositorioUsuario.crearUsuario(usuario);
    }
}