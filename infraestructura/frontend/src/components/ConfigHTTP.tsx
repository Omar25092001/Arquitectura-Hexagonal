import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const ConfigHTTP = () => {
    const [config, setConfig] = useState({
        url: '',
        endpoint: '',
        method: 'GET',
        username: '',
        password: ''
    });

    const [connectionState, setConnectionState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [connectionMessage, setConnectionMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const testConnection = () => {
        setConnectionState('testing');
        setConnectionMessage('Probando conexión...');
        
        // Simulación de tiempo de respuesta
        setTimeout(() => {
            // Simulación de resultado aleatorio o basado en alguna condición simple
            const isSuccess = config.url.includes('https://');
            
            if (isSuccess) {
                setConnectionState('success');
                setConnectionMessage('Conexión exitosa. El servidor respondió correctamente.');
            } else {
                setConnectionState('error');
                setConnectionMessage('Error: No se pudo establecer la conexión. Verifique la URL o si necesita https://');
            }
        }, 1500);
    };

    return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-white mb-1">
                        URL del Servicio
                    </label>
                    <input
                        id="url"
                        name="url"
                        type="text"
                        placeholder="https://api.example.com"
                        value={config.url}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                </div>
                
                <div>
                    <label htmlFor="endpoint" className="block text-sm font-medium text-white mb-1">
                        Endpoint
                    </label>
                    <input
                        id="endpoint"
                        name="endpoint"
                        type="text"
                        placeholder="/api/data"
                        value={config.endpoint}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                </div>
                
                <div>
                    <label htmlFor="method" className="block text-sm font-medium text-white mb-1">
                        Método HTTP
                    </label>
                    <h2 className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400">
                        GET (Por defecto)
                    </h2>
                </div>
               
            
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                        Contraseña o Token
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Contraseña/Token (opcional)"
                        value={config.password}
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
};

export default ConfigHTTP;