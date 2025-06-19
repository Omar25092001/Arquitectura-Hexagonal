export class Contrasena {
    value: string;

    constructor(value: string) {
        this.value = value;
        this.validateSecurityRules();
    }

    private validateSecurityRules() {
        if (!this.value || this.value.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
        }
        
        if (!/\d/.test(this.value)) {
            throw new Error('La contraseña debe contener al menos un número');
        }
        
        if (!/[A-Z]/.test(this.value)) {
            throw new Error('La contraseña debe contener al menos una letra mayúscula');
        }
        
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.value)) {
            throw new Error('La contraseña debe contener al menos un carácter especial');
        }
    }
}