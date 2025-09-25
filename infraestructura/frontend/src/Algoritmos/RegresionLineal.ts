import { DataPoint, AlgorithmResult } from './types';

export function ejecutarRegresionLineal(data: DataPoint[], variables: string[]): AlgorithmResult[] {
    console.log('📈 Ejecutando Regresión Lineal...');
    console.log(`📊 Procesando ${data.length} registros para variables: ${variables.join(', ')}`);
    
    const results: AlgorithmResult[] = [];
    
    variables.forEach(variable => {
        try {
            // Extraer valores numéricos de la variable
            const values = data.map((d, index) => ({
                x: index, // Usar índice como variable independiente (tiempo)
                y: parseFloat(d[variable]) || 0
            })).filter(point => !isNaN(point.y) && isFinite(point.y));

            if (values.length < 2) {
                console.warn(`⚠️ No hay suficientes datos válidos para ${variable} (${values.length} puntos)`);
                return;
            }

            // Calcular regresión lineal simple: y = mx + b
            const n = values.length;
            const sumX = values.reduce((acc, p) => acc + p.x, 0);
            const sumY = values.reduce((acc, p) => acc + p.y, 0);
            const sumXY = values.reduce((acc, p) => acc + (p.x * p.y), 0);
            const sumXX = values.reduce((acc, p) => acc + (p.x * p.x), 0);

            const denominator = n * sumXX - sumX * sumX;
            
            if (denominator === 0) {
                console.warn(`⚠️ No se puede calcular regresión para ${variable} (denominador cero)`);
                return;
            }

            const m = (n * sumXY - sumX * sumY) / denominator;
            const b = (sumY - m * sumX) / n;

            // Generar predicciones para los próximos 5 pasos
            const predictions = [];
            for (let i = 1; i <= 5; i++) {
                const nextX = values.length + i - 1;
                const predictedY = m * nextX + b;
                predictions.push({
                    step: i,
                    timestamp: `T+${i}`,
                    value: Math.round(predictedY * 100) / 100
                });
            }

            // Determinar tendencia
            let trend = 'estable';
            if (Math.abs(m) > 0.01) {
                trend = m > 0 ? 'ascendente' : 'descendente';
            }

            results.push({
                variable: variable,
                algorithm: 'Regresión Lineal',
                predictions: predictions,
                equation: `y = ${Math.round(m * 1000) / 1000}x + ${Math.round(b * 100) / 100}`,
                slope: Math.round(m * 1000) / 1000,
                intercept: Math.round(b * 100) / 100,
                dataPoints: values.length,
                lastValue: values[values.length - 1].y,
                trend: trend
            });

            console.log(`✅ Regresión calculada para ${variable}: pendiente=${m.toFixed(3)}, tendencia=${trend}`);

        } catch (error) {
            console.error(`❌ Error procesando ${variable}:`, error);
        }
    });

    console.log(`✅ Regresión Lineal completada. ${results.length} variables procesadas.`);
    return results;
}