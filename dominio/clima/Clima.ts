//Definir cada objeto de valor del dominio Clima nos ayudara en la semantica del codigo y en la facilidad de lectura.
//Tambien nos permitira asignar validaciones a cada tipo de dato.
import { ClimaId } from "./objetosValor/ClimaId";
import { Ciudad } from "./objetosValor/Ciudad";
import { Temperatura } from "./objetosValor/Temperatura";
import { Humedad } from "./objetosValor/Humedad";
import { VelocidadViento } from "./objetosValor/VelocidadViento";
import { Estado } from "./objetosValor/Estado";
import { CreatedAt } from "./objetosValor/CreatedAt";
//Entidad de Dominio Clima
export class Clima {
   id: ClimaId;
   ciudad: Ciudad;
   temperatura: Temperatura;
   humedad: Humedad;
   velocidadViento: VelocidadViento;
   estado: Estado;
   createdAt: CreatedAt;

   constructor( id: ClimaId, ciudad: Ciudad, temperatura: Temperatura, humedad: Humedad, velocidadViento: VelocidadViento, estado: Estado, createdAt: CreatedAt){
      this.id = id;
      this.ciudad = ciudad;
      this.temperatura = temperatura;
      this.humedad = humedad;
      this.velocidadViento = velocidadViento;
      this.estado = estado;
      this.createdAt = createdAt;
   }

   public mapToPrimitive(){ //Esto se utiliza para que a la hora de devolver el clima desde la base de datos, no se devuelva como objeto desde el repositorio
      return {
         id: this.id.value,
         ciudad: this.ciudad.value,
         temperatura: this.temperatura.value,
         humedad: this.humedad.value,
         velocidadViento: this.velocidadViento.value,
         estado: this.estado.value,
         createdAt: this.createdAt.value,
      };
   }
  
}
