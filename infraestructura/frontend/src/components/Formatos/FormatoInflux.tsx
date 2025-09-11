import { useState } from 'react';
import { X, Copy, Check, Database } from 'lucide-react';

interface FormatoInfluxProps {
    isOpen: boolean;
    onClose: () => void;
}

const FormatoInflux = ({ isOpen, onClose }: FormatoInfluxProps) => {
    const [copied, setCopied] = useState(false);
    
    const formatExampleWithMeasurement = `from(bucket: "Estacion 1")
|> range(start: -7d)
|> filter(fn: (r) => r._measurement == "temperatura")
|> filter(fn: (r) => r["_field"] == "value")
|> last()`;

    const formatExampleWithoutMeasurement = `from(bucket: "Estacion 1")
|> range(start: -7d)
|> filter(fn: (r) => r["_field"] == "value")
|> group(columns: ["_measurement"])
|> last()`;
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl w-full max-h-screen overflow-y-auto border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white pr-4 flex items-center">
                        <Database className="w-5 h-5 mr-2 text-blue-400" />
                        Formato de Datos InfluxDB
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white flex-shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Estructura esperada:</h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3">
                            Los datos pueden guardarse de dos formas: <code className="bg-gray-700 px-1 rounded text-xs">bucket → measurement → field:value</code>
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Opción 1 - Cada variable como measurement:</h4>
                        <p className="text-gray-300 text-xs mb-2">
                            Para usar el checkbox "Filtrar por measurement específico" <strong>DESMARCADO</strong>:
                        </p>
                        <div className="bg-gray-900 rounded-lg p-2 sm:p-3 border border-gray-600">
                            <div className="bg-gray-700 rounded p-2">
                                <code className="text-green-400 text-xs sm:text-sm">
                                    bucket: "Estacion 1"<br/>
                                    _measurement: "temperatura"<br/>
                                    _field: "value"<br/>
                                    _value: 25.3<br/>
                                    _time: 2024-09-10T20:30:00Z
                                </code>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Opción 2 - Variables como fields:</h4>
                        <p className="text-gray-300 text-xs mb-2">
                            Para usar el checkbox "Filtrar por measurement específico" <strong>MARCADO</strong>:
                        </p>
                        <div className="bg-gray-900 rounded-lg p-2 sm:p-3 border border-gray-600">
                            <div className="bg-gray-700 rounded p-2">
                                <code className="text-green-400 text-xs sm:text-sm">
                                    bucket: "Estacion 1"<br/>
                                    _measurement: "sensores"<br/>
                                    _field: "temperatura"<br/>
                                    _value: 25.3<br/>
                                    _time: 2024-09-10T20:30:00Z
                                </code>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Query SIN measurement específico:</h4>
                        <p className="text-gray-300 text-xs mb-2">
                            Lee todas las variables (cada measurement = una variable):
                        </p>
                        <div className="bg-gray-900 rounded-lg p-2 sm:p-3 border border-gray-600">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <code className="text-blue-400 text-xs sm:text-sm break-all whitespace-pre">
                                    {formatExampleWithoutMeasurement}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(formatExampleWithoutMeasurement)}
                                    className="self-start sm:self-auto p-1 text-gray-400 hover:text-white flex-shrink-0"
                                    title="Copiar query"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Query CON measurement específico:</h4>
                        <p className="text-gray-300 text-xs mb-2">
                            Lee un measurement que contiene múltiples variables como fields:
                        </p>
                        <div className="bg-gray-900 rounded-lg p-2 sm:p-3 border border-gray-600">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <code className="text-blue-400 text-xs sm:text-sm break-all whitespace-pre">
                                    {formatExampleWithMeasurement}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(formatExampleWithMeasurement)}
                                    className="self-start sm:self-auto p-1 text-gray-400 hover:text-white flex-shrink-0"
                                    title="Copiar query"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Reglas importantes:</h4>
                        <ul className="text-gray-300 text-xs sm:text-sm space-y-1 list-disc list-inside">
                            <li><strong>Opción 1:</strong> Cada variable es un <code className="bg-gray-700 px-1 rounded text-xs">_measurement</code> y <code className="bg-gray-700 px-1 rounded text-xs">_field = "value"</code></li>
                            <li><strong>Opción 2:</strong> Un <code className="bg-gray-700 px-1 rounded text-xs">_measurement</code> con múltiples <code className="bg-gray-700 px-1 rounded text-xs">_field</code> (uno por variable)</li>
                            <li>El valor numérico siempre va en <code className="bg-gray-700 px-1 rounded text-xs">_value</code></li>
                            <li>Los nombres pueden contener letras, números y guiones bajos</li>
                            <li>La aplicación obtiene el último valor disponible</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Variables del ejemplo:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                            {[
                                { name: 'temperatura', value: '25.3', unit: '°C' },
                                { name: 'humedad', value: '67.8', unit: '%' },
                                { name: 'indice_thw', value: '14.11', unit: '°C' },
                                { name: 'velocidad_viento', value: '12.5', unit: 'km/h' },
                                { name: 'direccion_viento', value: '245', unit: '°' },
                                { name: 'presion_atmosferica', value: '1013.25', unit: 'hPa' }
                            ].map((item, index) => (
                                <div key={index} className="bg-gray-700 rounded p-2">
                                    <span className="text-orange-400 font-medium">{item.name}</span>
                                    <span className="text-gray-300">: {item.value} {item.unit}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Resultado que recibe la aplicación:</h4>
                        <div className="bg-gray-900 rounded-lg p-2 sm:p-3 border border-gray-600">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <p className="text-gray-400 text-xs mb-2">Sin measurement específico (Opción 1):</p>
                                    <code className="text-green-400 text-xs">
                                        &#123;<br/>
                                        &nbsp;&nbsp;"timestamp": "8:30:15 p. m.",<br/>
                                        &nbsp;&nbsp;"temperatura": 25.3,<br/>
                                        &nbsp;&nbsp;"humedad": 67.8,<br/>
                                        &nbsp;&nbsp;"indice_thw": 14.11,<br/>
                                        &nbsp;&nbsp;"velocidad_viento": 12.5<br/>
                                        &#125;
                                    </code>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs mb-2">Con measurement específico (Opción 2):</p>
                                    <code className="text-green-400 text-xs">
                                        &#123;<br/>
                                        &nbsp;&nbsp;"timestamp": "8:30:15 p. m.",<br/>
                                        &nbsp;&nbsp;"temperatura": 25.3,<br/>
                                        &nbsp;&nbsp;"humedad": 67.8,<br/>
                                        &nbsp;&nbsp;"indice_thw": 14.11,<br/>
                                        &nbsp;&nbsp;"velocidad_viento": 12.5<br/>
                                        &#125;
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={onClose}
                            className="px-3 py-2 sm:px-4 sm:py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-medium text-sm sm:text-base"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormatoInflux;