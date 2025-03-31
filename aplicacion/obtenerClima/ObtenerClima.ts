import {Clima} from "../../dominio/clima/Clima";
import { ClimaId } from "../../dominio/clima/objetosValor/ClimaId";
import { RepositorioClima } from "../../dominio/RepositorioClima";
import { ClimaNoEncontrado } from "../../dominio/clima/erroresDominio/ClimaNoEncontrado";

export class ObtenerClima{
    constructor(private repositorioClima: RepositorioClima) {}

    async run(id:number): Promise<Clima> {
        const clima = await this.repositorioClima.obtenerClima(new ClimaId(id));

        //Utilizamos este metodo de error en caso de que no se encuentre el clima, para que el controlador pueda manejarlo y no de un error 500 como respuesta
        if(!clima){
            throw  new ClimaNoEncontrado("Clima no encontrado");
        }

        return clima;
    }
}