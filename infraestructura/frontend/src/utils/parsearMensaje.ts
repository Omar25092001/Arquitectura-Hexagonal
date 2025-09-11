export interface ParsedData {
    timestamp: string;
    [key: string]: any;
}


export const parsearMensaje = (mensaje: string, formato?: string): ParsedData => {
    const timestamp = new Date().toLocaleTimeString();
    let parsedData: ParsedData = { timestamp };

    try {
        // Detectar y parsear JSON
        if (formato === 'json' || mensaje.trim().startsWith('{') || mensaje.trim().startsWith('[')) {
            const jsonData = JSON.parse(mensaje);

            const flattenObject = (obj: any, prefix = '') => {
                Object.keys(obj).forEach((key) => {
                    const value = obj[key];
                    const fullKey = prefix ? `${prefix}.${key}` : key;

                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        flattenObject(value, fullKey);
                    } else {
                        let displayName = fullKey;
                        // Remover prefijo 'data.' si existe
                        if (displayName.startsWith('data.')) {
                            displayName = displayName.replace('data.', '');
                        }
                        parsedData[displayName] = value;
                    }
                });
            };

            if (Array.isArray(jsonData)) {
                if (jsonData.length > 0) {
                    flattenObject(jsonData[0]);
                }
            } else {
                flattenObject(jsonData);
            }
        } else {
            // Formato MQTT/Custom (variable=valor|variable=valor)
            const pares = mensaje.split('|').filter(par => par.trim() !== '');

            pares.forEach((par) => {
                const [nombre, valor] = par.split('=');
                if (nombre && valor !== undefined) {
                    const nombreLimpio = nombre.trim();
                    const valorLimpio = valor.trim();

                    // Convertir tipos de datos
                    const numeroParseado = parseFloat(valorLimpio);
                    if (!isNaN(numeroParseado) && isFinite(numeroParseado)) {
                        parsedData[nombreLimpio] = numeroParseado;
                    } else if (valorLimpio.toLowerCase() === 'true' || valorLimpio.toLowerCase() === 'false') {
                        parsedData[nombreLimpio] = valorLimpio.toLowerCase() === 'true';
                    } else {
                        parsedData[nombreLimpio] = valorLimpio;
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error parseando mensaje:', error);
        console.error('Mensaje original:', mensaje);
    }

    return parsedData;
};

