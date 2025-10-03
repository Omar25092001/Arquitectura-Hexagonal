import React, { useState } from 'react';
import { X, Thermometer, Droplets, Sun, Wind, Activity, ArrowLeft, RotateCcw, Beaker, Monitor } from 'lucide-react';
import SimularMonitorizacion from './SimularMonitorizacion';

interface ModalMonitorizacionProps {
    isOpen: boolean;
    onClose: () => void;
    asignaciones: Record<string, string>;
    datosActuales: Record<string, number>;
    showAsModal?: boolean;
}

interface EstadoVariable {
    estado: 'optimo' | 'bajo' | 'critico';
    valor: number;
    rango: string;
    icono: React.ReactNode;
    color: string;
}

export default function ModalMonitorizacion({
    isOpen,
    onClose,
    asignaciones,
    datosActuales,
    showAsModal = true
}: ModalMonitorizacionProps) {

    if (showAsModal && !isOpen) return null;

    // Estados
    const [modoSimulacion, setModoSimulacion] = useState(false);
    const [valoresSimulados, setValoresSimulados] = useState<Record<string, number>>({});
    const [inputsTemporales, setInputsTemporales] = useState<Record<string, string>>({});

    

    const determinarEstado = (variable: string, valor: number): EstadoVariable => {
        const configs = {
            temperatura: {
                optimo: [18, 25],
                bajo: [10, 18],
                unidad: '°C',
                icono: <Thermometer className="w-5 h-5" />
            },
            humedad: {
                optimo: [60, 70],
                bajo: [40, 60],
                unidad: '%',
                icono: <Droplets className="w-5 h-5" />
            },
            radiacion: {
                optimo: [400, 800],
                bajo: [200, 400],
                unidad: 'W/m²',
                icono: <Sun className="w-5 h-5" />
            },
            co2: {
                optimo: [800, 1200],
                bajo: [400, 800],
                unidad: 'ppm',
                icono: <Activity className="w-5 h-5" />
            },
            viento: {
                optimo: [0.5, 2.0],
                bajo: [0, 0.5],
                unidad: 'm/s',
                icono: <Wind className="w-5 h-5" />
            }
        };

        const config = configs[variable as keyof typeof configs];
        if (!config) {
            return {
                estado: 'optimo',
                valor,
                rango: 'N/A',
                icono: <Activity className="w-5 h-5" />,
                color: 'text-gray-400'
            };
        }

        let estado: 'optimo' | 'bajo' | 'critico' = 'optimo';
        let color = 'text-green-400';

        if (valor >= config.optimo[0] && valor <= config.optimo[1]) {
            estado = 'optimo';
            color = 'text-green-400';
        } else if (valor >= config.bajo[0] && valor < config.bajo[1]) {
            estado = 'bajo';
            color = 'text-yellow-400';
        } else {
            estado = 'critico';
            color = 'text-red-400';
        }

        return {
            estado,
            valor,
            rango: `${config.optimo[0]}-${config.optimo[1]} ${config.unidad}`,
            icono: config.icono,
            color
        };
    };

    

    // Función para obtener el valor final (simulado o real)
    const obtenerValorFinal = (varEstandar: string, varRecibida: string): number => {
        if (valoresSimulados[varEstandar] !== undefined) {
            return valoresSimulados[varEstandar];
        }
        return datosActuales[varRecibida] || 0;
    };

    // Funciones de simulación
    const manejarCambioInput = (variable: string, valor: string) => {
        setInputsTemporales(prev => ({
            ...prev,
            [variable]: valor
        }));

        if (valor === '') {
            limpiarValorSimulado(variable);
            return;
        }

        const numeroValor = parseFloat(valor);
        if (!isNaN(numeroValor)) {
            setValoresSimulados(prev => ({
                ...prev,
                [variable]: numeroValor
            }));
        }
    };

    const limpiarValorSimulado = (variable: string) => {
        setValoresSimulados(prev => {
            const nuevo = { ...prev };
            delete nuevo[variable];
            return nuevo;
        });
        setInputsTemporales(prev => {
            const nuevo = { ...prev };
            delete nuevo[variable];
            return nuevo;
        });
    };

    const limpiarTodosLosValores = () => {
        setValoresSimulados({});
        setInputsTemporales({});
    };

    const volverAMonitorizacion = () => {
        setModoSimulacion(false);
        setValoresSimulados({});
        setInputsTemporales({});
    };

    // Estados calculados
    const estadosVariables = Object.entries(asignaciones).reduce((acc, [varEstandar, varRecibida]) => {
        if (varRecibida && (datosActuales[varRecibida] !== undefined || valoresSimulados[varEstandar] !== undefined)) {
            const valorFinal = obtenerValorFinal(varEstandar, varRecibida);
            acc[varEstandar] = determinarEstado(varEstandar, valorFinal);
        }
        return acc;
    }, {} as Record<string, EstadoVariable>);

    const estadoGeneral = () => {
        const estados = Object.values(estadosVariables).map(e => e.estado);
        if (estados.includes('critico')) return 'critico';
        if (estados.includes('bajo')) return 'bajo';
        return 'optimo';
    };

    const estadoInvernadero = estadoGeneral();
    const hayDatos = Object.keys(datosActuales).length > 0 && Object.values(datosActuales).some(valor => valor !== undefined && valor !== null);
    const hayDatosOSimulados = hayDatos || Object.keys(valoresSimulados).length > 0;

    // Imagen del invernadero
    const getInvernaderoImage = () => {
        const baseStyle = "w-full max-w-sm mx-auto h-36 sm:h-48 md:h-56 rounded-lg mb-6 bg-gradient-to-b";

        switch (estadoInvernadero) {
            case 'optimo':
                return (
                    <div className={`${baseStyle} flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-green-500 opacity-20 animate-pulse"></div>
                        <div className="text-center text-white z-10 px-4">
                            <div className="flex justify-center mb-2">
                                <img
                                    src="/assets/Estados/optimo.png"
                                    alt="Invernadero Óptimo"
                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg animate-bounce"
                                />
                            </div>
                            <p className="text-base sm:text-lg font-bold">Invernadero Óptimo</p>
                            <p className="text-xs sm:text-sm">Valores óptimos</p>
                        </div>
                    </div>
                );
            case 'bajo':
                return (
                    <div className={`${baseStyle} flex items-center justify-center relative overflow-hidden `}>
                        <div className="absolute inset-0 bg-yellow-500 opacity-20 animate-pulse"></div>
                        <div className="text-center text-white z-10 px-4">
                            <div className="flex justify-center mb-2">
                                <img
                                    src="/assets/Estados/bajo.png"
                                    alt="Invernadero Bajo"
                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg animate-bounce"
                                />
                            </div>
                            <p className="text-base sm:text-lg font-bold">Atención Requerida</p>
                            <p className="text-xs sm:text-sm">Valores por debajo del óptimo</p>
                        </div>
                    </div>
                );
            case 'critico':
                return (
                    <div className={`${baseStyle} flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse"></div>
                        <div className="text-center text-white z-10 px-4">
                            <div className="flex justify-center mb-2">
                                <img
                                    src="/assets/Estados/critico.png"
                                    alt="Invernadero Crítico"
                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg animate-bounce"
                                />
                            </div>
                            <p className="text-base sm:text-lg font-bold">Estado Crítico</p>
                            <p className="text-xs sm:text-sm">Acción inmediata requerida</p>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className={`${baseStyle} from-gray-400 to-gray-600 flex items-center justify-center`}>
                        <div className="text-center text-white px-4">
                            <Activity className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2" />
                            <p className="text-base sm:text-lg font-bold">Sin Datos</p>
                            <p className="text-xs sm:text-sm">Esperando información...</p>
                        </div>
                    </div>
                );
        }
    };

    // Vista de monitorización
    const renderVistaMonitorizacion = () => (
        <>
            {!hayDatosOSimulados ? (
                // Estado sin datos
                <div className="text-center py-8 sm:py-16">
                    <div className="w-full max-w-xs sm:max-w-md mx-auto h-32 sm:h-48 rounded-lg mb-4 sm:mb-6 bg-gradient-to-b from-gray-400 to-gray-600 flex items-center justify-center">
                        <div className="text-center text-white px-4">
                            <Activity className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm sm:text-base md:text-lg font-bold">Sin Datos</p>
                            <p className="text-xs sm:text-sm">Esperando información...</p>
                        </div>
                    </div>

                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-3 sm:mb-4">
                        No hay datos disponibles
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base max-w-sm sm:max-w-md mx-auto px-4">
                        Aún no se han recibido datos de los sensores. Usa el botón "Simular" para probar valores.
                    </p>

                    {/* Mostrar asignaciones configuradas */}
                    {Object.keys(asignaciones).length > 0 && (
                        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-background rounded-lg max-w-xs sm:max-w-md mx-auto">
                            <h4 className="text-white font-medium mb-3 text-sm sm:text-base">
                                Variables configuradas:
                            </h4>
                            <div className="space-y-2">
                                {Object.entries(asignaciones).map(([key, value]) => (
                                    <div key={key} className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-400 capitalize">{key}:</span>
                                        <span className="text-blue-400 font-medium">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // Estado con datos
                <>
                    {/* Imagen del invernadero */}
                    <div className="flex justify-center mb-4 sm:mb-6 px-4">
                        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
                            {getInvernaderoImage()}
                        </div>
                    </div>

                    {/* Estado general */}
                    <div className="text-center mb-4 sm:mb-6 md:mb-8 px-4">
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-2">
                            Estado General:
                            <span className={`ml-2 ${estadoInvernadero === 'optimo' ? 'text-green-400' :
                                estadoInvernadero === 'bajo' ? 'text-yellow-400' :
                                    'text-red-400'
                                }`}>
                                {estadoInvernadero === 'optimo' ? 'Óptimo' :
                                    estadoInvernadero === 'bajo' ? 'Bajo' :
                                        estadoInvernadero === 'critico' ? 'Crítico' :
                                            'Desconocido'}
                            </span>
                        </h3>
                    </div>

                    {/* Variables monitorizadas (solo lectura) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-2 sm:px-0">
                        {Object.entries(estadosVariables).map(([variable, estado]) => (
                            <div key={variable} className="bg-background rounded-lg p-3 sm:p-4">
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={estado.color}>{estado.icono}</span>
                                        <h4 className="text-white font-medium capitalize text-xs sm:text-sm md:text-base truncate">
                                            {variable}
                                        </h4>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${estado.estado === 'optimo' ? 'bg-green-600 bg-opacity-20 text-green-300' :
                                            estado.estado === 'bajo' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
                                                'bg-red-600 bg-opacity-20 text-red-300'
                                        }`}>
                                        {estado.estado}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                                        {estado.valor}
                                        <span className="text-sm text-gray-400 ml-1">
                                            {estado.rango.split(' ').pop()}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">
                                        Óptimo: {estado.rango}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        Variable: {asignaciones[variable]}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    );

    const content = (
        <div className="p-3 sm:p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center">
                    <Activity className="w-5 sm:w-6 h-5 sm:h-6 mr-2 text-orange-400 flex-shrink-0" />
                    <span className="truncate">
                        {modoSimulacion ? 'Simulación de Variables' : 'Monitorización de Invernadero'}
                    </span>
                </h2>
                <div className="flex gap-2">
                    {/* Botón para cambiar modo */}
                    <button
                        onClick={() => {
                            const nuevoModo = !modoSimulacion;
                            setModoSimulacion(nuevoModo);

                            // ✅ Si vamos a simulación, mantener valores. Si vamos a monitorización, limpiar
                            if (!nuevoModo) {
                                // Volviendo a monitorización - limpiar valores simulados
                                setValoresSimulados({});
                                setInputsTemporales({});
                            }
                        }}
                        className={`px-3 py-2 text-white rounded-lg flex items-center gap-2 text-sm ${modoSimulacion
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                    >
                        {modoSimulacion ? (
                            <>
                                <Monitor className="w-4 h-4" />
                                <span className="hidden sm:inline">Monitorización</span>
                            </>
                        ) : (
                            <>
                                <Beaker className="w-4 h-4" />
                                <span className="hidden sm:inline">Simular</span>
                            </>
                        )}
                    </button>
                    {/* Botón limpiar (solo en monitorización si hay valores simulados) */}
                    {!modoSimulacion && Object.keys(valoresSimulados).length > 0 && (
                        <button
                            onClick={limpiarTodosLosValores}
                            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 text-sm"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span className="hidden sm:inline">Restaurar</span>
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        {showAsModal ? (
                            <X className="w-5 sm:w-6 h-5 sm:h-6" />
                        ) : (
                            <>
                                <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                                <span className="text-sm sm:text-base">Volver</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Renderizar vista según el modo */}
            {modoSimulacion ? (
                <SimularMonitorizacion
                    asignaciones={asignaciones}
                    datosActuales={datosActuales}
                    valoresSimulados={valoresSimulados}
                    inputsTemporales={inputsTemporales}
                    onCambioInput={manejarCambioInput}
                    onLimpiarValor={limpiarValorSimulado}
                    onLimpiarTodos={limpiarTodosLosValores}
                    onVolverMonitorizacion={volverAMonitorizacion}
                    determinarEstado={determinarEstado}
                />
            ) : (
                renderVistaMonitorizacion()
            )}
        </div>
    );

    // Si es modal, envolver en overlay
    if (showAsModal) {
        return (
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-secundary rounded-xl sm:rounded-2xl shadow-xl w-full max-w-xs sm:max-w-2xl md:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-secundary rounded-xl sm:rounded-2xl shadow-xl w-full max-w-xs sm:max-w-2xl md:max-w-4xl mx-auto">
            {content}
        </div>
    );
}