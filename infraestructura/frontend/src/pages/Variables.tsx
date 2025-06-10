import { useState } from 'react';
import Header from '../components/Header';
import { CheckCircle, ArrowRight, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export default function Variables() {
    const steps = [
        { id: 1, title: 'Fuentes de Datos', active: true },
        { id: 2, title: 'Variables', active: true },
        { id: 3, title: 'Algoritmo', active: false },
        { id: 4, title: 'Ejecución', active: false }
    ];

    // Lista de ejemplo de variables
    const [variables, setVariables] = useState([
        {
            id: 1,
            name: 'Temperatura',
            unit: '°C',
            dataType: 'Numérico',
            min: 0,
            max: 100,
            current: 24.5,
            color: 'bg-blue-500'
        },
        {
            id: 2,
            name: 'Humedad',
            unit: '%',
            dataType: 'Numérico',
            min: 0,
            max: 100,
            current: 65,
            color: 'bg-green-500'
        },
        {
            id: 3,
            name: 'Presión',
            unit: 'hPa',
            dataType: 'Numérico',
            min: 900,
            max: 1100,
            current: 1013,
            color: 'bg-purple-500'
        },
        {
            id: 4,
            name: 'Velocidad del Viento',
            unit: 'km/h',
            dataType: 'Numérico',
            min: 0,
            max: 200,
            current: 15.7,
            color: 'bg-yellow-500'
        },
        {
            id: 5,
            name: 'Estado',
            unit: '',
            dataType: 'Categórico',
            options: ['Activo', 'Inactivo', 'Mantenimiento', 'Error'],
            current: 'Activo',
            color: 'bg-red-500'
        },
        {
            id: 6,
            name: 'Nivel de Batería',
            unit: '%',
            dataType: 'Numérico',
            min: 0,
            max: 100,
            current: 78,
            color: 'bg-indigo-500'
        },
        {
            id: 7,
            name: 'Calidad del Aire',
            unit: 'AQI',
            dataType: 'Numérico',
            min: 0,
            max: 500,
            current: 42,
            color: 'bg-teal-500'
        }
    ]);

    // Estado para la variable seleccionada actualmente para detalles
    const [selectedVariable, setSelectedVariable] = useState<number | null>(null);

    // Estado para las variables seleccionadas para el algoritmo
    const [selectedVariables, setSelectedVariables] = useState<number[]>([]);



    // Manejar la selección/deselección de variables
    const toggleVariableSelection = (id: number) => {
        setSelectedVariables(prev => {
            // Si ya está seleccionada, la removemos
            if (prev.includes(id)) {
                return prev.filter(varId => varId !== id);
            }
            // Si no está seleccionada, la añadimos
            else {
                return [...prev, id];
            }
        });
    };

    // Obtener los detalles de una variable
    const getVariableDetails = (id: number) => {
        setSelectedVariable(id === selectedVariable ? null : id);
    };




    return (
        <div className="bg-background min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex flex-col items-center justify-center px-4">
                {/* Pasos de navegación */}
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
                            <h1 className="text-2xl md:text-xl font-bold text-white">Paso 2: Configuración de Variables</h1>
                            <p className="text-gray-300 text-sm mt-1">Seleccione las variables que desea utilizar en el algoritmo</p>
                        </div>



                        {/* Grid de variables seleccionables */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                            {variables.map(variable => (
                                <div
                                    key={variable.id}
                                    className={`relative rounded-lg p-1 cursor-pointer border flex flex-col items-center justify-center h-20 transition-all
            ${selectedVariables.includes(variable.id)
                                            ? 'border-2 border-background bg-background-transparent hover:bg-background-transparent'
                                            : 'border-background bg-secundary hover:bg-background-transparent'}`}
                                    onClick={() => toggleVariableSelection(variable.id)}
                                >
                                    {/* Indicador de selección */}
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
                        <div className="bg-background-transparent rounded-lg p-3 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-white font-medium">Variables Seleccionadas</h3>
                                <span className="text-xs text-gray-400">
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
                                                className="flex items-center bg-background rounded-full pl-2 pr-1 py-1"
                                            >
                                                <span className="text-xs text-white mr-1">{variable.name}</span>
                                                <button
                                                    className="text-gray-400 hover:text-white  rounded-full"
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



                        {/* Botón de acción */}
                        <div className="flex justify-between items-center mt-6">
                            <span className="text-sm text-gray-300">
                                {selectedVariables.length > 0
                                    ? `Variables seleccionadas: ${selectedVariables.length}`
                                    : 'Seleccione al menos una variable para continuar'}
                            </span>
                            <button
                                disabled={selectedVariables.length === 0}
                                className={`px-4 py-2 rounded-lg flex items-center
                                ${selectedVariables.length === 0
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-orange-400 text-white hover:bg-orange-500'} transition-colors`}
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