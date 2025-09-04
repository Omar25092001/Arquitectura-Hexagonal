import { useState } from 'react';
import Header from '../components/Header';
import { CheckCircle, ArrowRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Algoritmo() {
    const navigate = useNavigate();
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
    const [algorithmDropdownOpen, setAlgorithmDropdownOpen] = useState(false);
    const [simulationType, setSimulationType] = useState('');

    const algorithmOptions = [
        { id: 'algoritmo1', name: 'Algoritmo 1' },
        { id: 'algoritmo2', name: 'Algoritmo 2' },
        { id: 'algoritmo3', name: 'Algoritmo 3' },
        { id: 'algoritmo4', name: 'Algoritmo 4' },
    ];

    const steps = [
        { id: 1, title: 'Fuentes de Datos', active: true },
        { id: 2, title: 'Variables', active: true },
        { id: 3, title: 'Algoritmo', active: true },
        { id: 4, title: 'Ejecución', active: false }
    ];

    const handleAlgorithmChange = (algorithmId: string) => {
        setSelectedAlgorithm(algorithmId);
        setAlgorithmDropdownOpen(false);
    };

    const handleSimulationTypeChange = (type: string) => {
        setSimulationType(type);
    };

    const handleSiguientePaso = () => {
        if (selectedAlgorithm && simulationType) {
            const algorithmConfig = {
                algorithm: selectedAlgorithm,
                simulationType: simulationType
            };
            localStorage.setItem('algorithmConfig', JSON.stringify(algorithmConfig));
            navigate('/usuario/ejecucion');
        }
    };

    const hasConfiguration = selectedAlgorithm && simulationType;

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex flex-col items-center justify-center px-4">
                {/* Indicador de pasos */}
                <div className="flex flex-wrap space-x-2 md:space-x-4 mb-6 overflow-x-auto pb-2">
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
                </div>

                <div className="w-full max-w-4xl bg-secundary rounded-2xl shadow-md overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl md:text-xl font-bold text-white mb-6">Paso 3: Configuración del Algoritmo</h1>
                            
                            {/* Dropdown de Algoritmos */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-white mb-1">
                                    Seleccionar Algoritmo
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setAlgorithmDropdownOpen(!algorithmDropdownOpen)}
                                        className="w-full flex items-center justify-between px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    >
                                        <span>
                                            {selectedAlgorithm 
                                                ? algorithmOptions.find(a => a.id === selectedAlgorithm)?.name 
                                                : 'Selecciona un algoritmo'
                                            }
                                        </span>
                                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${algorithmDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {algorithmDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-background border border-background rounded-lg shadow-lg">
                                            {algorithmOptions.map((algorithm) => (
                                                <div
                                                    key={algorithm.id}
                                                    onClick={() => handleAlgorithmChange(algorithm.id)}
                                                    className="px-3 py-2 hover:bg-secundary cursor-pointer text-gray-300"
                                                >
                                                    {algorithm.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tipo de Simulación */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-white mb-4">Tipo de Simulación</h2>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Simulación Estado Actual */}
                                    <div 
                                        onClick={() => handleSimulationTypeChange('actual')}
                                        className="flex items-center cursor-pointer"
                                    >
                                        <div className="relative">
                                            <input
                                                type="radio"
                                                name="simulationType"
                                                value="actual"
                                                checked={simulationType === 'actual'}
                                                onChange={() => handleSimulationTypeChange('actual')}
                                                className="sr-only"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                simulationType === 'actual' 
                                                    ? 'border-orange-400 bg-orange-400' 
                                                    : 'border-gray-400'
                                            }`}>
                                                {simulationType === 'actual' && (
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="ml-3 text-white">Simulación de estado actual (Datos en tiempo real)</span>
                                    </div>

                                    {/* Simulación Predicción Futura */}
                                    <div 
                                        onClick={() => handleSimulationTypeChange('futura')}
                                        className="flex items-center cursor-pointer"
                                    >
                                        <div className="relative">
                                            <input
                                                type="radio"
                                                name="simulationType"
                                                value="futura"
                                                checked={simulationType === 'futura'}
                                                onChange={() => handleSimulationTypeChange('futura')}
                                                className="sr-only"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                simulationType === 'futura' 
                                                    ? 'border-orange-400 bg-orange-400' 
                                                    : 'border-gray-400'
                                            }`}>
                                                {simulationType === 'futura' && (
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="ml-3 text-white">Simulación predicción futura (Escenario Proyectado)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tipo de Salida Esperada - Solo aparece si se selecciona un tipo de simulación */}
                            {simulationType && (
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-white mb-4">Tipo de Salida Esperada</h2>
                                    
                                    <div className="bg-label border border-background rounded-lg p-4">
                                        {simulationType === 'actual' ? (
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 bg-orange-400 rounded-full mr-3"></div>
                                                <span className="text-white">📊 Gráficos de tendencias + 📋 Tabla de recomendaciones</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 bg-orange-400 rounded-full mr-3"></div>
                                                <span className="text-white">🔮 Proyecciones futuras + 📈 Análisis predictivo</span>
                                            </div>
                                        )}
                                        
                                        <div className="mt-3 text-sm text-gray-400">
                                            {simulationType === 'actual' ? (
                                                'El algoritmo generará visualizaciones del estado actual de las variables y recomendaciones para optimizar el sistema.'
                                            ) : (
                                                'El algoritmo generará predicciones futuras basadas en los patrones históricos y análisis de tendencias proyectadas.'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botón de acción */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleSiguientePaso}
                                disabled={!hasConfiguration}
                                className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                                    hasConfiguration
                                        ? 'bg-orange-400 text-white hover:bg-orange-500'
                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Siguiente Paso
                                <ArrowRight className="ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}