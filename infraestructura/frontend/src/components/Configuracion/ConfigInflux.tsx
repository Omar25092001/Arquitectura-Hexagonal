import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { InfluxDB } from '@influxdata/influxdb-client';

interface ConfigInfluxProps {
    onConnectionStateChange?: (state: 'idle' | 'testing' | 'success' | 'error') => void;
    onConfigChange?: (config: any) => void;
}

const ConfigInflux = ({ onConnectionStateChange, onConfigChange }: ConfigInfluxProps) => {

    // Configuración y prueba de conexión InfluxDB
    const [influxConfig, setInfluxConfig] = useState({
        url: '',
        token: '',
        org: '',
        bucket: ''
    });

    const [connectionState, setConnectionState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [connectionMessage, setConnectionMessage] = useState('');


    const probarConexionInflux = async () => {
        setConnectionState('testing');
        onConnectionStateChange?.('testing');
        setConnectionMessage('Probando conexión a InfluxDB...');

        const hasUrl = influxConfig.url.trim() !== '';
        const hasToken = influxConfig.token.trim() !== '';
        const hasOrg = influxConfig.org.trim() !== '';
        const hasBucket = influxConfig.bucket.trim() !== '';
        const isValidUrl = influxConfig.url.startsWith('http://') || influxConfig.url.startsWith('https://');

        if (!hasUrl || !hasToken || !hasOrg || !hasBucket || !isValidUrl) {
            setConnectionState('error');
            onConnectionStateChange?.('error');
            let errorMsg = 'Error: ';
            if (!hasUrl || !isValidUrl) {
                errorMsg += 'La URL de InfluxDB debe comenzar con http:// o https://. ';
            } else if (!hasToken) {
                errorMsg += 'Se requiere un token de API válido. ';
            } else if (!hasOrg) {
                errorMsg += 'Se requiere especificar la organización. ';
            } else if (!hasBucket) {
                errorMsg += 'Se requiere especificar un bucket. ';
            }
            setConnectionMessage(errorMsg);
            return;
        }

        try {
            // Crear cliente InfluxDB
            const client = new InfluxDB({
                url: influxConfig.url,
                token: influxConfig.token,
            });

            const queryApi = client.getQueryApi(influxConfig.org);// Obtener API de consulta con la organización
            
            // Consulta básica para verificar conectividad
            const testQuery = `
                from(bucket: "${influxConfig.bucket}")
                |> range(start: -1m)
                |> limit(n: 1)
            `;

            // Intentar ejecutar la consulta
            await queryApi.collectRows(testQuery);

            setConnectionState('success');
            onConnectionStateChange?.('success');
            setConnectionMessage(`Conexión exitosa a InfluxDB. Bucket "${influxConfig.bucket}" disponible para escritura y consulta.`);

        } catch (error: any) {
            setConnectionState('error');
            onConnectionStateChange?.('error');
            
            // Manejar diferentes tipos de errores
            if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
                setConnectionMessage('Error: Token de API inválido o sin permisos.');
            } else if (error.message?.includes('404') || error.message?.includes('bucket')) {
                setConnectionMessage(`Error: El bucket "${influxConfig.bucket}" no existe o no tienes acceso.`);
            } else if (error.message?.includes('org') || error.message?.includes('organization')) {
                setConnectionMessage(`Error: La organización "${influxConfig.org}" no existe.`);
            } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                setConnectionMessage('Error: No se puede conectar al servidor InfluxDB. Verifica la URL.');
            } else {
                setConnectionMessage(`Error de conexión: ${error.message}`);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInfluxConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };


        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-white mb-1">
                            URL de InfluxDB
                        </label>
                        <input
                            id="url"
                            name="url"
                            type="text"
                            placeholder="https://us-west-2-1.aws.cloud2.influxdata.com"
                            value={influxConfig.url}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            URL de la instancia InfluxDB, incluyendo http:// o https://
                        </p>
                    </div>

                    <div>
                        <label htmlFor="token" className="block text-sm font-medium text-white mb-1">
                            Token de API
                        </label>
                        <input
                            id="token"
                            name="token"
                            type="password"
                            placeholder="Token de API de InfluxDB"
                            value={influxConfig.token}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Token de acceso para autenticación con InfluxDB
                        </p>
                    </div>

                    <div>
                        <label htmlFor="org" className="block text-sm font-medium text-white mb-1">
                            Organización
                        </label>
                        <input
                            id="org"
                            name="org"
                            type="text"
                            placeholder="mi-organizacion"
                            value={influxConfig.org}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="bucket" className="block text-sm font-medium text-white mb-1">
                            Bucket
                        </label>
                        <input
                            id="bucket"
                            name="bucket"
                            type="text"
                            placeholder="mi-bucket"
                            value={influxConfig.bucket}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Bucket donde se almacenarán los datos de series temporales
                        </p>
                    </div>
                </div>

                {/* Botón y estado de conexión */}
                <div className="mt-6 mb-4 flex flex-wrap items-start gap-3">
                    <button
                        onClick={probarConexionInflux}
                        disabled={connectionState === 'testing'}
                        className={`px-4 py-2 rounded-lg text-white font-medium flex items-center 
                    ${connectionState === 'testing'
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-orange-400 hover:bg-orange-500'}`}
                    >
                        {connectionState === 'testing' && (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        )}
                        Probar Conexión InfluxDB
                    </button>

                    <div className="flex mt-2 items-center space-x-3">
                        {/* Círculo indicador de estado */}
                        {connectionState === 'success' && (
                            <div className="flex items-center">
                                <div className="h-4 w-4 rounded-full bg-green-500 shadow-lg"></div>
                                <span className="ml-2 text-sm font-medium text-green-400">Conexión exitosa</span>
                            </div>
                        )}

                        {connectionState === 'error' && (
                            <div className="flex items-center ">
                                <div className="h-4 w-4 rounded-full bg-red-500 shadow-lg"></div>
                                <span className="ml-2 text-sm font-medium text-red-400">Conexión fallida</span>
                            </div>
                        )}
                    </div>

                    {/* Panel con detalles del estado */}
                    {connectionState !== 'idle' && (
                        <div className={`flex-grow p-3 rounded-lg flex items-start
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
                </div>

            </div>
        );
    };

    export default ConfigInflux;