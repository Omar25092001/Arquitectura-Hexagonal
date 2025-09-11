import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, FileSpreadsheet, Upload, File, HelpCircle } from 'lucide-react';
import * as ExcelJS from 'exceljs';
import FormatoExcel from '../Formatos/FormatoExcel';

interface ConfigExcelProps {
    onConnectionStateChange?: (state: 'idle' | 'testing' | 'success' | 'error') => void;
    onConfigChange?: (config: any) => void;
}


const ConfigExcel = ({ onConnectionStateChange, onConfigChange }: ConfigExcelProps) => {
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
    const [availableSheets, setAvailableSheets] = useState<string[]>([]);
    const [mostrarModalFormato, setMostrarModalFormato] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setExcelConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            setConnectionState('idle');
            setConnectionMessage('');
            setAvailableSheets([]);

            const configCompleta = {
                file: file,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            };
            console.log('📝 Enviando config Excel (archivo):', configCompleta);
            onConfigChange?.(configCompleta);
        }
    };

    const handleRadioChange = (useSheetName: boolean) => {
        setExcelConfig(prev => ({
            ...prev,
            useSheetName
        }));
    };

    const testConnection = async () => {
        if (!selectedFile) {
            setConnectionState('error');
            onConnectionStateChange?.('error');
            setConnectionMessage('Error: Debe seleccionar un archivo Excel');
            return;
        }

        setConnectionState('testing');
        onConnectionStateChange?.('testing');
        setConnectionMessage('Analizando archivo Excel...');

        try {
            // Leer el archivo con ExcelJS
            const buffer = await selectedFile.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);

            // Obtener nombres de las hojas
            const sheetNames = workbook.worksheets.map(ws => ws.name);
            setAvailableSheets(sheetNames);

            console.log('Hojas disponibles:', sheetNames);

            // Validar configuración específica
            let worksheet;
            let sheetInfo = '';

            if (excelConfig.useSheetName) {
                if (!excelConfig.sheetName.trim()) {
                    throw new Error('Debe especificar un nombre de hoja');
                }

                worksheet = workbook.getWorksheet(excelConfig.sheetName);
                if (!worksheet) {
                    throw new Error(`La hoja "${excelConfig.sheetName}" no existe. Hojas disponibles: ${sheetNames.join(', ')}`);
                }
                sheetInfo = `hoja "${excelConfig.sheetName}"`;
            } else {
                const sheetIndex = parseInt(excelConfig.sheetIndex);
                if (isNaN(sheetIndex) || sheetIndex < 0) {
                    throw new Error('El índice de la hoja debe ser un número entero no negativo');
                }

                if (sheetIndex >= workbook.worksheets.length) {
                    throw new Error(`El índice ${sheetIndex} está fuera del rango. El archivo tiene ${workbook.worksheets.length} hojas`);
                }

                worksheet = workbook.worksheets[sheetIndex];
                sheetInfo = `hoja con índice ${sheetIndex} ("${worksheet.name}")`;
            }

            // Verificar que la hoja tenga datos
            if (worksheet.rowCount === 0) {
                throw new Error(`La ${sheetInfo} está vacía`);
            }

            // Verificar que tenga al menos cabeceras
            const firstRow = worksheet.getRow(1);
            let hasHeaders = false;
            firstRow.eachCell((cell) => {
                if (cell.value && String(cell.value).trim()) {
                    hasHeaders = true;
                }
            });

            if (!hasHeaders) {
                throw new Error(`La ${sheetInfo} no tiene cabeceras válidas en la primera fila`);
            }

            // Contar filas con datos
            let dataRows = 0;
            for (let i = 2; i <= worksheet.rowCount; i++) {
                const row = worksheet.getRow(i);
                let hasData = false;
                row.eachCell((cell) => {
                    if (cell.value && String(cell.value).trim()) {
                        hasData = true;
                    }
                });
                if (hasData) dataRows++;
            }

            // Todo OK
            setConnectionState('success');
            onConnectionStateChange?.('success');
            setConnectionMessage(
                `Archivo Excel válido. Se leerán datos de la ${sheetInfo}. ` +
                `Encontradas ${dataRows} filas de datos en el archivo ${selectedFile.name}.`
            );

            // Enviar configuración completa
            const configCompleta = {
                file: selectedFile,
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                fileType: selectedFile.type,
                sheetName: excelConfig.sheetName,
                sheetIndex: excelConfig.sheetIndex,
                useSheetName: excelConfig.useSheetName,
                availableSheets: sheetNames,
                dataRows: dataRows,
                isValid: true
            };
            console.log('Configuración Excel validada:', configCompleta);
            onConfigChange?.(configCompleta);

        } catch (error: any) {
            console.error('Error verificando archivo Excel:', error);
            setConnectionState('error');
            onConnectionStateChange?.('error');
            setConnectionMessage(`Error: ${error.message}`);
        }
    };

    return (
        <div className="space-y-4">
            {/* Selector de archivo */}
            <div className="border-2 border-dashed border-background rounded-lg p-6 flex flex-col items-center">
                <FileSpreadsheet className="w-12 h-12 text-orange-400 mb-4" />
                <div className="flex items-center space-x-2 mb-2 ">
                    <h3 className="text-lg font-medium text-white mb-2">Selecciona un archivo Excel</h3>
                    <button
                        type="button"
                        onClick={() => setMostrarModalFormato(true)}
                        className="text-gray-400 hover:text-orange-400 transition-colors"
                        title="Ver formato de archivo esperado"
                    >
                        <HelpCircle className="w-6 h-6" />
                    </button>
                </div>
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
                        <span className={`text-sm ${connectionState === 'success' ? 'text-green-400' :
                            connectionState === 'error' ? 'text-red-400' : 'text-gray-300'
                            }`}>
                            {connectionMessage}
                        </span>
                    </div>
                )}
            </div>
            <FormatoExcel
                isOpen={mostrarModalFormato} 
                onClose={() => setMostrarModalFormato(false)} 
            />
        </div>
    );
};

export default ConfigExcel;