import { X, Clock } from 'lucide-react';
import type { EjecucionAlgoritmo } from '../../services/ejecucion.service';
import ModalResultadosAlgoritmos from '../Ejecucion/ModalResultadosAlgoritmos';

interface ModalDetalleEjecucionProps {
    ejecucion: EjecucionAlgoritmo | null;
    onClose: () => void;
}

export default function ModalDetalleEjecucion({ ejecucion, onClose }: ModalDetalleEjecucionProps) {
    if (!ejecucion) return null;

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

    const transformarAResultadoModal = (ejecucion: EjecucionAlgoritmo) => {
        const tipo = ejecucion.tipoAlgoritmo as 'predictivo' | 'optimizacion' | 'clasificacion';
        
        switch (tipo) {
            case 'predictivo':
                return {
                    tipo: 'predictivo' as const,
                    predicciones: ejecucion.resultado,
                };
            
            case 'optimizacion':
                return {
                    tipo: 'optimizacion' as const,
                    optimizacion: {
                        funcion_objetivo: ejecucion.resultado[0],
                        mejora_porcentual: ejecucion.resultado[1] || 0,
                        iteraciones_realizadas: ejecucion.resultado[2] || 0,
                        valores_optimizados: ejecucion.resultado,
                        estadisticas_entrada: {
                            promedio: ejecucion.valoresEntrada.reduce((a, b) => a + b, 0) / ejecucion.valoresEntrada.length,
                            maximo: Math.max(...ejecucion.valoresEntrada),
                            minimo: Math.min(...ejecucion.valoresEntrada),
                        }
                    }
                };
            
            case 'clasificacion':
                const probabilidades = {
                    'Frio': ejecucion.resultado[0] || 0,
                    'Normal': ejecucion.resultado[1] || 0,
                    'Caliente': ejecucion.resultado[2] || 0,
                };
                
                const clasePredicha = Object.entries(probabilidades)
                    .reduce((a, b) => a[1] > b[1] ? a : b)[0];
                
                const confianza = Math.max(...Object.values(probabilidades));
                
                return {
                    tipo: 'clasificacion' as const,
                    clasificacion: {
                        clase_predicha: clasePredicha,
                        confianza: confianza,
                        probabilidades: probabilidades,
                        caracteristicas_detectadas: {
                            patron: 'Análisis histórico',
                            tendencia: ejecucion.valoresEntrada[ejecucion.valoresEntrada.length - 1] > ejecucion.valoresEntrada[0] ? 'Ascendente' : 'Descendente',
                            temperatura_promedio: ejecucion.valoresEntrada.reduce((a, b) => a + b, 0) / ejecucion.valoresEntrada.length,
                            variabilidad: Math.max(...ejecucion.valoresEntrada) - Math.min(...ejecucion.valoresEntrada),
                            rango: `${Math.min(...ejecucion.valoresEntrada).toFixed(1)}°C - ${Math.max(...ejecucion.valoresEntrada).toFixed(1)}°C`,
                        },
                        reglas_aplicadas: [
                            `Basado en ${ejecucion.valoresEntrada.length} valores de entrada`,
                            `Confianza del ${(confianza * 100).toFixed(1)}%`,
                        ]
                    }
                };
            
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
            <div className="bg-secundary rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-background-transparent p-6 rounded-t-2xl border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-white">{ejecucion.nombreAlgoritmo}</h3>
                            <p className="text-gray-400 text-sm">
                                {formatearFecha(ejecucion.fechaEjecucion)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white hover:bg-background rounded-full p-2 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-background p-4 rounded-lg border border-gray-700">
                            <p className="text-sm text-gray-400 mb-2">Variable</p>
                            <p className="text-lg font-semibold text-orange-400">
                                {ejecucion.variableSeleccionada}
                            </p>
                        </div>
                        <div className="bg-background p-4 rounded-lg border border-gray-700">
                            <p className="text-sm text-gray-400 mb-2">Tipo</p>
                            <span className="text-lg font-semibold text-orange-400">
                                {ejecucion.tipoAlgoritmo}
                            </span>
                        </div>
                        <div className="bg-background p-4 rounded-lg border border-gray-700">
                            <p className="text-sm text-gray-400 mb-2">Tiempo de ejecución</p>
                            <p className="text-lg font-semibold text-white flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-orange-400" />
                                {formatearTiempo(ejecucion.tiempoEjecucionMs)}
                            </p>
                        </div>
                        <div className="bg-background p-4 rounded-lg border border-gray-700">
                            <p className="text-sm text-gray-400 mb-2">ID de ejecución</p>
                            <p className="text-xs font-mono text-gray-300 break-all">
                                {ejecucion.id}
                            </p>
                        </div>
                    </div>

                    <div className="bg-background p-5 rounded-lg border border-orange-400">
                        <h4 className="font-semibold text-white mb-3">
                            Valores de Entrada
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {ejecucion.valoresEntrada.map((valor, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-2 bg-secundary text-orange-300 rounded-lg text-sm font-mono border border-orange-500"
                                >
                                    {formatearValor(valor)}
                                </span>
                            ))}
                        </div>
                    </div>

                    <ModalResultadosAlgoritmos 
                        resultado={transformarAResultadoModal(ejecucion)}
                    />
                </div>
            </div>
        </div>
    );
}