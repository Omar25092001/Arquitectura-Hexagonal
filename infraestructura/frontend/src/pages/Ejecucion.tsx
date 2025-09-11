import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { CheckCircle, Play, Pause, RotateCcw, Settings, Activity, Wifi, WifiOff, Database, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mqtt from 'mqtt';
import * as ExcelJS from 'exceljs';
import { InfluxDB } from '@influxdata/influxdb-client';
import { parsearMensaje } from '../utils/parsearMensaje';

interface DataPoint {
    timestamp: string;
    [key: string]: any;
}

export default function Ejecucion() {
    const navigate = useNavigate();
    const [isRunning, setIsRunning] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [dataSourceConfig, setDataSourceConfig] = useState<any>(null);
    const [variablesConfig, setVariablesConfig] = useState<any>(null);
    const [algorithmConfig, setAlgorithmConfig] = useState<any>(null);
    const [liveData, setLiveData] = useState<DataPoint[]>([]);
    const [connectionError, setConnectionError] = useState<string>('');
    const [mqttClient, setMqttClient] = useState<any>(null);
    const [wsClient, setWsClient] = useState<WebSocket | null>(null);
    const [httpInterval, setHttpInterval] = useState<NodeJS.Timeout | null>(null);

    const steps = [
        { id: 1, title: 'Fuentes de Datos', active: true },
        { id: 2, title: 'Variables', active: true },
        { id: 3, title: 'Algoritmo', active: true },
        { id: 4, title: 'Ejecución', active: true }
    ];

    // Cargar configuraciones al montar el componente
    useEffect(() => {
        const loadConfigurations = () => {
            const dataSource = localStorage.getItem('dataSourceConfig');
            const variables = localStorage.getItem('selectedVariables');
            const algorithm = localStorage.getItem('algorithmConfig');

            if (dataSource) setDataSourceConfig(JSON.parse(dataSource));
            if (variables) setVariablesConfig({ variables: JSON.parse(variables) });
            if (algorithm) setAlgorithmConfig(JSON.parse(algorithm));
        };

        loadConfigurations();
    }, []);


    // Conectar MQTT
    const conectarMQTT = () => {
        if (!dataSourceConfig?.config) return;

        const config = dataSourceConfig.config;
        console.log('Conectando a MQTT:', config);

        try {
            const client = mqtt.connect(`ws://${config.ip}`, {
                username: config.username || undefined,
                password: config.password || undefined,
            });

            client.on('connect', () => {
                console.log(' MQTT Conectado');
                setConnectionStatus('connected');
                setConnectionError('');

                client.subscribe(config.topic, (err) => {
                    if (err) {
                        setConnectionError('Error suscribiéndose al tópico: ' + err.message);
                        setConnectionStatus('error');
                    } else {
                        console.log(`Suscrito al tópico: ${config.topic}`);
                    }
                });
            });

            client.on('message', (topic, message) => {
                if (topic !== config.topic) return;

                const mensajeRecibido = message.toString();
                console.log('Mensaje MQTT recibido:', mensajeRecibido);

                // Usar la función importada
                const parsedData = parsearMensaje(mensajeRecibido);

                setLiveData(prev => {
                    const updated = [parsedData, ...prev];
                    return updated.slice(0, 100);
                });
            });

            client.on('error', (err) => {
                console.error('Error MQTT:', err);
                setConnectionError('Error de conexión MQTT: ' + err.message);
                setConnectionStatus('error');
            });

            client.on('close', () => {
                console.log('MQTT Desconectado');
                if (connectionStatus === 'connected') {
                    setConnectionStatus('disconnected');
                }
            });

            setMqttClient(client);

        } catch (error: any) {
            setConnectionError('Error creando cliente MQTT: ' + error.message);
            setConnectionStatus('error');
        }
    };

    // Conectar WebSocket
    // Conectar WebSocket
    const conectarWebSocket = () => {
        if (!dataSourceConfig?.config) return;

        const config = dataSourceConfig.config;
        console.log('Conectando a WebSocket:', config);

        try {
            const ws = new WebSocket(config.url);

            ws.onopen = () => {
                console.log(' WebSocket Conectado');
                setConnectionStatus('connected');
                setConnectionError('');

                // Enviar token de autenticación si está configurado
                if (config.useToken && config.token) {
                    ws.send(JSON.stringify({
                        type: 'auth',
                        token: config.token
                    }));
                    console.log('Token WebSocket enviado');
                }

                // Enviar mensaje de suscripción si está configurado
                if (config.subscriptionMessage) {
                    try {
                        const subscriptionMsg = JSON.parse(config.subscriptionMessage);
                        ws.send(JSON.stringify(subscriptionMsg));
                        console.log(' Mensaje de suscripción enviado:', subscriptionMsg);
                    } catch (e) {
                        // Si no es JSON válido, enviar como texto plano
                        ws.send(config.subscriptionMessage);
                        console.log('Mensaje de suscripción enviado (texto):', config.subscriptionMessage);
                    }
                }

                // Configurar ping/keepalive cada 30 segundos para mantener la conexión
                const pingInterval = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
                        console.log(' Ping enviado para mantener conexión');
                    } else {
                        clearInterval(pingInterval);
                    }
                }, 30000);

                // Guardar referencia del interval para limpiarlo después
                (ws as any).pingInterval = pingInterval;
            };

            ws.onmessage = (event) => {
                const mensajeRecibido = event.data;
                console.log('Mensaje WebSocket recibido:', mensajeRecibido);

                try {
                    // Intentar parsear como JSON primero
                    const jsonData = JSON.parse(mensajeRecibido);

                    // Ignorar mensajes de control (pong, auth confirmations, etc.)
                    if (jsonData.type && ['pong', 'auth_success', 'ping', 'keepalive'].includes(jsonData.type)) {
                        console.log(' Mensaje de control ignorado:', jsonData.type);
                        return;
                    }
                } catch (e) {
                    // No es JSON, continuar con el procesamiento normal
                }

                // Usar la función importada para parsear datos
                const parsedData = parsearMensaje(mensajeRecibido);

                // Verificar que tenemos datos válidos (más que solo timestamp)
                const dataKeys = Object.keys(parsedData).filter(key => key !== 'timestamp');
                if (dataKeys.length === 0) {
                    console.log(' Mensaje sin datos válidos, ignorando');
                    return;
                }

                setLiveData(prev => {
                    const updated = [parsedData, ...prev];
                    return updated.slice(0, 100); // Mantener últimos 100 registros
                });
            };

            ws.onerror = (error) => {
                console.error(' Error WebSocket:', error);
                setConnectionError('Error de conexión WebSocket: Verifica la URL y configuración');
                setConnectionStatus('error');
            };

            ws.onclose = (event) => {
                console.log(' WebSocket Desconectado', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });

                // Limpiar interval de ping si existe
                if ((ws as any).pingInterval) {
                    clearInterval((ws as any).pingInterval);
                }

                if (!event.wasClean && connectionStatus === 'connected') {
                    const reason = event.reason || `Código: ${event.code}`;
                    setConnectionError(`Conexión WebSocket cerrada inesperadamente: ${reason}`);
                    setConnectionStatus('error');
                } else if (isRunning) {
                    // Si se desconecta mientras debería estar corriendo, intentar reconectar
                    console.log(' Intentando reconectar WebSocket en 5 segundos...');
                    setTimeout(() => {
                        if (isRunning && connectionStatus !== 'connected') {
                            console.log(' Reconectando WebSocket...');
                            conectarWebSocket();
                        }
                    }, 5000);
                } else {
                    setConnectionStatus('disconnected');
                }
            };

            setWsClient(ws);

        } catch (error: any) {
            console.error(' Error creando WebSocket:', error);
            setConnectionError('Error creando WebSocket: ' + error.message);
            setConnectionStatus('error');
        }
    };
    // Conectar HTTP (polling cada 15 segundos)
    const conectarHTTP = () => {
        if (!dataSourceConfig?.config) return;

        const config = dataSourceConfig.config;
        console.log('Iniciando polling HTTP:', config);

        const realizarRequest = async () => {
            try {
                const requestOptions: RequestInit = {
                    method: config.method || 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...config.headers
                    }
                };

                if (['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase()) && config.body) {
                    requestOptions.body = config.body;
                }

                const response = await fetch(config.url, requestOptions);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const contentType = response.headers.get('content-type') || '';
                const responseText = await response.text();

                console.log('Respuesta HTTP recibida:', responseText);

                const formato = contentType.includes('application/json') ? 'json' : 'text';
                // Usar la función importada
                const parsedData = parsearMensaje(responseText, formato);

                setLiveData(prev => {
                    const updated = [parsedData, ...prev];
                    return updated.slice(0, 100);
                });

                if (connectionStatus !== 'connected') {
                    setConnectionStatus('connected');
                    setConnectionError('');
                }

            } catch (error: any) {
                console.error('Error HTTP:', error);
                setConnectionError('Error en petición HTTP: ' + error.message);
                setConnectionStatus('error');
            }
        };

        // Realizar primera petición
        realizarRequest();

        // Configurar polling cada 15 segundos
        const interval = setInterval(realizarRequest, 15000);
        setHttpInterval(interval);
    };

   // Conectar InfluxDB
