import { RepositorioUsuario } from "../../../dominio/RepositorioUsuario";
import { Usuario } from "../../../dominio/usuario/Usuario";

export class ObtenerUsuarios {
    constructor(
        private repositorioUsuario: RepositorioUsuario // Inyectamos el repositorio de usuario
    ) {}

    // Obtenemos todos los usuarios sin filtros
    async run(): Promise<Usuario[]> {
        try {
            const usuarios = await this.repositorioUsuario.obtenerUsuarios();
            
            if (!usuarios) {
                return [];
            }
            
            return usuarios;
        } catch (error) {
            console.error('Error en ObtenerUsuarios:', error);
            throw new Error('Error al obtener la lista de usuarios');
        }
    }
}