import { ObtenerClimas } from "../../aplicacion/obtenerClimas/ObtenerClimas"
import { ObtenerClima } from "../../aplicacion/obtenerClima/ObtenerClima"
import { CrearClima } from "../../aplicacion/crearClima/CrearClima"
import { EditarClima } from "../../aplicacion/editarClima/EditarClima"
import { EliminarClima } from "../../aplicacion/eliminarClima/EliminarClima"
import { RepositorioClimaPrisma } from "../../infraestructura/backend/adaptadores/RepositorioClimaPrismaPostgre"

//El contenedor de servicios es el encargado de instanciar los casos de uso y los repositorios
 
const climaRepositorio = new RepositorioClimaPrisma(); //podemos cambiar el repositorio, ya sea que se trabaje con bases de datos o en memoria sin cambiar el resto del codigo

export const ServiceContainer = {
  clima: {
        obtenerClimas: new ObtenerClimas(climaRepositorio),
        obtenerClima: new ObtenerClima(climaRepositorio),
        crearClima: new CrearClima(climaRepositorio),
        editarClima: new EditarClima(climaRepositorio),
        eliminarClima: new EliminarClima(climaRepositorio),
    },
    
}