export class CredencialesInvalidas extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = "CredencialesInvalidas";
    }
}