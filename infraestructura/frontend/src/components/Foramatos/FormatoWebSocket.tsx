import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface FormatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FormatoWebSocket = ({ isOpen, onClose }: FormatModalProps) => {
    const [copied, setCopied] = useState(false);
    
    const formatExample = JSON.stringify({
        temperatura: 30,
        humedad: 140,
        "V.Viento": 45,
        presion: 1013,
        luminosidad: 850,
    }, null, 2);
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(formatExample);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl w-full max-h-screen overflow-y-auto border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white pr-4">
                        Formato de Datos WebSocket
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
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Formato esperado:</h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3">
                            Los datos deben enviarse como un objeto JSON válido con pares clave-valor para cada variable.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Ejemplo JSON:</h4>
                        <div className="bg-gray-900 rounded-lg p-2 sm:p-3 border border-gray-600">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <pre className="text-green-400 text-xs sm:text-sm overflow-x-auto">
                                    {formatExample}
                                </pre>
                                <button
                                    onClick={copyToClipboard}
                                    className="self-start sm:self-auto p-1 text-gray-400 hover:text-white flex-shrink-0"
                                    title="Copiar ejemplo"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Reglas importantes:</h4>
                        <ul className="text-gray-300 text-xs sm:text-sm space-y-1 list-disc list-inside">
                            <li>Debe ser un <code className="bg-gray-700 px-1 rounded text-xs">JSON válido</code></li>
                            <li>Usar nombres de propiedades como <code className="bg-gray-700 px-1 rounded text-xs">strings</code></li>
                            <li>Los valores pueden ser <code className="bg-gray-700 px-1 rounded text-xs">números</code> o <code className="bg-gray-700 px-1 rounded text-xs">strings</code></li>
                            <li>Los nombres con puntos deben ir entre comillas: <code className="bg-gray-700 px-1 rounded text-xs">"V.Viento"</code></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Tipos de mensajes soportados:</h4>
                        <div className="space-y-2">
                            <div className="bg-gray-700 rounded p-2">
                                <h5 className="text-orange-400 font-medium text-xs sm:text-sm">Datos de sensores:</h5>
                                <code className="text-gray-300 text-xs">{'{"temperatura": 25, "humedad": 60}'}</code>
                            </div>
                            <div className="bg-gray-700 rounded p-2">
                                <h5 className="text-orange-400 font-medium text-xs sm:text-sm">Múltiples variables:</h5>
                                <code className="text-gray-300 text-xs">{'{"temp": 25, "hum": 60, "press": 1013}'}</code>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Variables del ejemplo:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                            {[
                                { name: 'temperatura', value: '30', unit: '°C' },
                                { name: 'humedad', value: '140', unit: '%' },
                                { name: 'V.Viento', value: '45', unit: 'km/h' },
                                { name: 'presion', value: '1013', unit: 'hPa' },
                                { name: 'luminosidad', value: '850', unit: 'lux' },
                            ].map((item, index) => (
                                <div key={index} className="bg-gray-700 rounded p-2">
                                    <span className="text-orange-400 font-medium">{item.name}</span>
                                    <span className="text-gray-300">: {item.value} {item.unit}</span>
                                </div>
                            ))}
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

export default FormatoWebSocket;