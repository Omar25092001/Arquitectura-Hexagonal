import { Usuario } from "../Usuario";

export interface Token {
    generar(usuario: Usuario): Promise<string>;
    verificar(token: string): Promise<any>;
    decodificar(token: string): any;
}