export class FechaEjecucion {
    value: Date;

    constructor(value: Date) {
        this.value = new Date(value.getTime()); // Copia defensiva
        this.validateFormat();
    }

    private validateFormat() {
        if (!(this.value instanceof Date)) {
            throw new Error('FechaEjecucion debe ser una instancia de Date');
        }

        if (isNaN(this.value.getTime())) {
            throw new Error('FechaEjecucion debe ser una fecha válida');
        }
    }

    static ahora(): FechaEjecucion {
        return new FechaEjecucion(new Date());
    }
}