export class ValoresEntrada {
    value: number[];

    constructor(value: number[]) {
        this.value = [...value]; // Copia defensiva
        this.validateFormat();
    }

    private validateFormat() {
        if (!Array.isArray(this.value)) {
            throw new Error('ValoresEntrada debe ser un arreglo');
        }

        if (this.value.length === 0) {
            throw new Error('ValoresEntrada no puede estar vacío');
        }

        if (this.value.length > 1000) {
            throw new Error('ValoresEntrada no puede exceder 1000 elementos');
        }

        const tieneValoresInvalidos = this.value.some(v => 
            typeof v !== 'number' || isNaN(v) || !isFinite(v)
        );

        if (tieneValoresInvalidos) {
            throw new Error('Todos los ValoresEntrada deben ser números válidos');
        }
    }
}