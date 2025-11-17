import React, { createContext, useContext, useState } from 'react';

interface ExcelFileSectionContextType {
    excelFile: File | null;
    setExcelFile: (file: File | null) => void;
    dateRangeData: any | null;
    setDateRangeData: (data: any | null) => void;
}

const ExcelFileSectionContext = createContext<ExcelFileSectionContextType | undefined>(undefined);

export const ExcelFileSectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [excelFile, setExcelFile] = useState<File | null>(null);
    
    const [dateRangeData, setDateRangeData] = useState<any | null>(null);
    return (
        <ExcelFileSectionContext.Provider value={{ excelFile, setExcelFile,dateRangeData, setDateRangeData }}>
            {children}
        </ExcelFileSectionContext.Provider>
    );
};

export function useExcelFileSection() {
    const context = useContext(ExcelFileSectionContext);
    if (!context) throw new Error('useExcelFileSection debe usarse dentro de ExcelFileSectionProvider');
    return context;
}