const conectarInfluxDB = () => {
    if (!dataSourceConfig?.config) {
        console.error('No hay configuración de InfluxDB');
        setConnectionError('No hay configuración de InfluxDB disponible');
        setConnectionStatus('error');
        return;
    }

    const config = dataSourceConfig.config;

    // Obtener las variables seleccionadas y limpiar nombres (quitar .value)
    const variablesOriginales = variablesConfig?.variables?.map((v: any) => v.name) || [];
    const variablesSeleccionadas = variablesOriginales.map((variable: string) => {
        return variable.endsWith('.value') ? variable.replace('.value', '') : variable;
    });

    console.log('Variables originales:', variablesOriginales);
    console.log('Variables limpiadas para query:', variablesSeleccionadas);

    if (variablesSeleccionadas.length === 0) {
        setConnectionError('No hay variables seleccionadas para consultar');
        setConnectionStatus('error');
        return;
    }

    console.log('Conectando a InfluxDB:', {
        url: config.url,
        org: config.org,
        bucket: config.bucket,
        measurement: config.measurement,
        useMeasurement: config.useMeasurement,
        variablesSeleccionadas: variablesSeleccionadas,
        hasToken: !!config.token
    });

    try {
        const client = new InfluxDB({
            url: config.url,
            token: config.token,
        });

        const queryApi = client.getQueryApi(config.org);

        const realizarQuery = async () => {
            try {
                let query = '';

                if (config.useMeasurement && config.measurement) {
                    // OPCIÓN 1: CON MEASUREMENT ESPECÍFICO (variables como fields)
                    const fieldFilters = variablesSeleccionadas.map((variable: any) =>
                        `r._field == "${variable}"`
                    ).join(' or ');

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
                    // OPCIÓN 2: SIN MEASUREMENT ESPECÍFICO (cada variable es un measurement)
                    const measurementFilters = variablesSeleccionadas.map((variable: any) =>
                        `r._measurement == "${variable}"`
                    ).join(' or ');

                    query = `
                        from(bucket: "${config.bucket}")
                        |> range(start: -7d)
                        |> filter(fn: (r) => r["_field"] == "value")
                        |> filter(fn: (r) => ${measurementFilters})
                        |> group(columns: ["_measurement"])
                        |> last()
                    `;
                }

                console.log('Ejecutando query InfluxDB:', query);

                const rows = await queryApi.collectRows(query);
                console.log('Respuesta de InfluxDB:', rows);
                console.log('Número de filas:', rows.length);

                if (rows.length > 0) {
                    const parsedData: any = {
                        timestamp: new Date().toLocaleTimeString()
                    };

                    if (config.useMeasurement && config.measurement) {
                        // CASO 1: CON MEASUREMENT - Datos pivoteados en una sola fila
                        const latestRow = rows[0] as any;
                        console.log('Fila pivoteada:', latestRow);

                        if (latestRow._time) {
                            parsedData.timestamp = new Date(latestRow._time).toLocaleTimeString();
                        }

                        // Mapear variables usando nombres originales
                        variablesOriginales.forEach((variableOriginal:any, index:any) => {
                            const variableLimpia = variablesSeleccionadas[index];
                            if (latestRow[variableLimpia] !== undefined) {
                                parsedData[variableOriginal] = latestRow[variableLimpia];
                                console.log(`Variable mapeada: ${variableLimpia} → ${variableOriginal} = ${latestRow[variableLimpia]}`);
                            }
                        });

                    } else {
                        // CASO 2: SIN MEASUREMENT - Múltiples filas, cada una es una variable
                        console.log('Procesando múltiples measurements:');

                        rows.forEach((row: any, index: number) => {
                            const measurement = row._measurement;
                            const value = row._value;
                            const timestamp = row._time;

                            console.log(`Row ${index}:`, { measurement, value, timestamp });

                            // Buscar variable original que corresponde a este measurement
                            const variableOriginalIndex = variablesSeleccionadas.findIndex((v: any) => v === measurement);
                            
                            if (variableOriginalIndex !== -1 && value !== undefined) {
                                const variableOriginal = variablesOriginales[variableOriginalIndex];
                                parsedData[variableOriginal] = value;
                                console.log(`Measurement mapeado: ${measurement} → ${variableOriginal} = ${value}`);
                            } else {
                                console.log(`Measurement "${measurement}" no coincide con variables seleccionadas`);
                            }

                            if (timestamp) {
                                parsedData.timestamp = new Date(timestamp).toLocaleTimeString();
                            }
                        });
                    }

                    console.log('Datos parseados finales:', parsedData);

                    // Verificar que tenemos datos útiles
                    const dataKeys = Object.keys(parsedData).filter(key => key !== 'timestamp');
                    const variablesEncontradas = dataKeys.filter(key => variablesOriginales.includes(key));

                    console.log(`Variables esperadas: ${variablesOriginales.join(', ')}`);
                    console.log(`Variables encontradas: ${variablesEncontradas.join(', ')}`);

                    if (variablesEncontradas.length === 0) {
                        console.warn('No se encontraron datos para las variables seleccionadas');
                        setConnectionError(`No se encontraron datos para: ${variablesOriginales.join(', ')}`);
                        return;
                    }

                    if (variablesEncontradas.length < variablesOriginales.length) {
                        const faltantes = variablesOriginales.filter((v: any) => !variablesEncontradas.includes(v));
                        console.warn(`Variables faltantes: ${faltantes.join(', ')}`);
                        setConnectionError(`Variables no encontradas: ${faltantes.join(', ')}`);
                    }

                    // Agregar datos al array
                    setLiveData(prev => {
                        const updated = [parsedData, ...prev];
                        return updated.slice(0, 100);
                    });

                    // Actualizar estado de conexión
                    if (connectionStatus !== 'connected') {
                        setConnectionStatus('connected');
                        if (variablesEncontradas.length === variablesOriginales.length) {
                            setConnectionError('');
                        }
                        console.log('InfluxDB conectado exitosamente');
                    }

                } else {
                    console.warn('No se encontraron datos en InfluxDB');
                    setConnectionError(`No hay datos disponibles para: ${variablesOriginales.join(', ')}`);
                }

            } catch (error: any) {
                console.error('Error en query InfluxDB:', error);
                
                let errorMessage = 'Error consultando InfluxDB';
                if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
                    errorMessage = 'Token de API inválido o sin permisos';
                } else if (error.message?.includes('bucket') || error.message?.includes('404')) {
                    errorMessage = `Bucket "${config.bucket}" no existe o sin acceso`;
                } else if (error.message?.includes('organization')) {
                    errorMessage = `Organización "${config.org}" no válida`;
                } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                    errorMessage = 'No se puede conectar al servidor InfluxDB';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                setConnectionError(errorMessage);
                setConnectionStatus('error');
            }
        };

        // Realizar primera consulta
        console.log('Realizando primera consulta a InfluxDB...');
        realizarQuery();

        // Configurar polling cada 10 segundos
        const interval = setInterval(() => {
            console.log('Consulta periódica a InfluxDB...');
            realizarQuery();
        }, 10000);
        setHttpInterval(interval);

    } catch (error: any) {
        console.error('Error creando cliente InfluxDB:', error);
        setConnectionError('Error de conexión: ' + error.message);
        setConnectionStatus('error');
    }
};
    // Leer archivo Excel
    const leerArchivoExcel = async () => {
        // Para Excel, simularemos la lectura de datos
        console.log('Simulando lectura de Excel...');

        const simulateExcelData = () => {
            const parsedData: any = {
                timestamp: new Date().toLocaleTimeString()
            };

            // Generar datos basados en las variables seleccionadas
            if (variablesConfig?.variables) {
                variablesConfig.variables.forEach((variable: any) => {
                    parsedData[variable.name] = (Math.random() * 100).toFixed(2);
                });
            }

            setLiveData(prev => {
                const updated = [parsedData, ...prev];
                return updated.slice(0, 100);
            });
        };

        setConnectionStatus('connected');
        setConnectionError('');

        // Simular datos cada 5 segundos
        simulateExcelData();
        const interval = setInterval(simulateExcelData, 5000);
        setHttpInterval(interval);
    };

    // Manejar inicio de simulación
    const handleStartSimulation = () => {
        setIsRunning(true);
        setConnectionStatus('connecting');
        setConnectionError('');
        setLiveData([]);

        // Delay para mostrar "Conectando..."
        setTimeout(() => {
            const protocol = dataSourceConfig?.protocol;

            switch (protocol) {
                case 'mqtt':
                    conectarMQTT();
                    break;
                case 'websocket':
                    conectarWebSocket();
                    break;
                case 'http':
                    conectarHTTP();
                    break;
                case 'influx':
                    conectarInfluxDB();
                    break;
                case 'file':
                    leerArchivoExcel();
                    break;
                default:
                    setConnectionError('Protocolo no soportado: ' + protocol);
                    setConnectionStatus('error');
            }
        }, 2000);
    };

    const handlePauseSimulation = () => {
        setIsRunning(false);
        setConnectionStatus('disconnected');

        // Limpiar conexiones
        if (mqttClient) {
            mqttClient.end();
            setMqttClient(null);
        }
        if (wsClient) {
            wsClient.close();
            setWsClient(null);
        }
        if (httpInterval) {
            clearInterval(httpInterval);
            setHttpInterval(null);
        }
    };

    const handleNewSimulation = () => {
        handlePauseSimulation();
        setLiveData([]);
        setConnectionError('');
    };

    const handleReconfigure = () => {
        handlePauseSimulation();
        setLiveData([]);
        navigate('/usuario/fuente-datos');
    };

    const getConnectionIcon = () => {
        switch (connectionStatus) {
            case 'connecting':
                return <Activity className="w-5 h-5 text-yellow-400 animate-spin" />;
            case 'connected':
                return <Wifi className="w-5 h-5 text-green-400" />;
            case 'error':
                return <WifiOff className="w-5 h-5 text-red-400" />;
            default:
                return <Database className="w-5 h-5 text-gray-400" />;
        }
    };

    const getConnectionText = () => {
        const protocol = dataSourceConfig?.protocol?.toUpperCase() || 'DESCONOCIDO';

        switch (connectionStatus) {
            case 'connecting':
                return `Conectando a ${protocol}...`;
            case 'connected':
                return `Conectado a ${protocol} - ${liveData.length} registros`;
            case 'error':
                return `Error de conexión ${protocol}`;
            default:
                return 'Desconectado';
        }
    };

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex flex-col items-center justify-start px-4 py-6">
                {/* Indicador de pasos */}
                <div className="flex flex-wrap space-x-2 md:space-x-4 mb-6 overflow-x-auto pb-2">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`flex items-center mb-2 ${step.active ? 'text-orange-400' : 'text-gray-500'}`}
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span className="whitespace-nowrap">{step.title}</span>
                        </div>
                    ))}
                </div>

                <div className="w-full max-w-7xl space-y-6">
                    {/* Header de Ejecución */}
                    <div className="bg-secundary rounded-2xl shadow-md p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    Ejecución de la Simulación
                                </h1>
                                <p className="text-gray-300">
                                    Controla y gestiona la ejecución de tu simulación configurada
                                </p>
                            </div>

                            {/* Estado de Conexión */}
                            <div className="flex items-center mt-4 md:mt-0">
                                {getConnectionIcon()}
                                <span className="ml-2 text-white font-medium">
                                    {getConnectionText()}
                                </span>
                            </div>
                        </div>

                        {/* Error de Conexión */}
                        {connectionError && (
                            <div className="mb-4 p-3 bg-red-600 bg-opacity-20 border border-red-500 rounded-lg flex items-center">
                                <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                                <span className="text-red-300">{connectionError}</span>
                            </div>
                        )}

                        {/* Controles de Simulación */}
                        <div className="flex flex-wrap gap-3">
                            {!isRunning ? (
                                <button
                                    onClick={handleStartSimulation}
                                    className="px-6 py-3 bg-orange-400 text-white hover:bg-orange-500 rounded-lg flex items-center transition-colors font-medium"
                                >
                                    <Play className="w-5 h-5 mr-2" />
                                    Iniciar Simulación
                                </button>
                            ) : (
                                <button
                                    onClick={handlePauseSimulation}
                                    className="px-6 py-3 bg-secundary border-2 border-background text-gray-300 hover:bg-background-transparent hover:border-background rounded-lg flex items-center transition-colors font-medium"
                                >
                                    <Pause className="w-5 h-5 mr-2" />
                                    Pausar
                                </button>
                            )}

                            <button
                                onClick={handleNewSimulation}
                                className="px-6 py-3  bg-secundary border-2 border-background text-gray-300 hover:bg-background-transparent hover:border-background rounded-lg flex items-center transition-colors font-medium"
                            >
                                <RotateCcw className="w-5 h-5 mr-2" />
                                Nueva Simulación
                            </button>

                            <button
                                onClick={handleReconfigure}
                                className="px-6 py-3 b bg-secundary border-2 border-background text-gray-300 hover:bg-background-transparent hover:border-background rounded-lg flex items-center transition-colors font-medium"
                            >
                                <Settings className="w-5 h-5 mr-2" />
                                Reconfigurar
                            </button>
                        </div>
                    </div>

                    {/* Resumen de Configuración */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Fuente de Datos */}
                        <div className="bg-secundary rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Fuente de Datos</h3>
                            <div className="text-gray-300 space-y-1">
                                <p><strong>Protocolo:</strong> {dataSourceConfig?.protocol?.toUpperCase() || 'No configurado'}</p>
                                {dataSourceConfig?.protocol === 'mqtt' && (
                                    <>
                                        <p><strong>Broker:</strong> {dataSourceConfig.config?.ip}</p>
                                        <p><strong>Topic:</strong> {dataSourceConfig.config?.topic}</p>
                                    </>
                                )}
                                {dataSourceConfig?.protocol === 'influx' && (
                                    <>
                                        <p><strong>URL:</strong> {dataSourceConfig.config?.url}</p>
                                        <p><strong>Bucket:</strong> {dataSourceConfig.config?.bucket}</p>
                                    </>
                                )}
                                {dataSourceConfig?.protocol === 'http' && (
                                    <p><strong>URL:</strong> {dataSourceConfig.config?.url}</p>
                                )}
                                {dataSourceConfig?.protocol === 'websocket' && (
                                    <p><strong>URL:</strong> {dataSourceConfig.config?.url}</p>
                                )}
                                {dataSourceConfig?.protocol === 'file' && (
                                    <p><strong>Tipo:</strong> Archivo Excel</p>
                                )}
                            </div>
                        </div>

                        {/* Variables */}
                        <div className="bg-secundary rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Variables</h3>
                            <div className="text-gray-300 space-y-1">
                                <p><strong>Total:</strong> {variablesConfig?.variables?.length || 0} variables</p>
                                <p><strong>Estado:</strong> {connectionStatus === 'connected' ? 'Recibiendo datos' : 'Configuradas'}</p>
                                {variablesConfig?.variables?.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm"><strong>Variables:</strong></p>
                                        <div className="text-xs text-gray-400 max-h-16 overflow-y-auto">
                                            {variablesConfig.variables.map((v: any, i: number) => (
                                                <span key={i}>{v.name}{i < variablesConfig.variables.length - 1 ? ', ' : ''}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Algoritmo */}
                        <div className="bg-secundary rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Algoritmo</h3>
                            <div className="text-gray-300 space-y-1">
                                <p><strong>Seleccionado:</strong> {algorithmConfig?.algorithm || 'No configurado'}</p>
                                <p><strong>Tipo:</strong> {algorithmConfig?.simulationType || 'No especificado'}</p>
                                <p><strong>Estado:</strong> {isRunning ? 'Procesando' : 'Configurado'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Panel de Datos en Tiempo Real */}
                    <div className="bg-secundary rounded-2xl shadow-md">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-xl font-semibold text-white flex items-center">
                                <Activity className="w-6 h-6 mr-2 text-orange-400" />
                                Datos en Tiempo Real
                                {connectionStatus === 'connected' && (
                                    <span className="ml-2 text-sm px-2 py-1 bg-green-600 bg-opacity-30 text-green-300 rounded">
                                        En vivo
                                    </span>
                                )}
                            </h2>
                        </div>

                        <div className="p-6">
                            {liveData.length === 0 ? (
                                <div className="text-center py-16">
                                    <Activity className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-white mb-2">
                                        {connectionStatus === 'connecting' ? 'Estableciendo Conexión...' :
                                            connectionStatus === 'connected' ? 'Esperando Datos...' :
                                                connectionStatus === 'error' ? 'Error de Conexión' :
                                                    'Listo para Iniciar'}
                                    </h3>
                                    <p className="text-gray-400">
                                        {connectionStatus === 'connecting' ? `Conectando con ${dataSourceConfig?.protocol?.toUpperCase()}` :
                                            connectionStatus === 'connected' ? 'La conexión está establecida, esperando datos' :
                                                connectionStatus === 'error' ? 'Verifica la configuración de tu fuente de datos' :
                                                    'Haz clic en "Iniciar Simulación" para comenzar'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Último registro */}
                                    <div className="bg-label rounded-lg p-4">
                                        <h4 className="text-white font-medium mb-3">Último Dato Recibido</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {Object.entries(liveData[0] || {}).map(([key, value]) => (
                                                key !== 'timestamp' && (
                                                    <div key={key} className="text-center">
                                                        <p className="text-gray-400 text-sm capitalize">{key}</p>
                                                        <p className="text-white text-lg font-bold">{value}</p>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                        <p className="text-gray-400 text-sm mt-2">
                                            Actualizado: {liveData[0]?.timestamp}
                                        </p>
                                    </div>

                                    {/* Tabla de historial */}
                                    <div className="bg-label rounded-lg overflow-hidden">
                                        <div className="p-4 border-b border-gray-600">
                                            <h4 className="text-white font-medium">
                                                Historial de Datos ({liveData.length} registros)
                                            </h4>
                                        </div>
                                        <div className="overflow-x-auto max-h-64">
                                            <table className="w-full">
                                                <thead className="bg-background sticky top-0">
                                                    <tr>
                                                        <th className="text-left text-gray-300 p-3 text-sm">Timestamp</th>
                                                        {Object.keys(liveData[0] || {}).map((key) => (
                                                            key !== 'timestamp' && (
                                                                <th key={key} className="text-left text-gray-300 p-3 text-sm capitalize">
                                                                    {key}
                                                                </th>
                                                            )
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {liveData.slice(0, 15).map((data, index) => (
                                                        <tr key={index} className="border-b border-gray-700 hover:bg-background hover:bg-opacity-50">
                                                            <td className="text-gray-300 p-3 text-sm">{data.timestamp}</td>
                                                            {Object.entries(data).map(([key, value]) => (
                                                                key !== 'timestamp' && (
                                                                    <td key={key} className="text-white p-3 text-sm">{value}</td>
                                                                )
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}