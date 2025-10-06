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

        // Validar que solo contenga caracteres válidos para nombres de columna
        const caracteresValidos = /^[a-zA-Z0-9_-]+$/;
        if (!caracteresValidos.test(this.value)) {
            throw new Error('VariableSeleccionada solo puede contener letras, números, guiones y guiones bajos');
        }
    }
}