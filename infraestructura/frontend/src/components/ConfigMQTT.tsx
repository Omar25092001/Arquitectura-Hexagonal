import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';


const ConfigMQTT = () => {
    const [mqttConfig, setMqttConfig] = useState({
        ip: '',
        topic: '',
        username: '',
        password: ''
    });

    const [connectionState, setConnectionState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [connectionMessage, setConnectionMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMqttConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const testConnection = () => {
        setConnectionState('testing');
        setConnectionMessage('Probando conexión al broker MQTT...');
        
        // Simulación de tiempo de respuesta
        setTimeout(() => {
            // Validación básica de dirección IP y puerto
            const ipPattern = /^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?$|^localhost(?::\d+)?$/;
            const isValidIp = ipPattern.test(mqttConfig.ip);
            
            if (isValidIp && mqttConfig.topic) {
                setConnectionState('success');
                setConnectionMessage(`Conexión exitosa al broker MQTT. Suscrito al tópico ${mqttConfig.topic}.`);
            } else {
                setConnectionState('error');
                const errorMsg = !isValidIp 
                    ? 'Error: La dirección IP del broker no es válida. Formato esperado: 192.168.1.100:1883' 
                    : 'Error: Debe especificar un tópico para la suscripción MQTT.';
                setConnectionMessage(errorMsg);
            }
        }, 1500);
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
                <label htmlFor="topic" className="block text-sm font-medium text-white mb-1">
                    Tópico
                </label>
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
                    onClick={testConnection}
                    disabled={connectionState === 'testing'}
                    className={`px-4 py-2 rounded-lg text-white font-medium flex items-center 
                    ${connectionState === 'testing' 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-orange-400 hover:bg-orange-500'}`}
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
                    <span className={`text-sm ${
                        connectionState === 'success' ? 'text-green-400' : 
                        connectionState === 'error' ? 'text-red-400' : 'text-gray-300'
                    }`}>
                        {connectionMessage}
                    </span>
                </div>
            )}
        </div>
        
    );
}

export default ConfigMQTT;