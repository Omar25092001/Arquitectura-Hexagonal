import { useState } from 'react';
import ModalMonitorizacion from './ModalMonitorizacionVariables';

interface MonitorizacionVariablesProps {
    variablesRecibidas: { name: string }[];
    onAsignar: (
        asignaciones: Record<string, string>,
        rangos: Record<string, {
            criticoMin: string;
            optimoMin: string;
            optimoMax: string;
            bajoMax: string;
        }>
    ) => void;
    datosActuales?: Record<string, number>;
}

const variablesEstandar = [
    { key: 'temperatura', label: 'Temperatura del aire' },
    { key: 'humedad', label: 'Humedad relativa del aire' },
    { key: 'radiacion', label: 'Radiación solar / Luminosidad' },
    { key: 'co2', label: 'Concentración de CO₂ (opcional)' },
    { key: 'viento', label: 'Velocidad y dirección del viento' },
];

export default function MonitorizacionVariables({
    variablesRecibidas,
    onAsignar,
    datosActuales = {}
}: MonitorizacionVariablesProps) {
    const [asignaciones, setAsignaciones] = useState<Record<string, string>>({});
    const [showMonitorizacion, setShowMonitorizacion] = useState(false);
    const [rangos, setRangos] = useState<Record<
        string,
        {
            criticoMin: string;
            optimoMin: string;
            optimoMax: string;
            bajoMax: string;
            criticoMax: string;
        }
    >>({});

    const handleChange = (key: string, value: string) => {
        setAsignaciones(prev => ({ ...prev, [key]: value }));
    };

    const handleConfirmar = () => {
        onAsignar(asignaciones, rangos);
        setShowMonitorizacion(true);
    };

    // Si ya se confirmaron las asignaciones, mostrar monitorización
    if (showMonitorizacion) {
        return (
            <ModalMonitorizacion
                isOpen={true}
                onClose={() => setShowMonitorizacion(false)}
                asignaciones={asignaciones}
                rangos={rangos}
                datosActuales={datosActuales}
                showAsModal={false} // Renderizar como componente, no como modal
            />
        );
    }

    // Vista de asignación de variables
    return (
        <div className="bg-secundary rounded-2xl shadow-md p-6 max-w-2xl mx-auto">
            <div className="max-w-4xl mx-auto">
                <p className="text-gray-300 mb-6 text-sm sm:text-base">
                    Asocia cada variable estándar con la variable que recibes de tus sensores.
                </p>

                {/* Grid responsive para las asignaciones */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {variablesEstandar.map(variable => (
                        <div key={variable.key} className="space-y-2">
                            {/* Label responsive */}
                            <label className="block text-white font-medium text-sm sm:text-base">
                                {variable.label}
                            </label>

                            {/* Select responsive */}
                            <select
                                value={asignaciones[variable.key] || ''}
                                onChange={e => handleChange(variable.key, e.target.value)}
                                className="monitor-select-variable w-full px-3 py-2 sm:py-3 rounded-lg bg-background text-white text-sm sm:text-base border border-gray-600 hover:border-gray-500 focus:border-orange-400 focus:outline-none transition-colors"
                            >
                                <option value="">Selecciona variable...</option>
                                {variablesRecibidas.map(v => (
                                    <option key={v.name} value={v.name}>{v.name}</option>
                                ))}
                            </select>
                            <div className="text-gray-400 text-xs">
                                <span className="font-medium">Especifica el valor optimo de la variable según tu caso</span>
                            </div>
                            <div className="monitor-rangos  flex flex-col gap-1 mt-2">
                                <div className="flex gap-2 items-center">
                                    <span className="text-xs text-red-400 w-14">Crítico</span>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={rangos[variable.key]?.criticoMin || ''}
                                        onChange={e =>
                                            setRangos(prev => ({
                                                ...prev,
                                                [variable.key]: { ...prev[variable.key], criticoMin: e.target.value }
                                            }))
                                        }
                                        className="w-16 px-2 py-1 rounded bg-background text-white border border-gray-600 text-xs"
                                    />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className="text-xs text-yellow-400 w-14">Bajo</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={rangos[variable.key]?.bajoMax || ''}
                                        onChange={e =>
                                            setRangos(prev => ({
                                                ...prev,
                                                [variable.key]: { ...prev[variable.key], bajoMax: e.target.value }
                                            }))
                                        }
                                        className="w-16 px-2 py-1 rounded bg-background text-white border border-gray-600 text-xs"
                                    />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className="text-xs text-green-400 w-14">Óptimo</span>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={rangos[variable.key]?.optimoMin || ''}
                                        onChange={e =>
                                            setRangos(prev => ({
                                                ...prev,
                                                [variable.key]: { ...prev[variable.key], optimoMin: e.target.value }
                                            }))
                                        }
                                        className="w-16 px-2 py-1 rounded bg-background text-white border border-gray-600 text-xs"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={rangos[variable.key]?.optimoMax || ''}
                                        onChange={e =>
                                            setRangos(prev => ({
                                                ...prev,
                                                [variable.key]: { ...prev[variable.key], optimoMax: e.target.value }
                                            }))
                                        }
                                        className="w-16 px-2 py-1 rounded bg-background text-white border border-gray-600 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                    ))}
                </div>


                {/* Botón responsive */}
                <div className="monitor-confirm mt-8 flex justify-center">
                    <button
                        onClick={handleConfirmar}
                        disabled={Object.keys(asignaciones).length === 0}
                        className="w-full sm:w-auto px-6 py-3 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors font-medium disabled:bg-gray-600 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        Confirmar asignaciones
                    </button>
                </div>


            </div>
        </div>
    );
}