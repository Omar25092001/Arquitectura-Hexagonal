import {Clima} from "./clima/Clima";
import { ClimaId } from "./clima/objetosValor/ClimaId";

//Repositorio Clima seria el puerto de la arquitectura hexagonal
//El repositorio es la interfaz que define los métodos para interactuar con la base de datos

export interface RepositorioClima{
    crearClima(clima: Clima): Promise<void>;
    obtenerClimas(): Promise<Clima[] | null>;
    obtenerClima(id: ClimaId): Promise<Clima | null>;
    editarClima(clima:Clima): Promise<void>;
    eliminarClima(id: ClimaId): Promise<void>;
}