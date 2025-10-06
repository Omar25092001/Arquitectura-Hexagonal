export class TiempoEjecucion {
    value: number;

    constructor(value: number) {
        this.value = value;
        this.validateFormat();
    }

    private validateFormat() {
        if (typeof this.value !== 'number' || isNaN(this.value) || !isFinite(this.value)) {
            throw new Error('TiempoEjecucion debe ser un número válido');
        }

        if (this.value < 0) {
            throw new Error('TiempoEjecucion no puede ser negativo');
        }

        if (this.value > 300) { // 5 minutos máximo en segundos
            throw new Error('TiempoEjecucion no puede exceder 300 segundos (5 minutos)');
        }
    }
}