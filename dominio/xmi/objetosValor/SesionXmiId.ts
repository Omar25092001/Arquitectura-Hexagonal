export class SesionXmiId {
    constructor(public readonly value: string) {
        if (!value || value.trim() === '') {
            throw new Error('El ID del algoritmo no puede estar vacío');
        }
    }
}