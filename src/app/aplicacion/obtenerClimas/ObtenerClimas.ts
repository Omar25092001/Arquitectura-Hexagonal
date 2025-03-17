import { RepositorioClima } from "@/app/dominio/RepositorioClima";
import {Clima} from "@/app/dominio/clima/Clima";

export class ObtenerClima{
    constructor(private repositorioClima: RepositorioClima) {}

    async run(): Promise<Clima[]> {
        return this.repositorioClima.obtenerClimas();
    }

}