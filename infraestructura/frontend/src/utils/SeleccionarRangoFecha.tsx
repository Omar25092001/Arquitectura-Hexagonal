import { useState, useEffect } from 'react';
import { Calendar, Clock, X, Filter } from 'lucide-react';
import * as ExcelJS from 'exceljs';

interface SeleccionarRangoFechaProps {
    isOpen: boolean;
    onClose: () => void;
    file: File;
    config: any;
    onDateRangeSelected: (rangeData: {
        dateColumn: string;
        startDate: string;
        endDate: string;
        filteredData: any[];
        totalRecords: number;
    }) => void;
}

interface DateInfo {
    dateColumn: string;
    dates: string[];
    allData: any[];
}

const SeleccionarRangoFecha = ({ 
    isOpen, 
    onClose, 
    file, 
    config, 
    onDateRangeSelected 
}: SeleccionarRangoFechaProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dateInfo, setDateInfo] = useState<DateInfo | null>(null);
    const [selectedRange, setSelectedRange] = useState({
        startDate: '',
        endDate: ''
    });

    // Detectar fechas cuando se abre el modal
    useEffect(() => {
        if (isOpen && file) {
            detectarColumnaDeFechas();
        }
    }, [isOpen, file]);

    const detectarColumnaDeFechas = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const dateData = await procesarExcelParaFechas(file, config);
            setDateInfo(dateData);
            
            // Establecer rango inicial (primera y última fecha)
            if (dateData.dates.length > 0) {
                setSelectedRange({
                    startDate: dateData.dates[0],
                    endDate: dateData.dates[dateData.dates.length - 1]
                });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const procesarExcelParaFechas = async (file: File, config: any): Promise<DateInfo> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const buffer = e.target?.result as ArrayBuffer;
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.load(buffer);
                    
                    // Seleccionar hoja
                    let worksheet;
                    if (config.useSheetName && config.sheetName) {
                        worksheet = workbook.getWorksheet(config.sheetName);
                        if (!worksheet) {
                            const availableSheets = workbook.worksheets.map(ws => ws.name).join(', ');
                            reject(new Error(`La hoja "${config.sheetName}" no existe. Hojas disponibles: ${availableSheets}`));
                            return;
                        }
                    } else {
                        const sheetIndex = parseInt(config.sheetIndex) || 0;
                        if (sheetIndex >= workbook.worksheets.length) {
                            reject(new Error(`El índice ${sheetIndex} está fuera del rango. El archivo tiene ${workbook.worksheets.length} hojas`));
                            return;
                        }
                        worksheet = workbook.worksheets[sheetIndex];
                    }
                    
                    // Extraer encabezados
                    const firstRow = worksheet.getRow(1);
                    const headers: string[] = [];
                    
                    firstRow.eachCell((cell) => {
                        const headerValue = cell.value ? String(cell.value).trim() : '';
                        headers.push(headerValue);
                    });
                    
                    // Buscar columna de fecha
                    const dateColumnNames = ['date', 'fecha', 'timestamp', 'time', 'datetime'];
                    let dateColumnIndex = -1;
                    let dateColumnName = '';
                    
                    headers.forEach((header, index) => {
                        const lowerHeader = header.toLowerCase().trim();
                        if (dateColumnNames.some(dateCol => 
                            lowerHeader === dateCol || lowerHeader.includes(dateCol)
                        )) {
                            dateColumnIndex = index;
                            dateColumnName = header;
                        }
                    });
                    
                    if (dateColumnIndex === -1) {
                        reject(new Error('No se encontró una columna de fecha. Asegúrate de que exista una columna llamada "Date", "Fecha", "Timestamp", etc.'));
                        return;
                    }
                    
                    // Extraer todos los datos
                    const allData: any[] = [];
                    const dates: string[] = [];
                    
                    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
                        const row = worksheet.getRow(rowNumber);
                        const rowData: any = {};
                        let hasData = false;
                        
                        headers.forEach((header, colIndex) => {
                            const cell = row.getCell(colIndex + 1);
                            let cellValue = cell.value;
                            
                            // Procesar fechas especiales
                            if (colIndex === dateColumnIndex && cellValue) {
                                cellValue = formatearFecha(cellValue);
                            }
                            
                            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                                rowData[header] = cellValue;
                                hasData = true;
                            }
                        });
                        
                        if (hasData && rowData[dateColumnName]) {
                            allData.push(rowData);
                            dates.push(rowData[dateColumnName]);
                        }
                    }
                    
                    // Ordenar fechas y eliminar duplicados
                    const uniqueSortedDates = [...new Set(dates)].sort((a, b) => {
                        return compararFechas(a, b);
                    });
                    
                    resolve({
                        dateColumn: dateColumnName,
                        dates: uniqueSortedDates,
                        allData: allData
                    });
                    
                } catch (error: any) {
                    reject(new Error(`Error procesando Excel: ${error.message}`));
                }
            };
            
            reader.onerror = () => reject(new Error('Error leyendo el archivo'));
            reader.readAsArrayBuffer(file);
        });
    };

    const formatearFecha = (cellValue: any): string => {
        if (cellValue instanceof Date) {
            // Fecha de Excel
            return formatearFechaISO(cellValue);
        } else if (typeof cellValue === 'number') {
            // Excel almacena fechas como números seriales
            const excelDate = new Date((cellValue - 25569) * 86400 * 1000);
            return formatearFechaISO(excelDate);
        } else {
            // Texto, intentar parsearlo
            return String(cellValue).trim();
        }
    };

    const formatearFechaISO = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    };

    const compararFechas = (a: string, b: string): number => {
        const dateA = parsearFecha(a);
        const dateB = parsearFecha(b);
        return dateA.getTime() - dateB.getTime();
    };

    const parsearFecha = (fechaStr: string): Date => {
        // Formatos soportados
        const formatos = [
            /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/, // DD-MM-YYYY HH:MM
            /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/, // YYYY-MM-DD HH:MM
            /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/, // DD/MM/YYYY HH:MM
            /^(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
            /^(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
        ];
        
        // DD-MM-YYYY con o sin hora
        if (formatos[0].test(fechaStr)) {
            const match = fechaStr.match(formatos[0]);
            const [, day, month, year, hour = '0', minute = '0'] = match!;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 
                           parseInt(hour), parseInt(minute));
        }
        
        // YYYY-MM-DD con o sin hora
        if (formatos[1].test(fechaStr)) {
            const match = fechaStr.match(formatos[1]);
            const [, year, month, day, hour = '0', minute = '0'] = match!;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 
                           parseInt(hour), parseInt(minute));
        }
        
        // Fallback: intentar parseo nativo
        return new Date(fechaStr);
    };

    const filtrarDatosPorRango = () => {
        if (!dateInfo) return [];
        
        const startIndex = dateInfo.dates.indexOf(selectedRange.startDate);
        const endIndex = dateInfo.dates.indexOf(selectedRange.endDate);
        
        if (startIndex === -1 || endIndex === -1) return [];
        
        const fechasEnRango = dateInfo.dates.slice(startIndex, endIndex + 1);
        
        return dateInfo.allData.filter(row => 
            fechasEnRango.includes(row[dateInfo.dateColumn])
        );
    };

    const handleConfirmar = () => {
        if (!dateInfo) return;
        
        const filteredData = filtrarDatosPorRango();
        
        onDateRangeSelected({
            dateColumn: dateInfo.dateColumn,
            startDate: selectedRange.startDate,
            endDate: selectedRange.endDate,
            filteredData: filteredData,
            totalRecords: filteredData.length
        });
        
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4">
            <div className="bg-secundary rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center">
                            <Calendar className="w-6 h-6 text-orange-400 mr-3" />
                            <div>
                                <h2 className="text-xl font-bold text-white">Seleccionar Rango de Fechas</h2>
                                <p className="text-gray-400 text-sm">Analiza datos dentro de un período específico</p>
                            </div>
                        </div>
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
                            <span className="ml-3 text-gray-300">Analizando fechas en el archivo...</span>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Content */}
                    {dateInfo && !isLoading && (
                        <>
                            {/* Info del archivo */}
                            <div className="bg-background rounded-lg p-4 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center">
                                        <Clock className="w-5 h-5 text-blue-400 mr-2" />
                                        <div>
                                            <p className="text-gray-400 text-sm">Columna de fecha</p>
                                            <p className="text-white font-medium">{dateInfo.dateColumn}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Filter className="w-5 h-5 text-green-400 mr-2" />
                                        <div>
                                            <p className="text-gray-400 text-sm">Total de registros</p>
                                            <p className="text-white font-medium">{dateInfo.allData.length}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 text-purple-400 mr-2" />
                                        <div>
                                            <p className="text-gray-400 text-sm">Fechas únicas</p>
                                            <p className="text-white font-medium">{dateInfo.dates.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Selección de rango */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Fecha inicio */}
                                <div>
                                    <label className="block text-gray-300 font-medium mb-2">
                                        📅 Fecha de inicio:
                                    </label>
                                    <select
                                        value={selectedRange.startDate}
                                        onChange={e => setSelectedRange(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg bg-background text-white border border-gray-600 focus:border-orange-400 focus:outline-none"
                                    >
                                        {dateInfo.dates.map(date => (
                                            <option key={`start-${date}`} value={date}>
                                                {date}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fecha fin */}
                                <div>
                                    <label className="block text-gray-300 font-medium mb-2">
                                        🏁 Fecha de fin:
                                    </label>
                                    <select
                                        value={selectedRange.endDate}
                                        onChange={e => setSelectedRange(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg bg-background text-white border border-gray-600 focus:border-orange-400 focus:outline-none"
                                    >
                                        {dateInfo.dates.map(date => (
                                            <option key={`end-${date}`} value={date}>
                                                {date}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Resumen del rango */}
                            <div className="bg-background rounded-lg p-4 mb-6">
                                <h3 className="text-white font-medium mb-3 flex items-center">
                                    <Filter className="w-5 h-5 mr-2 text-orange-400" />
                                    Resumen del rango seleccionado
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400">Desde:</span>
                                        <p className="text-green-400 font-medium">{selectedRange.startDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Hasta:</span>
                                        <p className="text-green-400 font-medium">{selectedRange.endDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Días únicos:</span>
                                        <p className="text-blue-400 font-medium">
                                            {(() => {
                                                const start = dateInfo.dates.indexOf(selectedRange.startDate);
                                                const end = dateInfo.dates.indexOf(selectedRange.endDate);
                                                return end - start + 1;
                                            })()}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Registros:</span>
                                        <p className="text-purple-400 font-medium">
                                            {filtrarDatosPorRango().length}
                                        </p>
                                    </div>
                                </div>
                            </div>


                            {/* Botones */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmar}
                                    className="flex-1 px-4 py-3 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors font-medium"
                                >
                                    Aplicar Rango ({filtrarDatosPorRango().length} registros)
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeleccionarRangoFecha;