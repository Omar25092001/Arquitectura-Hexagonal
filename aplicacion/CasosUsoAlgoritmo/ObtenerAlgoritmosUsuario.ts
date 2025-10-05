import { RepositorioAlgoritmo } from '../../dominio/RepositorioAlgoritmo';
import { Algoritmo } from '../../dominio/algoritmo/Algoritmo';

export class ObtenerAlgoritmosUsuario {
    constructor(private repositorioAlgoritmo: RepositorioAlgoritmo) {}

    async run(usuarioId: string): Promise<Algoritmo[]> {
        if (!usuarioId || usuarioId.trim() === '') {
            throw new Error('El ID de usuario es requerido');
        }
        return await this.repositorioAlgoritmo.obtenerAlgoritmosPorUsuario(usuarioId);
    }
}