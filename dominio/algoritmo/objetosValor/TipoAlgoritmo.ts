export type TipoAlgoritmoValue = 'predictivo' | 'optimizacion' | 'clasificacion';

export class TipoAlgoritmo {
    readonly value: TipoAlgoritmoValue;

    constructor(value: TipoAlgoritmoValue) {
        this.validar(value);
        this.value = value;
    }

    private validar(value: TipoAlgoritmoValue): void {
        if (!value || value.trim() === '') {
            throw new Error('El tipo de algoritmo no puede estar vacío');
        }

        const tiposValidos: TipoAlgoritmoValue[] = ['predictivo', 'optimizacion', 'clasificacion'];
        if (!tiposValidos.includes(value)) {
            throw new Error(`Tipo de algoritmo inválido. Debe ser: ${tiposValidos.join(', ')}`);
        }
    }

    // Cantidad mínima de datos necesarios según el tipo
    obtenerMinimoDatos(): number {
        switch (this.value) {
            case 'predictivo':
                return 5; // Necesita histórico para predecir
            case 'optimizacion':
                return 10; // Necesita más datos para optimizar
            case 'clasificacion':
                return 1; // Solo necesita el dato actual
            default:
                return 1;
        }
    }

    // Descripción del tipo
    obtenerDescripcion(): string {
        const descripciones: Record<TipoAlgoritmoValue, string> = {
            'predictivo': 'Predice valores futuros basándose en datos históricos',
            'optimizacion': 'Encuentra la mejor solución a partir de múltiples datos',
            'clasificacion': 'Clasifica o categoriza un dato'
        };
        return descripciones[this.value];
    }

    // Método para comparar tipos
    esIgual(otro: TipoAlgoritmo): boolean {
        return this.value === otro.value;
    }
}