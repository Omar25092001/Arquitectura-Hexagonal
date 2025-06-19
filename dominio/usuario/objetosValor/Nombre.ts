export class Nombre {
    value: string;
    constructor(value: string){
        this.value = value;
        this.sizeIsValid();
    }

    private sizeIsValid(){
        if (this.value.length < 0 && this.value.length >= 30){
            throw new Error('El nombre del debe tener entre 1 y 30 caracteres');
        }
    }
}