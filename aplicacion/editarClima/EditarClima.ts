import { Clima } from "../../dominio/clima/Clima";
import { Ciudad } from "../../dominio/clima/objetosValor/Ciudad";
import { ClimaId } from "../../dominio/clima/objetosValor/ClimaId";
import { Estado } from "../../dominio/clima/objetosValor/Estado";
import { Humedad } from "../../dominio/clima/objetosValor/Humedad";
import { Temperatura } from "../../dominio/clima/objetosValor/Temperatura";
import { VelocidadViento } from "../../dominio/clima/objetosValor/VelocidadViento";
import { CreatedAt } from "../../dominio/clima/objetosValor/CreatedAt";
import { RepositorioClima } from "../../dominio/RepositorioClima";

export class EditarClima{
    constructor(private repositorioClima: RepositorioClima){}

    async run(id: number, ciudad: string, temperatura: number, humedad: number, velocidadViento: number, estado: string, createdAt: Date) : Promise<void>{
       const clima = new Clima(
            new ClimaId(id),
            new Ciudad(ciudad),
            new Temperatura(temperatura),
            new Humedad(humedad),
            new VelocidadViento(velocidadViento),
            new Estado(estado),
            new CreatedAt(createdAt)
       );

       await this.repositorioClima.editarClima(clima);
    }
}