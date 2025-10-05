import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/user.store';
import Header from '../components/Header';
import { ejecutarAlgoritmo } from '@/Algoritmos/Index';
import MonitorizacionVariables from '@/components/Ejecucion/MonitorizacionVariables'
import DatosEnTiempoReal, { type DataPoint } from '../components/Ejecucion/DatosEntiempoReal';
import { CheckCircle, Play, Pause, RotateCcw, Settings, Activity, Wifi, WifiOff, Database, AlertTriangle, Monitor, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    conectarMQTT,
    conectarWebSocket,
    conectarHTTP,
    conectarInfluxDB,
    leerArchivoExcelConRango
} from '../utils/ExtraerDatos';
import ModalDetalleRegistro from '@/components/Ejecucion/ModalDetalleRegistro';


export default function Ejecucion() {
    const navigate = useNavigate();

    const userId = useUserStore((state) => state.user.id);

    const [isRunning, setIsRunning] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [dataSourceConfig, setDataSourceConfig] = useState<any>(null);
    const [variablesConfig, setVariablesConfig] = useState<any>(null);
    const [liveData, setLiveData] = useState<DataPoint[]>([]);
    const [connectionError, setConnectionError] = useState<string>('');
    const [mqttClient, setMqttClient] = useState<any>(null);
    const [wsClient, setWsClient] = useState<WebSocket | null>(null);
    const [httpInterval, setHttpInterval] = useState<NodeJS.Timeout | null>(null);
    const [showDataModal, setShowDataModal] = useState(false);
    const [selectedData, setSelectedData] = useState<DataPoint | null>(null);
    const [intervaloTiempo, setIntervaloTiempo] = useState<number>(15);

    const [rangoDireccion, setRangoDireccion] = useState<'arriba' | 'abajo' >('arriba');
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');

    const [isProcessingAlgorithm, setIsProcessingAlgorithm] = useState(false);


    const [modoMonitorizacion, setModoMonitorizacion] = useState(false);
    
    const steps = [
        { id: 1, title: 'Fuentes de Datos', active: true },
        { id: 2, title: 'Variables', active: true },
        { id: 3, title: 'Ejecución', active: true }
    ];

    useEffect(() => {
        const loadConfigurations = () => {
            const dataSource = localStorage.getItem('dataSourceConfig');
            const variables = localStorage.getItem('selectedVariables');
            const tiempo = Number(localStorage.getItem('intervaloMinutos'))
            setIntervaloTiempo(tiempo);
            if (dataSource) setDataSourceConfig(JSON.parse(dataSource));
            if (variables) setVariablesConfig({ variables: JSON.parse(variables) });
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
                    leerArchivoExcelConRango(
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

    const handleSeleccionarRango = async (direccion: 'arriba' | 'abajo' | 'actual') => {
        if (!selectedData || !selectedAlgorithm) {
            alert('Por favor selecciona un algoritmo primero');
            return;
        }

        setIsProcessingAlgorithm(true);
        const startTime = Date.now();

        try {
            const idx = liveData.findIndex(d => d === selectedData);
            let datosSeleccionados: DataPoint[] = [];
            let rangeDescription = '';

            // Seleccionar datos según la dirección
            if (direccion === 'arriba') {
                // Desde el inicio hasta el seleccionado (incluido), invertir para orden cronológico
                datosSeleccionados = liveData.slice(0, idx + 1).reverse();
                rangeDescription = `Desde el inicio hasta el registro ${idx + 1} (${datosSeleccionados.length} registros)`;
            } else if (direccion === 'abajo') {
                // Desde el seleccionado hasta el final
                datosSeleccionados = liveData.slice(idx);
                rangeDescription = `Desde el registro ${idx + 1} hasta el final (${datosSeleccionados.length} registros)`;
            } else {
                // Solo el dato actual
                datosSeleccionados = [selectedData];
                rangeDescription = `Solo el registro ${idx + 1} (1 registro)`;
            }

            // Obtener variables disponibles (excluir timestamp)
            const variables = Object.keys(datosSeleccionados[0] || {}).filter(key => key !== 'timestamp');

            if (variables.length === 0) {
                alert('No hay variables disponibles para procesar');
                return;
            }

            // Ejecutar algoritmo usando la función de los archivos separados
            const algorithmId = direccion === 'actual' && selectedAlgorithm === 'prediccion1' ? 'persistencia' : selectedAlgorithm;
            const predictions = ejecutarAlgoritmo(algorithmId, datosSeleccionados, variables);

            const executionTime = Date.now() - startTime;

            // Crear resultado del algoritmo
            const result = {
                algorithm: algorithmId === 'prediccion1' ? 'Regresión Lineal' :
                    algorithmId === 'prediccion2' ? 'Media Móvil' : 'Persistencia',
                input: datosSeleccionados,
                predictions: predictions,
                summary: {
                    totalRecords: datosSeleccionados.length,
                    variables: variables,
                    range: rangeDescription,
                    executionTime: executionTime
                }
            };

            // Cerrar modal de selección y abrir modal de resultados
            setShowDataModal(false);

            console.log('Algoritmo ejecutado exitosamente:', result);

        } catch (error: any) {
            console.error(' Error ejecutando algoritmo:', error);
            alert(`Error ejecutando algoritmo: ${error.message}`);
        } finally {
            setIsProcessingAlgorithm(false);
        }
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

    const handleAsignacionesMonitor = (asignaciones: Record<string, string>) => {
        console.log('Asignaciones guardadas:', asignaciones);
        // Aquí podrías guardar en localStorage o enviar al backend
        localStorage.setItem('asignacionesMonitor', JSON.stringify(asignaciones));
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

                        {/* Estado del Sistema */}
                        <div className="bg-secundary rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Estado del Sistema</h3>
                            <div className="text-gray-300 space-y-1">
                                <p><strong>Conexión:</strong> {
                                    connectionStatus === 'connected' ? '🟢 Conectado' :
                                        connectionStatus === 'connecting' ? '🟡 Conectando...' :
                                            connectionStatus === 'error' ? '🔴 Error' :
                                                '⚪ Desconectado'
                                }</p>
                                <p><strong>Monitorización:</strong> {modoMonitorizacion ? '🔍 Activa' : '📊 Datos en bruto'}</p>
                                <p><strong>Datos almacenados:</strong> {liveData.length} registros</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-700">
                        <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center">
                            <Activity className="w-5 sm:w-6 h-5 sm:h-6 mr-2 text-orange-400" />
                            <span className="truncate">
                                {modoMonitorizacion ? 'Monitorización de Variables' : 'Datos en Tiempo Real'}
                            </span>
                            {connectionStatus === 'connected' && !modoMonitorizacion && (
                                <span className="ml-2 text-xs sm:text-sm px-2 py-1 bg-green-600 bg-opacity-30 text-green-300 rounded whitespace-nowrap">
                                    En vivo
                                </span>
                            )}
                        </h2>

                        <button
                            onClick={() => setModoMonitorizacion(!modoMonitorizacion)}
                            className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base ${modoMonitorizacion
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-green-500 hover:bg-green-600'
                                }`}
                        >
                            {modoMonitorizacion ? (
                                <>
                                    <Monitor className="w-4 sm:w-5 h-4 sm:h-5" />
                                    <span className="hidden sm:inline">Ocultar Monitorización</span>
                                    <span className="sm:hidden">Ocultar</span>
                                </>
                            ) : (
                                <>
                                    <Sun className="w-4 sm:w-5 h-4 sm:h-5" />
                                    <span className="hidden sm:inline">Activar Monitorización</span>
                                    <span className="sm:hidden">Activar</span>
                                </>
                            )}
                        </button>
                    </div>
                    {/* Panel de Datos en Tiempo Real */}
                    {modoMonitorizacion ? (
                        <MonitorizacionVariables
                            variablesRecibidas={variablesConfig?.variables || []}
                            onAsignar={handleAsignacionesMonitor}
                            datosActuales={liveData[0] || {}} // Pasar datos actuales
                        />
                    ) : (
                        <DatosEnTiempoReal
                            connectionStatus={connectionStatus}
                            dataSourceConfig={dataSourceConfig}
                            liveData={liveData}
                            onSelectData={handleSelectData}
                        />
                    )}

                </div>
            </div>
            <ModalDetalleRegistro
                isOpen={showDataModal}
                onClose={() => setShowDataModal(false)}
                selectedData={selectedData}
                rangoDireccion={rangoDireccion}
                onRangoDireccionChange={setRangoDireccion}
                selectedAlgorithm={selectedAlgorithm}
                onSelectedAlgorithmChange={setSelectedAlgorithm}
                isProcessingAlgorithm={isProcessingAlgorithm}
                onEjecutarAlgoritmo={handleSeleccionarRango}
                usuarioId={userId}
            />
        </div>
    );
}