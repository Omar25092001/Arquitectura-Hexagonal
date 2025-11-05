import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react'; //   1. Importar useState y useEffect

interface ModalProtocolosProps {
    isOpen: boolean;
    onClose: () => void;
    intervaloMinutos: number;
    onIntervaloChange: (minutos: number) => void;
    onConfirm: () => void;
}

export default function ModalProtocolos({
    isOpen,
    onClose,
    intervaloMinutos,
    onIntervaloChange,
    onConfirm
}: ModalProtocolosProps) {
    const navigate = useNavigate();
    const MIN_SEGUNDOS = 10;
    const MAX_SEGUNDOS = 3600; // 1 hora

    const [segundos, setSegundos] = useState(() => {
        const valInicial = intervaloMinutos * 60;
        return valInicial < MIN_SEGUNDOS ? MIN_SEGUNDOS : valInicial;
    });


    // Esto permite que el campo esté vacío (ej. '')
    const [valorInput, setValorInput] = useState(String(segundos));

    // Sincroniza el input si el modal se reabre con valores diferentes
    useEffect(() => {
        if (isOpen) {
            const valInicial = intervaloMinutos * 60;
            const segundosValidos = valInicial < MIN_SEGUNDOS ? MIN_SEGUNDOS : valInicial;
            setSegundos(segundosValidos);
            setValorInput(String(segundosValidos));
        }
    }, [isOpen, intervaloMinutos]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValorInput(e.target.value);
    };

    const handleBlur = () => {
        let numSegundos = parseInt(valorInput);

        if (isNaN(numSegundos) || numSegundos < MIN_SEGUNDOS) {
            numSegundos = MIN_SEGUNDOS;
        }
        if (numSegundos > MAX_SEGUNDOS) {
            numSegundos = MAX_SEGUNDOS;
        }

        // Sincroniza todos los estados con el valor validado
        setValorInput(String(numSegundos));
        setSegundos(numSegundos);
        onIntervaloChange(numSegundos / 60); // Envía minutos al padre
    };

    const handleConfirmClick = () => {
        // Llama a onBlur una última vez para asegurar la validación
        handleBlur();

        // Guarda el valor en minutos (usando el estado numérico 'segundos')
        localStorage.setItem('intervaloMinutos', String(segundos / 60));
        onConfirm();
    };

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50 p-4">
            <div className="bg-secundary rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                        Ajustar tiempo de Solicitud de Datos
                    </h2>
                    <p className="text-gray-300 text-sm mb-6">
                        Para continuar, necesitas seleccionar la recurrencia en que los datos se solicitarán de la fuente de datos.
                    </p>

                    <div className="space-y-4">
                        <label className="block text-gray-300 mb-1">
                            Intervalo de solicitud (segundos):
                        </label>
                        <input
                            type="number"
                            min={MIN_SEGUNDOS}
                            max={MAX_SEGUNDOS}
                            value={valorInput}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="w-full px-3 py-2 rounded-lg bg-background text-white mb-2"
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => {
                                onClose();
                                navigate('/usuario/fuente-datos');
                            }}
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Volver
                        </button>

                        <button
                            onClick={handleConfirmClick}
                            disabled={Number(valorInput) < MIN_SEGUNDOS}
                            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${Number(valorInput) < MIN_SEGUNDOS
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-orange-400 text-white hover:bg-orange-500'
                                }`}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}