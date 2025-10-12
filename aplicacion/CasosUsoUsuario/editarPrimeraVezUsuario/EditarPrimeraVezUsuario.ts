import { RepositorioUsuario } from "../../../dominio/RepositorioUsuario";
import { UsuarioId } from "../../../dominio/usuario/objetosValor/UsuarioId";
import { PrimeraVez } from "../../../dominio/usuario/objetosValor/PrimeraVez";
import { UpdatedAt } from "../../../dominio/usuario/objetosValor/UpdatedAt";
import { Usuario } from "../../../dominio/usuario/Usuario";

export class EditarPrimeraVezUsuario {
    constructor(private repositorioUsuario: RepositorioUsuario) {}

    async run(id: string, primeraVez: boolean, updatedAt:Date): Promise<void> {
        const usuarioActual = await this.repositorioUsuario.obtenerUsuario(new UsuarioId(id));
        if (!usuarioActual) throw new Error("Usuario no encontrado");

        const usuarioActualizado = new Usuario(
            usuarioActual.id,
            usuarioActual.nombre,
            usuarioActual.correo,
            usuarioActual.estado,
            usuarioActual.contrasena,
            new PrimeraVez(primeraVez),
            usuarioActual.createdAt,
            new UpdatedAt(updatedAt)
        );

        await this.repositorioUsuario.editarUsuario(usuarioActualizado);
    }
}