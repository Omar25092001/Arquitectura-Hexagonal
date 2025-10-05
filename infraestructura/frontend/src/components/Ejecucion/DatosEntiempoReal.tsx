import { Activity } from 'lucide-react';
import { useState } from 'react';

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

    // ✅ Estado para la columna seleccionada
    const [columnaSeleccionada, setColumnaSeleccionada] = useState<string>('');

    // ✅ Obtener todas las columnas disponibles (excluyendo timestamp)
    const obtenerColumnasDisponibles = (): string[] => {
        if (liveData.length === 0) return [];
        return Object.keys(liveData[0]).filter(key => key !== 'timestamp');
    };

    // ✅ Función para obtener datos de la columna seleccionada
    const obtenerDatosColumna = (nombreColumna: string): number[] => {
        if (liveData.length === 0 || !nombreColumna) return [];
        
        return liveData.map(data => {
            const valor = Number(data[nombreColumna]);
            return isNaN(valor) ? 0 : valor;
        });
    };

    // ✅ Auto-seleccionar primera columna al cargar datos
    const columnasDisponibles = obtenerColumnasDisponibles();
    if (columnasDisponibles.length > 0 && !columnaSeleccionada) {
        setColumnaSeleccionada(columnasDisponibles[0]);
    }

    // ✅ Función mejorada para manejar la selección de datos
    const handleSelectData = (data: DataPoint, index: number) => {
        const columnaActual = columnaSeleccionada || columnasDisponibles[0];
        const datosColumna = obtenerDatosColumna(columnaActual);
        
        // Agregar información extra al data para el modal
        const dataConInfo = {
            ...data,
            _indiceFila: index,
            _nombreColumnaSeleccionada: columnaActual,
            _valorColumnaSeleccionada: datosColumna[index],
            _totalFilas: liveData.length,
            _datosColumna: datosColumna,
            _columnasDisponibles: columnasDisponibles
        };

        onSelectData(dataConInfo);
    };

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
                        {/* ✅ Selector de columna para algoritmos */}
                        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                            <h4 className="text-blue-300 font-medium mb-3">Seleccionar Variable para Algoritmos</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-blue-200 text-sm block mb-2">
                                        Elige qué columna enviar a los algoritmos:
                                    </label>
                                    <select
                                        value={columnaSeleccionada}
                                        onChange={(e) => setColumnaSeleccionada(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-background text-white border border-blue-400 focus:border-blue-300 focus:outline-none"
                                    >
                                        {columnasDisponibles.map(columna => (
                                            <option key={columna} value={columna}>
                                                {columna}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Info de la columna seleccionada */}
                                {columnaSeleccionada && (
                                    <div className="text-sm text-blue-200">
                                        <p><strong>Columna seleccionada:</strong> {columnaSeleccionada}</p>
                                        <p><strong>Total de valores:</strong> {obtenerDatosColumna(columnaSeleccionada).length}</p>
                                        <p><strong>Rango:</strong> {
                                            obtenerDatosColumna(columnaSeleccionada).length > 0 
                                                ? `${Math.min(...obtenerDatosColumna(columnaSeleccionada)).toFixed(2)} - ${Math.max(...obtenerDatosColumna(columnaSeleccionada)).toFixed(2)}`
                                                : 'N/A'
                                        }</p>
                                        <p className="text-xs mt-1 text-blue-400">
                                            Esta columna se enviará a los algoritmos cuando selecciones una fila
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Último registro */}
                        <div className="bg-label rounded-lg p-4">
                            <h4 className="text-white font-medium mb-3">Último Dato Recibido</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(liveData[0] || {}).map(([key, value]) => (
                                    key !== 'timestamp' && (
                                        <div key={key} className={`text-center ${
                                            key === columnaSeleccionada 
                                                ? 'bg-blue-900/30 border border-blue-500/50 rounded p-2' 
                                                : ''
                                        }`}>
                                            <p className={`text-sm capitalize ${
                                                key === columnaSeleccionada 
                                                    ? 'text-blue-300 font-medium' 
                                                    : 'text-gray-400'
                                            }`}>
                                                {key} {key === columnaSeleccionada}
                                            </p>
                                            <p className={`text-lg font-bold ${
                                                key === columnaSeleccionada 
                                                    ? 'text-blue-200' 
                                                    : 'text-white'
                                            }`}>
                                                {String(value)}
                                            </p>
                                            {key === columnaSeleccionada && (
                                                <p className="text-xs text-blue-400">Variable seleccionada</p>
                                            )}
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
                                <p className="text-sm text-gray-400 mt-1">
                                    Haz clic en cualquier fila para usar la variable "{columnaSeleccionada}" en algoritmos
                                </p>
                            </div>
                            <div className="overflow-x-auto max-h-64">
                                <table className="w-full">
                                    <thead className="bg-background sticky top-0">
                                        <tr>
                                            <th className="text-left text-gray-300 p-3 text-sm">Timestamp</th>
                                            {Object.keys(liveData[0] || {}).map((key) => (
                                                key !== 'timestamp' && (
                                                    <th key={key} className={`text-left p-3 text-sm capitalize ${
                                                        key === columnaSeleccionada 
                                                            ? 'text-blue-300 font-medium bg-blue-900/20' 
                                                            : 'text-gray-300'
                                                    }`}>
                                                        {key} {key === columnaSeleccionada}
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
                                                onClick={() => handleSelectData(data, index)}
                                            >
                                                <td className="text-gray-300 p-3 text-sm">{data.timestamp}</td>
                                                {Object.entries(data).map(([key, value]) => (
                                                    key !== 'timestamp' && (
                                                        <td key={key} className={`p-3 text-sm ${
                                                            key === columnaSeleccionada 
                                                                ? 'text-blue-200 font-medium bg-blue-900/10' 
                                                                : 'text-white'
                                                        }`}>
                                                            {String(value)}
                                                        </td>
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

export type { DataPoint };