import { useState } from 'react';
import ModalMonitorizacion from './ModalMonitorizacionVariables';

interface MonitorizacionVariablesProps {
    variablesRecibidas: { name: string }[];
    onAsignar: (asignaciones: Record<string, string>) => void;
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

    const handleChange = (key: string, value: string) => {
        setAsignaciones(prev => ({ ...prev, [key]: value }));
    };

    const handleConfirmar = () => {
        onAsignar(asignaciones);
        setShowMonitorizacion(true);
    };

    // Si ya se confirmaron las asignaciones, mostrar monitorización
    if (showMonitorizacion) {
        return (
            <ModalMonitorizacion
                isOpen={true}
                onClose={() => setShowMonitorizacion(false)}
                asignaciones={asignaciones}
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
                                className="w-full px-3 py-2 sm:py-3 rounded-lg bg-background text-white text-sm sm:text-base border border-gray-600 hover:border-gray-500 focus:border-orange-400 focus:outline-none transition-colors"
                            >
                                <option value="">Selecciona variable...</option>
                                {variablesRecibidas.map(v => (
                                    <option key={v.name} value={v.name}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>


                {/* Botón responsive */}
                <div className="mt-8 flex justify-center">
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