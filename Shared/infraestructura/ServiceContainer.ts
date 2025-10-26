//Usuario
import { CrearUsuario } from "../../aplicacion/CasosUsoUsuario/crearUsuario/CrearUsuario";
import { VerificarCredenciales } from "../../aplicacion/verificarCredenciales/VerificarCredenciales";
import {ObtenerUsuarios} from '../../aplicacion/CasosUsoUsuario/obtenerUsuarios/ObtenerUsuarios';
import {EditarUsuario} from '../../aplicacion/CasosUsoUsuario/editarUsuario/EditarUsuario';
import {EditarEstadoUsuario} from '../../aplicacion/CasosUsoUsuario/editarEstadoUsuario/EditarEstadoUsuario';
import {EditarPrimeraVezUsuario} from '../../aplicacion/CasosUsoUsuario/editarPrimeraVezUsuario/EditarPrimeraVezUsuario';
import { ObtenerAlgoritmosUsuario } from "../../aplicacion/CasosUsoAlgoritmo/ObtenerAlgoritmosUsuario";

//Algoritmo
import { EjecutarAlgoritmo } from "../../aplicacion/CasosUsoAlgoritmo/EjecutarAlgoritmo";
import { EjecutorModeloPython } from "../../infraestructura/backend/adaptadores/EjecutorModeloPython";

//Ejecucion Algoritmo
import {CrearEjecucion} from "../../aplicacion/CasosUsoEjecucionAlgoritmo/CrearEjecucion"
import { ObtenerEjecuciones } from "../../aplicacion/CasosUsoEjecucionAlgoritmo/ObtenerEjecuciones"

//XMI
import { CrearSesionXmi } from "../../aplicacion/CasosUsoXmi/CrearSesionXmi";

//Repositorios
import { RepositorioEjecucionAlgoritmoPrismaPostgre } from "../../infraestructura/backend/adaptadores/RepositorioEjecucionAlgoritmoPrismaPostgre"
import { RepositorioUsuarioPrismaPostgre } from "../../infraestructura/backend/adaptadores/RepositorioUsuarioPrismaPostgre"
import { RepositorioUsuarioInflux } from "../../infraestructura/backend/adaptadores/RepositorioUsuarioInflux"
import { RepositorioAlgoritmoFileSystem } from "../../infraestructura/backend/adaptadores/RepositorioAlgoritmoFileSystem"
import { RepositorioXmiFileSystem } from "../../infraestructura/backend/adaptadores/RepositorioXmiFileSystem";
import { HasheBcrypt } from "../../infraestructura/backend/servicios/HasheBcrypt"
import {TokenJWT} from "../../infraestructura/backend/servicios/TokenJWT";
//El contenedor de servicios es el encargado de instanciar los casos de uso y los repositorios

const usuarioRepositorioPostgre = new RepositorioUsuarioPrismaPostgre; //podemos cambiar el repositorio, ya sea que se trabaje con bases de datos o en memoria sin cambiar el resto del codigo
const ejecucionRepositorio = new RepositorioEjecucionAlgoritmoPrismaPostgre; //Implementar el repositorio de ejecucion de algoritmo cuando se tenga claro la persistencia a utilizar
const usuarioRepositorioInflux = new RepositorioUsuarioInflux; //podemos cambiar el repositorio, ya sea que se trabaje con bases de datos o en memoria sin cambiar el resto del codigo
const algoritmoRepositorio = new RepositorioAlgoritmoFileSystem; //podemos cambiar el repositorio, ya sea que se trabaje con bases de datos o en memoria sin cambiar el resto del codigo
const xmiRepositorio = new RepositorioXmiFileSystem();
const servicioHasheo = new HasheBcrypt();
const Token = new TokenJWT();
export const ServiceContainer = {
  usuario:{
    crearUsuario: new CrearUsuario(usuarioRepositorioPostgre, servicioHasheo),
    verificarCredenciales: new VerificarCredenciales(usuarioRepositorioPostgre, servicioHasheo,Token),
    obtenerUsuarios: new ObtenerUsuarios(usuarioRepositorioPostgre),
    editarUsuario: new EditarUsuario(usuarioRepositorioPostgre, servicioHasheo),
    editarEstadoUsuario: new EditarEstadoUsuario(usuarioRepositorioPostgre),
    editarPrimeraVezUsuario: new EditarPrimeraVezUsuario(usuarioRepositorioPostgre)
  },
  algoritmo: {
    obtenerAlgoritmosUsuario: new ObtenerAlgoritmosUsuario(algoritmoRepositorio),
    ejecutarAlgoritmo: new EjecutarAlgoritmo(new EjecutorModeloPython())
  },
  ejecucionAlgoritmo: {
    crearEjecucion: new CrearEjecucion(ejecucionRepositorio),
    obtenerEjecuciones: new ObtenerEjecuciones(ejecucionRepositorio)
  },
  xmi: {
    crearSesionXmi: new CrearSesionXmi(xmiRepositorio)
  }
}