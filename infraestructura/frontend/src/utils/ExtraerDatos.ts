import mqtt from 'mqtt';
import { InfluxDB } from '@influxdata/influxdb-client';
import { parsearMensaje } from './parsearMensaje';

export function conectarMQTT(
    config: any,
    setLiveData: any,
    setConnectionStatus: any,
    setConnectionError: any,
    setMqttClient: any
) {
    if (!config) return;
    try {
        const client: any = mqtt.connect(`wss://${config.ip}`, {
            username: config.username || undefined,
            password: config.password || undefined,
        });

        client.on('connect', () => {
            setConnectionStatus('connected');
            setConnectionError('');
            client.subscribe(config.topic, (err: any) => {
                if (err) {
                    setConnectionError('Error suscribiéndose al tópico: ' + err.message);
                    setConnectionStatus('error');
                }
            });
        });

        client.on('message', (topic: any, message: any) => {
            if (topic !== config.topic) return;
            const mensajeRecibido: any = message.toString();
            const parsedData: any = parsearMensaje(mensajeRecibido);
            setLiveData((prev: any) => [parsedData, ...prev]);
        });

        client.on('error', (err: any) => {
            setConnectionError('Error de conexión MQTT: ' + err.message);
            setConnectionStatus('error');
        });

        client.on('close', () => setConnectionStatus('disconnected'));
        setMqttClient(client);
    } catch (error: any) {
        setConnectionError('Error creando cliente MQTT: ' + error.message);
        setConnectionStatus('error');
    }
}

export function conectarWebSocket(
    config: any,
    setLiveData: any,
    setConnectionStatus: any,
    setConnectionError: any,
    setWsClient: any,
    isRunning: any,
    reconnect: any
) {
    if (!config) return;
    try {
        const ws: any = new WebSocket(config.url);

        ws.onopen = () => {
            setConnectionStatus('connected');
            setConnectionError('');
            if (config.useToken && config.token) {
                ws.send(JSON.stringify({ type: 'auth', token: config.token }));
            }
            if (config.subscriptionMessage) {
                try {
                    ws.send(JSON.stringify(JSON.parse(config.subscriptionMessage)));
                } catch {
                    ws.send(config.subscriptionMessage);
                }
            }
            const pingInterval: any = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
                } else {
                    clearInterval(pingInterval);
                }
            }, 30000);
            (ws as any).pingInterval = pingInterval;
        };

        ws.onmessage = (event: any) => {
            const mensajeRecibido: any = event.data;
            let parsedData: any = {};
            try {
                const jsonData: any = JSON.parse(mensajeRecibido);
                if (jsonData.type && ['pong', 'auth_success', 'ping', 'keepalive'].includes(jsonData.type)) return;
            } catch {}
            parsedData = parsearMensaje(mensajeRecibido);
            if (Object.keys(parsedData).filter((k: any) => k !== 'timestamp').length === 0) return;
            setLiveData((prev: any) => [parsedData, ...prev]);setLiveData((prev: any) => [parsedData, ...prev]);
        };

        ws.onerror = () => {
            setConnectionError('Error de conexión WebSocket');
            setConnectionStatus('error');
        };

        ws.onclose = (event: any) => {
            if ((ws as any).pingInterval) clearInterval((ws as any).pingInterval);
            if (!event.wasClean && isRunning) {
                setTimeout(() => reconnect(), 5000);
            } else {
                setConnectionStatus('disconnected');
            }
        };

        setWsClient(ws);
    } catch (error: any) {
        setConnectionError('Error creando WebSocket: ' + error.message);
        setConnectionStatus('error');
    }
}

export function conectarHTTP(
    config: any,
    setLiveData: any,
    setConnectionStatus: any,
    setConnectionError: any,
    setHttpInterval:any,
    intervaloMinutos: number
) {
    if (!config) return;
    const realizarRequest = async () => {
        try {
            const requestOptions: any = {
                method: config.method || 'GET',
                headers: { 'Content-Type': 'application/json', ...config.headers }
            };
            if (['POST', 'PUT', 'PATCH'].includes((config.method || '').toUpperCase()) && config.body) {
                requestOptions.body = config.body;
            }
            const response: any = await fetch(config.url, requestOptions);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            const contentType: any = response.headers.get('content-type') || '';
            const responseText: any = await response.text();
            const formato: any = contentType.includes('application/json') ? 'json' : 'text';
            const parsedData: any = parsearMensaje(responseText, formato);
            setLiveData((prev: any) => [parsedData, ...prev]);
            setConnectionStatus('connected');
            setConnectionError('');
        } catch (error: any) {
            setConnectionError('Error en petición HTTP: ' + error.message);
            setConnectionStatus('error');
        }
    };
    realizarRequest();
    const interval: any = setInterval(realizarRequest, intervaloMinutos * 60 * 1000); // <-- aquí usas el intervalo
    setHttpInterval(interval);
}

