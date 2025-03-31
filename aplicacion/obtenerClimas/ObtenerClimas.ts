import { RepositorioClima } from "../../dominio/RepositorioClima";
import {Clima} from "../../dominio/clima/Clima";

export class ObtenerClimas{
    constructor(private repositorioClima: RepositorioClima) {}

    async run(): Promise<Clima[] | null> {
        const climas = await this.repositorioClima.obtenerClimas(); // Usar await aquí
        return climas || [];
    }

}