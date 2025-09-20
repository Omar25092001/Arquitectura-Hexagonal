import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { CheckCircle, Play, Pause, RotateCcw, Settings, Activity, Wifi, WifiOff, Database, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    conectarMQTT,
    conectarWebSocket,
    conectarHTTP,
    conectarInfluxDB,
    leerArchivoExcel
} from '../utils/ExtraerDatos';

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
    const [showDataModal, setShowDataModal] = useState(false);
    const [selectedData, setSelectedData] = useState<DataPoint | null>(null);
    const [intervaloTiempo, setIntervaloTiempo] = useState<number> (15);

    const [rangoDireccion, setRangoDireccion] = useState<'arriba' | 'abajo' | 'actual'>('arriba');
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');

    const steps = [
        { id: 1, title: 'Fuentes de Datos', active: true },
        { id: 2, title: 'Variables', active: true },
        { id: 3, title: 'Ejecución', active: true }
    ];

    useEffect(() => {
        const loadConfigurations = () => {
            const dataSource = localStorage.getItem('dataSourceConfig');
            const variables = localStorage.getItem('selectedVariables');
            const algorithm = localStorage.getItem('algorithmConfig');
            const tiempo = Number(localStorage.getItem('intervaloMinutos'))
            setIntervaloTiempo(tiempo);
            if (dataSource) setDataSourceConfig(JSON.parse(dataSource));
            if (variables) setVariablesConfig({ variables: JSON.parse(variables) });
            if (algorithm) setAlgorithmConfig(JSON.parse(algorithm));
        };

        
        loadConfigurations();
    }, []);

    // Manejar inicio de simulación
    const handleStartSimulation = () => {
        setIsRunning(true);
        setConnectionStatus('connecting');
        setConnectionError('');


        setTimeout(() => {
            const protocol = dataSourceConfig?.protocol;
            switch (protocol) {
                case 'mqtt':
                    conectarMQTT(
                        dataSourceConfig.config,
                        setLiveData,
                        setConnectionStatus,
                        setConnectionError,
                        setMqttClient
                    );
                    break;
                case 'websocket':
                    conectarWebSocket(
                        dataSourceConfig.config,
                        setLiveData,
                        setConnectionStatus,
                        setConnectionError,
                        setWsClient,
                        true,
                        () => conectarWebSocket(
                            dataSourceConfig.config,
                            setLiveData,
                            setConnectionStatus,
                            setConnectionError,
                            setWsClient,
                            true,
                            () => { }
                        )
                    );
                    break;
                case 'http':
                    conectarHTTP(
                        dataSourceConfig.config,
                        setLiveData,
                        setConnectionStatus,
                        setConnectionError,
                        setHttpInterval,
                        intervaloTiempo
                    );
                    break;
                case 'influx':
                    conectarInfluxDB(
                        dataSourceConfig.config,
                        variablesConfig,
                        setLiveData,
                        setConnectionStatus,
                        setConnectionError,
                        setHttpInterval,
                        intervaloTiempo
                    );
                    break;
                case 'file':
                    leerArchivoExcel(
                        variablesConfig,
                        setLiveData,
                        setConnectionStatus,
                        setConnectionError,
                        setHttpInterval,
                        intervaloTiempo
                    );
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

    const handleSelectData = (data: DataPoint) => {
        setSelectedData(data);
        setShowDataModal(true);
    }

    const handleSeleccionarRango = (direccion: 'arriba' | 'abajo' | 'actual') => {
        if (!selectedData) return;
        const idx = liveData.findIndex(d => d === selectedData);
        let datosSeleccionados: DataPoint[] = [];
        if (direccion === 'arriba') {
            // Desde el inicio hasta el seleccionado (incluido)
            datosSeleccionados = liveData.slice(0, idx + 1);
        } else {
            // Desde el seleccionado hasta el final
            datosSeleccionados = liveData.slice(idx);
        }
        // Aquí puedes guardar datosSeleccionados en un estado, mostrar otro modal, etc.
        console.log('Datos seleccionados:', datosSeleccionados);
        alert(`Seleccionaste ${datosSeleccionados.length} registros (${direccion})`);
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
                                    Extraer Datos
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
                        <div className="p-6 flex gap-20 border-b border-gray-700">
                            <h2 className="text-xl font-semibold text-white flex items-center">
                                <Activity className="w-6 h-6 mr-2 text-orange-400" />
                                Datos en Tiempo Real
                                {connectionStatus === 'connected' && (
                                    <span className="ml-2 text-sm px-2 py-1 bg-green-600 bg-opacity-30 text-green-300 rounded">
                                        En vivo
                                    </span>
                                )}
                            </h2>

                            <button>
                                <span className="ml-2 text-sm px-2 py-1 bg-green-600 bg-opacity-30 text-green-300 rounded">
                                    Ver Monitorización
                                </span>
                            </button>
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
                                                        <tr
                                                            key={index}
                                                            className="border-b border-gray-700 hover:bg-secundary cursor-pointer"
                                                            onClick={() => handleSelectData(data)}
                                                        >
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
            {showDataModal && selectedData && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
                    <div className="bg-secundary rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Detalle del Registro</h2>
                        <div className="space-y-2 mb-4">
                            {Object.entries(selectedData).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                    <span className="text-gray-400 capitalize">{key}</span>
                                    <span className="text-white">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-300 mb-1">Selecciona el rango:</label>
                            <select
                                value={rangoDireccion}
                                onChange={e => setRangoDireccion(e.target.value as 'arriba' | 'abajo')}
                                className="w-full px-3 py-2 rounded-lg bg-background text-white mb-2"
                            >
                                <option value="arriba">Desde el inicio hasta aquí (hacia arriba)</option>
                                <option value="abajo">Desde aquí hasta el final (hacia abajo)</option>
                                <option value="actual">Solo este dato</option>
                            </select>
                            {rangoDireccion === 'abajo' && (
                                <>
                                    <label className="text-gray-300 mb-1">Selecciona el algoritmo:</label>
                                    <select
                                        value={selectedAlgorithm}
                                        onChange={e => setSelectedAlgorithm(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-background text-white mb-2"
                                    >
                                        <option value="">Selecciona un algoritmo</option>
                                        <option value="prediccion1">Regesión Lineal</option>
                                        <option value="prediccion2">Media Movil</option>
                                        {/* Agrega aquí más algoritmos de predicción si tienes */}
                                    </select>
                                </>
                            )}
                            {rangoDireccion === 'arriba' && (
                                <>
                                    <label className="text-gray-300 mb-1">Selecciona el algoritmo:</label>
                                    <select
                                        value={selectedAlgorithm}
                                        onChange={e => setSelectedAlgorithm(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-background text-white mb-2"
                                    >
                                        <option value="">Selecciona un algoritmo</option>
                                        <option value="prediccion1">Regesión Lineal</option>
                                        <option value="prediccion2">Media Movil</option>
                                        {/* Agrega aquí más algoritmos de predicción si tienes */}
                                    </select>
                                </>
                            )}
                            {rangoDireccion === 'actual' && (
                                <>
                                    <label className="text-gray-300 mb-1">Selecciona el algoritmo:</label>
                                    <select
                                        value={selectedAlgorithm}
                                        onChange={e => setSelectedAlgorithm(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-background text-white mb-2"
                                    >
                                        <option value="">Selecciona un algoritmo</option>
                                        <option value="prediccion1">Persistencia</option>
                                        {/* Agrega aquí más algoritmos de predicción si tienes */}
                                    </select>
                                </>
                            )}
                            <button
                                onClick={() => handleSeleccionarRango(rangoDireccion)}
                                className="w-full px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors"
                            >
                                Aplicar selección
                            </button>
                            <button
                                onClick={() => setShowDataModal(false)}
                                className="w-full px-4 py-2 rounded-xl bg-secundary border-2 border-background text-gray-300 hover:bg-background-transparent hover:border-background transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}