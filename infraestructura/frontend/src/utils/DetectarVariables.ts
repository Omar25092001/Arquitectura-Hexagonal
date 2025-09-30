import mqtt from 'mqtt';
import * as ExcelJS from 'exceljs';
import { InfluxDB } from '@influxdata/influxdb-client';
import { parsearMensaje, type ParsedData } from '../utils/parsearMensaje';

// Helper para convertir datos parseados a variables
export function convertirParsedDataAVariables(parsedData: ParsedData): any[] {
    const variables: any[] = [];
    let id = 1;
    Object.entries(parsedData).forEach(([key, value]) => {
        if (key === 'timestamp') return;
        let dataType: string;
        if (typeof value === 'number') {
            dataType = Number.isInteger(value) ? 'Numérico (Entero)' : 'Numérico (Decimal)';
        } else if (typeof value === 'boolean') {
            dataType = 'Booleano';
        } else if (Array.isArray(value)) {
            dataType = 'Array';
            value = JSON.stringify(value);
        } else {
            dataType = 'Texto';
        }
        variables.push({
            id: id++,
            name: key,
            dataType,
            current: value,
            originalValue: String(value),
            fullPath: key
        });
    });
    return variables;
}

export async function detectarVariablesMQTT(config: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('No se recibieron mensajes en 30 segundos'));
        }, 30000);

        const client = mqtt.connect(`ws://${config.ip}`, {
            username: config.username || undefined,
            password: config.password || undefined,
        });

        client.on('connect', () => {
            client.subscribe(config.topic, (err: any) => {
                if (err) {
                    clearTimeout(timeout);
                    client.end();
                    reject(new Error('Error suscribiéndose al tópico: ' + err.message));
                }
            });
        });

        client.on('message', (topic: any, message: any) => {
            clearTimeout(timeout);
            if (topic !== config.topic) return;
            try {
                const parsedData = parsearMensaje(message.toString());
                const variablesDetectadas = convertirParsedDataAVariables(parsedData);
                client.end();
                if (variablesDetectadas.length === 0) {
                    reject(new Error('No se detectaron variables válidas en el mensaje.'));
                } else {
                    resolve(variablesDetectadas);
                }
            } catch (err: any) {
                client.end();
                reject(new Error('Error parseando mensaje: ' + err.message));
            }
        });

        client.on('error', (err: any) => {
            clearTimeout(timeout);
            client.end();
            reject(new Error('Error de conexión: ' + err.message));
        });
    });
}

export async function detectarVariablesHTTP(config: any): Promise<any[]> {
    const requestOptions: RequestInit = {
        method: config.method || 'GET',
        headers: { 'Content-Type': 'application/json', ...config.headers }
    };
    if (['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase()) && config.body) {
        requestOptions.body = config.body;
    }
    const response = await fetch(config.url, requestOptions);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();
    console.log('Respuesta HTTP recibida:', responseText);
    const formato = contentType.includes('application/json') ? 'json' : 'text';
    const parsedData = parsearMensaje(responseText, formato);
    const variablesDetectadas = convertirParsedDataAVariables(parsedData);
    console.log('Variables detectadas HTTP:', variablesDetectadas);
    if (variablesDetectadas.length === 0) {
        throw new Error('No se detectaron variables válidas en la respuesta HTTP.');
    }
    return variablesDetectadas;
}

export async function detectarVariablesWebSocket(config: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('No se recibieron mensajes en 30 segundos'));
        }, 30000);

        const ws = new WebSocket(config.url);

        ws.onopen = () => {
            if (config.useToken && config.token) {
                ws.send(JSON.stringify({ token: config.token }));
            }
        };

        ws.onmessage = (event: any) => {
            clearTimeout(timeout);
            try {
                const parsedData = parsearMensaje(event.data);
                const variablesDetectadas = convertirParsedDataAVariables(parsedData);
                ws.close();
                if (variablesDetectadas.length === 0) {
                    reject(new Error('No se detectaron variables válidas en el mensaje.'));
                } else {
                    resolve(variablesDetectadas);
                }
            } catch (err: any) {
                ws.close();
                reject(new Error('Error parseando mensaje: ' + err.message));
            }
        };

        ws.onerror = () => {
            clearTimeout(timeout);
            ws.close();
            reject(new Error('Error de conexión WebSocket'));
        };

        ws.onclose = (event: any) => {
            if (!event.wasClean) {
                clearTimeout(timeout);
                reject(new Error('Conexión WebSocket cerrada inesperadamente'));
            }
        };
    });
}

