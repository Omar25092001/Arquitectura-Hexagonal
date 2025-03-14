export class Estado{
    value: string;
    constructor(value: string){
        this.value = value;
        this.isValid();
    }

    private opcoinesValidas = ['soleado', 'nublado', 'lluvioso', 'tormenta', 'nieve', 'viento', 'neblina'];

    private isValid(){
        if (!this.opcoinesValidas.includes(this.value)){
            throw new Error('El estado del clima no es valido');
        }
    }
}