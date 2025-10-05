import { type DataPoint } from './DatosEntiempoReal';
import { useEffect, useState } from 'react';
import { obtenerAlgoritmos, ejecutarAlgoritmo } from '../../services/algoritmo.service';
import ModalResultadosAlgoritmos from './ModalResultadosAlgoritmos';

interface ModalDetalleRegistroProps {
    isOpen: boolean;
    onClose: () => void;
    selectedData: DataPoint | null;
    rangoDireccion: 'arriba' | 'abajo';
    onRangoDireccionChange: (direction: 'arriba' | 'abajo') => void;
    selectedAlgorithm: string;
    onSelectedAlgorithmChange: (algorithm: string) => void;
    isProcessingAlgorithm: boolean;
    onEjecutarAlgoritmo: (direction: 'arriba' | 'abajo') => void;
    usuarioId: string;
}

interface Algoritmo {
    id: string;
    nombre: string;
    fechaCreacion: string;
    usuarioId: string;
    rutaArchivo: string;
}

// Tipos específicos para algoritmos
type TipoAlgoritmo = 'predictivo' | 'optimizacion' | 'clasificacion';

interface ConfigTipo {
    icono: string;
    descripcion: string;
    color: string;
    colorBg: string;
    colorText: string;
}

// Interfaces para resultados tipados
interface ResultadoPredictivo {
    tipo: 'predictivo';
    predicciones: number[];
    n_pasos: number;
    valores_entrada: number[];
    usuario_id: string;
    nombre_modelo: string;
}

interface ResultadoOptimizacion {
    tipo: 'optimizacion';
    optimizacion: {
        funcion_objetivo: number;
        mejora_porcentual: number;
        iteraciones_realizadas: number;
        valores_optimizados: number[];
        estadisticas_entrada: {
            promedio: number;
            maximo: number;
            minimo: number;
        };
    };
    parametros_entrada: number[];
    usuario_id: string;
    nombre_modelo: string;
}

interface ResultadoClasificacion {
    tipo: 'clasificacion';
    clasificacion: {
        clase_predicha: string;
        confianza: number;
        probabilidades: Record<string, number>;
        caracteristicas_detectadas: {
            patron: string;
            temperatura_promedio: number;
            variabilidad: number;
            tendencia: string;
            rango: string;
        };
        reglas_aplicadas: string[];
    };
    datos_entrada: number[];
    usuario_id: string;
    nombre_modelo: string;
}

type ResultadoAlgoritmo = ResultadoPredictivo | ResultadoOptimizacion | ResultadoClasificacion;

// Funciones de utilidad
const detectarTipoAlgoritmo = (algoritmo: Algoritmo): TipoAlgoritmo => {
    const nombre = algoritmo.nombre;

    if (nombre.includes('[Predictivo]')) return 'predictivo';
    if (nombre.includes('[Optimización]')) return 'optimizacion';
    if (nombre.includes('[Clasificación]')) return 'clasificacion';

    // Fallback por ruta
    const ruta = algoritmo.rutaArchivo;
    if (ruta.includes('\\Prediccion\\') || ruta.includes('/Prediccion/')) return 'predictivo';
    if (ruta.includes('\\Optimizacion\\') || ruta.includes('/Optimizacion/')) return 'optimizacion';
    if (ruta.includes('\\Clasificacion\\') || ruta.includes('/Clasificacion/')) return 'clasificacion';

    return 'predictivo'; // Valor por defecto
};

const obtenerNombreLimpio = (algoritmo: Algoritmo): string => {
    return algoritmo.nombre.replace(/^\[.*?\]\s*/, '');
};

const obtenerConfigTipo = (tipo: TipoAlgoritmo): ConfigTipo => {
    const configs: Record<TipoAlgoritmo, ConfigTipo> = {
        predictivo: {
            icono: 'PRED',
            descripcion: 'Predice valores futuros',
            color: 'blue',
            colorBg: 'bg-blue-100',
            colorText: 'text-blue-800'
        },
        optimizacion: {
            icono: 'OPT',
            descripcion: 'Encuentra valores óptimos',
            color: 'green',
            colorBg: 'bg-green-100',
            colorText: 'text-green-800'
        },
        clasificacion: {
            icono: 'CLAS',
            descripcion: 'Clasifica en categorías',
            color: 'purple',
            colorBg: 'bg-purple-100',
            colorText: 'text-purple-800'
        }
    };

    return configs[tipo];
};

