export class SesionXmiDuplicada extends Error {
    constructor(id: string) {
        super(`La sesión XMI con el ID <${id}> ya existe.`);
        this.name = "SesionXmiDuplicada";
    }
}