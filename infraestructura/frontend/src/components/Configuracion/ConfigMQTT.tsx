import { useState, useRef } from 'react';
import { CheckCircle, XCircle, Loader2, HelpCircle } from 'lucide-react';
import mqtt from 'mqtt';
import FormatoMQTT from '../Formatos/FormatoMQTT';

interface ConfigMQTTProps {
    onConnectionStateChange?: (state: 'idle' | 'testing' | 'success' | 'error') => void;
    onConfigChange?: (config: any) => void;
}

const ConfigMQTT = ({ onConnectionStateChange, onConfigChange }: ConfigMQTTProps) => {

    const [mostrarModalFormato, setMostrarModalFormato] = useState(false);

    //Prueba de Conexión MQTT

    const [mqttConfig, setMqttConfig] = useState({
        ip: '',
        topic: '',
        username: '',
        password: ''
    });

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [connectionState, setConnectionState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [connectionMessage, setConnectionMessage] = useState('');

    const camposObligatoriosCompletos = () => {
        return mqttConfig.ip.trim() !== '' && mqttConfig.topic.trim() !== '';
    };

    const ProbarConexionMQTT = () => {

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        const url = `ws://${mqttConfig.ip}`;
        const opcionesConexion: mqtt.IClientOptions = {
            username: mqttConfig.username,
            password: mqttConfig.password,
        };
        setConnectionState('testing');
        onConnectionStateChange?.('testing');
        setConnectionMessage('Probando conexión al broker MQTT...');
        const client = mqtt.connect(url, opcionesConexion);


        timeoutRef.current = setTimeout(() => {
            setConnectionState('error');
            onConnectionStateChange?.('error');
            setConnectionMessage('No se pudo conectar al broker MQTT.');
            client.end(true);
        }, 10000);


        //Conexión y manejo de eventos
        client.on('connect', () => {
            setConnectionState('success');
            onConnectionStateChange?.('success');
            setConnectionMessage(`Conexión exitosa al broker MQTT. Suscrito al tópico ${mqttConfig.topic}.`);
            
            client.subscribe(mqttConfig.topic, (err) => {
                if (err) {
                    setConnectionState('error');
                    setConnectionMessage(`Error al suscribirse al tópico ${mqttConfig.topic}: ${err.message}`);
                }
            });
        });

        //Manejo en caso de error
        client.on('error', (err: Error) => {
            setConnectionState('error');
            onConnectionStateChange?.('error');
            setConnectionMessage(`Error de conexión: ${err.message}`);
            client.end();
        });

    };

    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newConfig = { ...mqttConfig, [name]: value };
        setMqttConfig(newConfig);
        
        // ENVIAR CONFIGURACIÓN AL PADRE
        console.log('Enviando config MQTT:', newConfig);
        onConfigChange?.(newConfig);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="ip" className="block text-sm font-medium text-white mb-1">
                    Dirección IP del broker
                </label>
                <input
                    id="ip"
                    name="ip"
                    type="text"
                    placeholder="192.168.1.100:1883"
                    value={mqttConfig.ip}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
            </div>

            <div>
               <div className="flex items-center mb-1">
                    <label htmlFor="topic" className="block text-sm font-medium text-white">
                        Tópico
                    </label>
                    <button
                        type="button"
                        onClick={() => setMostrarModalFormato(true)}
                        className="ml-2 text-gray-400 hover:text-orange-400 transition-colors tutorial-format-button"
                        title="Ver formato de datos esperado"
                    >
                        <HelpCircle className="w-4 h-4 " />
                    </button>
                </div>
                <input
                    id="topic"
                    name="topic"
                    type="text"
                    placeholder="sensor/data"
                    value={mqttConfig.topic}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
            </div>

            <div>
                <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
                    Usuario
                </label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Usuario (opcional)"
                    value={mqttConfig.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                    Contraseña
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Contraseña (opcional)"
                    value={mqttConfig.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
            </div>
            {/* Botón y estado de conexión con círculo indicador */}
            <div className="mt-6 flex items-center flex-wrap gap-3">
               <button
                    onClick={ProbarConexionMQTT}
                    disabled={connectionState === 'testing' || !camposObligatoriosCompletos()}
                    className={`px-4 py-2 rounded-lg text-white font-medium flex items-center transition-colors
                    ${connectionState === 'testing' || !camposObligatoriosCompletos()
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-orange-400 hover:bg-orange-500'}`}
                    title={!camposObligatoriosCompletos() ? 'Complete IP y Tópico para continuar' : ''}
                >
                    {connectionState === 'testing' && (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    )}
                    Probar Conexión
                </button>

                {/* Círculo indicador de estado */}
                {connectionState === 'success' && (
                    <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-green-500 shadow-lg"></div>
                        <span className="ml-2 text-sm font-medium text-green-400">Conexión exitosa</span>
                    </div>
                )}

                {connectionState === 'error' && (
                    <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-red-500 shadow-lg"></div>
                        <span className="ml-2 text-sm font-medium text-red-400">Conexión fallida</span>
                    </div>
                )}
            </div>

            {/* Panel con detalles del estado */}
            {connectionState !== 'idle' && (
                <div className={`mt-3 p-3 rounded-lg flex items-start
                    ${connectionState === 'testing' ? 'bg-gray-700 bg-opacity-70' : ''}
                    ${connectionState === 'success' ? 'bg-green-900 bg-opacity-20' : ''}
                    ${connectionState === 'error' ? 'bg-red-900 bg-opacity-20' : ''}`}
                >
                    {connectionState === 'testing' && <Loader2 className="w-5 h-5 mr-2 animate-spin text-gray-300" />}
                    {connectionState === 'success' && <CheckCircle className="w-5 h-5 mr-2 text-green-400" />}
                    {connectionState === 'error' && <XCircle className="w-5 h-5 mr-2 text-red-400" />}
                    <span className={`text-sm ${connectionState === 'success' ? 'text-green-400' :
                            connectionState === 'error' ? 'text-red-400' : 'text-gray-300'
                        }`}>
                        {connectionMessage}
                    </span>
                </div>
            )}
            <FormatoMQTT
                isOpen={mostrarModalFormato} 
                onClose={() => setMostrarModalFormato(false)} 
            />
        </div>

    );
}

export default ConfigMQTT;