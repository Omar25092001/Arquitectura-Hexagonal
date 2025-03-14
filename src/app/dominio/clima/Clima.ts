//Definir cada objeto de valor del dominio Clima nos ayudara en la semantica del codigo y en la facilidad de lectura.
//Tambien nos permitira asignar validaciones a cada tipo de dato.
import { ClimaId } from "./objetosValor/ClimaId";
import { Ciudad } from "./objetosValor/Ciudad";
import { Temperatura } from "./objetosValor/Temperatura";
import { Humedad } from "./objetosValor/Humedad";
import { VelocidadViento } from "./objetosValor/VelocidadViento";
import { Estado } from "./objetosValor/Estado";
//Entidad de Dominio Clima
export class Clima {
   id: ClimaId;
   ciudad: Ciudad;
   temperatura: Temperatura;
   humedad: Humedad;
   velocidadViento: VelocidadViento;
   estado: Estado;

   constructor( id: ClimaId, ciudad: Ciudad, temperatura: Temperatura, humedad: Humedad, velocidadViento: VelocidadViento, estado: Estado){
      this.id = id;
      this.ciudad = ciudad;
      this.temperatura = temperatura;
      this.humedad = humedad;
      this.velocidadViento = velocidadViento;
      this.estado = estado;
   }
  
}
