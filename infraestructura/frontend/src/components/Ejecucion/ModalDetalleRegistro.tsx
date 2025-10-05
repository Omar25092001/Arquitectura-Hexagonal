import { type DataPoint } from './DatosEntiempoReal';
import { useEffect, useState } from 'react';
import { obtenerAlgoritmos } from '../../services/algoritmo.service';

interface ModalDetalleRegistroProps {
    isOpen: boolean;
    onClose: () => void;
    selectedData: DataPoint | null;
    rangoDireccion: 'arriba' | 'abajo' | 'actual';
    onRangoDireccionChange: (direction: 'arriba' | 'abajo' | 'actual') => void;
    selectedAlgorithm: string;
    onSelectedAlgorithmChange: (algorithm: string) => void;
    isProcessingAlgorithm: boolean;
    onEjecutarAlgoritmo: (direction: 'arriba' | 'abajo' | 'actual') => void;
    usuarioId: string; // Agregar el ID de usuario como prop
}

interface Algoritmo {
    id: string;
    nombre: string;
    fechaCreacion: string;
}

export default function ModalDetalleRegistro({
    isOpen,
    onClose,
    selectedData,
    rangoDireccion,
    onRangoDireccionChange,
    selectedAlgorithm,
    onSelectedAlgorithmChange,
    isProcessingAlgorithm,
    onEjecutarAlgoritmo,
    usuarioId
}: ModalDetalleRegistroProps) {
    const [algoritmos, setAlgoritmos] = useState<Algoritmo[]>([]);
    const [loadingAlgoritmos, setLoadingAlgoritmos] = useState(false);

    // Cargar algoritmos cuando se abre el modal
    useEffect(() => {
        if (isOpen && usuarioId) {
            cargarAlgoritmos();
        }
    }, [isOpen, usuarioId]);

    const cargarAlgoritmos = async () => {
        setLoadingAlgoritmos(true);
        try {
            const response = await obtenerAlgoritmos(usuarioId);
            setAlgoritmos(response.algoritmos || []);
        } catch (error) {
            console.error('Error al cargar algoritmos:', error);
            setAlgoritmos([]);
        } finally {
            setLoadingAlgoritmos(false);
        }
    };

    if (!isOpen || !selectedData) return null;

    const renderAlgorithmOptions = () => {
        if (loadingAlgoritmos) {
            return <option value="">Cargando algoritmos...</option>;
        }

        if (algoritmos.length === 0) {
            return <option value="">No tienes algoritmos entrenados</option>;
        }

        return (
            <>
                <option value="">Selecciona un algoritmo</option>
                {algoritmos.map(alg => (
                    <option key={alg.id} value={alg.id}>
                        {alg.nombre}
                    </option>
                ))}
            </>
        );
    };

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
            <div className="bg-secundary rounded-2xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-white mb-4">Detalle del Registro</h2>
                
                {/* Datos del registro */}
                <div className="space-y-2 mb-4">
                    {Object.entries(selectedData).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                            <span className="text-gray-400 capitalize">{key}</span>
                            <span className="text-white">{String(value)}</span>
                        </div>
                    ))}
                </div>

                {/* Controles de selección */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-300 mb-1">Selecciona el rango:</label>
                    <select
                        value={rangoDireccion}
                        onChange={e => onRangoDireccionChange(e.target.value as 'arriba' | 'abajo' | 'actual')}
                        className="w-full px-3 py-2 rounded-lg bg-background text-white mb-2"
                    >
                        <option value="arriba">Desde el inicio hasta aquí (hacia arriba)</option>
                        <option value="abajo">Desde aquí hasta el final (hacia abajo)</option>
                        <option value="actual">Solo este dato</option>
                    </select>

                    <label className="text-gray-300 mb-1">Selecciona tu algoritmo:</label>
                    <select
                        value={selectedAlgorithm}
                        onChange={e => onSelectedAlgorithmChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background text-white mb-2"
                        disabled={loadingAlgoritmos || algoritmos.length === 0}
                    >
                        {renderAlgorithmOptions()}
                    </select>

                    {/* Botones de acción */}
                    <button
                        onClick={() => onEjecutarAlgoritmo(rangoDireccion)}
                        disabled={!selectedAlgorithm || isProcessingAlgorithm || algoritmos.length === 0}
                        className="w-full px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isProcessingAlgorithm ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Ejecutando algoritmo...
                            </>
                        ) : (
                            'Ejecutar Algoritmo'
                        )}
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 rounded-xl bg-secundary border-2 border-background text-gray-300 hover:bg-background-transparent hover:border-background transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}