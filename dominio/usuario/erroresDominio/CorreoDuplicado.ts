export class CorreoDuplicado extends Error {
    constructor(correo: string) {
        super(`Ya existe un usuario con el correo: ${correo}`);
        this.name = 'CorreoDuplicado';
    }
}