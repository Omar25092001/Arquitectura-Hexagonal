import { RepositorioEjecucionAlgoritmo } from "../../dominio/RepositorioEjecucionAlgoritmo";
import { EjecucionAlgoritmo } from "../../dominio/ejecucionAlgoritmo/EjecucionAlgoritmo";

export class ObtenerEjecuciones {
    constructor(
        private repositorioEjecucion: RepositorioEjecucionAlgoritmo // Inyectamos el repositorio de ejecución para obtener las ejecuciones
    ) {}

    // Obtenemos todas las ejecuciones desde el repositorio
    async run(): Promise<EjecucionAlgoritmo[] | null> {
        return await this.repositorioEjecucion.obtenerEjecuciones();
    }
}