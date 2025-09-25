import { useNavigate } from 'react-router-dom';

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

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onIntervaloChange(val === '' ? 0 : Number(val));
    };

    const handleConfirmClick = () => {
        const minutos = intervaloMinutos.toString();
        console.log("tiempo", minutos);
        localStorage.setItem('intervaloMinutos', intervaloMinutos.toString());
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
                            Intervalo de solicitud (minutos):
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={60}
                            value={intervaloMinutos}
                            onChange={handleInputChange}
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
                            disabled={intervaloMinutos <= 0}
                            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                intervaloMinutos <= 0
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