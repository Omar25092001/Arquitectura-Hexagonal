
import { RepositorioXmi } from "../../dominio/RepositorioXmi";
import { SesionXMI } from "../../dominio/xmi/SesionXMI";
import { SesionXmiId } from "../../dominio/xmi/objetosValor/SesionXmiId";
import { UsuarioId } from "../../dominio/usuario/objetosValor/UsuarioId"; 
import { RutaArchivo } from "../../dominio/xmi/objetosValor/RutaArchivo";
import { CreatedAt } from "../../dominio/xmi/objetosValor/CreatedAt";

export class GuardarSesionXmi {
    
    // 1. Inyecta el repositorio (igual que 'CrearUsuario')
    constructor(private readonly repositorioXmi: RepositorioXmi) {}

    /**
     * @param usuarioId ID del usuario (primitivo)
     * @param sesionId ID de la sesión (primitivo, generado en el Controlador)
     * @param liveData Los datos crudos (primitivo)
     */
    async run(
        usuarioId: string, 
        sesionId: string, 
        liveData: any[]
    ): Promise<void> {
        
        // 2. Convertir primitivos a VOs (igual que 'CrearUsuario')
        const uId = new UsuarioId(usuarioId);
        const sId = new SesionXmiId(sesionId);
        const fecha = new Date();
        
        // 3. Crear la ruta relativa (lógica de dominio)
        // (Usamos concatenación simple, sin 'path', como en tu ejemplo de CrearSesion)
        const rutaRelativaCarpeta = `${uId.value}/${sId.value}`; 
        
        // 4. Crear la Entidad de Dominio
        const sesion = new SesionXMI(
            sId,
            uId,
            new RutaArchivo(rutaRelativaCarpeta), // Solo la ruta a la carpeta
            new CreatedAt(fecha)
        );

        await this.repositorioXmi.guardarArchivo(
            sesion, 
            "modelo_invernadero.xmi", 
            liveData 
        );
    }
}