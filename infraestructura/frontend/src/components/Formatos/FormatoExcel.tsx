import { useState } from 'react';
import { X, Copy, Check, FileSpreadsheet } from 'lucide-react';

interface FormatoExcelProps {
    isOpen: boolean;
    onClose: () => void;
}

const FormatoExcel = ({ isOpen, onClose }: FormatoExcelProps) => {
    const [copied, setCopied] = useState(false);
    
    const exampleHeaders = "Date,temperatura,humedad,indice_thw,velocidad_viento,direccion_viento,presion_atmosferica";
    
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
                        <FileSpreadsheet className="w-5 h-5 mr-2 text-green-400" />
                        Formato de Archivo Excel
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
                            El archivo Excel debe tener: <code className="bg-gray-700 px-1 rounded text-xs">Primera columna "Date" + columnas de variables</code>
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Formato de encabezados:</h4>
                        <div className="bg-gray-900 rounded-lg p-2 sm:p-3 border border-gray-600">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <code className="text-green-400 text-xs sm:text-sm break-all">
                                    {exampleHeaders}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(exampleHeaders)}
                                    className="self-start sm:self-auto p-1 text-gray-400 hover:text-white flex-shrink-0"
                                    title="Copiar encabezados"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Ejemplo de estructura completa:</h4>
                        <div className="bg-gray-900 rounded-lg p-2 sm:p-3 border border-gray-600">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs sm:text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-600">
                                            <th className="text-orange-400 text-left p-1">Date</th>
                                            <th className="text-green-400 text-left p-1">temperatura</th>
                                            <th className="text-green-400 text-left p-1">humedad</th>
                                            <th className="text-green-400 text-left p-1">indice_thw</th>
                                            <th className="text-green-400 text-left p-1">velocidad_viento</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                        <tr className="border-b border-gray-700">
                                            <td className="p-1">2024-09-10 20:30:00</td>
                                            <td className="p-1">25.3</td>
                                            <td className="p-1">67.8</td>
                                            <td className="p-1">14.11</td>
                                            <td className="p-1">12.5</td>
                                        </tr>
                                        <tr className="border-b border-gray-700">
                                            <td className="p-1">2024-09-10 20:35:00</td>
                                            <td className="p-1">25.1</td>
                                            <td className="p-1">68.2</td>
                                            <td className="p-1">14.08</td>
                                            <td className="p-1">11.8</td>
                                        </tr>
                                        <tr>
                                            <td className="p-1">2024-09-10 20:40:00</td>
                                            <td className="p-1">24.9</td>
                                            <td className="p-1">68.5</td>
                                            <td className="p-1">14.05</td>
                                            <td className="p-1">13.2</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Reglas importantes:</h4>
                        <ul className="text-gray-300 text-xs sm:text-sm space-y-1 list-disc list-inside">
                            <li>La primera columna DEBE llamarse <code className="bg-gray-700 px-1 rounded text-xs">"Date"</code></li>
                            <li>Las fechas deben estar en formato <code className="bg-gray-700 px-1 rounded text-xs">YYYY-MM-DD HH:MM:SS</code></li>
                            <li>Las columnas de variables deben coincidir exactamente con los nombres seleccionados</li>
                            <li>Los valores numéricos pueden usar punto (.) como separador decimal</li>
                            <li>No debe haber filas vacías entre los datos</li>
                            <li>El archivo debe ser .xlsx o .csv compatible con Excel</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Formatos de fecha aceptados:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                            {[
                                { format: 'YYYY-MM-DD HH:MM:SS', example: '2024-09-10 20:30:00' },
                                { format: 'DD/MM/YYYY HH:MM:SS', example: '10/09/2024 20:30:00' },
                                { format: 'MM/DD/YYYY HH:MM:SS', example: '09/10/2024 20:30:00' },
                                { format: 'YYYY-MM-DD', example: '2024-09-10' },
                            ].map((item, index) => (
                                <div key={index} className="bg-gray-700 rounded p-2">
                                    <span className="text-blue-400 font-medium">{item.format}</span>
                                    <div className="text-gray-300 text-xs">{item.example}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Ejemplo de archivo CSV:</h4>
                        <div className="bg-gray-900 rounded-lg p-2 sm:p-3 border border-gray-600">
                            <code className="text-green-400 text-xs sm:text-sm block">
                                Date,temperatura,humedad,indice_thw<br/>
                                2024-09-10 20:30:00,25.3,67.8,14.11<br/>
                                2024-09-10 20:35:00,25.1,68.2,14.08<br/>
                                2024-09-10 20:40:00,24.9,68.5,14.05
                            </code>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Resultado que procesa la aplicación:</h4>
                        <div className="bg-gray-900 rounded-lg p-2 sm:p-3 border border-gray-600">
                            <code className="text-green-400 text-xs sm:text-sm">
                                &#123;<br/>
                                &nbsp;&nbsp;"timestamp": "8:30:00 p. m.",<br/>
                                &nbsp;&nbsp;"temperatura": 25.3,<br/>
                                &nbsp;&nbsp;"humedad": 67.8,<br/>
                                &nbsp;&nbsp;"indice_thw": 14.11,<br/>
                                &nbsp;&nbsp;"velocidad_viento": 12.5<br/>
                                &#125;
                            </code>
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

export default FormatoExcel;