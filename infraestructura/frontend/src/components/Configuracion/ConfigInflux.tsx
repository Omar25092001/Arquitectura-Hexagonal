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
        bucket: '',
        measurement: '',
        useMeasurement: true // Nueva opción para usar o no measurement
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
        const needsMeasurement = influxConfig.useMeasurement && influxConfig.measurement.trim() === '';

        if (!hasUrl || !hasToken || !hasOrg || !hasBucket || !isValidUrl || needsMeasurement) {
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
            } else if (needsMeasurement) {
                errorMsg += 'Se requiere especificar un measurement cuando está habilitado. ';
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

            const queryApi = client.getQueryApi(influxConfig.org);

            if (influxConfig.useMeasurement) {
                // OPCIÓN 1: CON MEASUREMENT ESPECÍFICO (comportamiento actual)
                const testQuery = `
                    from(bucket: "${influxConfig.bucket}")
                    |> range(start: -24h)
                    |> filter(fn: (r) => r._measurement == "${influxConfig.measurement}")
                    |> limit(n: 1)
                `;

                const rows = await queryApi.collectRows(testQuery);

                setConnectionState('success');
                onConnectionStateChange?.('success');

                if (rows.length > 0) {
                    setConnectionMessage(`Conexión exitosa. Measurement "${influxConfig.measurement}" encontrado en bucket "${influxConfig.bucket}" con datos existentes.`);
                } else {
                    setConnectionMessage(`Conexión exitosa. Bucket "${influxConfig.bucket}" accesible. Measurement "${influxConfig.measurement}" está listo para recibir datos.`);
                }

                onConfigChange?.({
                    url: influxConfig.url,
                    token: influxConfig.token,
                    org: influxConfig.org,
                    bucket: influxConfig.bucket,
                    measurement: influxConfig.measurement,
                    useMeasurement: true,
                    isValid: true
                });

            } else {
                // OPCIÓN 2: SIN MEASUREMENT - LEER TODAS LAS VARIABLES DEL BUCKET
                const discoverQuery = `
                    from(bucket: "${influxConfig.bucket}")
                    |> range(start: -7d)
                    |> group(columns: ["_measurement"])
                    |> distinct(column: "_field")
                    |> group()
                    |> sort()
                `;

                const rows = await queryApi.collectRows(discoverQuery);

                setConnectionState('success');
                onConnectionStateChange?.('success');

                // Agrupar variables por measurement
                const measurementMap = new Map();
                let totalVariables = 0;

                rows.forEach(row => {
                    const { _measurement, _field } = row as { _measurement: string; _field: string };
                    
                    if (!_measurement || !_field) return;

                    if (!measurementMap.has(_measurement)) {
                        measurementMap.set(_measurement, []);
                    }
                    measurementMap.get(_measurement).push(_field);
                    totalVariables++;
                });

                const measurements = Array.from(measurementMap.keys());
                const measurementDetails = Array.from(measurementMap.entries()).map(([measurement, fields]) => ({
                    measurement,
                    fields: fields,
                    fieldCount: fields.length
                }));

                if (totalVariables > 0) {
                    setConnectionMessage(
                        `Conexión exitosa. Bucket "${influxConfig.bucket}" contiene ${measurements.length} measurement(s) ` +
                        `con un total de ${totalVariables} variables disponibles.`
                    );
                } else {
                    setConnectionMessage(
                        `Conexión exitosa. Bucket "${influxConfig.bucket}" accesible pero sin datos en los últimos 7 días.`
                    );
                }

                onConfigChange?.({
                    url: influxConfig.url,
                    token: influxConfig.token,
                    org: influxConfig.org,
                    bucket: influxConfig.bucket,
                    measurement: null, // No se usa measurement específico
                    useMeasurement: false,
                    availableMeasurements: measurements,
                    measurementDetails: measurementDetails,
                    totalVariables: totalVariables,
                    isValid: true
                });
            }

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
        const { name, value, type, checked } = e.target;
        setInfluxConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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

                {/* NUEVA OPCIÓN PARA USAR O NO MEASUREMENT */}
                <div className="md:col-span-2">
                    <div className="flex items-center space-x-3 mb-3">
                        <input
                            id="useMeasurement"
                            name="useMeasurement"
                            type="checkbox"
                            checked={influxConfig.useMeasurement}
                            onChange={handleChange}
                            className="w-4 h-4 text-orange-400 bg-label border-background rounded focus:ring-orange-400 focus:ring-2"
                        />
                        <label htmlFor="useMeasurement" className="text-sm font-medium text-white">
                            Usar measurement específico
                        </label>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                        <strong>Marcado:</strong> Se usará un measurement específico para filtrar datos.<br/>
                        <strong>Desmarcado:</strong> Se leerán todas las variables disponibles en el bucket.
                    </p>
                </div>

                {/* CAMPO MEASUREMENT - SOLO SI ESTÁ HABILITADO */}
                {influxConfig.useMeasurement && (
                    <div className="md:col-span-2">
                        <label htmlFor="measurement" className="block text-sm font-medium text-white mb-1">
                            Measurement
                        </label>
                        <input
                            id="measurement"
                            name="measurement"
                            type="text"
                            placeholder="sensores, datos_iot"
                            value={influxConfig.measurement}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Nombre del measurement específico donde buscar los datos. Es como el nombre de una tabla en SQL tradicional.
                        </p>
                    </div>
                )}
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
                    {influxConfig.useMeasurement ? 'Probar Conexión InfluxDB' : 'Explorar Variables del Bucket'}
                </button>

                <div className="flex mt-2 items-center space-x-3">
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