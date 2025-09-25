import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModalArchivoExcelProps {
    isOpen: boolean;
    onClose: () => void;
    selectedFile: File | null;
    error: string | null;
    onFileSelection: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ModalArchivoExcel({
    isOpen,
    onClose,
    selectedFile,
    error,
    onFileSelection
}: ModalArchivoExcelProps) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50 p-4">
            <div className="bg-secundary rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Seleccionar archivo Excel</h2>
                    <p className="text-gray-300 text-sm mb-6">
                        Para continuar, necesitas seleccionar el archivo Excel que configuraste anteriormente.
                    </p>

                    <div className="space-y-4">
                        <label className="block">
                            <div className="w-full bg-orange-400 text-white px-4 py-3 rounded-lg flex items-center justify-center cursor-pointer hover:bg-orange-500 transition-colors">
                                Seleccionar archivo Excel
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept=".xlsx,.xls"
                                onChange={onFileSelection}
                            />
                        </label>

                        {selectedFile && (
                            <div className="p-3 bg-background rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                                        <p className="text-gray-400 text-xs">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <Check className="w-5 h-5 text-green-400" />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg">
                                <p className="text-red-300 text-sm">{error}</p>
                            </div>
                        )}
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

                        {selectedFile && (
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors"
                            >
                                Continuar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}