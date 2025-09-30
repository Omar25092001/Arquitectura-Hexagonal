import { ObtenerClimas } from "../../aplicacion/obtenerClimas/ObtenerClimas"
import { ObtenerClima } from "../../aplicacion/obtenerClima/ObtenerClima"
import { CrearClima } from "../../aplicacion/crearClima/CrearClima"
import { EditarClima } from "../../aplicacion/editarClima/EditarClima"
import { EliminarClima } from "../../aplicacion/eliminarClima/EliminarClima"
import { CrearUsuario } from "../../aplicacion/CasosUsoUsuario/crearUsuario/CrearUsuario";
import { VerificarCredenciales } from "../../aplicacion/verificarCredenciales/VerificarCredenciales";
import {ObtenerUsuarios} from '../../aplicacion/CasosUsoUsuario/obtenerUsuarios/ObtenerUsuarios';
import {EditarUsuario} from '../../aplicacion/CasosUsoUsuario/editarUsuario/EditarUsuario';
import {EditarEstadoUsuario} from '../../aplicacion/CasosUsoUsuario/editarEstadoUsuario/EditarEstadoUsuario';
import { RepositorioClimaPrisma } from "../../infraestructura/backend/adaptadores/RepositorioClimaPrismaPostgre"
import { RepositorioUsuarioPrismaPostgre } from "../../infraestructura/backend/adaptadores/RepositorioUsuarioPrismaPostgre"
import { RepositorioUsuarioInflux } from "../../infraestructura/backend/adaptadores/RepositorioUsuarioInflux"
import { HasheBcrypt } from "../../infraestructura/backend/servicios/HasheBcrypt"
import {TokenJWT} from "../../infraestructura/backend/servicios/TokenJWT";
//El contenedor de servicios es el encargado de instanciar los casos de uso y los repositorios

const usuarioRepositorioPostgre = new RepositorioUsuarioPrismaPostgre; //podemos cambiar el repositorio, ya sea que se trabaje con bases de datos o en memoria sin cambiar el resto del codigo
const climaRepositorio = new RepositorioClimaPrisma; //podemos cambiar el repositorio, ya sea que se trabaje con bases de datos o en memoria sin cambiar el resto del codigo
const usuarioRepositorioInflux = new RepositorioUsuarioInflux; //podemos cambiar el repositorio, ya sea que se trabaje con bases de datos o en memoria sin cambiar el resto del codigo
const servicioHasheo = new HasheBcrypt();
const Token = new TokenJWT();
export const ServiceContainer = {
  clima:{
    obtenerClimas: new ObtenerClimas(climaRepositorio),
    obtenerClima: new ObtenerClima(climaRepositorio),
    crearClima: new CrearClima(climaRepositorio),
    editarClima: new EditarClima(climaRepositorio),
    eliminarClima: new EliminarClima(climaRepositorio)
  },
  usuario:{
    crearUsuario: new CrearUsuario(usuarioRepositorioPostgre, servicioHasheo),
    verificarCredenciales: new VerificarCredenciales(usuarioRepositorioPostgre, servicioHasheo,Token),
    obtenerUsuarios: new ObtenerUsuarios(usuarioRepositorioPostgre),
    editarUsuario: new EditarUsuario(usuarioRepositorioPostgre, servicioHasheo),
    editarEstadoUsuario: new EditarEstadoUsuario(usuarioRepositorioPostgre)
  }
}