export interface SistemaArchivos {
    /**
     * Copia la plantilla XMI a un nuevo destino.
     * La implementación debe crear los directorios necesarios.
     * @param rutaDestinoRelativa La ruta relativa (ej: "uuid_userid/modelo_sesion.xmi")
     */
    copiarPlantilla(rutaDestinoRelativa: string): Promise<void>;
}