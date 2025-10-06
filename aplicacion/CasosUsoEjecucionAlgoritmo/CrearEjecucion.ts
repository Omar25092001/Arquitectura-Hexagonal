import { RepositorioEjecucionAlgoritmo } from "../../dominio/RepositorioEjecucionAlgoritmo";
import { EjecucionAlgoritmo } from "../../dominio/ejecucionAlgoritmo/EjecucionAlgoritmo";
import { EjecucionAlgoritmoId } from "../../dominio/ejecucionAlgoritmo/objetosValor/EjecucionAlgoritmoId";
import { TipoAlgoritmo } from "../../dominio/ejecucionAlgoritmo/objetosValor/TipoAlgoritmo";
import { ValoresEntrada } from "../../dominio/ejecucionAlgoritmo/objetosValor/ValoresEntrada";
import { VariableSeleccionada } from "../../dominio/ejecucionAlgoritmo/objetosValor/VariableSeleccionada";
import { FechaEjecucion } from "../../dominio/ejecucionAlgoritmo/objetosValor/FechaEjecucion";
import { TiempoEjecucion } from "../../dominio/ejecucionAlgoritmo/objetosValor/TiempoEjecucion";
import { ResultadoEjecucion } from "../../dominio/ejecucionAlgoritmo/objetosValor/ResultadoEjecucion";
import { UsuarioId } from "../../dominio/usuario/objetosValor/UsuarioId";
import { NombreAlgoritmo } from "../../dominio/algoritmo/objetosValor/NombreAlgoritmo";

export class CrearEjecucion {
    constructor(
        private repositorioEjecucion: RepositorioEjecucionAlgoritmo
    ) {
        
    }

    async run(
        id: string,
        usuarioId: string,
        nombreAlgoritmo: string,
        tipoAlgoritmo: 'predictivo' | 'optimizacion' | 'clasificacion',
        valoresEntrada: number[],
        variableSeleccionada: string,
        fechaEjecucion: Date,
        resultado: number[],
        tiempoEjecucion: number
    ): Promise<void> {

        // Debug temporal
        console.log('🔍 En run method:');
        console.log('crearEjecucion existe?', typeof this.repositorioEjecucion.crearEjecucion);
        console.log('repositorioEjecucion:', this.repositorioEjecucion);

        const ejecucion = new EjecucionAlgoritmo(
            new EjecucionAlgoritmoId(id),
            new UsuarioId(usuarioId),
            new NombreAlgoritmo(nombreAlgoritmo),
            new TipoAlgoritmo(tipoAlgoritmo),
            new ValoresEntrada(valoresEntrada),
            new VariableSeleccionada(variableSeleccionada),
            new FechaEjecucion(fechaEjecucion),
            new ResultadoEjecucion(resultado),
            new TiempoEjecucion(tiempoEjecucion)
        );

        await this.repositorioEjecucion.crearEjecucion(ejecucion);
    }
}