export default function ModalDetalleRegistro({
    isOpen,
    onClose,
    selectedData,
    rangoDireccion,
    onRangoDireccionChange,
    selectedAlgorithm,
    onSelectedAlgorithmChange,
    usuarioId,
}: ModalDetalleRegistroProps) {
    const [algoritmos, setAlgoritmos] = useState<Algoritmo[]>([]);
    const [loadingAlgoritmos, setLoadingAlgoritmos] = useState(false);
    const [ejecutando, setEjecutando] = useState(false);
    const [resultadoAlgoritmo, setResultadoAlgoritmo] = useState<ResultadoAlgoritmo | null>(null);
    const [errorEjecucion, setErrorEjecucion] = useState<string>('');

    // Cargar algoritmos cuando se abre el modal
    useEffect(() => {
        if (isOpen && usuarioId) {
            cargarAlgoritmos();
        }
        // Limpiar resultados al abrir/cerrar
        if (isOpen) {
            setResultadoAlgoritmo(null);
            setErrorEjecucion('');
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

    const limpiarResultado = () => {
        setResultadoAlgoritmo(null);
        setErrorEjecucion('');
    };

    // Función para obtener valores seguros para el algoritmo
    const obtenerValoresParaAlgoritmo = (): number[] => {
        // ✅ No simular valores - usar solo datos reales
        const datosColumna = selectedData?._datosColumna as number[];
        const indiceFila = selectedData?._indiceFila as number;

        // ❌ Si no hay datos reales, lanzar error
        if (!datosColumna || datosColumna.length === 0) {
            throw new Error('No hay datos de columna disponibles');
        }

        if (indiceFila === undefined || indiceFila < 0 || indiceFila >= datosColumna.length) {
            throw new Error('Índice de fila inválido');
        }

        let valoresSeleccionados: number[] = [];

        if (rangoDireccion === 'arriba') {
            // TODOS los datos desde el inicio hasta el punto seleccionado (incluido)
            valoresSeleccionados = datosColumna.slice(0, indiceFila + 1);
        } else if (rangoDireccion === 'abajo') {
            // TODOS los datos desde el punto seleccionado hasta el final
            valoresSeleccionados = datosColumna.slice(indiceFila);
        } else {
            throw new Error('Dirección de rango inválida');
        }
        if (valoresSeleccionados.length === 0) {
            throw new Error('No se pudieron extraer valores del rango seleccionado');
        }

        return valoresSeleccionados;
    };

    // Función principal para ejecutar algoritmo
    // Función principal para ejecutar algoritmo
const ejecutarAlgoritmoSeleccionado = async () => {
    if (!selectedAlgorithm) {
        setErrorEjecucion('Selecciona un algoritmo');
        return;
    }

    const algoritmoSeleccionado = algoritmos.find(alg => alg.id === selectedAlgorithm);
    if (!algoritmoSeleccionado) {
        setErrorEjecucion('Algoritmo no encontrado');
        return;
    }

    setEjecutando(true);
    setResultadoAlgoritmo(null);
    setErrorEjecucion('');

    try {
        const tipo = detectarTipoAlgoritmo(algoritmoSeleccionado);
        const nombreLimpio = obtenerNombreLimpio(algoritmoSeleccionado);
        
        // ✅ Intentar obtener valores reales - puede lanzar error
        let valoresParaAlgoritmo: number[];
        try {
            valoresParaAlgoritmo = obtenerValoresParaAlgoritmo();
        } catch (error: any) {
            // ❌ Error específico de datos
            setErrorEjecucion(`Error con los datos: ${error.message}`);
            return;
        }

        // Construir payload según el tipo
        let payload: any = {
            usuarioId: usuarioId,
            nombreModelo: nombreLimpio,
            valores: valoresParaAlgoritmo
        };

        // Agregar parámetros específicos según el tipo
        switch (tipo) {
            case 'predictivo':
                payload.nPasos = 7;
                break;
            case 'optimizacion':
                payload.objetivo = 'maximizar';
                payload.iteraciones = 100;
                break;
            case 'clasificacion':
                payload.umbralConfianza = 0.8;
                break;
        }

        const resultado = await ejecutarAlgoritmo(payload);

        if (resultado.success) {
            setResultadoAlgoritmo(resultado.data);
        } else {
            setErrorEjecucion(resultado.message || 'Error desconocido en la ejecución');
        }

    } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Error al ejecutar el algoritmo';
        setErrorEjecucion(errorMsg);
    } finally {
        setEjecutando(false);
    }
};

    // Renderizar opciones de algoritmos con iconos
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
                {algoritmos.map(alg => {
                    const tipo = detectarTipoAlgoritmo(alg);
                    const config = obtenerConfigTipo(tipo);
                    const nombreLimpio = obtenerNombreLimpio(alg);

                    return (
                        <option key={alg.id} value={alg.id}>
                            [{config.icono}] {nombreLimpio} ({tipo})
                        </option>
                    );
                })}
            </>
        );
    };

    const renderResultado = () => {
        if (!resultadoAlgoritmo) return null;

        return (
            <ModalResultadosAlgoritmos
                resultado={resultadoAlgoritmo}
                onCerrar={limpiarResultado}
            />
        );
    };

    // Renderizar error si existe
    const renderError = () => {
        if (!errorEjecucion) return null;

        return (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                <p className="text-red-300 text-sm">
                    <span className="font-bold">Error:</span> {errorEjecucion}
                </p>
            </div>
        );
    };

    // Debug info actualizado
    const renderInfoDebug = () => {
        if (process.env.NODE_ENV !== 'development') return null;

        const valores = obtenerValoresParaAlgoritmo();
        const datosColumna = selectedData?._datosColumna as number[];

        return (
            <div className="mt-3 p-2 bg-gray-800 rounded text-xs text-gray-400">
                <p className="font-bold">Debug Info:</p>
                <p>Columna seleccionada: {selectedData?._nombrePrimeraColumna}</p>
                <p>Datos de columna: [{datosColumna?.slice(0, 5).join(', ')}...] ({datosColumna?.length} total)</p>
                <p>Índice fila: {selectedData?._indiceFila}</p>
                <p>Rango: {rangoDireccion}</p>
                <p>Valores finales: [{valores.join(', ')}]</p>
                <p>Algoritmos disponibles: {algoritmos.length}</p>
            </div>
        );
    };

    if (!isOpen || !selectedData) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
            <div className="bg-secundary rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-4">Detalle del Registro</h2>

                {/* Controles de selección */}
                <div className="flex flex-col gap-3">
                    <div>
                        <label className="text-gray-300 mb-2 block">Selecciona el rango de datos:</label>
                        <select
                            value={rangoDireccion}
                            onChange={e => onRangoDireccionChange(e.target.value as 'arriba' | 'abajo')}
                            className="w-full px-3 py-2 rounded-lg bg-background text-white border border-gray-600 focus:border-orange-400 focus:outline-none"
                        >
                            <option value="arriba">De aquí hacia arriba (inicio → punto seleccionado)</option>
                            <option value="abajo">De aquí hacia abajo (punto seleccionado → final)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-300 mb-2 block">Selecciona tu algoritmo:</label>
                        <select
                            value={selectedAlgorithm}
                            onChange={e => onSelectedAlgorithmChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-background text-white border border-gray-600 focus:border-orange-400 focus:outline-none"
                            disabled={loadingAlgoritmos || algoritmos.length === 0}
                        >
                            {renderAlgorithmOptions()}
                        </select>
                    </div>

                    {/* Botón principal para ejecutar */}
                    <button
                        onClick={ejecutarAlgoritmoSeleccionado}
                        disabled={!selectedAlgorithm || ejecutando || algoritmos.length === 0}
                        className="w-full px-4 py-3 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                    >
                        {ejecutando ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Ejecutando algoritmo...
                            </>
                        ) : (
                            <>
                                Ejecutar Algoritmo
                            </>
                        )}
                    </button>

                    {/* Usar el nuevo componente de resultados */}
                    {renderResultado()}
                    {renderError()}
                    {renderInfoDebug()}

                    {/* Botón cerrar */}
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 rounded-xl bg-secundary border-2 border-background text-gray-300 hover:bg-background hover:border-gray-500 transition-colors mt-3"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}