export function conectarInfluxDB(
    config: any,
    variablesConfig: any,
    setLiveData: any,
    setConnectionStatus: any,
    setConnectionError: any,
    setHttpInterval: any,
    intervaloMinutos:any
) {
    if (!config) {
        setConnectionError('No hay configuración de InfluxDB disponible');
        setConnectionStatus('error');
        return;
    }
    const variablesOriginales: any = variablesConfig?.variables?.map((v: any) => v.name) || [];
    const variablesSeleccionadas: any = variablesOriginales.map((variable: any) =>
        variable.endsWith('.value') ? variable.replace('.value', '') : variable
    );
    if (variablesSeleccionadas.length === 0) {
        setConnectionError('No hay variables seleccionadas para consultar');
        setConnectionStatus('error');
        return;
    }
    try {
        const client: any = new InfluxDB({ url: config.url, token: config.token });
        const queryApi: any = client.getQueryApi(config.org);
        const realizarQuery = async () => {
            try {
                let query: any = '';
                if (config.useMeasurement && config.measurement) {
                    const fieldFilters: any = variablesSeleccionadas.map((variable: any) => `r._field == "${variable}"`).join(' or ');
                    query = `
                        from(bucket: "${config.bucket}")
                        |> range(start: -7d)
                        |> filter(fn: (r) => r._measurement == "${config.measurement}")
                        |> filter(fn: (r) => ${fieldFilters})
                        |> group(columns: ["_field"])
                        |> last()
                        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
                    `;
                } else {
                    const measurementFilters: any = variablesSeleccionadas.map((variable: any) => `r._measurement == "${variable}"`).join(' or ');
                    query = `
                        from(bucket: "${config.bucket}")
                        |> range(start: -7d)
                        |> filter(fn: (r) => r["_field"] == "value")
                        |> filter(fn: (r) => ${measurementFilters})
                        |> group(columns: ["_measurement"])
                        |> last()
                    `;
                }
                const rows: any = await queryApi.collectRows(query);
                if (rows.length > 0) {
                    const parsedData: any = { timestamp: new Date().toLocaleTimeString() };
                    if (config.useMeasurement && config.measurement) {
                        const latestRow: any = rows[0];
                        if (latestRow._time) parsedData.timestamp = new Date(latestRow._time).toLocaleTimeString();
                        variablesOriginales.forEach((variableOriginal: any, index: any) => {
                            const variableLimpia: any = variablesSeleccionadas[index];
                            if (latestRow[variableLimpia] !== undefined) {
                                parsedData[variableOriginal] = latestRow[variableLimpia];
                            }
                        });
                    } else {
                        rows.forEach((row: any) => {
                            const measurement: any = row._measurement;
                            const value: any = row._value;
                            const timestamp: any = row._time;
                            const variableOriginalIndex: any = variablesSeleccionadas.findIndex((v: any) => v === measurement);
                            if (variableOriginalIndex !== -1 && value !== undefined) {
                                const variableOriginal: any = variablesOriginales[variableOriginalIndex];
                                parsedData[variableOriginal] = value;
                            }
                            if (timestamp) parsedData.timestamp = new Date(timestamp).toLocaleTimeString();
                        });
                    }
                    setLiveData((prev: any) => [parsedData, ...prev]);
                    setConnectionStatus('connected');
                    setConnectionError('');
                } else {
                    setConnectionError(`No hay datos disponibles para: ${variablesOriginales.join(', ')}`);
                }
            } catch (error: any) {
                setConnectionError('Error consultando InfluxDB: ' + error.message);
                setConnectionStatus('error');
            }
        };
        realizarQuery();
        const interval: any = setInterval(realizarQuery, intervaloMinutos * 60 * 1000);
        setHttpInterval(interval);
    } catch (error: any) {
        setConnectionError('Error de conexión: ' + error.message);
        setConnectionStatus('error');
    }
}

// Agregar al final de ExtraerDatos.ts:
export function leerArchivoExcelConRango(
    variablesConfig: any,
    setLiveData: any,
    setConnectionStatus: any,
    setConnectionError: any,
    setHttpInterval: any,
    intervaloMinutos: number
) {
    // Obtener datos del rango seleccionado
    const dateRangeData = localStorage.getItem('dateRangeData');
    
    if (!dateRangeData) {
        setConnectionError('No se encontró información del rango de fechas seleccionado');
        setConnectionStatus('error');
        return;
    }
    
    const rangeInfo = JSON.parse(dateRangeData);
    console.log('Usando datos del rango:', rangeInfo);
    
    let currentIndex = 0;
    
    const simularLecturaSecuencial = () => {
        if (currentIndex < rangeInfo.filteredData.length) {
            const rowData = rangeInfo.filteredData[currentIndex];
            
            // Convertir los datos de la fila al formato esperado
            const parsedData: any = {
                timestamp: new Date(rowData[rangeInfo.dateColumn] || new Date()).toLocaleTimeString()
            };
            
            // Agregar solo las variables seleccionadas
            if (variablesConfig?.variables) {
                variablesConfig.variables.forEach((variable: any) => {
                    if (rowData[variable.name] !== undefined) {
                        parsedData[variable.name] = rowData[variable.name];
                    }
                });
            }
            
            setLiveData((prev: any) => [parsedData, ...prev]);
            currentIndex++;
            
            console.log(`Procesado registro ${currentIndex}/${rangeInfo.filteredData.length}:`, parsedData);
            
        } else {
            console.log('Todos los registros del rango han sido procesados');
            // Reiniciar desde el principio si se desea loop
            currentIndex = 0;
        }
    };
    
    setConnectionStatus('connected');
    setConnectionError('');
    
    // Cargar primer registro
    simularLecturaSecuencial();
    
    // Configurar intervalo para simular datos en tiempo real
    const interval: any = setInterval(simularLecturaSecuencial, intervaloMinutos * 60 * 1000);
    setHttpInterval(interval);
}