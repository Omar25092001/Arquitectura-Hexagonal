export type TipoAlgoritmoValor = 'predictivo' | 'optimizacion' | 'clasificacion';

export class TipoAlgoritmo {
    value: TipoAlgoritmoValor;

    constructor(value: TipoAlgoritmoValor) {
        this.value = value;
        this.validateFormat();
    }

    private validateFormat() {
        const tiposValidos: TipoAlgoritmoValor[] = ['predictivo', 'optimizacion', 'clasificacion'];
        
        if (!tiposValidos.includes(this.value)) {
            throw new Error(`TipoAlgoritmo debe ser uno de: ${tiposValidos.join(', ')}`);
        }
    }
}