import { DataPoint, AlgorithmResult } from './types';

export function ejecutarPersistencia(data: DataPoint[], variables: string[]): AlgorithmResult[] {
    console.log('🔄 Ejecutando Persistencia...');
    
    if (data.length === 0) return [];
    
    const results: AlgorithmResult[] = [];
    const currentData = data[0];
    
    variables.forEach(variable => {
        try {
            const currentValue = parseFloat(currentData[variable]) || 0;
            
            if (isNaN(currentValue)) {
                console.warn(`⚠️ Valor no válido para ${variable}`);
                return;
            }

            // Predicciones (valor constante)
            const predictions = [];
            for (let i = 1; i <= 5; i++) {
                predictions.push({
                    step: i,
                    timestamp: `T+${i}`,
                    value: currentValue
                });
            }

            results.push({
                variable: variable,
                algorithm: 'Persistencia',
                predictions: predictions,
                currentValue: currentValue,
                assumption: 'El valor actual se mantiene constante',
                dataPoints: data.length
            });

            console.log(`✅ Persistencia para ${variable}: ${currentValue}`);

        } catch (error) {
            console.error(`❌ Error procesando ${variable}:`, error);
        }
    });

    return results;
}