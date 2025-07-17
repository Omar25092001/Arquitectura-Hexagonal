import { Contrasena } from "../objetosValor/Constrasena";
export interface Hasheo {
    hashear(contrasena: Contrasena): Promise<string>;
    verificar(contrasenaPlana: string, contrasenaHasheada: string): Promise<boolean>;
}