interface ResultadoAlgoritmo {
    tipo: 'predictivo' | 'optimizacion' | 'clasificacion';
    [key: string]: any;
}

interface ContenedorResultadosProps {
    resultado: ResultadoAlgoritmo | null; // ✅ Permitir null
    onCerrar?: () => void;
}

export default function ModalResultadosAlgoritmos({ resultado, onCerrar }: ContenedorResultadosProps) {
    if (!resultado || !resultado.tipo) {
        return null;
    }

    const obtenerColorClase = (clase: string) => {
        const colores = {
            'Frio': 'text-blue-400',
            'Normal': 'text-green-400',
            'Caliente': 'text-red-400'
        };
        return colores[clase as keyof typeof colores] || 'text-gray-400';
    };

    const renderResultadoPredictivo = () => {
        if (resultado.tipo !== 'predictivo') return null;
        
        // Calcular hora estimada para cada paso (ejemplo: cada paso = +1 hora)
        const ahora = new Date();
        const minutosPorPaso = 60; // Puedes ajustar a 15, 30, etc. según tu lógica
        return (
            <div className="modal-algorithm-results space-y-4">
                <div className="flex items-center gap-2">
                    <h4 className="text-blue-400 font-semibold">Predicciones Futuras</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {resultado.predicciones && resultado.predicciones.length > 0 ? (
                        resultado.predicciones.map((pred: number, index: number) => {
                            const horaEstimada = new Date(ahora.getTime() + minutosPorPaso * 60000 * (index + 1));
                            const horaStr = horaEstimada.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            return (
                                <div key={index} className="bg-gray-700 p-3 rounded-lg text-white text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-400 font-medium">Paso {index + 1}:</span>
                                        <span className="font-bold">{pred.toFixed(2)}°C</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">Hora estimada: {horaStr}</div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-red-400 col-span-2">No hay predicciones disponibles</div>
                    )}
                </div>
            </div>
        );
    };

    const renderResultadoOptimizacion = () => {
        if (resultado.tipo !== 'optimizacion') return null;
        
        const mejoraPorcentual = resultado.optimizacion?.mejora_porcentual || 0;
        const esMejora = mejoraPorcentual > 0;

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h4 className="text-green-400 font-semibold">Resultados de Optimización</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-green-400 font-medium">Función objetivo:</span>
                            <span className="text-white font-bold">
                                {resultado.optimizacion?.funcion_objetivo?.toFixed(4) || 'N/A'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-green-400 font-medium">Mejora obtenida:</span>
                            <span className={`font-bold ${esMejora ? 'text-green-300' : 'text-red-300'}`}>
                                {esMejora ? '+' : ''}{mejoraPorcentual.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-green-400 font-medium">Iteraciones:</span>
                            <span className="text-white font-bold">
                                {resultado.optimizacion?.iteraciones_realizadas || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {resultado.optimizacion?.valores_optimizados && resultado.optimizacion.valores_optimizados.length > 0 && (
                    <div className="bg-gray-800 p-3 rounded-lg">
                        <h5 className="text-green-400 font-medium mb-2">Valores optimizados:</h5>
                        <div className="text-white text-sm font-mono">
                            [{resultado.optimizacion.valores_optimizados.map((v: number) => v.toFixed(2)).join(', ')}]
                        </div>
                    </div>
                )}

                {resultado.optimizacion?.estadisticas_entrada && (
                    <div className="bg-gray-800 p-3 rounded-lg">
                        <h5 className="text-gray-300 text-sm font-medium mb-2">Estadísticas de entrada:</h5>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                                <p className="text-gray-400">Promedio</p>
                                <p className="text-white font-bold">{resultado.optimizacion.estadisticas_entrada.promedio?.toFixed(2) || 'N/A'}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-400">Máximo</p>
                                <p className="text-white font-bold">{resultado.optimizacion.estadisticas_entrada.maximo?.toFixed(2) || 'N/A'}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-400">Mínimo</p>
                                <p className="text-white font-bold">{resultado.optimizacion.estadisticas_entrada.minimo?.toFixed(2) || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                )}

               
            </div>
        );
    };

    const renderResultadoClasificacion = () => {
        if (resultado.tipo !== 'clasificacion') return null;
        
        const confianzaPorcentaje = ((resultado.clasificacion?.confianza || 0) * 100).toFixed(1);
        const esAltaConfianza = (resultado.clasificacion?.confianza || 0) > 0.7;

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h4 className="text-purple-400 font-semibold">Resultado de Clasificación</h4>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-center">
                        <h5 className="text-gray-300 text-sm mb-2">Clasificación detectada:</h5>
                        <div className={`text-2xl font-bold ${obtenerColorClase(resultado.clasificacion?.clase_predicha || '')}`}>
                            {resultado.clasificacion?.clase_predicha || 'N/A'}
                        </div>
                        <div className={`text-sm mt-2 ${esAltaConfianza ? 'text-green-400' : 'text-yellow-400'}`}>
                            Confianza: {confianzaPorcentaje}%
                        </div>
                    </div>
                </div>

                {resultado.clasificacion?.probabilidades && Object.keys(resultado.clasificacion.probabilidades).length > 0 && (
                    <div className="bg-gray-800 p-3 rounded-lg">
                        <h5 className="text-purple-400 font-medium mb-3">Probabilidades por clase:</h5>
                        <div className="space-y-2">
                            {Object.entries(resultado.clasificacion.probabilidades)
                                .sort(([,a], [,b]) => (b as number) - (a as number))
                                .map(([clase, prob]) => {
                                    const porcentaje = ((prob as number) * 100).toFixed(1);
                                    const ancho = Math.max(parseFloat(porcentaje), 5);
                                    
                                    return (
                                        <div key={clase} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className={`font-medium ${obtenerColorClase(clase)}`}>
                                                    {clase}
                                                </span>
                                                <span className="text-white">{porcentaje}%</span>
                                            </div>
                                            <div className="w-full bg-gray-600 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                        clase === resultado.clasificacion?.clase_predicha 
                                                            ? 'bg-purple-400' 
                                                            : 'bg-gray-500'
                                                    }`}
                                                    style={{ width: `${ancho}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {resultado.clasificacion?.caracteristicas_detectadas && (
                    <div className="bg-gray-800 p-3 rounded-lg">
                        <h5 className="text-purple-400 font-medium mb-3">Características detectadas:</h5>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-400">Patrón:</span>
                                <p className="text-white font-medium">
                                    {resultado.clasificacion.caracteristicas_detectadas.patron || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-400">Tendencia:</span>
                                <p className="text-white font-medium">
                                    {resultado.clasificacion.caracteristicas_detectadas.tendencia || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-400">Temperatura promedio:</span>
                                <p className="text-white font-medium">
                                    {resultado.clasificacion.caracteristicas_detectadas.temperatura_promedio?.toFixed(1) || 'N/A'}°C
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-400">Variabilidad:</span>
                                <p className="text-white font-medium">
                                    {resultado.clasificacion.caracteristicas_detectadas.variabilidad?.toFixed(2) || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-gray-400">Rango:</span>
                            <p className="text-white font-medium">
                                {resultado.clasificacion.caracteristicas_detectadas.rango || 'N/A'}
                            </p>
                        </div>
                    </div>
                )}

                {resultado.clasificacion?.reglas_aplicadas && resultado.clasificacion.reglas_aplicadas.length > 0 && (
                    <div className="bg-gray-800 p-3 rounded-lg">
                        <h5 className="text-purple-400 font-medium mb-2">Reglas aplicadas:</h5>
                        <div className="space-y-1">
                            {resultado.clasificacion.reglas_aplicadas.map((regla: string, index: number) => (
                                <p key={index} className="text-xs text-gray-300">
                                    • {regla}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        );
    };

    return (
        <div className="mt-4 p-4 bg-background rounded-lg border border-gray-600">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center">
                    Resultado del Algoritmo
                    <span className="ml-2 text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
                        {resultado.tipo}
                    </span>
                </h3>
                {onCerrar && (
                    <button
                        onClick={onCerrar}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Limpiar resultado"
                    >
                        ✕
                    </button>
                )}
            </div>
            
            {renderResultadoPredictivo()}
            {renderResultadoOptimizacion()}
            {renderResultadoClasificacion()}
        </div>
    );
}