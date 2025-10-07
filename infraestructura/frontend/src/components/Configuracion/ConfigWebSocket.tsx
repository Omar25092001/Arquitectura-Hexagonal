import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, HelpCircle } from 'lucide-react';
import FormatoWebSocket from '../Formatos/FormatoWebSocket';

interface ConfigWebSocketProps {
    onConnectionStateChange?: (state: 'idle' | 'testing' | 'success' | 'error') => void;
    onConfigChange?: (config: any) => void;
}

const ConfigWebSocket = ({ onConnectionStateChange, onConfigChange }: ConfigWebSocketProps) => {
    const [mostrarModalFormato, setMostrarModalFormato] = useState(false);

    const [config, setConfig] = useState({
        url: '',
        port: '8080',
        path: ''
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
        return config.url.trim() !== '' && config.port.trim() !== '';
    };

    const probarConexionWebSocket = () => {
        setConnectionState('testing');
        onConnectionStateChange?.('testing');
        setConnectionMessage('Conectando al servidor WebSocket...');

        const wsUrl = `ws://${config.url}:${config.port}${config.path}`;
        console.log('🔍 Intentando conectar a WebSocket:', wsUrl);

        let ws: WebSocket;

        try {
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('✅ Conexión WebSocket exitosa');
                setConnectionState('success');
                onConnectionStateChange?.('success');
                setConnectionMessage('Conexión exitosa al servidor WebSocket');
                
                setTimeout(() => {
                    ws.close();
                }, 2000);
            };

            ws.onerror = (error) => {
                console.error('❌ Error de conexión WebSocket:', error);
                setConnectionState('error');
                onConnectionStateChange?.('error');
                setConnectionMessage('Error: No se pudo conectar al servidor WebSocket. Verifica la URL y el puerto.');
            };

            ws.onclose = () => {
                console.log('🔌 Conexión WebSocket cerrada');
            };

        } catch (error: any) {
            console.error('❌ Error al crear WebSocket:', error);
            setConnectionState('error');
            onConnectionStateChange?.('error');
            setConnectionMessage(`Error: ${error.message}`);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="url" className="block text-sm font-medium text-white mb-1">
                    URL del Servidor
                </label>
                <input
                    id="url"
                    name="url"
                    type="text"
                    placeholder="localhost o 192.168.1.100"
                    value={config.url}
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
                    placeholder="8080"
                    value={config.port}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
            </div>

            <div>
                <div className="flex items-center mb-1">
                    <label htmlFor="path" className="block text-sm font-medium text-white">
                        Path (opcional)
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
                    id="path"
                    name="path"
                    type="text"
                    placeholder="/ws"
                    value={config.path}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
            </div>

            <div className="mt-6 flex items-center flex-wrap gap-3">
                <button
                    onClick={probarConexionWebSocket}
                    disabled={connectionState === 'testing' || !camposObligatoriosCompletos()}
                    className={`px-4 py-2 rounded-lg text-white font-medium flex items-center transition-colors tutorial-test-button
                        ${connectionState === 'testing' || !camposObligatoriosCompletos()
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-orange-400 hover:bg-orange-500'}`}
                    title={!camposObligatoriosCompletos() ? 'Complete URL y Puerto para continuar' : ''}
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

            <FormatoWebSocket
                isOpen={mostrarModalFormato}
                onClose={() => setMostrarModalFormato(false)}
            />
        </div>
    );
};

export default ConfigWebSocket;