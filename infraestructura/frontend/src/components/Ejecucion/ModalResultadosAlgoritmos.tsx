import { TrendingUp } from 'lucide-react';
import type { AlgorithmResult } from '@/Algoritmos/types';

interface AlgorithmResultData {
    algorithm: string;
    input: any[];
    predictions: AlgorithmResult[];
    summary: {
        totalRecords: number;
        variables: string[];
        range: string;
        executionTime: number;
    };
}

interface ModalResultadosAlgoritmosProps {
    isOpen: boolean;
    onClose: () => void;
    algorithmResults: AlgorithmResultData[];
}

export default function ModalResultadosAlgoritmos({
    isOpen,
    onClose,
    algorithmResults
}: ModalResultadosAlgoritmosProps) {

    if (!isOpen || algorithmResults.length === 0) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4">
            <div className="bg-secundary rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
                            Resultados de Algoritmos
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-2xl transition-colors"
                        >
                            ×
                        </button>
                    </div>

                    {/* Resultados */}
                    <div className="space-y-6">
                        {algorithmResults.map((result, index) => (
                            <div key={index} className="bg-background rounded-lg p-6">
                                {/* Header del resultado */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">{result.algorithm}</h3>
                                        <p className="text-gray-400">{result.summary.range}</p>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        <p>{result.summary.totalRecords} registros</p>
                                        <p>{result.summary.executionTime}ms</p>
                                    </div>
                                </div>

                                {/* Predicciones por variable */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.predictions.map((pred: AlgorithmResult, predIndex: number) => (
                                        <div key={predIndex} className="bg-secundary rounded-lg p-4">
                                            <h4 className="text-white font-medium mb-2 capitalize">{pred.variable}</h4>

                                            {/* Información específica por algoritmo */}
                                            {pred.algorithm === 'Regresión Lineal' && (
                                                <div className="mb-3">
                                                    <p className="text-gray-400 text-sm">Ecuación: {pred.equation}</p>
                                                    <p className="text-gray-400 text-sm">Tendencia: {pred.trend}</p>
                                                    <p className="text-gray-400 text-sm">Último valor: {pred.lastValue}</p>
                                                </div>
                                            )}

                                            {pred.algorithm === 'Media Móvil' && (
                                                <div className="mb-3">
                                                    <p className="text-gray-400 text-sm">Ventana: {pred.windowSize} registros</p>
                                                    <p className="text-gray-400 text-sm">Promedio: {pred.averageValue}</p>
                                                    <p className="text-gray-400 text-sm">Último valor: {pred.lastValue}</p>
                                                </div>
                                            )}

                                            {pred.algorithm === 'Persistencia' && (
                                                <div className="mb-3">
                                                    <p className="text-gray-400 text-sm">{pred.assumption}</p>
                                                    <p className="text-gray-400 text-sm">Valor actual: {pred.currentValue}</p>
                                                </div>
                                            )}

                                            {/* Predicciones */}
                                            <div>
                                                <p className="text-white text-sm font-medium mb-2">Predicciones:</p>
                                                <div className="space-y-1">
                                                    {pred.predictions.slice(0, 3).map((p, i) => (
                                                        <p key={i} className="text-green-400 text-sm">
                                                            {p.timestamp}: {p.value}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}