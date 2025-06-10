import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, FileSpreadsheet, Upload, File } from 'lucide-react';

const ConfigExcel = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [excelConfig, setExcelConfig] = useState({
        sheetName: '',
        sheetIndex: '0',
        useSheetName: true,
        fileName: '',
        enableAutoExport: false,
        exportInterval: '3600'
    });

    const [connectionState, setConnectionState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [connectionMessage, setConnectionMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setExcelConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setExcelConfig(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setExcelConfig(prev => ({
                ...prev,
                fileName: file.name
            }));
            // Reset connection state when file changes
            setConnectionState('idle');
            setConnectionMessage('');
        }
    };

    const handleRadioChange = (useSheetName: boolean) => {
        setExcelConfig(prev => ({
            ...prev,
            useSheetName
        }));
    };

    const testConnection = () => {
        setConnectionState('testing');
        setConnectionMessage('Verificando archivo Excel...');
        
        // Simulación de tiempo de respuesta
        setTimeout(() => {
            // Validación básica
            if (!selectedFile) {
                setConnectionState('error');
                setConnectionMessage('Error: Debe seleccionar un archivo Excel (.xlsx o .xls)');
                return;
            }

            const isExcelFile = /\.xlsx?$/.test(selectedFile.name);
            if (!isExcelFile) {
                setConnectionState('error');
                setConnectionMessage('Error: El archivo seleccionado no es un archivo Excel válido (.xlsx o .xls)');
                return;
            }

            if (excelConfig.useSheetName && !excelConfig.sheetName.trim()) {
                setConnectionState('error');
                setConnectionMessage('Error: Debe especificar un nombre de hoja');
                return;
            }

            if (!excelConfig.useSheetName && (isNaN(parseInt(excelConfig.sheetIndex)) || parseInt(excelConfig.sheetIndex) < 0)) {
                setConnectionState('error');
                setConnectionMessage('Error: El índice de la hoja debe ser un número entero no negativo');
                return;
            }

            // Si pasa todas las validaciones
            setConnectionState('success');
            const sheetInfo = excelConfig.useSheetName 
                ? `hoja "${excelConfig.sheetName}"` 
                : `hoja con índice ${excelConfig.sheetIndex}`;
            setConnectionMessage(`Archivo Excel válido. Se leerán datos de la ${sheetInfo} del archivo ${selectedFile.name}`);
        }, 1200);
    };

    return (
        <div className="space-y-4">
            {/* Selector de archivo */}
            <div className="border-2 border-dashed border-background rounded-lg p-6 flex flex-col items-center">
                <FileSpreadsheet className="w-12 h-12 text-orange-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Selecciona un archivo Excel</h3>
                <p className="text-sm text-gray-400 mb-4 text-center">
                    Formatos compatibles: Excel (.xlsx, .xls)
                </p>
                
                <label className="bg-orange-400 text-white px-4 py-2 rounded-lg flex items-center cursor-pointer hover:bg-orange-500 transition-colors">
                    <Upload className="w-5 h-5 mr-2" />
                    Seleccionar archivo
                    <input
                        type="file"
                        className="hidden"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                    />
                </label>

                {selectedFile && (
                    <div className="mt-4 p-3 bg-background-transparent rounded-lg w-full flex items-center">
                        <File className="w-5 h-5 mr-2 text-gray-300" />
                        <span className="text-sm text-gray-300 truncate">{selectedFile.name}</span>
                        <span className="text-xs text-gray-400 ml-2">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                )}
            </div>

            {/* Configuración de la hoja */}
            {selectedFile && (
                <div className="bg-background-transparent p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-3">Configuración de la hoja</h3>
                    
                    <div className="space-y-3">
                        <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-orange-400 border-gray-600 focus:ring-orange-400"
                                    name="sheetSelector"
                                    checked={excelConfig.useSheetName}
                                    onChange={() => handleRadioChange(true)}
                                />
                                <span className="ml-2 text-sm text-white">Por nombre</span>
                            </label>
                            
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-orange-400 border-gray-600 focus:ring-orange-400"
                                    name="sheetSelector"
                                    checked={!excelConfig.useSheetName}
                                    onChange={() => handleRadioChange(false)}
                                />
                                <span className="ml-2 text-sm text-white">Por índice</span>
                            </label>
                        </div>
                        
                        {excelConfig.useSheetName ? (
                            <div>
                                <label htmlFor="sheetName" className="block text-sm font-medium text-white mb-1">
                                    Nombre de la hoja
                                </label>
                                <input
                                    id="sheetName"
                                    name="sheetName"
                                    type="text"
                                    placeholder="Hoja1"
                                    value={excelConfig.sheetName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Escriba el nombre exacto de la hoja de Excel (sensible a mayúsculas/minúsculas)
                                </p>
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="sheetIndex" className="block text-sm font-medium text-white mb-1">
                                    Índice de la hoja
                                </label>
                                <input
                                    id="sheetIndex"
                                    name="sheetIndex"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={excelConfig.sheetIndex}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-label border border-background rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    El índice comienza en 0 (primera hoja = 0, segunda hoja = 1, etc.)
                                </p>
                            </div>
                        )}
                    </div>
                    

                </div>
            )}
            
            {/* Botón y estado de validación */}
            <div className="mt-6 mb-2 flex flex-wrap items-start gap-3">
                <button
                    onClick={testConnection}
                    disabled={connectionState === 'testing' || !selectedFile}
                    className={`px-4 py-2 rounded-lg text-white font-medium flex items-center 
                    ${connectionState === 'testing' 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : !selectedFile 
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-orange-400 hover:bg-orange-500'}`}
                >
                    {connectionState === 'testing' && (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    )}
                    {connectionState !== 'testing' && (
                        <FileSpreadsheet className="w-5 h-5 mr-2" />
                    )}
                    Verificar archivo Excel
                </button>
                
                <div className="flex mt-2 items-center space-x-3">
                    {connectionState === 'success' && (
                        <div className="flex items-center">
                            <div className="h-4 w-4 rounded-full bg-green-500 shadow-lg"></div>
                            <span className="ml-2 text-sm font-medium text-green-400">Archivo válido</span>
                        </div>
                    )}
                    
                    {connectionState === 'error' && (
                        <div className="flex items-center">
                            <div className="h-4 w-4 rounded-full bg-red-500 shadow-lg"></div>
                            <span className="ml-2 text-sm font-medium text-red-400">Archivo inválido</span>
                        </div>
                    )}
                </div>

                {/* Panel con detalles del estado */}
                {connectionState !== 'idle' && (
                    <div className={`flex-grow p-3 rounded-lg flex items-start
                        ${connectionState === 'testing' ? 'bg-gray-700 bg-opacity-70' : ''}
                        ${connectionState === 'success' ? 'bg-green-900 bg-opacity-20' : ''}
                        ${connectionState === 'error' ? 'bg-red-900 bg-opacity-20' : ''}`}
                    >
                        {connectionState === 'testing' && <Loader2 className="w-5 h-5 mr-2 animate-spin text-gray-300" />}
                        {connectionState === 'success' && <CheckCircle className="w-5 h-5 mr-2 text-green-400" />}
                        {connectionState === 'error' && <XCircle className="w-5 h-5 mr-2 text-red-400" />}
                        <span className={`text-sm ${
                            connectionState === 'success' ? 'text-green-400' : 
                            connectionState === 'error' ? 'text-red-400' : 'text-gray-300'
                        }`}>
                            {connectionMessage}
                        </span>
                    </div>
                )}
            </div>
            
            
        </div>
    );
};

export default ConfigExcel;