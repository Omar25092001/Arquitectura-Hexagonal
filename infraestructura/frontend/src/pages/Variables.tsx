import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { CheckCircle, ArrowRight, Check, X, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mqtt from 'mqtt';

export default function Variables() {
    const navigate = useNavigate();

    const [dataSourceConfig, setDataSourceConfig] = useState<any>(null);
    const [variables, setVariables] = useState<any[]>([]);
    const [selectedVariables, setSelectedVariables] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

    // PASOS DE NAVEGACIÓN
    const steps = [
        { id: 1, title: 'Fuentes de Datos', active: true },
        { id: 2, title: 'Variables', active: true },
        { id: 3, title: 'Algoritmo', active: false },
        { id: 4, title: 'Ejecución', active: false }
    ];

    // Cargar configuración
    useEffect(() => {
        const savedConfig = localStorage.getItem('dataSourceConfig');
        if (!savedConfig) {
            navigate('/fuente-datos');
            return;
        }

        const config = JSON.parse(savedConfig);
        if (!['mqtt', 'http'].includes(config.protocol)) {
            console.log('protocolo no soportado:', config.protocol)
            navigate('/fuente-datos');
            return;
        }

        setDataSourceConfig(config);
    }, [navigate]);

    //  FUNCIÓN PARA PARSEAR EL MENSAJE MQTT
    const parsearMensaje = (mensaje: string, formato?: string) => {
        const variables: any[] = [];

        try {
            //  INTENTAR PARSEAR COMO JSON PRIMERO
            if (formato === 'json' || mensaje.trim().startsWith('{') || mensaje.trim().startsWith('[')) {
                const jsonData = JSON.parse(mensaje);

                // Convertir objeto JSON a variables
                const flattenObject = (obj: any, prefix = '') => {
                    Object.keys(obj).forEach((key) => {
                        const value = obj[key];
                        const fullKey = prefix ? `${prefix}.${key}` : key;

                        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                            // Objeto anidado - aplanar recursivamente
                            flattenObject(value, fullKey);
                        } else {
                            // Valor primitivo - crear variable
                            let dataType: string;
                            let valorParseado: any = value;

                            if (typeof value === 'number') {
                                dataType = Number.isInteger(value) ? 'Numérico' : 'Numérico';
                            } else if (typeof value === 'boolean') {
                                dataType = 'Booleano';
                            } else if (Array.isArray(value)) {
                                dataType = 'Array';
                                valorParseado = JSON.stringify(value);
                            } else {
                                dataType = 'Texto';
                            }

                            // REMOVER EL PREFIJO "data." DEL NOMBRE
                            let displayName = fullKey;
                            if (displayName.startsWith('data.')) {
                                displayName = displayName.replace('data.', '');
                            }

                            variables.push({
                                id: variables.length + 1,
                                name: displayName, // USAR EL NOMBRE SIN PREFIJO
                                dataType: dataType,
                                current: valorParseado,
                                originalValue: String(value),
                                fullPath: fullKey // GUARDAR LA RUTA COMPLETA POR SI LA NECESITAS
                            });
                        }
                    });
                };

                if (Array.isArray(jsonData)) {
                    // Si es un array, usar el primer elemento
                    if (jsonData.length > 0) {
                        flattenObject(jsonData[0]);
                    }
                } else {
                    flattenObject(jsonData);
                }
            }
            // PARSEAR COMO FORMATO MQTT (variable=valor|variable=valor)
            else {
                const pares = mensaje.split('|').filter(par => par.trim() !== '');

                pares.forEach((par, index) => {
                    const [nombre, valor] = par.split('=');

                    if (nombre && valor !== undefined) {
                        const nombreLimpio = nombre.trim();
                        const valorLimpio = valor.trim();

                        // Detectar tipo de dato
                        let valorParseado: any;
                        let dataType: string;

                        const numeroParseado = parseFloat(valorLimpio);
                        if (!isNaN(numeroParseado) && isFinite(numeroParseado)) {
                            valorParseado = numeroParseado;
                            dataType = 'Numérico';
                        } else if (valorLimpio.toLowerCase() === 'true' || valorLimpio.toLowerCase() === 'false') {
                            valorParseado = valorLimpio.toLowerCase() === 'true';
                            dataType = 'Booleano';
                        } else {
                            valorParseado = valorLimpio;
                            dataType = 'Texto';
                        }

                        variables.push({
                            id: index + 1,
                            name: nombreLimpio,
                            dataType: dataType,
                            current: valorParseado,
                            originalValue: valorLimpio,
                            fullPath: nombreLimpio // Para MQTT es igual
                        });

                        console.log(`✅ Variable ${index + 1}:`, {
                            nombre: nombreLimpio,
                            valor: valorParseado,
                            tipo: dataType,
                            original: valorLimpio
                        });
                    } else {
                        console.log(`Par inválido ignorado: "${par}"`);
                    }
                });
            }
        } catch (jsonError) {
            console.log('No es JSON válido, intentando formato MQTT...');
            // Ya se intentó el formato MQTT arriba
        }

        console.log(`Total variables detectadas: ${variables.length}`);
        return variables;
    };

    // Detectar variables MQTT
    const detectarVariablesMQTT = async () => {
        if (!dataSourceConfig?.config) return;

        setIsLoading(true);
        setError(null);

        setSelectedVariables([]);

        try {
            const config = dataSourceConfig.config;

            const variables = await new Promise<any[]>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('No se recibieron mensajes en 30 segundos'));
                }, 30000);

                const client = mqtt.connect(`ws://${config.ip}`, {
                    username: config.username || undefined,
                    password: config.password || undefined,
                });

                client.on('connect', () => {
                    client.subscribe(config.topic, (err) => {
                        if (err) {
                            clearTimeout(timeout);
                            client.end();
                            reject(new Error('Error suscribiéndose al tópico: ' + err.message));
                        } else {
                            console.log('📡 Esperando mensajes en formato: variable=valor|variable=valor|...');
                        }
                    });
                });

                client.on('message', (topic, message) => {
                    clearTimeout(timeout);
                    const mensajeRecibido = message.toString();
                    if (topic !== config.topic) {
                        console.log(`⚠️ Mensaje de tópico diferente ignorado: ${topic} (esperado: ${config.topic})`);
                        return;
                    }

                    try {
                        const variablesDetectadas = parsearMensaje(mensajeRecibido);

                        if (variablesDetectadas.length === 0) {
                            client.end();
                            reject(new Error('No se detectaron variables válidas en el mensaje. Verifica el formato: variable=valor|variable=valor|...'));
                            return;
                        }

                        client.end();
                        resolve(variablesDetectadas);

                    } catch (parseError: any) {
                        client.end();
                        reject(new Error('Error parseando mensaje: ' + parseError.message));
                    }
                });

                client.on('error', (err) => {
                    clearTimeout(timeout);
                    client.end();
                    reject(new Error('Error de conexión: ' + err.message));
                });
            });

            setVariables(variables);
            setLastFetchTime(new Date());
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const detectarVariablesHTTP = async () => {
        setIsLoading(true);
        setError(null);
        const config = dataSourceConfig.config;

        try {
            const requestOptions: RequestInit = {
                method: config.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...config.headers
                }
            };

            // Agregar body si es POST/PUT
            if (['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase()) && config.body) {
                requestOptions.body = config.body;
            }

            const response = await fetch(config.url, requestOptions);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type') || '';
            const responseText = await response.text();

            // Determinar formato basado en Content-Type
            const formato = contentType.includes('application/json') ? 'json' : 'text';

            const variablesDetectadas = parsearMensaje(responseText, formato);
            console.log(`Total variables detectadas:`, variablesDetectadas);

            if (variablesDetectadas.length === 0) {
                throw new Error('No se detectaron variables válidas en la respuesta HTTP.\n\nFormatos soportados:\n• JSON: {"variable": valor}\n• Texto: variable=valor|variable=valor|...');
            }
            setVariables(variablesDetectadas);
            setLastFetchTime(new Date());
            setIsLoading(true);
            setError(null);


        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    //MANEJAR SELECCIÓN DE VARIABLES
    const toggleVariableSelection = (id: number) => {
        setSelectedVariables(prev => {
            if (prev.includes(id)) {
                return prev.filter(varId => varId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    if (!dataSourceConfig) {
        return (
            <div className="bg-background min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-orange-400" />
                </div>
            </div>
        );
    }

    const protocol = dataSourceConfig.protocol || 'mqtt';

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex flex-col items-center justify-center px-4">
                {/* Pasos de navegación */}
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
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl md:text-xl font-bold text-white">Paso 2: Configuración de Variables</h1>
                                    <p className="text-gray-300 text-sm mt-1">
                                        Variables detectadas desde {protocol.toUpperCase()}
                                        {lastFetchTime && (
                                            <span className="text-gray-400 ml-2">
                                                (última actualización: {lastFetchTime.toLocaleTimeString()})
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/*  BOTÓN PARA REFRESCAR VARIABLES */}
                                <button
                                    onClick={() => {
                                        if (dataSourceConfig.protocol === 'http') {
                                            console.log('entra en http')
                                            detectarVariablesHTTP();

                                        } if (dataSourceConfig.protocol === 'mqtt') {

                                            detectarVariablesMQTT();
                                        }
                                    }}
                                    disabled={isLoading}
                                    className="flex items-center px-3 py-2 bg-orange-400 hover:bg-orange-500 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                    {isLoading ? 'Detectando...' : 'Refrescar'}
                                </button>
                            </div>
                        </div>

                        {/* MOSTRAR ESTADO DE CARGA O ERROR */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mr-3" />
                                <span className="text-gray-300">Detectando variables disponibles...</span>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <X className="w-5 h-5 text-red-400 mr-2" />
                                    <span className="text-red-400 font-medium">Error al detectar variables</span>
                                </div>
                                <p className="text-red-300 text-sm mt-1">{error}</p>
                                <button
                                    onClick={() => {
                                        if (dataSourceConfig.protocol === 'http') {
                                            detectarVariablesHTTP();

                                        } if (dataSourceConfig.protocol === 'mqtt') {

                                            detectarVariablesMQTT();
                                        }
                                    }}
                                    className="text-red-400 hover:text-red-300 text-sm underline mt-2"
                                >
                                    Intentar nuevamente
                                </button>
                            </div>
                        )}

                        {/* MOSTRAR VARIABLES SOLO SI NO HAY ERROR Y NO ESTÁ CARGANDO */}
                        {!isLoading && !error && (
                            <>
                                {variables.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400">No se detectaron variables en la fuente de datos</p>
                                        <button
                                            onClick={() => {
                                                if (dataSourceConfig.protocol === 'http') {
                                                    detectarVariablesHTTP();

                                                } if (dataSourceConfig.protocol === 'mqtt') {

                                                    detectarVariablesMQTT();
                                                }
                                            }}
                                            className="text-orange-400 hover:text-orange-300 text-sm underline mt-2"
                                        >
                                            Volver a intentar
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Grid de variables seleccionables */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                                            {variables.map(variable => (
                                                <div
                                                    key={variable.id}
                                                    className={`relative rounded-lg cursor-pointer border-2 flex flex-col items-center justify-center h-10 transition-all
                                                        ${selectedVariables.includes(variable.id)
                                                            ? ' border-background bg-background-transparent hover:background-transparent'
                                                            : 'border-background bg-secundary hover:bg-background'}`}
                                                    onClick={() => toggleVariableSelection(variable.id)}
                                                >
                                                    {selectedVariables.includes(variable.id) && (
                                                        <div className="absolute top-1 right-1">
                                                            <Check className="w-3 h-3 text-orange-400" />
                                                        </div>
                                                    )}

                                                    <h3 className="text-white text-center text-xs font-medium truncate max-w-full px-1">
                                                        {variable.name}
                                                    </h3>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Lista de variables seleccionadas */}
                                        <div className="bg-background rounded-lg p-3 mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-white font-medium">Variables Seleccionadas</h3>
                                                <span className="text-xs text-gray-400">
                                                    {selectedVariables.length} de {variables.length} variables
                                                </span>
                                            </div>

                                            {selectedVariables.length === 0 ? (
                                                <p className="text-sm text-gray-400 italic">No se ha seleccionado ninguna variable</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedVariables.map(id => {
                                                        const variable = variables.find(v => v.id === id);
                                                        if (!variable) return null;

                                                        return (
                                                            <div
                                                                key={id}
                                                                className="flex items-center bg-gray-700 rounded-full pl-2 pr-1 py-1"
                                                            >
                                                                <span className="text-xs text-white mr-1">{variable.name}</span>
                                                                <button
                                                                    className="text-gray-400 hover:text-white rounded-full"
                                                                    onClick={() => toggleVariableSelection(id)}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* Botón de acción */}
                        <div className="flex justify-between items-center mt-6">
                            <span className="text-sm text-gray-300">
                                {selectedVariables.length > 0
                                    ? `Variables seleccionadas: ${selectedVariables.length}`
                                    : 'Seleccione al menos una variable para continuar'}
                            </span>
                            <button
                                disabled={selectedVariables.length === 0}
                                className={`px-4 py-2 rounded-lg flex items-center
                                    ${selectedVariables.length === 0
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-orange-400 text-white hover:bg-orange-500'} transition-colors`}
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