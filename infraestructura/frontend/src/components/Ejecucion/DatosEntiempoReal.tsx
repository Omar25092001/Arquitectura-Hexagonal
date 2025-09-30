import { Activity } from 'lucide-react';

interface DataPoint {
    timestamp: string;
    [key: string]: any;
}

interface DatosEnTiempoRealProps {
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
    dataSourceConfig: any;
    liveData: DataPoint[];
    onSelectData: (data: DataPoint) => void;
    onVerMonitorizacion?: () => void;
}

export default function DatosEnTiempoReal({
    connectionStatus,
    dataSourceConfig,
    liveData,
    onSelectData
}: DatosEnTiempoRealProps) {

    return (
        <div className="bg-secundary rounded-2xl shadow-md">
            

            <div className="p-6">
                {liveData.length === 0 ? (
                    <div className="text-center py-16">
                        <Activity className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">
                            {connectionStatus === 'connecting' ? 'Estableciendo Conexión...' :
                                connectionStatus === 'connected' ? 'Esperando Datos...' :
                                    connectionStatus === 'error' ? 'Error de Conexión' :
                                        'Listo para Iniciar'}
                        </h3>
                        <p className="text-gray-400">
                            {connectionStatus === 'connecting' ? `Conectando con ${dataSourceConfig?.protocol?.toUpperCase()}` :
                                connectionStatus === 'connected' ? 'La conexión está establecida, esperando datos' :
                                    connectionStatus === 'error' ? 'Verifica la configuración de tu fuente de datos' :
                                        'Haz clic en "Extraer Datos" para comenzar'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Último registro */}
                        <div className="bg-label rounded-lg p-4">
                            <h4 className="text-white font-medium mb-3">Último Dato Recibido</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(liveData[0] || {}).map(([key, value]) => (
                                    key !== 'timestamp' && (
                                        <div key={key} className="text-center">
                                            <p className="text-gray-400 text-sm capitalize">{key}</p>
                                            <p className="text-white text-lg font-bold">{String(value)}</p>
                                        </div>
                                    )
                                ))}
                            </div>
                            <p className="text-gray-400 text-sm mt-2">
                                Actualizado: {liveData[0]?.timestamp}
                            </p>
                        </div>

                        {/* Tabla de historial */}
                        <div className="bg-label rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-600">
                                <h4 className="text-white font-medium">
                                    Historial de Datos ({liveData.length} registros)
                                </h4>
                            </div>
                            <div className="overflow-x-auto max-h-64">
                                <table className="w-full">
                                    <thead className="bg-background sticky top-0">
                                        <tr>
                                            <th className="text-left text-gray-300 p-3 text-sm">Timestamp</th>
                                            {Object.keys(liveData[0] || {}).map((key) => (
                                                key !== 'timestamp' && (
                                                    <th key={key} className="text-left text-gray-300 p-3 text-sm capitalize">
                                                        {key}
                                                    </th>
                                                )
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {liveData.slice(0, 15).map((data, index) => (
                                            <tr
                                                key={index}
                                                className="border-b border-gray-700 hover:bg-secundary cursor-pointer transition-colors"
                                                onClick={() => onSelectData(data)}
                                            >
                                                <td className="text-gray-300 p-3 text-sm">{data.timestamp}</td>
                                                {Object.entries(data).map(([key, value]) => (
                                                    key !== 'timestamp' && (
                                                        <td key={key} className="text-white p-3 text-sm">{String(value)}</td>
                                                    )
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Exportar el tipo para usar en otros componentes
export type { DataPoint };