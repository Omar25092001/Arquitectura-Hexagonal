import { EjecucionAlgoritmo } from "./ejecucionAlgoritmo/EjecucionAlgoritmo";

export interface RepositorioEjecucionAlgoritmo {
    crearEjecucion(ejecucion: EjecucionAlgoritmo): Promise<void>;
    obtenerEjecuciones(): Promise<EjecucionAlgoritmo[] | null>;
}