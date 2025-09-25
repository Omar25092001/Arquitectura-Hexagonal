export { ejecutarRegresionLineal } from './RegresionLineal';
export { ejecutarMediaMovil } from './MediaMovil';
export { ejecutarPersistencia } from './Persistencia';
export * from './types';

// Función principal
import { DataPoint, AlgorithmResult } from './types';
import { ejecutarRegresionLineal } from './RegresionLineal';
import { ejecutarMediaMovil } from './MediaMovil';
import { ejecutarPersistencia } from './Persistencia';

export function ejecutarAlgoritmo(algorithm: string, data: DataPoint[], variables: string[]): AlgorithmResult[] {
    console.log(`🤖 Ejecutando ${algorithm} con ${data.length} registros`);

    // Filtrar solo variables numéricas
    const numericVariables = variables.filter(variable => {
        const sampleValue = data[0]?.[variable];
        return sampleValue !== undefined && 
               sampleValue !== null && 
               sampleValue !== '' &&
               !isNaN(parseFloat(sampleValue));
    });

    if (numericVariables.length === 0) {
        console.warn('⚠️ No hay variables numéricas válidas');
        return [];
    }

    switch (algorithm) {
        case 'prediccion1':
        case 'regresion-lineal':
            return ejecutarRegresionLineal(data, numericVariables);
            
        case 'prediccion2':
        case 'media-movil':
            return ejecutarMediaMovil(data, numericVariables);
            
        case 'persistencia':
            return ejecutarPersistencia(data, numericVariables);
            
        default:
            console.warn(`⚠️ Algoritmo no implementado: ${algorithm}`);
            return [];
    }
}