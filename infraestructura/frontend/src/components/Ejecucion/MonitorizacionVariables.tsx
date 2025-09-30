import React, { useState } from 'react';

interface MonitorizacionVariablesProps {
    variablesRecibidas: { name: string }[];
    onAsignar: (asignaciones: Record<string, string>) => void;
}

const variablesEstandar = [
    { key: 'temperatura', label: 'Temperatura del aire' },
    { key: 'humedad', label: 'Humedad relativa del aire' },
    { key: 'radiacion', label: 'Radiación solar / Luminosidad' },
    { key: 'co2', label: 'Concentración de CO₂ (opcional)' },
    { key: 'viento', label: 'Velocidad y dirección del viento' },
];

export default function MonitorizacionVariables({ variablesRecibidas, onAsignar }: MonitorizacionVariablesProps) {
    const [asignaciones, setAsignaciones] = useState<Record<string, string>>({});

    const handleChange = (key: string, value: string) => {
        setAsignaciones(prev => ({ ...prev, [key]: value }));
    };

    const handleConfirmar = () => {
        onAsignar(asignaciones);
    };

    return (
        <div className="bg-secundary rounded-2xl shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-4">Monitorización de Variables</h2>
            <p className="text-gray-300 mb-6">
                Asocia cada variable estándar con la variable que recibes de tus sensores.
            </p>
            <div className="space-y-4">
                {variablesEstandar.map(variable => (
                    <div key={variable.key} className="flex items-center gap-4">
                        <label className="text-white font-medium w-56">{variable.label}</label>
                        <select
                            value={asignaciones[variable.key] || ''}
                            onChange={e => handleChange(variable.key, e.target.value)}
                            className="px-3 py-2 rounded-lg bg-background text-white w-64"
                        >
                            <option value="">Selecciona variable...</option>
                            {variablesRecibidas.map(v => (
                                <option key={v.name} value={v.name}>{v.name}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
            <button
                onClick={handleConfirmar}
                className="mt-8 px-6 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors font-medium"
            >
                Confirmar asignaciones
            </button>
        </div>
    );
}