export async function detectarVariablesExcel(config: any, selectedFile: File): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e: any) => {
            try {
                const buffer = e.target.result as ArrayBuffer;
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(buffer);
                let worksheet;
                if (config.useSheetName && config.sheetName) {
                    worksheet = workbook.getWorksheet(config.sheetName);
                    if (!worksheet) {
                        reject(new Error(`La hoja "${config.sheetName}" no existe.`));
                        return;
                    }
                } else {
                    const sheetIndex = parseInt(config.sheetIndex) || 0;
                    worksheet = workbook.worksheets[sheetIndex];
                }
                const firstRow = worksheet.getRow(1);
                const allHeaders: string[] = [];
                firstRow.eachCell((cell, colNumber) => {
                    const headerValue = cell.value ? String(cell.value).trim() : `Columna_${colNumber}`;
                    if (headerValue) allHeaders.push(headerValue);
                });
                // Filtrar columnas de fecha
                const dateColumnNames = ['date', 'fecha', 'timestamp', 'time', 'datetime'];
                const filteredHeaders = allHeaders.filter(header => {
                    const lowerHeader = header.toLowerCase().trim();
                    return !dateColumnNames.some(dateCol =>
                        lowerHeader === dateCol || lowerHeader.includes(dateCol)
                    );
                });
                if (filteredHeaders.length === 0) {
                    reject(new Error('No se encontraron variables después de filtrar las columnas de fecha.'));
                    return;
                }
                const variablesDetectadas = filteredHeaders.map((header, index) => ({
                    id: index + 1,
                    name: header,
                    dataType: 'Texto',
                    current: `Variable ${index + 1}`,
                    originalValue: header,
                    fullPath: header,
                    columnIndex: index
                }));
                resolve(variablesDetectadas);
            } catch (error: any) {
                reject(new Error(`Error procesando Excel: ${error.message}`));
            }
        };
        reader.onerror = () => reject(new Error('Error leyendo el archivo'));
        reader.readAsArrayBuffer(selectedFile);
    });
}
export async function detectarVariablesInflux(config: any): Promise<any[]> {
    try {
        const client = new InfluxDB({
            url: config.url,
            token: config.token,
        });
        const queryApi = client.getQueryApi(config.org);

        if (config.useMeasurement && config.measurement) {
            // CASO 1: Measurement específico
            const fieldsQuery = `
                import "influxdata/influxdb/schema"
                schema.measurementFieldKeys(
                    bucket: "${config.bucket}",
                    measurement: "${config.measurement}"
                )
            `;
            const fieldRows = await queryApi.collectRows(fieldsQuery);
            if (fieldRows.length === 0) {
                throw new Error(`No se encontraron fields en el measurement "${config.measurement}"`);
            }
            const dataQuery = `
                from(bucket: "${config.bucket}")
                |> range(start: -24h)
                |> filter(fn: (r) => r._measurement == "${config.measurement}")
                |> last()
                |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
            `;
            const dataRows = await queryApi.collectRows(dataQuery);

            const fieldTypes: { [key: string]: string } = {};
            if (dataRows.length > 0) {
                const sampleRow = dataRows[0] as any;
                fieldRows.forEach((fieldRow: any) => {
                    const fieldName = fieldRow._value;
                    const fieldValue = sampleRow[fieldName];
                    if (fieldValue !== undefined && fieldValue !== null) {
                        if (typeof fieldValue === 'number') {
                            fieldTypes[fieldName] = Number.isInteger(fieldValue) ? 'Numérico (Entero)' : 'Numérico (Decimal)';
                        } else if (typeof fieldValue === 'boolean') {
                            fieldTypes[fieldName] = 'Booleano';
                        } else if (typeof fieldValue === 'string') {
                            const numValue = parseFloat(fieldValue);
                            if (!isNaN(numValue) && isFinite(numValue)) {
                                fieldTypes[fieldName] = 'Numérico (String)';
                            } else {
                                fieldTypes[fieldName] = 'Texto';
                            }
                        } else {
                            fieldTypes[fieldName] = 'Desconocido';
                        }
                    } else {
                        fieldTypes[fieldName] = 'Sin datos';
                    }
                });
            }

            const variablesDetectadas = fieldRows.map((fieldRow: any, index: number) => {
                const fieldName = fieldRow._value;
                const dataType = fieldTypes[fieldName] || 'Desconocido';
                let currentValue = 'Sin datos';
                if (dataRows.length > 0) {
                    const sampleRow = dataRows[0] as any;
                    const value = sampleRow[fieldName];
                    if (value !== undefined && value !== null) {
                        currentValue = String(value);
                    }
                }
                return {
                    id: index + 1,
                    name: fieldName,
                    dataType: dataType,
                    current: currentValue,
                    originalValue: fieldName,
                    fullPath: `${config.measurement}.${fieldName}`,
                    measurement: config.measurement,
                    bucket: config.bucket
                };
            });

            return variablesDetectadas;

        } else {
            // CASO 2: Explorar todo el bucket
            const measurementsQuery = `
                import "influxdata/influxdb/schema"
                schema.measurements(bucket: "${config.bucket}")
            `;
            const measurementRows = await queryApi.collectRows(measurementsQuery);
            if (measurementRows.length === 0) {
                throw new Error(`No se encontraron measurements en el bucket "${config.bucket}"`);
            }
            const allVariables: any[] = [];
            let variableId = 1;
            for (const measurementRow of measurementRows) {
                const measurement = (measurementRow as any)._value;
                try {
                    const fieldsQuery = `
                        import "influxdata/influxdb/schema"
                        schema.measurementFieldKeys(
                            bucket: "${config.bucket}",
                            measurement: "${measurement}"
                        )
                    `;
                    const fieldRows = await queryApi.collectRows(fieldsQuery);
                    const dataQuery = `
                        from(bucket: "${config.bucket}")
                        |> range(start: -24h)
                        |> filter(fn: (r) => r._measurement == "${measurement}")
                        |> last()
                        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
                    `;
                    const dataRows = await queryApi.collectRows(dataQuery);

                    fieldRows.forEach((fieldRow: any) => {
                        const fieldName = fieldRow._value;
                        let dataType = 'Sin datos';
                        let currentValue = 'Sin datos';
                        if (dataRows.length > 0) {
                            const sampleRow = dataRows[0] as any;
                            const value = sampleRow[fieldName];
                            if (value !== undefined && value !== null) {
                                currentValue = String(value);
                                if (typeof value === 'number') {
                                    dataType = Number.isInteger(value) ? 'Numérico (Entero)' : 'Numérico (Decimal)';
                                } else if (typeof value === 'boolean') {
                                    dataType = 'Booleano';
                                } else if (typeof value === 'string') {
                                    const numValue = parseFloat(value);
                                    if (!isNaN(numValue) && isFinite(numValue)) {
                                        dataType = 'Numérico (String)';
                                    } else {
                                        dataType = 'Texto';
                                    }
                                } else {
                                    dataType = 'Desconocido';
                                }
                            }
                        }
                        allVariables.push({
                            id: variableId++,
                            name: `${measurement}.${fieldName}`,
                            dataType: dataType,
                            current: currentValue,
                            originalValue: fieldName,
                            fullPath: `${measurement}.${fieldName}`,
                            measurement: measurement,
                            field: fieldName,
                            bucket: config.bucket
                        });
                    });
                } catch (fieldError) {
                    // Continúa con el siguiente measurement
                }
            }
            if (allVariables.length === 0) {
                throw new Error(`No se encontraron variables en ningún measurement del bucket "${config.bucket}"`);
            }
            return allVariables;
        }
    } catch (error: any) {
        throw new Error(error.message || 'Error detectando variables InfluxDB');
    }
}