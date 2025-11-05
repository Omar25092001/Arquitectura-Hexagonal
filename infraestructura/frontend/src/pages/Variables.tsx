import { useState, useEffect } from 'react';
import Header from '../components/Header';
import SeleccionarRangoFecha from '@/utils/SeleccionarRangoFecha';
import { CheckCircle, ArrowRight, Check, X, RefreshCw, ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModalProtocolos from '../components/Variables/ModalProtocolos';
import { useExcelFileSection } from "@/components/shared/ExcelFileSectionContext";
import { useTutorial } from '../components/Tutorial/TutorialContext'; //   AÑADIR
import { TutorialVariables } from '../components/Tutorial/TutorialVariables'; //   AÑADIR

import {
    detectarVariablesMQTT,
    detectarVariablesHTTP,
    detectarVariablesWebSocket,
    detectarVariablesExcel,
    detectarVariablesInflux
} from '../utils/DetectarVariables';

export default function Variables() {
    const navigate = useNavigate();
    const { startTutorial } = useTutorial(); //   AÑADIR

    const [dataSourceConfig, setDataSourceConfig] = useState<any>(null);
    const [variables, setVariables] = useState<any[]>([]);
    const [selectedVariables, setSelectedVariables] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [intervaloMinutos, setIntervaloMinutos] = useState<number>(1);

    //Manejo de Excel
    const [showDateRangeModal, setShowDateRangeModal] = useState(false);
    const { excelFile } = useExcelFileSection();
    const [rangoFechasSeleccionado, setRangoFechasSeleccionado] = useState(false);

    // PASOS DE NAVEGACIÓN
    const steps = [
        { id: 1, title: 'Fuentes de Datos', active: true },
        { id: 2, title: 'Variables', active: true },
        { id: 3, title: 'Ejecución', active: false }
    ];

    useEffect(() => {
        if (dataSourceConfig) {
            handleDetectarVariables();
        }
    }, [dataSourceConfig]);

    useEffect(() => {
            const primeraVez = localStorage.getItem('tutorialPrimeraVez');
            if (primeraVez === 'true') {
                startTutorial(TutorialVariables); // O el tutorial correspondiente
            }
        }, []);
    

    const handleSiguientePaso = () => {
        if (selectedVariables.length === 0) return;
        localStorage.setItem('selectedVariables', JSON.stringify(variables.filter(v => selectedVariables.includes(v.id))));
        navigate('/usuario/ejecucion');
    }

    const handleTimeModalClose = () => {
        setShowTimeModal(false);
        handleSiguientePaso();
    };

    const handleTimeModalOpen = () => {
        if (dataSourceConfig.protocol === 'mqtt' || dataSourceConfig.protocol === 'websocket') {
            console.log(dataSourceConfig.protocol)
            console.log("entra")
            handleSiguientePaso();
        }
        setShowTimeModal(true);
    };

    const handleGoBack = () => {
        navigate('/usuario/fuente-datos');
    };

    //   AÑADIR FUNCIÓN PARA INICIAR TUTORIAL
    const handleStartTutorial = () => {
        startTutorial(TutorialVariables);
    };

    // Cargar configuración
    useEffect(() => {
        const savedConfig = localStorage.getItem('dataSourceConfig');
        if (!savedConfig) {
            navigate('/usuario/fuente-datos');
            return;
        }

        const config = JSON.parse(savedConfig);
        if (!['mqtt', 'http', 'websocket', 'file', 'influx'].includes(config.protocol)) {
            console.log('protocolo no soportado:', config.protocol)
            navigate('/usuario/fuente-datos');
            return;
        }

        setDataSourceConfig(config);
    }, [navigate]);

    const handleDetectarVariables = async () => {
        setIsLoading(true);
        setError(null);
        setSelectedVariables([]);
        try {
            let variablesDetectadas: any[] = [];
            if (dataSourceConfig.protocol === 'mqtt') {
                variablesDetectadas = await detectarVariablesMQTT(dataSourceConfig.config);
            } else if (dataSourceConfig.protocol === 'http') {
                variablesDetectadas = await detectarVariablesHTTP(dataSourceConfig.config);
            } else if (dataSourceConfig.protocol === 'websocket') {
                variablesDetectadas = await detectarVariablesWebSocket(dataSourceConfig.config);
            } else if (dataSourceConfig.protocol === 'file') {
                if (!excelFile) throw new Error('Selecciona un archivo Excel primero.');
                variablesDetectadas = await detectarVariablesExcel(dataSourceConfig.config, excelFile);
                setShowDateRangeModal(true);
            } else if (dataSourceConfig.protocol === 'influx') {
                variablesDetectadas = await detectarVariablesInflux(dataSourceConfig.config);
            }
            setVariables(variablesDetectadas);
            setLastFetchTime(new Date());
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateRangeSelected = async (rangeData: any) => {
        try {
            if (dataSourceConfig && excelFile) {
                const variablesDetectadas = await detectarVariablesExcel(dataSourceConfig.config, excelFile);
                setVariables(variablesDetectadas);
                setLastFetchTime(new Date());
                localStorage.setItem('dateRangeData', JSON.stringify(rangeData));
                setRangoFechasSeleccionado(true);
                setShowDateRangeModal(false);
            }
        } catch (error: any) {
            setError(`Error procesando el rango de fechas: ${error.message}`);
        }
    };

    //MANEJAR SELECCIÓN DE VARIABLES
    const toggleVariableSelection = (id: number) => {
        setSelectedVariables(prev => {
            if (prev.includes(id)) {
                return prev.filter(varId => varId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    if (!dataSourceConfig) {
        return (
            <div className="bg-background min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-orange-400" />
                </div>
            </div>
        );
    }

    const protocol = dataSourceConfig.protocol || 'mqtt';

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex flex-col items-center justify-center px-4">
                {/* Pasos de navegación */}
                <div className="tutorial-steps flex flex-wrap space-x-2 md:space-x-4 mb-6 overflow-x-auto pb-2">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`flex items-center mb-2 ${step.active ? 'text-orange-400' : 'text-gray-500'}`}
                        >
                            {step.active ? (
                                <CheckCircle className="w-5 h-5 mr-2" />
                            ) : (
                                <span className="w-5 h-5 mr-2 flex items-center justify-center rounded-full border border-current">
                                    {step.id}
                                </span>
                            )}
                            <span className="whitespace-nowrap">{step.title}</span>
                        </div>
                    ))}
                    {/* BOTÓN PARA MOSTRAR TUTORIAL */}
                    <button
                        onClick={handleStartTutorial}
                        className="flex items-center text-orange-400 hover:text-orange-300 transition-colors ml-auto"
                        title="Ver tutorial"
                    >
                        <HelpCircle className="w-5 h-5 mr-1" />
                        <span className="text-sm">Tutorial</span>
                    </button>
                </div>

                <div className="w-full max-w-4xl bg-secundary rounded-2xl shadow-md overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="mb-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <button
                                            className="tutorial-back-button px-3 py-2 bg-background-transparent hover:bg-background text-white rounded-lg flex items-center transition-colors"
                                            onClick={handleGoBack}
                                            title="Volver a Fuentes de Datos"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <h1 className="text-2xl md:text-xl font-bold text-white">
                                            Paso 2: Configuración de Variables
                                        </h1>
                                    </div>
                                    <p className="text-gray-300 text-sm mt-1 ml-14">
                                        Variables detectadas desde {protocol.toUpperCase()}
                                        {lastFetchTime && (
                                            <span className="text-gray-400 ml-2">
                                                (última actualización: {lastFetchTime.toLocaleTimeString()})
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/*  BOTÓN PARA REFRESCAR VARIABLES */}
                                    <button
                                        className="tutorial-refresh-button flex items-center px-3 py-2 bg-orange-400 hover:bg-orange-500 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                                        onClick={handleDetectarVariables}
                                        disabled={isLoading}
                                    >
                                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                        {isLoading ? 'Detectando...' : 'Refrescar'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* MOSTRAR ESTADO DE CARGA O ERROR */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mr-3" />
                                <span className="text-gray-300">Detectando variables disponibles...</span>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <X className="w-5 h-5 text-red-400 mr-2" />
                                    <span className="text-red-400 font-medium">Error al detectar variables</span>
                                </div>
                                <p className="text-red-300 text-sm mt-1">{error}</p>
                                <button
                                    onClick={handleDetectarVariables}
                                    className="text-red-400 hover:text-red-300 text-sm underline mt-2"
                                >
                                    Intentar nuevamente
                                </button>
                            </div>
                        )}

                        {/* MOSTRAR VARIABLES SOLO SI NO HAY ERROR Y NO ESTÁ CARGANDO */}
                        {!isLoading && !error && (
                            <>
                                {variables.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400">No se detectaron variables en la fuente de datos</p>
                                        <button
                                            onClick={handleDetectarVariables}
                                            className="text-orange-400 hover:text-orange-300 text-sm underline mt-2"
                                        >
                                            Volver a intentar
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Grid de variables seleccionables */}
                                        <div className="tutorial-variables-grid grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                                            {variables.map(variable => (
                                                <div
                                                    key={variable.id}
                                                    className={`relative rounded-lg cursor-pointer border-2 flex flex-col items-center justify-center h-10 transition-all
                                                        ${selectedVariables.includes(variable.id)
                                                            ? ' border-background bg-background-transparent hover:background-transparent'
                                                            : 'border-background bg-secundary hover:bg-background'}`}
                                                    onClick={() => toggleVariableSelection(variable.id)}
                                                >
                                                    {selectedVariables.includes(variable.id) && (
                                                        <div className="absolute top-1 right-1">
                                                            <Check className="w-3 h-3 text-orange-400" />
                                                        </div>
                                                    )}

                                                    <h3 className="text-white text-center text-xs font-medium truncate max-w-full px-1">
                                                        {variable.name}
                                                    </h3>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Lista de variables seleccionadas */}
                                        <div className="tutorial-selected-list bg-background rounded-lg p-3 mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-white font-medium">Variables Seleccionadas</h3>
                                                <span className="tutorial-variable-count text-xs text-gray-400">
                                                    {selectedVariables.length} de {variables.length} variables
                                                </span>
                                            </div>

                                            {selectedVariables.length === 0 ? (
                                                <p className="text-sm text-gray-400 italic">No se ha seleccionado ninguna variable</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedVariables.map(id => {
                                                        const variable = variables.find(v => v.id === id);
                                                        if (!variable) return null;

                                                        return (
                                                            <div
                                                                key={id}
                                                                className="flex items-center bg-gray-700 rounded-full pl-2 pr-1 py-1"
                                                            >
                                                                <span className="text-xs text-white mr-1">{variable.name}</span>
                                                                <button
                                                                    className="text-gray-400 hover:text-white rounded-full"
                                                                    onClick={() => toggleVariableSelection(id)}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* Botón de acción */}
                        <div className="flex justify-between items-center mt-6">
                            <span className="text-sm text-gray-300">
                                {selectedVariables.length > 0
                                    ? `Variables seleccionadas: ${selectedVariables.length}`
                                    : 'Seleccione al menos una variable para continuar'}
                            </span>
                            <button
                                //   COMBINAR LOS DOS className EN UNO SOLO
                                className={`tutorial-next-button px-4 py-2 rounded-lg flex items-center ${selectedVariables.length === 0 || (dataSourceConfig.protocol === 'file' && !rangoFechasSeleccionado)
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-orange-400 text-white hover:bg-orange-500'
                                    } transition-colors`}
                                onClick={() => { handleTimeModalOpen(); }}
                                disabled={
                                    selectedVariables.length === 0 ||
                                    (dataSourceConfig.protocol === 'file' && !rangoFechasSeleccionado)
                                }
                            >
                                Siguiente Paso
                                <ArrowRight className="ml-2" />
                            </button>
                        </div>

                        {/* Mensaje de advertencia */}
                        {dataSourceConfig.protocol === 'file' && !rangoFechasSeleccionado && (
                            <span className="text-xs text-red-400 block mt-2">
                                Debes seleccionar el rango de fechas antes de continuar.
                            </span>
                        )}
                    </div>
                </div>

                <ModalProtocolos
                    isOpen={showTimeModal}
                    onClose={() => setShowTimeModal(false)}
                    intervaloMinutos={intervaloMinutos}
                    onIntervaloChange={setIntervaloMinutos}
                    onConfirm={handleTimeModalClose}
                />
                {showDateRangeModal && excelFile && dataSourceConfig && (
                    <SeleccionarRangoFecha
                        isOpen={showDateRangeModal}
                        onClose={() => setShowDateRangeModal(false)}
                        file={excelFile}
                        config={dataSourceConfig.config}
                        onDateRangeSelected={handleDateRangeSelected}
                    />
                )}
            </div>
        </div>
    );
}