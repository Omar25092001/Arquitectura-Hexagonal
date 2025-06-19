export class Correo {
    value: string;

    constructor(value: string) {
        this.value = value.toLowerCase().trim();
        this.validateFormat();
    }

    private validateFormat() {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(this.value)) {
            throw new Error('El formato del correo electrónico no es válido');
        }
    }
}