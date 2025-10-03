import { Thermometer, Droplets, Sun, Wind, Activity, RotateCcw} from 'lucide-react';

interface SimularMonitorizacionProps {
    asignaciones: Record<string, string>;
    datosActuales: Record<string, number>;
    valoresSimulados: Record<string, number>;
    inputsTemporales: Record<string, string>;
    onCambioInput: (variable: string, valor: string) => void;
    onLimpiarValor: (variable: string) => void;
    onLimpiarTodos: () => void;
    onVolverMonitorizacion: () => void;
    determinarEstado: (variable: string, valor: number) => any;
}

export default function SimulacionVariables({
    asignaciones,
    datosActuales,
    valoresSimulados,
    inputsTemporales,
    onCambioInput,
    onLimpiarValor,
    determinarEstado
}: SimularMonitorizacionProps) {

    // Función para obtener el valor final (simulado o real)
    const obtenerValorFinal = (varEstandar: string, varRecibida: string): number => {
        if (valoresSimulados[varEstandar] !== undefined) {
            return valoresSimulados[varEstandar];
        }
        return datosActuales[varRecibida] || 0;
    };

    // Calcular estados en tiempo real
    const estadosVariables = Object.entries(asignaciones).reduce((acc, [varEstandar, varRecibida]) => {
        if (varRecibida && (datosActuales[varRecibida] !== undefined || valoresSimulados[varEstandar] !== undefined)) {
            const valorFinal = obtenerValorFinal(varEstandar, varRecibida);
            acc[varEstandar] = determinarEstado(varEstandar, valorFinal);
        }
        return acc;
    }, {} as Record<string, any>);

    // Determinar estado general en tiempo real
    const estadoGeneral = () => {
        const estados = Object.values(estadosVariables).map(e => e.estado);
        if (estados.includes('critico')) return 'critico';
        if (estados.includes('bajo')) return 'bajo';
        return 'optimo';
    };


    const estadoInvernadero = estadoGeneral();
    const hayValoresSimulados = Object.keys(valoresSimulados).length > 0;

    // Imagen del invernadero en tiempo real
    const getInvernaderoImageSimulacion = () => {
        const baseStyle = "w-full max-w-sm mx-auto h-32 sm:h-40 md:h-48 rounded-lg mb-4 bg-gradient-to-b";

        switch (estadoInvernadero) {
            case 'optimo':
                return (
                    <div className={`${baseStyle} flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-green-500 opacity-30 animate-pulse"></div>
                        <div className="text-center text-white z-10 px-4">
                            <div className="flex justify-center mb-2">
                                <img
                                    src="/assets/Estados/optimo.png"
                                    alt="Invernadero Óptimo"
                                    className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded-lg animate-bounce"
                                />
                            </div>
                            <p className="text-sm sm:text-base font-bold text-green-300">¡Óptimo!</p>
                            <p className="text-xs text-green-200">Simulación exitosa</p>
                        </div>
                    </div>
                );
            case 'bajo':
                return (
                    <div className={`${baseStyle} flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-yellow-500 opacity-30 animate-pulse"></div>
                        <div className="text-center text-white z-10 px-4">
                            <div className="flex justify-center mb-2">
                                <img
                                    src="/assets/Estados/bajo.png"
                                    alt="Invernadero Bajo"
                                    className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded-lg animate-bounce"
                                />
                            </div>
                            <p className="text-sm sm:text-base font-bold text-yellow-300">Atención</p>
                            <p className="text-xs text-yellow-200">Ajustar valores</p>
                        </div>
                    </div>
                );
            case 'critico':
                return (
                    <div className={`${baseStyle} flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-red-500 opacity-40 animate-pulse"></div>
                        <div className="text-center text-white z-10 px-4">
                            <div className="flex justify-center mb-2">
                                <img
                                    src="/assets/Estados/critico.png"
                                    alt="Invernadero Crítico"
                                    className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded-lg animate-bounce"
                                />
                            </div>
                            <p className="text-sm sm:text-base font-bold text-red-300">¡Crítico!</p>
                            <p className="text-xs text-red-200">Revisar simulación</p>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className={`${baseStyle} from-gray-400 to-gray-600 flex items-center justify-center`}>
                        <div className="text-center text-white px-4">
                            <Activity className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1" />
                            <p className="text-sm font-bold">Sin valores</p>
                            <p className="text-xs text-gray-300">Introduce datos</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            

            {/* ✨ IMAGEN EN TIEMPO REAL */}
            {hayValoresSimulados && (
                <div className="mb-6">
                   
                    <div className="flex justify-center px-4">
                        <div className="w-full max-w-xs sm:max-w-sm">
                            {getInvernaderoImageSimulacion()}
                        </div>
                    </div>

                    {/* Estado general compacto */}
                    <div className="text-center">
                        <p className="text-sm text-gray-300">
                            Estado actual: 
                            <span className={`ml-1 font-medium ${
                                estadoInvernadero === 'optimo' ? 'text-green-400' :
                                estadoInvernadero === 'bajo' ? 'text-yellow-400' :
                                'text-red-400'
                            }`}>
                                {estadoInvernadero === 'optimo' ? 'Óptimo' :
                                 estadoInvernadero === 'bajo' ? 'Bajo' :
                                 estadoInvernadero === 'critico' ? 'Crítico' :
                                 'Sin datos'}
                            </span>
                        </p>
                    </div>
                </div>
            )}

            {/* Grid de inputs de simulación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(asignaciones).map(([variable, varRecibida]) => {
                    const configs = {
                        temperatura: { unidad: '°C', icono: <Thermometer className="w-5 h-5" />, placeholder: "Ej: 22" },
                        humedad: { unidad: '%', icono: <Droplets className="w-5 h-5" />, placeholder: "Ej: 65" },
                        radiacion: { unidad: 'W/m²', icono: <Sun className="w-5 h-5" />, placeholder: "Ej: 600" },
                        co2: { unidad: 'ppm', icono: <Activity className="w-5 h-5" />, placeholder: "Ej: 1000" },
                        viento: { unidad: 'm/s', icono: <Wind className="w-5 h-5" />, placeholder: "Ej: 1.5" }
                    };

                    const config = configs[variable as keyof typeof configs] || { 
                        unidad: '', 
                        icono: <Activity className="w-5 h-5" />, 
                        placeholder: "Valor" 
                    };
                    
                    const valorInput = inputsTemporales[variable] || '';
                    const esSimulado = valoresSimulados[variable] !== undefined;
                    
                    // ✨ ESTADO EN TIEMPO REAL de cada variable
                    const estadoVariable = esSimulado ? estadosVariables[variable] : null;

                    return (
                        <div key={variable} className="bg-background rounded-lg p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-purple-400">{config.icono}</span>
                                    <h4 className="text-white font-medium capitalize">{variable}</h4>
                                    <span className="text-gray-400 text-sm">({config.unidad})</span>
                                </div>
                                {/* ✨ ESTADO EN TIEMPO REAL */}
                                {estadoVariable && (
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        estadoVariable.estado === 'optimo' ? 'bg-green-600 bg-opacity-20 text-green-300' :
                                        estadoVariable.estado === 'bajo' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
                                        'bg-red-600 bg-opacity-20 text-red-300'
                                    }`}>
                                        {estadoVariable.estado}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3">
                                {/* Input de simulación */}
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder={config.placeholder}
                                        value={valorInput}
                                        onChange={(e) => onCambioInput(variable, e.target.value)}
                                        className="flex-1 px-3 py-2 bg-secundary border border-gray-600 rounded text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                                        step="0.1"
                                    />
                                    {esSimulado && (
                                        <button
                                            onClick={() => onLimpiarValor(variable)}
                                            className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                                            title="Limpiar valor"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Valor actual */}
                                {esSimulado && (
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-purple-300">
                                            {valoresSimulados[variable]} {config.unidad}
                                        </p>
                                        <p className="text-xs text-gray-400">Valor simulado</p>
                                    </div>
                                )}

                                {/* Valor real de referencia */}
                                {datosActuales[varRecibida] !== undefined && (
                                    <div className="text-xs text-gray-500">
                                        Valor real: {datosActuales[varRecibida]} {config.unidad}
                                    </div>
                                )}

                                {/* Rangos de referencia */}
                                <div className="text-xs space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-green-400">Óptimo:</span>
                                        <span className="text-gray-400">
                                            {determinarEstado(variable, 20).rango}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}