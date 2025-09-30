import { RepositorioUsuario } from "../../../dominio/RepositorioUsuario";
import { Usuario } from "../../../dominio/usuario/Usuario";
import { UsuarioId } from "../../../dominio/usuario/objetosValor/UsuarioId";
import { Correo } from "../../../dominio/usuario/objetosValor/Correo";
import { Estado } from "../../../dominio/usuario/objetosValor/Estado";
import { Contrasena } from "../../../dominio/usuario/objetosValor/Constrasena";
import { Nombre } from "../../../dominio/usuario/objetosValor/Nombre";
import { UpdatedAt } from "../../../dominio/usuario/objetosValor/UpdatedAt";
import { Hasheo } from "../../../dominio/usuario/servicios/Hasheo";

export class EditarUsuario {
    constructor(
        private repositorioUsuario: RepositorioUsuario,
        private servicioHasheo: Hasheo
    ) {}

    async run(
        id: string,
        nombre: string,
        correo: string,
        estado: boolean,
        contrasena: string,
        updatedAt: Date
    ): Promise<void> {
        // Verifica si el usuario existe
        const usuarioExistente = await this.repositorioUsuario.obtenerUsuario(new UsuarioId(id));
        if (!usuarioExistente) {
            throw new Error("Usuario no encontrado");
        }

        // Hashea la nueva contraseña si se proporciona
        const contrasenaObj = new Contrasena(contrasena);
        const contrasenaHasheada = await this.servicioHasheo.hashear(contrasenaObj);

        // Crea el usuario actualizado
        const usuarioActualizado = new Usuario(
            new UsuarioId(id),
            new Nombre(nombre),
            new Correo(correo),
            new Estado(estado),
            new Contrasena(contrasenaHasheada),
            usuarioExistente.createdAt, // Mantiene la fecha de creación original
            new UpdatedAt(updatedAt)
        );

        await this.repositorioUsuario.editarUsuario(usuarioActualizado);
    }
}