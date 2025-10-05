import { Algoritmo } from './algoritmo/Algoritmo';

export interface RepositorioAlgoritmo {
    obtenerAlgoritmosPorUsuario(usuarioId: string): Promise<Algoritmo[]>;
    guardarAlgoritmo(algoritmo: Algoritmo): Promise<void>;
    eliminarAlgoritmo(algoritmoId: string): Promise<void>;
}