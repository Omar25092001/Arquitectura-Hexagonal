export class RutaArchivo {
    constructor(public readonly value: string) {
        if (!value || value.trim() === '') {
            throw new Error('La ruta del archivo no puede estar vacía');
        }
    }
}