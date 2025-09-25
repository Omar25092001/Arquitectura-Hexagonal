import { DataPoint, AlgorithmResult } from './types';

export function ejecutarMediaMovil(data: DataPoint[], variables: string[]): AlgorithmResult[] {
    console.log('📊 Ejecutando Media Móvil...');
    console.log(`📈 Procesando ${data.length} registros para variables: ${variables.join(', ')}`);
    
    const results: AlgorithmResult[] = [];
    const windowSize = Math.min(5, data.length);
    
    variables.forEach(variable => {
        try {
            const values = data.map(d => parseFloat(d[variable]) || 0)
                              .filter(val => !isNaN(val) && isFinite(val));

            if (values.length < windowSize) {
                console.warn(`⚠️ No hay suficientes datos para ${variable}`);
                return;
            }

            // Calcular última media móvil
            const lastWindow = values.slice(-windowSize);
            const average = lastWindow.reduce((acc, val) => acc + val, 0) / windowSize;

            // Predicciones
            const predictions = [];
            for (let i = 1; i <= 5; i++) {
                predictions.push({
                    step: i,
                    timestamp: `T+${i}`,
                    value: Math.round(average * 100) / 100
                });
            }

            results.push({
                variable: variable,
                algorithm: 'Media Móvil',
                predictions: predictions,
                windowSize: windowSize,
                averageValue: Math.round(average * 100) / 100,
                lastValue: values[values.length - 1],
                dataPoints: values.length
            });

            console.log(`✅ Media móvil para ${variable}: ${average.toFixed(2)}`);

        } catch (error) {
            console.error(`❌ Error procesando ${variable}:`, error);
        }
    });

    return results;
}