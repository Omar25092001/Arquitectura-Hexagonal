import { ClimaId } from "../../dominio/clima/objetosValor/ClimaId";
import { RepositorioClima } from "../../dominio/RepositorioClima";

export class EliminarClima{
    constructor(private repositorioClima: RepositorioClima){}

    async run(id: number): Promise<void>{
        await this.repositorioClima.eliminarClima(new ClimaId(id));
    }

}