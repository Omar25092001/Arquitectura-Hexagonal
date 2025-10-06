export class ResultadoEjecucion {
    value: number[];

    constructor(value: number[]) {
        this.value = value;
        this.validateFormat();
    }

    private validateFormat() {
        if (this.value === null || this.value === undefined) {
            throw new Error('ResultadoEjecucion no puede ser null o undefined');
        }

        if (!Array.isArray(this.value)) {
            throw new Error('ResultadoEjecucion debe ser un array');
        }

        if (this.value.length === 0) {
            throw new Error('ResultadoEjecucion no puede estar vacío');
        }

        if (!this.value.every(item => typeof item === 'number' && !isNaN(item))) {
            throw new Error('ResultadoEjecucion debe contener solo números válidos');
        }
    }
}