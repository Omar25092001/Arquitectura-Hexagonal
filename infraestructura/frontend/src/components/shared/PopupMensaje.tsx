import { useEffect } from 'react';

interface PopupMensajeProps {
    mensaje: string;
    tipo: 'error' | 'exito';
    onClose: () => void;
    duracion?: number; // duración en ms (opcional, por defecto 3000)
}

export default function PopupMensaje({ mensaje, tipo, onClose, duracion = 3000 }: PopupMensajeProps) {
    useEffect(() => {
        if (!mensaje) return;
        const timer = setTimeout(onClose, duracion);
        return () => clearTimeout(timer);
    }, [mensaje, onClose, duracion]);

    if (!mensaje) return null;

    const bgColor = tipo === 'error' ? 'bg-red-500 text-white' : 'bg-green-700 text-white';
    const btnColor = tipo === 'error' ? 'text-red-500' : 'text-green-700';

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-end justify-end">
            <div className={`rounded-lg shadow-lg px-6 py-3 w-96 flex flex-row items-center ${bgColor}`}>
                <div className="flex flex-col flex-1">
                    <span className="text-base font-bold mb-1">
                        {tipo === 'error' ? 'Error' : 'Éxito'}
                    </span>
                    <span className="text-sm">{mensaje}</span>
                </div>
                <button
                    onClick={onClose}
                    className={`ml-4 px-3 py-1 bg-white rounded font-semibold hover:bg-gray-100 transition-colors ${btnColor} text-sm`}
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}