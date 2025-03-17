import {Clima} from "@/app/dominio/clima/Clima";
import { ClimaId } from "./clima/objetosValor/ClimaId";

export interface RepositorioClima{
    crearClima(clima: Clima): Promise<void>;
    obtenerClimas(): Promise<Clima[]>;
    obtenerClima(id: ClimaId): Promise<Clima>;
    editarClima(clima:Clima): Promise<void>;
    eliminarClima(id: ClimaId): Promise<void>;
}