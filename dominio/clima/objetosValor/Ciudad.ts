export class Ciudad {
    value: string;
    constructor(value: string){
        this.value = value;
        this.sizeIsValid();
    }

    private sizeIsValid(){
        if (this.value.length < 0 && this.value.length >= 50){
            throw new Error('El nombre de la ciudad debe tener entre 1 y 50 caracteres');
        }
    }
}