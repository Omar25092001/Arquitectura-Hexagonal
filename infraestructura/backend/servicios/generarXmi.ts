// Ruta: src/utils/XmiGenerator.ts

/**
 * Genera el contenido del archivo XMI dinámicamente.
 * @param liveData Datos recolectados (ordenados cronológicamente)
 * ej: [{Sensor_A: 10, Sensor_B: 50}, {Sensor_A: 11, Sensor_B: 51}]
 */
export function generarXmi(
    liveData: any[]
): string {
    
    if (!liveData || liveData.length === 0) {
        throw new Error("No hay datos (liveData) para generar el XMI.");
    }

    // 1. Extraer los nombres de las variables (claves) del primer registro
    //    (ej: ['Sensor_A', 'Sensor_B'])
    //    Filtramos 'timestamp' y cualquier clave interna que empiece con '_'
    const variables = Object.keys(liveData[0]).filter(key => 
        key !== 'timestamp' && !key.startsWith('_')
    );

    // 2. Transponer los datos (agrupar por variable)
    //    (ej: { Sensor_A: [10, 11], Sensor_B: [50, 51] })
    const datosPorSensor: Record<string, number[]> = {};
    for (const varName of variables) {
        datosPorSensor[varName] = [];
        for (const dataPoint of liveData) {
            // Solo añadir si el dato existe en ese punto
            if (dataPoint[varName] !== undefined && dataPoint[varName] !== null) {
                datosPorSensor[varName].push(Number(dataPoint[varName]));
            }
        }
    }

    // 3. Construir los bloques <sensores>
    const bloquesSensores = Object.keys(datosPorSensor).map(varName => {
        
        // Ignorar sensores que no tuvieron datos
        if(datosPorSensor[varName].length === 0) return ''; 

        const mediciones = datosPorSensor[varName]
            .map(valor => `    <mediciones valor="${valor.toFixed(1)}"/>`)
            .join('\n');
        
        // ¡LÓGICA DINÁMICA!
        // El 'tipo' es el propio nombre de la variable (la clave).
        // ej: <sensores tipo="Sensor_A">
        const tipoAtributo = `tipo="${varName}"`; 
        
        return `  <sensores ${tipoAtributo}>\n${mediciones}\n  </sensores>`;
    }).join('\n'); // Asegura que haya un salto de línea entre cada bloque de sensor

    // 4. Construir el XMI final
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<invernadero:Invernadero xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:invernadero="http://org.example.invernadero">
  <ubicacion/>
${bloquesSensores}
</invernadero:Invernadero>`;

    return xml;
}