import { useState, useEffect } from 'react';
import Header from '../components/Header';
import ConfigMQTT from '@/components/Configuracion/ConfigMQTT';
import ConfigWebSocket from '@/components/Configuracion/ConfigWebSocket';
import ConfigHTTP from '@/components/Configuracion/ConfigHTTP';
import ConfigInflux from '@/components/Configuracion/ConfigInflux';
import ConfigExcel from '@/components/Configuracion/ConfigExcel';
import { CheckCircle, ArrowRight, ChevronDown } from 'lucide-react';
import { GrSatellite } from "react-icons/gr";
import { SiInfluxdb } from "react-icons/si";
import { RiFileExcel2Fill } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';

export default function FuenteDatos() {
    const [selectedDataSource, setSelectedDataSource] = useState('mqtt');
    const [selectedProtocol, setSelectedProtocol] = useState('mqtt');
    const [protocolDropdownOpen, setProtocolDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const [estadoConexion, setEstadoConexion] = useState({
        mqtt: 'idle',
        websocket: 'idle',
        http: 'idle',
        influx: 'idle',
        file: 'idle'
    });

    const protocolOptions = [
        { id: 'mqtt', name: 'MQTT' },
        { id: 'websocket', name: 'WebSocket' },
        { id: 'http', name: 'HTTP/REST' }
    ];
    const steps = [
        { id: 1, title: 'Fuentes de Datos', active: true },
        { id: 2, title: 'Variables', active: false },
        { id: 3, title: 'Algoritmo', active: false },
        { id: 4, title: 'Ejecución', active: false }
    ];

    

    // Estado para almacenar las configuraciones de cada fuente de datos
    const [configurations, setConfigurations] = useState({
        mqtt: {},
        websocket: {},
        http: {},
        influx: {},
        file: {}
    });
    

    const dataSourceOptions = [
        {
            id: 'mqtt',
            title: 'Protocolo Directo',
            subtitle: 'MQTT, Websocket HTTP',
            icon: <GrSatellite className="w-8 h-8" />,
            selected: selectedDataSource === 'mqtt'
        },
        {
            id: 'influx',
            title: 'InfluxDB',
            subtitle: 'Base de datos temporal',
            icon: <SiInfluxdb className="w-8 h-8" />,
            selected: selectedDataSource === 'influx'
        },
        {
            id: 'file',
            title: 'Archivo Excel',
            subtitle: 'Datos Historicos CSV/XLSX',
            icon: <RiFileExcel2Fill className="w-8 h-8" />,
            selected: selectedDataSource === 'file'
        }
    ];
    
    useEffect(() => {
        console.log('FuenteDatos montado - Iniciando limpieza...');
        
        // Verificar si ya se hizo la limpieza en esta sesión
        const hasReloaded = sessionStorage.getItem('fuenteDatosReloaded');
        
        if (!hasReloaded) {
            console.log('Primera carga - Limpiando localStorage y recargando...');
            
            // Limpiar localStorage
            const keysToRemove = [
                'dataSourceConfig',
                'selectedVariables', 
                'algorithmConfig'
            ];
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Marcar que ya se hizo la limpieza
            sessionStorage.setItem('fuenteDatosReloaded', 'true');
            
            // Recargar la página para limpiar todas las conexiones y estados
            window.location.reload();
            return;
        }
        
        console.log('Página ya recargada - Continuando normalmente');
        
        // Limpiar la marca cuando el usuario navega fuera de esta página
        const handleBeforeUnload = () => {
            sessionStorage.removeItem('fuenteDatosReloaded');
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Limpiar la marca cuando el usuario navega a otra página usando React Router
    useEffect(() => {
        return () => {
            // Solo limpiar si estamos navegando fuera, no si se está desmontando por recarga
            if (!window.location.href.includes('/fuente-datos')) {
                sessionStorage.removeItem('fuenteDatosReloaded');
            }
        };
    }, []);

    const handleDataSourceChange = (newDataSource: string) => {
        // Resetear todos los estados de conexión cuando cambia la fuente
        setEstadoConexion({
            mqtt: 'idle',
            websocket: 'idle',
            http: 'idle',
            influx: 'idle',
            file: 'idle'
        });

        setSelectedDataSource(newDataSource);

        // Si es protocolo directo, resetear también el protocolo seleccionado
        if (newDataSource === 'mqtt') {
            setSelectedProtocol('mqtt');
        }
    };

    // Función para actualizar la configuración de un protocolo específico
    const actualizarConfiguracion = (protocol: string, config: any) => {
        setConfigurations(prev => ({
            ...prev,
            [protocol]: config
        }));
    };


    const handleProtocolChange = (newProtocol: string) => {
        // Resetear solo los estados de los protocolos directos
        setEstadoConexion(prev => ({
            ...prev,
            mqtt: 'idle',
            websocket: 'idle',
            http: 'idle'
        }));

        setSelectedProtocol(newProtocol);
        setProtocolDropdownOpen(false);
    };

    const actualizarEstadoConexion = (protocol: string, state: 'idle' | 'testing' | 'success' | 'error') => {
        setEstadoConexion(prev => ({
            ...prev,
            [protocol]: state
        }));
    };

    const handleSiguientePaso = () => {
    const currentProtocol = selectedDataSource === 'mqtt' ? selectedProtocol : selectedDataSource;
    const currentConfig = configurations[currentProtocol as keyof typeof configurations];

    let dataSourceInfo;
    
    if (currentProtocol === 'file') {
        //PARA ARCHIVOS: SOLO GUARDAR METADATOS, NO EL ARCHIVO
        const fileConfig = currentConfig as any;
        const { file, ...configSinArchivo } = fileConfig || {};
        dataSourceInfo = {
            protocol: currentProtocol,
            config: configSinArchivo,
            needsFile: true // BANDERA PARA INDICAR QUE NECESITA ARCHIVO
        };
    } else {
        dataSourceInfo = {
            protocol: currentProtocol,
            config: currentConfig
        };
    }
    
    localStorage.setItem('dataSourceConfig', JSON.stringify(dataSourceInfo));
    navigate('/usuario/variables');
};

    const hasSuccessfulConnection = Object.values(estadoConexion).includes('success');


    return (
        <div className="bg-background min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex flex-col items-center justify-center px-4 ">
                {/* Tarjeta con bg-secundary */}
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
                            <h1 className="text-2xl md:text-xl font-bold text-white">Paso 1: Seleccionar Fuente de Datos</h1>
                        </div>

                        {/* Opciones de fuentes de datos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {dataSourceOptions.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => handleDataSourceChange(option.id)}
                                    className={`p-4 rounded-lg cursor-pointer transition-colors ${option.selected
                                        ? 'bg-background-transparent border-2 border-background text-white'
                                        : 'bg-secundary border-2 border-background text-gray-300 hover:bg-background-transparent hover:border-background'
                                        }`}
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="mb-3">
                                            {option.icon}
                                        </div>
                                        <h2 className="font-semibold text-lg mb-1">{option.title}</h2>
                                        <p className="text-sm">{option.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>

                            <h2 className="text-lg font-semibold text-white mb-4">Configuración de la Conexión</h2>

                            {selectedDataSource === 'mqtt' && (
                                <div className="mb-6">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-white mb-1">
                                            Tipo de Protocolo
                                        </label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setProtocolDropdownOpen(!protocolDropdownOpen)}
                                                className="w-full flex items-center justify-between px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                            >
                                                <span>{protocolOptions.find(p => p.id === selectedProtocol)?.name}</span>
                                                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${protocolDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {protocolDropdownOpen && (
                                                <div className="absolute z-10 w-full mt-1 bg-background border border-background rounded-lg shadow-lg">
                                                    {protocolOptions.map((protocol) => (
                                                        <div
                                                            key={protocol.id}
                                                            onClick={() => handleProtocolChange(protocol.id)} // <-- Usar la nueva función
                                                            className="px-3 py-2 hover:bg-secundary cursor-pointer text-gray-300"
                                                        >
                                                            {protocol.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {selectedProtocol === 'mqtt' &&
                                        <ConfigMQTT onConnectionStateChange={(state) => actualizarEstadoConexion('mqtt', state)}
                                            onConfigChange={(config) => actualizarConfiguracion('mqtt', config)} />}
                                    {selectedProtocol === 'websocket' &&
                                        <ConfigWebSocket onConnectionStateChange={(state) => actualizarEstadoConexion('websocket', state)}
                                            onConfigChange={(config) => actualizarConfiguracion('websocket', config)} />}
                                    {selectedProtocol === 'http' && <ConfigHTTP onConnectionStateChange={(state) => actualizarEstadoConexion('http', state)}
                                        onConfigChange={(config) => actualizarConfiguracion('http', config)} />}
                                </div>
                            )}
                            {selectedDataSource === 'influx' &&
                                <ConfigInflux onConnectionStateChange={(state) => actualizarEstadoConexion('influx', state)}
                                    onConfigChange={(config) => actualizarConfiguracion('influx', config)} />}
                            {selectedDataSource === 'file' && 
                                <ConfigExcel 
                                    onConnectionStateChange={(state) => actualizarEstadoConexion('file', state)}
                                    onConfigChange={(config) => actualizarConfiguracion('file', config)} 
                                />
                            }
                        </div>

                        {/* Botón de acción */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleSiguientePaso()}
                                disabled={!hasSuccessfulConnection}
                                className={`px-4 py-2 rounded-lg flex items-center transition-colors ${hasSuccessfulConnection
                                    ? 'bg-orange-400 text-white hover:bg-orange-500'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Siguiente Paso
                                <ArrowRight className="ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}