import { ClimaId } from "@/app/dominio/clima/objetosValor/ClimaId";
import { RepositorioClima } from "@/app/dominio/RepositorioClima";

export class eliminarClima{
    constructor(private repositorioClima: RepositorioClima){}

    async run(id: number): Promise<void>{
        return this.repositorioClima.eliminarClima(new ClimaId(id));
    }

}