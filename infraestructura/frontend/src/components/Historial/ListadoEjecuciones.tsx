import { Clock } from 'lucide-react';
import type { EjecucionAlgoritmo } from '../../services/ejecucion.service';

interface ListadoEjecucionesProps {
    ejecuciones: EjecucionAlgoritmo[];
    onSeleccionar: (ejecucion: EjecucionAlgoritmo) => void;
}

export default function ListadoEjecuciones({ ejecuciones, onSeleccionar }: ListadoEjecucionesProps) {
    const formatearValor = (valor: any): string => {
        if (valor === null || valor === undefined) {
            return 'N/A';
        }
        if (typeof valor === 'number') {
            return valor.toFixed(4);
        }
        if (typeof valor === 'string') {
            const num = parseFloat(valor);
            if (!isNaN(num)) {
                return num.toFixed(4);
            }
            return valor;
        }
        return JSON.stringify(valor);
    };

    const formatearTiempo = (tiempoMs: any): string => {
        if (tiempoMs === null || tiempoMs === undefined) {
            return 'N/A';
        }
        const num = typeof tiempoMs === 'number' ? tiempoMs : parseFloat(tiempoMs);
        if (isNaN(num)) {
            return 'N/A';
        }
        return `${num.toFixed(4)}s`;
    };

    const formatearFecha = (fecha: string) => {
        const date = new Date(fecha);
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    };

    if (ejecuciones.length === 0) {
        return (
            <div className="bg-secundary border border-gray-700 rounded-2xl p-6 sm:p-12 text-center">
                <p className="text-gray-300 text-base sm:text-lg mb-2">No hay ejecuciones registradas</p>
                <p className="text-gray-400 text-xs sm:text-sm">
                    Ejecuta tu primer algoritmo para ver resultados aquí
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {ejecuciones.map((ejecucion) => (
                <div
                    key={ejecucion.id}
                    onClick={() => onSeleccionar(ejecucion)}
                    className="bg-secundary border-2 border-background hover:border-orange-400 rounded-xl p-4 sm:p-5 hover:shadow-xl transition-all cursor-pointer"
                >
                    {/* Header - Responsive flex */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                            {/* Título y variable */}
                            <div className="mb-3">
                                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                                    {ejecucion.nombreAlgoritmo}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-400">
                                    Variable: <span className="font-semibold text-orange-400">{ejecucion.variableSeleccionada}</span>
                                </p>
                            </div>

                            {/* Info cards - Responsive grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                <div className="bg-background rounded-lg p-2 sm:p-3">
                                    <p className="text-xs text-gray-400 mb-1">Tipo</p>
                                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold text-orange-300 bg-orange-400 bg-opacity-20 border border-orange-500">
                                        {ejecucion.tipoAlgoritmo}
                                    </span>
                                </div>
                                <div className="bg-background rounded-lg p-2 sm:p-3">
                                    <p className="text-xs text-gray-400 mb-1">Tiempo</p>
                                    <p className="text-xs sm:text-sm font-semibold text-white flex items-center">
                                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-orange-400" />
                                        {formatearTiempo(ejecucion.tiempoEjecucionMs)}
                                    </p>
                                </div>
                                {/* Fecha en mobile, aparece aquí */}
                                <div className="bg-background rounded-lg p-2 sm:p-3 col-span-2 sm:col-span-1">
                                    <p className="text-xs text-gray-400 mb-1 sm:hidden">Fecha</p>
                                    <p className="text-xs text-gray-400 sm:hidden">
                                        {formatearFecha(ejecucion.fechaEjecucion)}
                                    </p>
                                    {/* ID visible solo en desktop */}
                                    <p className="hidden sm:block text-xs text-gray-400 mb-1">ID</p>
                                    <p className="hidden sm:block text-xs text-gray-500 font-mono">
                                        {ejecucion.id.substring(0, 8)}...
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Fecha e ID - Solo visible en desktop */}
                        <div className="hidden sm:block text-right ml-4 min-w-[140px]">
                            <p className="text-xs text-gray-400">
                                {formatearFecha(ejecucion.fechaEjecucion)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                ID: {ejecucion.id.substring(0, 8)}...
                            </p>
                        </div>
                    </div>

                    {/* Preview de resultados - Responsive */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Preview de resultados:</p>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                            {ejecucion.resultado.slice(0, window.innerWidth < 640 ? 3 : 5).map((valor, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 sm:px-3 py-1 bg-orange-400 bg-opacity-20 text-orange-300 rounded-lg text-xs font-mono border border-orange-500 whitespace-nowrap"
                                >
                                    {formatearValor(valor)}
                                </span>
                            ))}
                            {ejecucion.resultado.length > (window.innerWidth < 640 ? 3 : 5) && (
                                <span className="px-2 sm:px-3 py-1 bg-background text-gray-400 rounded-lg text-xs border border-gray-600 whitespace-nowrap">
                                    +{ejecucion.resultado.length - (window.innerWidth < 640 ? 3 : 5)} más
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}