export class VariableSeleccionada {
    value: string;

    constructor(value: string) {
        this.value = value.trim();
        this.validateFormat();
    }

    private validateFormat() {
        if (!this.value || this.value.length === 0) {
            throw new Error('VariableSeleccionada no puede estar vacía');
        }

        if (this.value.length > 100) {
            throw new Error('VariableSeleccionada no puede exceder 100 caracteres');
        }

    }
}