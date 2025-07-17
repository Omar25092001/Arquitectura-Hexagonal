import { useState,useRef } from 'react';
import { CheckCircle, XCircle, Loader2, HelpCircle } from 'lucide-react';
import FormatoWebSocket from '../Foramatos/FormatoWebSocket';

interface ConfigWebSocketProps {
    onConnectionStateChange?: (state: 'idle' | 'testing' | 'success' | 'error') => void;
    onConfigChange?: (config: any) => void;
}

const ConfigWebSocket = ({ onConnectionStateChange, onConfigChange }: ConfigWebSocketProps) => {

    const [mostrarModalFormato, setMostrarModalFormato] = useState(false);

    //Configuración y prueba de conexión WebSocket
    const [connectionState, setConnectionState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [connectionMessage, setConnectionMessage] = useState('');

    const [config, setConfig] = useState({
        url: '',
        token: '',
        useToken: false
    });

    const probarConexionWebSocket = () => {
        setConnectionState('testing');
        onConnectionStateChange?.('testing');
        setConnectionMessage('Probando conexión WebSocket...');

        const wsPattern = /^wss?:\/\/.+/i;
        const isValidUrl = wsPattern.test(config.url);

        if (!isValidUrl) {
            setConnectionState('error');
            onConnectionStateChange?.('error');
            setConnectionMessage('Error: URL de WebSocket inválida. Debe comenzar con ws:// o wss://');
            return;
        }

        // Intentar conexión real
        try {
            const ws = new WebSocket(config.url);
            
            // Si usas token, puedes enviarlo como header (solo en backend) o como mensaje tras conectar
            ws.onopen = () => {
                console.log('Conexión WebSocket abierta');
                setConnectionState('success');
                onConnectionStateChange?.('success');
                setConnectionMessage('Conexión WebSocket exitosa. El socket está listo para comunicación bidireccional.');
                // Si necesitas enviar un token tras conectar:
                if (config.useToken && config.token) {
                    ws.send(JSON.stringify({ token: config.token }));
                }
                ws.close(); // Cierra la conexión de prueba
            };

            ws.onerror = () => {
                setConnectionState('error');
                onConnectionStateChange?.('error');
                setConnectionMessage('Error: No se pudo conectar al WebSocket.');
            };


        } catch (err) {
            setConnectionState('error');
            onConnectionStateChange?.('error');
            setConnectionMessage('Error: No se pudo crear la conexión WebSocket.');
        }


    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };



    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    return (
        <div className="grid grid-cols-1 gap-4">
            <div>
                <div className="flex items-center mb-1">
                    <label htmlFor="url" className="block text-sm font-medium text-white">
                        URL del WebSocket
                    </label>
                    <button
                        type="button"
                        onClick={() => setMostrarModalFormato(true)}
                        className="ml-2 text-gray-400 hover:text-orange-400 transition-colors"
                        title="Ver formato de datos esperado"
                    >
                        <HelpCircle className="w-4 h-4" />
                    </button>
                </div>
                <input
                    id="url"
                    name="url"
                    type="text"
                    placeholder="wss://example.com/ws"
                    value={config.url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                    Usa wss:// para conexiones seguras (recomendado) o ws:// para conexiones no seguras
                </p>
            </div>

            <div className="flex items-center">
                <input
                    id="useToken"
                    name="useToken"
                    type="checkbox"
                    checked={config.useToken}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-orange-400 border-background rounded focus:ring-orange-400"
                />
                <label htmlFor="useToken" className="ml-2 text-sm font-medium text-white">
                    Usar token de autenticación
                </label>
            </div>

            {config.useToken && (
                <div>
                    <label htmlFor="token" className="block text-sm font-medium text-white mb-1">
                        Token
                    </label>
                    <input
                        id="token"
                        name="token"
                        type="text"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        value={config.token}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                </div>
            )}
            {/* Botón y estado de conexión con círculo indicador */}
            <div className="mt-6 flex items-center flex-wrap gap-3">
                <button
                    onClick={probarConexionWebSocket}
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
                    <span className={`text-sm ${connectionState === 'success' ? 'text-green-400' :
                        connectionState === 'error' ? 'text-red-400' : 'text-gray-300'
                        }`}>
                        {connectionMessage}
                    </span>
                </div>
            )}
            <FormatoWebSocket 
                isOpen={mostrarModalFormato} 
                onClose={() => setMostrarModalFormato(false)} 
            />
        </div>


    );
};

export default ConfigWebSocket;