import { RepositorioClima } from "@/app/dominio/RepositorioClima";
import { Clima } from "@/app/dominio/clima/Clima";
import { Ciudad } from "@/app/dominio/clima/objetosValor/Ciudad";
import { ClimaId } from "@/app/dominio/clima/objetosValor/ClimaId";
import { Estado } from "@/app/dominio/clima/objetosValor/Estado";
import { Humedad } from "@/app/dominio/clima/objetosValor/Humedad";
import { Temperatura } from "@/app/dominio/clima/objetosValor/Temperatura";
import { VelocidadViento } from "@/app/dominio/clima/objetosValor/VelocidadViento";
import { CreatedAt } from "@/app/dominio/clima/objetosValor/CreatedAt";

export class CrearClima {
    constructor(private repositorioClima: RepositorioClima) {}

   //Instanciaremos un objeto de la clase Clima y lo guardaremos en el repositorio
   async run(id:number, ciudad:string, temperatura:number, humedad:number, velocidadViento:number, estado:string, createdAt: Date ): Promise<void> {
        const clima = new Clima(
            new ClimaId(id),
            new Ciudad(ciudad),
            new Temperatura(temperatura),
            new Humedad(humedad),
            new VelocidadViento(velocidadViento),
            new Estado(estado),
            new CreatedAt(createdAt)
        ); 

        return this.repositorioClima.crearClima(clima);
    }
}