export class NombreAlgoritmo {
    constructor(public readonly value: string) {
        if (!value || value.trim() === '') {
            throw new Error('El nombre del algoritmo no puede estar vacío');
        }
    }
}