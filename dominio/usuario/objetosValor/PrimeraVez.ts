export class PrimeraVez {
    value: boolean;
    constructor(value: boolean) {
        this.value = value;
        this.validateValue();
    }
    private validateValue() {
        if (typeof this.value !== 'boolean') {
            throw new Error('El valor debe ser un booleano');
        }
    }
}