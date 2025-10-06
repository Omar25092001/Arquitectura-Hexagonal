export class EjecucionAlgoritmoId {
    value: string;

    constructor(value: string) {
        this.value = value.trim();
        this.validateFormat();
    }

    private validateFormat() {
        if (!this.value || this.value.length === 0) {
            throw new Error('EjecucionAlgoritmoId no puede estar vacío');
        }
        
        if (this.value.length > 36) {
            throw new Error('EjecucionAlgoritmoId no puede exceder 36 caracteres');
        }
    }

    static create(): EjecucionAlgoritmoId {
        return new EjecucionAlgoritmoId(crypto.randomUUID());
    }
}