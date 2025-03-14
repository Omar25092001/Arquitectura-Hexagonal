import {Clima} from "@/app/dominio/clima/Clima";

export interface ClimaRepositorio{
    obtenerClimas(): Promise<Clima[]>;
    obtenerClima(id: string): Promise<Clima>;
    guardarClima(clima:Clima): Promise<void>; //guardara el clima y si existe lo actualizara
    eliminarClima(id: string): Promise<void>;
}