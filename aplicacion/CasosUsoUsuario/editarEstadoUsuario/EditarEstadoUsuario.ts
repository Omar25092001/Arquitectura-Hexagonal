import { RepositorioUsuario } from "../../../dominio/RepositorioUsuario";
import { UsuarioId } from "../../../dominio/usuario/objetosValor/UsuarioId";
import { Estado } from "../../../dominio/usuario/objetosValor/Estado";
import { UpdatedAt } from "../../../dominio/usuario/objetosValor/UpdatedAt";
import { Usuario } from "../../../dominio/usuario/Usuario";

export class EditarEstadoUsuario {
    constructor(private repositorioUsuario: RepositorioUsuario) {}

    async run(id: string, estado: boolean, updatedAt:Date): Promise<void> {
        const usuarioActual = await this.repositorioUsuario.obtenerUsuario(new UsuarioId(id));
        if (!usuarioActual) throw new Error("Usuario no encontrado");

        const usuarioActualizado = new Usuario(
            usuarioActual.id,
            usuarioActual.nombre,
            usuarioActual.correo,
            new Estado(estado),
            usuarioActual.contrasena,
            usuarioActual.createdAt,
            new UpdatedAt(new Date())
        );

        await this.repositorioUsuario.editarUsuario(usuarioActualizado);
    }
}