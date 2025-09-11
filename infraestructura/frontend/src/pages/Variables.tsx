import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { CheckCircle, ArrowRight, Check, X, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mqtt from 'mqtt';
import * as ExcelJS from 'exceljs';
import { InfluxDB } from '@influxdata/influxdb-client';
import { parsearMensaje, type ParsedData } from '../utils/parsearMensaje';

export default function Variables() {
    const navigate = useNavigate();

    const [dataSourceConfig, setDataSourceConfig] = useState<any>(null);
    const [variables, setVariables] = useState<any[]>([]);
    const [selectedVariables, setSelectedVariables] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showFileModal, setShowFileModal] = useState(false);

    // PASOS DE NAVEGACIÓN
    const steps = [
        { id: 1, title: 'Fuentes de Datos', active: true },
        { id: 2, title: 'Variables', active: true },
        { id: 3, title: 'Algoritmo', active: false },
        { id: 4, title: 'Ejecución', active: false }
    ];

    const handleSiguientePaso = () => {
        if (selectedVariables.length === 0) return;
        // Guardar variables seleccionadas en localStorage
        localStorage.setItem('selectedVariables', JSON.stringify(variables.filter(v => selectedVariables.includes(v.id))));
        navigate('/usuario/algoritmo');
    }

    // Cargar configuración
    useEffect(() => {
        const savedConfig = localStorage.getItem('dataSourceConfig');
        if (!savedConfig) {
            navigate('/fuente-datos');
            return;
        }

        const config = JSON.parse(savedConfig);
        if (!['mqtt', 'http', 'websocket', 'file', 'influx'].includes(config.protocol)) {
            console.log('protocolo no soportado:', config.protocol)
            navigate('/fuente-datos');
            return;
        }

        setDataSourceConfig(config);
        if (config.needsFile) {
            setShowFileModal(true);
        }
    }, [navigate]);

    // Función helper para convertir ParsedData a formato de variables
    const convertirParsedDataAVariables = (parsedData: ParsedData): any[] => {
        const variables: any[] = [];
        let id = 1;

        Object.entries(parsedData).forEach(([key, value]) => {
            if (key === 'timestamp') return; // Saltar timestamp

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
                dataType: dataType,
                current: value,
                originalValue: String(value),
                fullPath: key
            });
        });

        return variables;
    };

    // Detectar variables MQTT
    const detectarVariablesMQTT = async () => {
        if (!dataSourceConfig?.config) return;

        setIsLoading(true);
        setError(null);
        setSelectedVariables([]);

        try {
            const config = dataSourceConfig.config;

            const variables = await new Promise<any[]>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('No se recibieron mensajes en 30 segundos'));
                }, 30000);

                const client = mqtt.connect(`ws://${config.ip}`, {
                    username: config.username || undefined,
                    password: config.password || undefined,
                });

                client.on('connect', () => {
                    client.subscribe(config.topic, (err) => {
                        if (err) {
                            clearTimeout(timeout);
                            client.end();
                            reject(new Error('Error suscribiéndose al tópico: ' + err.message));
                        } else {
                            console.log(' Esperando mensajes en formato: variable=valor|variable=valor|...');
                        }
                    });
                });

                client.on('message', (topic, message) => {
                    clearTimeout(timeout);
                    const mensajeRecibido = message.toString();
                    if (topic !== config.topic) {
                        console.log(` Mensaje de tópico diferente ignorado: ${topic} (esperado: ${config.topic})`);
                        return;
                    }

                    try {
                        // Usar la función importada
                        const parsedData = parsearMensaje(mensajeRecibido);
                        const variablesDetectadas = convertirParsedDataAVariables(parsedData);

                        if (variablesDetectadas.length === 0) {
                            client.end();
                            reject(new Error('No se detectaron variables válidas en el mensaje. Verifica el formato: variable=valor|variable=valor|...'));
                            return;
                        }

                        client.end();
                        resolve(variablesDetectadas);

                    } catch (parseError: any) {
                        client.end();
                        reject(new Error('Error parseando mensaje: ' + parseError.message));
                    }
                });

                client.on('error', (err) => {
                    clearTimeout(timeout);
                    client.end();
                    reject(new Error('Error de conexión: ' + err.message));
                });
            });

            setVariables(variables);
            setLastFetchTime(new Date());
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const detectarVariablesHTTP = async () => {
        setIsLoading(true);
        setError(null);
        const config = dataSourceConfig.config;

        try {
            const requestOptions: RequestInit = {
                method: config.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...config.headers
                }
            };

            // Agregar body si es POST/PUT
            if (['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase()) && config.body) {
                requestOptions.body = config.body;
            }

            const response = await fetch(config.url, requestOptions);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type') || '';
            const responseText = await response.text();

            // Determinar formato basado en Content-Type
            const formato = contentType.includes('application/json') ? 'json' : 'text';

            // Usar la función importada
            const parsedData = parsearMensaje(responseText, formato);
            const variablesDetectadas = convertirParsedDataAVariables(parsedData);

            console.log(`Total variables detectadas:`, variablesDetectadas);

            if (variablesDetectadas.length === 0) {
                throw new Error('No se detectaron variables válidas en la respuesta HTTP.\n\nFormatos soportados:\n• JSON: {"variable": valor}\n• Texto: variable=valor|variable=valor|...');
            }

            setVariables(variablesDetectadas);
            setLastFetchTime(new Date());

        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const detectarVariablesWebSocket = async () => {
        if (!dataSourceConfig?.config) return;

        setIsLoading(true);
        setError(null);
        setSelectedVariables([]);

        const config = dataSourceConfig.config;

        try {
            const variables = await new Promise<any[]>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('No se recibieron mensajes en 30 segundos'));
                }, 30000);

                const ws = new WebSocket(config.url);

                ws.onopen = () => {
                    // Enviar token si está configurado
                    if (config.useToken && config.token) {
                        ws.send(JSON.stringify({ token: config.token }));
                        console.log(' Token enviado');
                    }

                    console.log('Esperando mensajes WebSocket...');
                };

                ws.onmessage = (event) => {
                    clearTimeout(timeout);
                    const mensajeRecibido = event.data;
                    console.log('MENSAJE WEBSOCKET RECIBIDO:', mensajeRecibido);

                    try {
                        // Usar la función importada
                        const parsedData = parsearMensaje(mensajeRecibido);
                        const variablesDetectadas = convertirParsedDataAVariables(parsedData);

                        if (variablesDetectadas.length === 0) {
                            ws.close();
                            reject(new Error('No se detectaron variables válidas en el mensaje. Verifica el formato: {"variable": valor} o variable=valor|variable=valor|...'));
                            return;
                        }

                        ws.close();
                        resolve(variablesDetectadas);

                    } catch (parseError: any) {
                        ws.close();
                        reject(new Error('Error parseando mensaje: ' + parseError.message));
                    }
                };

                ws.onerror = () => {
                    clearTimeout(timeout);
                    ws.close();
                    reject(new Error('Error de conexión WebSocket'));
                };

                ws.onclose = (event) => {
                    if (!event.wasClean) {
                        clearTimeout(timeout);
                        reject(new Error('Conexión WebSocket cerrada inesperadamente'));
                    }
                };
            });

            setVariables(variables);
            setLastFetchTime(new Date());

        } catch (error: any) {
            console.error('Error en WebSocket:', error);
            setError(`Error en WebSocket: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validar que sea Excel
            const isExcelFile = /\.xlsx?$/.test(file.name);
            if (!isExcelFile) {
                setError('Por favor selecciona un archivo Excel (.xlsx o .xls)');
                return;
            }

            setSelectedFile(file);
            setShowFileModal(false);
            setError(null);
            console.log('Archivo seleccionado:', file.name);
        }
    };

    //  FUNCIÓN ACTUALIZADA PARA DETECTAR VARIABLES EXCEL Y FILTRAR "Date"
    const detectarVariablesExcel = async () => {
        if (!dataSourceConfig?.config) return;

        // VERIFICAR QUE TENGAMOS ARCHIVO
        if (!selectedFile) {
            setError('Por favor selecciona un archivo Excel primero.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSelectedVariables([]);

        const config = dataSourceConfig.config;
        console.log('Procesando archivo Excel:', selectedFile.name);

        try {
            const headers = await new Promise<string[]>((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = async (e) => {
                    try {
                        const buffer = e.target?.result as ArrayBuffer;
                        const workbook = new ExcelJS.Workbook();

                        await workbook.xlsx.load(buffer);
                        console.log('Hojas disponibles:', workbook.worksheets.map(ws => ws.name));

                        let worksheet;
                        if (config.useSheetName && config.sheetName) {
                            worksheet = workbook.getWorksheet(config.sheetName);
                            if (!worksheet) {
                                const availableSheets = workbook.worksheets.map(ws => ws.name).join(', ');
                                reject(new Error(`La hoja "${config.sheetName}" no existe. Hojas disponibles: ${availableSheets}`));
                                return;
                            }
                            console.log(`Usando hoja: "${config.sheetName}"`);
                        } else {
                            const sheetIndex = parseInt(config.sheetIndex) || 0;
                            if (sheetIndex >= workbook.worksheets.length) {
                                reject(new Error(`El índice ${sheetIndex} está fuera del rango. El archivo tiene ${workbook.worksheets.length} hojas`));
                                return;
                            }
                            worksheet = workbook.worksheets[sheetIndex];
                            console.log(`Usando hoja índice ${sheetIndex}: "${worksheet.name}"`);
                        }

                        if (worksheet.rowCount === 0) {
                            reject(new Error('La hoja seleccionada está vacía'));
                            return;
                        }

                        const firstRow = worksheet.getRow(1);
                        const allHeaders: string[] = [];

                        firstRow.eachCell((cell, colNumber) => {
                            const headerValue = cell.value ? String(cell.value).trim() : `Columna_${colNumber}`;
                            if (headerValue) {
                                allHeaders.push(headerValue);
                            }
                        });

                        if (allHeaders.length === 0) {
                            for (let col = 1; col <= (firstRow.cellCount || 10); col++) {
                                const cell = firstRow.getCell(col);
                                const headerValue = cell.value ? String(cell.value).trim() : `Columna_${col}`;
                                allHeaders.push(headerValue);
                            }
                        }

                        console.log('Todas las cabeceras detectadas:', allHeaders);

                        if (allHeaders.length === 0) {
                            reject(new Error('No se encontraron cabeceras en la primera fila de la hoja'));
                            return;
                        }

                        //  FILTRAR LA COLUMNA "Date" Y VARIANTES
                        const dateColumnNames = ['date', 'fecha', 'timestamp', 'time', 'datetime'];
                        const filteredHeaders = allHeaders.filter(header => {
                            const lowerHeader = header.toLowerCase().trim();
                            const isDateColumn = dateColumnNames.some(dateCol =>
                                lowerHeader === dateCol ||
                                lowerHeader.includes(dateCol)
                            );

                            if (isDateColumn) {
                                console.log(`Columna de fecha filtrada: "${header}"`);
                                return false; // Excluir columnas de fecha
                            }
                            return true; // Incluir columnas que no son de fecha
                        });

                        console.log('Cabeceras filtradas (sin fecha):', filteredHeaders);

                        if (filteredHeaders.length === 0) {
                            reject(new Error('No se encontraron variables después de filtrar las columnas de fecha. Verifica que el archivo tenga más columnas además de "Date".'));
                            return;
                        }

                        // Mostrar información sobre el filtrado
                        const dateColumnsFound = allHeaders.filter(header => {
                            const lowerHeader = header.toLowerCase().trim();
                            return dateColumnNames.some(dateCol =>
                                lowerHeader === dateCol ||
                                lowerHeader.includes(dateCol)
                            );
                        });

                        if (dateColumnsFound.length > 0) {
                            console.log(`Columnas de fecha encontradas y filtradas: ${dateColumnsFound.join(', ')}`);
                        }

                        resolve(filteredHeaders);
                    } catch (error: any) {
                        reject(new Error(`Error procesando Excel: ${error.message}`));
                    }
                };

                reader.onerror = () => reject(new Error('Error leyendo el archivo'));
                reader.readAsArrayBuffer(selectedFile);
            });

            const variablesDetectadas = headers.map((header, index) => ({
                id: index + 1,
                name: header,
                dataType: 'Texto',
                current: `Variable ${index + 1}`,
                originalValue: header,
                fullPath: header,
                columnIndex: index
            }));

            console.log(`📊 ${variablesDetectadas.length} variables detectadas (excluyendo columnas de fecha)`);

            setVariables(variablesDetectadas);
            setLastFetchTime(new Date());

        } catch (error: any) {
            setError(`Error procesando Excel: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    // Detectar variables InfluxDB
    const detectarVariablesInflux = async () => {
        if (!dataSourceConfig?.config) return;

        setIsLoading(true);
        setError(null);
        setSelectedVariables([]);

        const config = dataSourceConfig.config;
        console.log('Detectando variables desde InfluxDB:', config);

        try {
            // Crear cliente InfluxDB
            const client = new InfluxDB({
                url: config.url,
                token: config.token,
            });

            const queryApi = client.getQueryApi(config.org);

            if (config.useMeasurement && config.measurement) {
                // CASO 1: CON MEASUREMENT ESPECÍFICO (comportamiento actual)
                const fieldsQuery = `
                import "influxdata/influxdb/schema"
                
                schema.measurementFieldKeys(
                    bucket: "${config.bucket}",
                    measurement: "${config.measurement}"
                )
            `;

                console.log('Ejecutando query para fields con measurement:', fieldsQuery);

                const fieldRows = await queryApi.collectRows(fieldsQuery);

                if (fieldRows.length === 0) {
                    throw new Error(`No se encontraron fields en el measurement "${config.measurement}"`);
                }

                // Query para obtener datos recientes y detectar tipos
                const dataQuery = `
                from(bucket: "${config.bucket}")
                |> range(start: -24h)
                |> filter(fn: (r) => r._measurement == "${config.measurement}")
                |> last()
                |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
            `;

                const dataRows = await queryApi.collectRows(dataQuery);

                // Crear mapa de tipos de datos
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

                // Convertir fields a formato de variables
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

                setVariables(variablesDetectadas);
                console.log(`${variablesDetectadas.length} variables detectadas desde measurement específico`);

            } else {
                // CASO 2: SIN MEASUREMENT ESPECÍFICO - EXPLORAR TODO EL BUCKET 

                const measurementsQuery = `
                import "influxdata/influxdb/schema"
                schema.measurements(bucket: "${config.bucket}")
            `;

                console.log('Obteniendo measurements disponibles...');

                const measurementRows = await queryApi.collectRows(measurementsQuery);

                if (measurementRows.length === 0) {
                    throw new Error(`No se encontraron measurements en el bucket "${config.bucket}"`);
                }

                console.log(`Encontrados ${measurementRows.length} measurements:`, measurementRows.map((r: any) => r._value));

                // Obtener fields para cada measurement
                const allVariables: any[] = [];
                let variableId = 1;

                for (const measurementRow of measurementRows) {
                    const measurement = (measurementRow as any)._value;
                    console.log(`Obteniendo fields para measurement: ${measurement}`);

                    try {
                        const fieldsQuery = `
                        import "influxdata/influxdb/schema"
                        schema.measurementFieldKeys(
                            bucket: "${config.bucket}",
                            measurement: "${measurement}"
                        )
                    `;

                        const fieldRows = await queryApi.collectRows(fieldsQuery);
                        console.log(`Fields encontrados en ${measurement}:`, fieldRows.map(r => (r as any)._value));

                        // Obtener datos recientes para este measurement
                        const dataQuery = `
                        from(bucket: "${config.bucket}")
                        |> range(start: -24h)
                        |> filter(fn: (r) => r._measurement == "${measurement}")
                        |> last()
                        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
                    `;

                        const dataRows = await queryApi.collectRows(dataQuery);

                        // Crear variables para este measurement
                        fieldRows.forEach((fieldRow: any) => {
                            const fieldName = fieldRow._value;
                            let dataType = 'Sin datos';
                            let currentValue = 'Sin datos';

                            // Detectar tipo de datos
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
                        console.warn(`Error obteniendo fields para ${measurement}:`, fieldError);
                        // Continuar con el siguiente measurement
                    }
                }

                if (allVariables.length === 0) {
                    throw new Error(`No se encontraron variables en ningún measurement del bucket "${config.bucket}"`);
                }

                // Agrupar por measurement para mostrar información
                const measurementGroups = allVariables.reduce((acc, variable) => {
                    if (!acc[variable.measurement]) {
                        acc[variable.measurement] = 0;
                    }
                    acc[variable.measurement]++;
                    return acc;
                }, {} as { [key: string]: number });

                const measurementSummary = Object.entries(measurementGroups)
                    .map(([measurement, count]) => `${measurement} (${count} variables)`)
                    .join(', ');

                console.log(`Variables detectadas por measurement: ${measurementSummary}`);

                setVariables(allVariables);
                console.log(`${allVariables.length} variables detectadas desde todo el bucket`);
            }

            setLastFetchTime(new Date());

        } catch (error: any) {
            console.error('Error detectando variables InfluxDB:', error);

            // Manejar errores específicos
            if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
                setError('Error de autenticación: Token de API inválido o sin permisos.');
            } else if (error.message?.includes('404') || error.message?.includes('bucket')) {
                setError(`Error: El bucket "${config.bucket}" no existe o no tienes acceso.`);
            } else if (error.message?.includes('measurement') && config.useMeasurement) {
                setError(`Error: No se encontraron datos en el measurement "${config.measurement}". Verifica que existan datos recientes.`);
            } else if (error.message?.includes('No se encontraron datos en el bucket')) {
                setError(`Error: El bucket "${config.bucket}" no contiene datos en los últimos 7 días.`);
            } else if (error.message?.includes('organization')) {
                setError(`Error: La organización "${config.org}" no existe.`);
            } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                setError('Error de red: No se puede conectar a InfluxDB. Verifica la URL.');
            } else {
                setError(`Error detectando variables: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    //MANEJAR SELECCIÓN DE VARIABLES
    const toggleVariableSelection = (id: number) => {
        setSelectedVariables(prev => {
            if (prev.includes(id)) {
                return prev.filter(varId => varId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    if (!dataSourceConfig) {
        return (
            <div className="bg-background min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-orange-400" />
                </div>
            </div>
        );
    }

    const protocol = dataSourceConfig.protocol || 'mqtt';

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex flex-col items-center justify-center px-4">
                {/* Pasos de navegación */}
                <div className="flex flex-wrap space-x-2 md:space-x-4 mb-6 overflow-x-auto pb-2">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`flex items-center mb-2 ${step.active ? 'text-orange-400' : 'text-gray-500'}`}
                        >
                            {step.active ? (
                                <CheckCircle className="w-5 h-5 mr-2" />
                            ) : (
                                <span className="w-5 h-5 mr-2 flex items-center justify-center rounded-full border border-current">
                                    {step.id}
                                </span>
                            )}
                            <span className="whitespace-nowrap">{step.title}</span>
                        </div>
                    ))}
                </div>

                <div className="w-full max-w-4xl bg-secundary rounded-2xl shadow-md overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl md:text-xl font-bold text-white">Paso 2: Configuración de Variables</h1>
                                    <p className="text-gray-300 text-sm mt-1">
                                        Variables detectadas desde {protocol.toUpperCase()}
                                        {lastFetchTime && (
                                            <span className="text-gray-400 ml-2">
                                                (última actualización: {lastFetchTime.toLocaleTimeString()})
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/*  BOTÓN PARA REFRESCAR VARIABLES */}
                                <button
                                    onClick={() => {
                                        if (dataSourceConfig.protocol === 'http') {
                                            console.log('entra en http')
                                            detectarVariablesHTTP();
                                        } else if (dataSourceConfig.protocol === 'mqtt') {
                                            detectarVariablesMQTT();
                                        } else if (dataSourceConfig.protocol === 'websocket') {
                                            detectarVariablesWebSocket();
                                        } else if (dataSourceConfig.protocol === 'file') {
                                            detectarVariablesExcel();
                                        } else if (dataSourceConfig.protocol === 'influx') {
                                            detectarVariablesInflux();
                                        } else {
                                            console.error('Protocolo no soportado:', dataSourceConfig.protocol);
                                        }
                                    }}
                                    disabled={isLoading}
                                    className="flex items-center px-3 py-2 bg-orange-400 hover:bg-orange-500 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                    {isLoading ? 'Detectando...' : 'Refrescar'}
                                </button>
                            </div>
                        </div>

                        {/* MOSTRAR ESTADO DE CARGA O ERROR */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mr-3" />
                                <span className="text-gray-300">Detectando variables disponibles...</span>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <X className="w-5 h-5 text-red-400 mr-2" />
                                    <span className="text-red-400 font-medium">Error al detectar variables</span>
                                </div>
                                <p className="text-red-300 text-sm mt-1">{error}</p>
                                <button
                                    onClick={() => {
                                        if (dataSourceConfig.protocol === 'http') {
                                            detectarVariablesHTTP();
                                        } else if (dataSourceConfig.protocol === 'mqtt') {
                                            detectarVariablesMQTT();
                                        } else if (dataSourceConfig.protocol === 'websocket') {
                                            detectarVariablesWebSocket();
                                        } else if (dataSourceConfig.protocol === 'file') {
                                            detectarVariablesExcel();
                                        } else if (dataSourceConfig.protocol === 'influx') {
                                            detectarVariablesInflux();
                                        }
                                    }}
                                    className="text-red-400 hover:text-red-300 text-sm underline mt-2"
                                >
                                    Intentar nuevamente
                                </button>
                            </div>
                        )}

                        {/* MOSTRAR VARIABLES SOLO SI NO HAY ERROR Y NO ESTÁ CARGANDO */}
                        {!isLoading && !error && (
                            <>
                                {variables.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400">No se detectaron variables en la fuente de datos</p>
                                        <button
                                            onClick={() => {
                                                if (dataSourceConfig.protocol === 'http') {
                                                    detectarVariablesHTTP();
                                                } else if (dataSourceConfig.protocol === 'mqtt') {
                                                    detectarVariablesMQTT();
                                                } else if (dataSourceConfig.protocol === 'websocket') {
                                                    detectarVariablesWebSocket();
                                                } else if (dataSourceConfig.protocol === 'file') {
                                                    detectarVariablesExcel();
                                                } else if (dataSourceConfig.protocol === 'influx') {
                                                    detectarVariablesInflux();
                                                }
                                            }}
                                            className="text-orange-400 hover:text-orange-300 text-sm underline mt-2"
                                        >
                                            Volver a intentar
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Grid de variables seleccionables */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                                            {variables.map(variable => (
                                                <div
                                                    key={variable.id}
                                                    className={`relative rounded-lg cursor-pointer border-2 flex flex-col items-center justify-center h-10 transition-all
                                                        ${selectedVariables.includes(variable.id)
                                                            ? ' border-background bg-background-transparent hover:background-transparent'
                                                            : 'border-background bg-secundary hover:bg-background'}`}
                                                    onClick={() => toggleVariableSelection(variable.id)}
                                                >
                                                    {selectedVariables.includes(variable.id) && (
                                                        <div className="absolute top-1 right-1">
                                                            <Check className="w-3 h-3 text-orange-400" />
                                                        </div>
                                                    )}

                                                    <h3 className="text-white text-center text-xs font-medium truncate max-w-full px-1">
                                                        {variable.name}
                                                    </h3>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Lista de variables seleccionadas */}
                                        <div className="bg-background rounded-lg p-3 mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-white font-medium">Variables Seleccionadas</h3>
                                                <span className="text-xs text-gray-400">
                                                    {selectedVariables.length} de {variables.length} variables
                                                </span>
                                            </div>

                                            {selectedVariables.length === 0 ? (
                                                <p className="text-sm text-gray-400 italic">No se ha seleccionado ninguna variable</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedVariables.map(id => {
                                                        const variable = variables.find(v => v.id === id);
                                                        if (!variable) return null;

                                                        return (
                                                            <div
                                                                key={id}
                                                                className="flex items-center bg-gray-700 rounded-full pl-2 pr-1 py-1"
                                                            >
                                                                <span className="text-xs text-white mr-1">{variable.name}</span>
                                                                <button
                                                                    className="text-gray-400 hover:text-white rounded-full"
                                                                    onClick={() => toggleVariableSelection(id)}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* Botón de acción */}
                        <div className="flex justify-between items-center mt-6">
                            <span className="text-sm text-gray-300">
                                {selectedVariables.length > 0
                                    ? `Variables seleccionadas: ${selectedVariables.length}`
                                    : 'Seleccione al menos una variable para continuar'}
                            </span>
                            <button
                                onClick={() => { handleSiguientePaso(); }}
                                disabled={selectedVariables.length === 0}
                                className={`px-4 py-2 rounded-lg flex items-center
                                    ${selectedVariables.length === 0
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-orange-400 text-white hover:bg-orange-500'} transition-colors`}
                            >
                                Siguiente Paso
                                <ArrowRight className="ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
                {showFileModal && (
                    <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50 p-4">
                        <div className="bg-secundary rounded-2xl shadow-xl w-full max-w-md">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-white mb-4">Seleccionar archivo Excel</h2>
                                <p className="text-gray-300 text-sm mb-6">
                                    Para continuar, necesitas seleccionar el archivo Excel que configuraste anteriormente.
                                </p>

                                <div className="space-y-4">
                                    <label className="block">
                                        <div className="w-full bg-orange-400 text-white px-4 py-3 rounded-lg flex items-center justify-center cursor-pointer hover:bg-orange-500 transition-colors">
                                            Seleccionar archivo Excel
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileSelection}
                                        />
                                    </label>

                                    {selectedFile && (
                                        <div className="p-3 bg-background rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                                                    <p className="text-gray-400 text-xs">
                                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                                <Check className="w-5 h-5 text-green-400" />
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="p-3 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg">
                                            <p className="text-red-300 text-sm">{error}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowFileModal(false);
                                            navigate('/fuente-datos');
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Volver
                                    </button>

                                    {selectedFile && (
                                        <button
                                            onClick={() => setShowFileModal(false)}
                                            className="flex-1 px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors"
                                        >
                                            Continuar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}