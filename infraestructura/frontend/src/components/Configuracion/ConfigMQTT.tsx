import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, HelpCircle } from 'lucide-react';
import * as mqtt from 'mqtt';
import FormatoMQTT from '../Formatos/FormatoMQTT';

interface ConfigMQTTProps {
    onConnectionStateChange?: (state: 'idle' | 'testing' | 'success' | 'error') => void;
    onConfigChange?: (config: any) => void;
}

const ConfigMQTT = ({ onConnectionStateChange, onConfigChange }: ConfigMQTTProps) => {
    const [mostrarModalFormato, setMostrarModalFormato] = useState(false);

    const [config, setConfig] = useState({
        broker: '',
        port: '1883',
        topic: '',
        username: '',
        password: ''
    });

    const [connectionState, setConnectionState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [connectionMessage, setConnectionMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newConfig = {
            ...config,
            [name]: value
        };
        setConfig(newConfig);
        onConfigChange?.(newConfig);
    };

    const camposObligatoriosCompletos = () => {
        return config.broker.trim() !== '' && config.port.trim() !== '' && config.topic.trim() !== '';
    };

    const probarConexionMqtt = () => {
        setConnectionState('testing');
        onConnectionStateChange?.('testing');
        setConnectionMessage('Conectando al broker MQTT...');

        const brokerUrl = `ws://${config.broker}:${config.port}`;

        const options: mqtt.IClientOptions = {
            clientId: `mqtt_client_${Math.random().toString(16).slice(2, 8)}`,
            clean: true,
            connectTimeout: 10000,
        };

        if (config.username && config.password) {
            options.username = config.username;
            options.password = config.password;
        }

        console.log('🔍 Intentando conectar a MQTT:', brokerUrl);

        const client = mqtt.connect(brokerUrl, options);

        client.on('connect', () => {
            console.log('✅ Conexión MQTT exitosa');
            setConnectionState('success');
            onConnectionStateChange?.('success');
            setConnectionMessage('Conexión exitosa al broker MQTT');
            
            client.subscribe(config.topic, (err) => {
                if (!err) {
                    console.log(`✅ Suscrito al topic: ${config.topic}`);
                } else {
                    console.error('❌ Error al suscribirse:', err);
                }
            });

            setTimeout(() => {
                client.end();
            }, 2000);
        });

        client.on('error', (error) => {
            console.error('❌ Error de conexión MQTT:', error);
            setConnectionState('error');
            onConnectionStateChange?.('error');
            setConnectionMessage(`Error de conexión: ${error.message}`);
            client.end();
        });

        client.on('offline', () => {
            console.warn('⚠️ Cliente MQTT desconectado');
            if (connectionState === 'testing') {
                setConnectionState('error');
                onConnectionStateChange?.('error');
                setConnectionMessage('No se pudo conectar al broker MQTT. Verifica la dirección y el puerto.');
            }
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="broker" className="block text-sm font-medium text-white mb-1">
                    Broker
                </label>
                <input
                    id="broker"
                    name="broker"
                    type="text"
                    placeholder="broker.hivemq.com"
                    value={config.broker}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
            </div>

            <div>
                <label htmlFor="port" className="block text-sm font-medium text-white mb-1">
                    Puerto
                </label>
                <input
                    id="port"
                    name="port"
                    type="text"
                    placeholder="1883"
                    value={config.port}
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
                        className="ml-2 text-orange-400 hover:text-orange-300 transition-all duration-300 relative group tutorial-format-button"
                        title="Ver formato de mensaje esperado"
                    >
                        <HelpCircle className="w-4 h-4 animate-pulse" />
                        <span className="absolute inset-0 rounded-full bg-orange-400 opacity-0 group-hover:opacity-30 animate-ping"></span>
                    </button>
                </div>
                <input
                    id="topic"
                    name="topic"
                    type="text"
                    placeholder="sensor/data"
                    value={config.topic}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
            </div>

            <div>
                <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
                    Usuario (opcional)
                </label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Usuario"
                    value={config.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                    Contraseña (opcional)
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Contraseña"
                    value={config.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
            </div>

            <div className="mt-6 flex items-center flex-wrap gap-3">
                <button
                    onClick={probarConexionMqtt}
                    disabled={connectionState === 'testing' || !camposObligatoriosCompletos()}
                    className={`px-4 py-2 rounded-lg text-white font-medium flex items-center transition-colors tutorial-test-button
                        ${connectionState === 'testing' || !camposObligatoriosCompletos()
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-orange-400 hover:bg-orange-500'}`}
                    title={!camposObligatoriosCompletos() ? 'Complete todos los campos obligatorios' : ''}
                >
                    {connectionState === 'testing' && (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    )}
                    Probar Conexión
                </button>

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
};

export default ConfigMQTT;