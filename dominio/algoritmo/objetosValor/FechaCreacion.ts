export class FechaCreacion {
    constructor(public readonly value: Date) {
        if (!(value instanceof Date) || isNaN(value.getTime())) {
            throw new Error('La fecha de creación debe ser válida');
        }
    }
}