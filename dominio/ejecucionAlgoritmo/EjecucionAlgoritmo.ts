import { EjecucionAlgoritmoId } from "./objetosValor/EjecucionAlgoritmoId";
import { TipoAlgoritmo } from "./objetosValor/TipoAlgoritmo";
import { ValoresEntrada } from "./objetosValor/ValoresEntrada";
import { VariableSeleccionada } from "./objetosValor/VariableSeleccionada";
import { ResultadoEjecucion } from "./objetosValor/ResultadoEjecucion";
import { FechaEjecucion } from "./objetosValor/FechaEjecucion";
import { TiempoEjecucion } from "./objetosValor/TiempoEjecucion";
import { UsuarioId } from "../usuario/objetosValor/UsuarioId";
import { NombreAlgoritmo } from "../algoritmo/objetosValor/NombreAlgoritmo";

// Entidad de Dominio EjecucionAlgoritmo
export class EjecucionAlgoritmo {
    id: EjecucionAlgoritmoId;
    usuarioId: UsuarioId;
    nombreAlgoritmo: NombreAlgoritmo;
    tipoAlgoritmo: TipoAlgoritmo;
    valoresEntrada: ValoresEntrada;
    variableSeleccionada: VariableSeleccionada;
    resultado: ResultadoEjecucion;
    fechaEjecucion: FechaEjecucion;
    tiempoEjecucion: TiempoEjecucion;

    constructor(
        id: EjecucionAlgoritmoId,
        usuarioId: UsuarioId,
        nombreAlgoritmo: NombreAlgoritmo,
        tipoAlgoritmo: TipoAlgoritmo,
        valoresEntrada: ValoresEntrada,
        variableSeleccionada: VariableSeleccionada,
        fechaEjecucion: FechaEjecucion,
        resultado: ResultadoEjecucion,
        tiempoEjecucion: TiempoEjecucion
    ) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.nombreAlgoritmo = nombreAlgoritmo;
        this.tipoAlgoritmo = tipoAlgoritmo;
        this.valoresEntrada = valoresEntrada;
        this.variableSeleccionada = variableSeleccionada;
        this.fechaEjecucion = fechaEjecucion;
        this.resultado = resultado;
        this.tiempoEjecucion = tiempoEjecucion;
    }

    

   

    public mapToPrimitive() {
        return {
            id: this.id.value,
            usuarioId: this.usuarioId.value,
            nombreAlgoritmo: this.nombreAlgoritmo.value,
            tipoAlgoritmo: this.tipoAlgoritmo.value,
            valoresEntrada: this.valoresEntrada.value,
            variableSeleccionada: this.variableSeleccionada.value,
            resultado: this.resultado.value || null,
            fechaEjecucion: this.fechaEjecucion.value,
            tiempoEjecucionMs: this.tiempoEjecucion?.value || null
        };
    }
}

