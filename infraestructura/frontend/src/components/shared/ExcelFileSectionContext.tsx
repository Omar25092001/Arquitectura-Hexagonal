import React, { createContext, useContext, useState } from 'react';

interface ExcelFileSectionContextType {
    excelFile: File | null;
    setExcelFile: (file: File | null) => void;
}

const ExcelFileSectionContext = createContext<ExcelFileSectionContextType | undefined>(undefined);

export const ExcelFileSectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [excelFile, setExcelFile] = useState<File | null>(null);

    return (
        <ExcelFileSectionContext.Provider value={{ excelFile, setExcelFile }}>
            {children}
        </ExcelFileSectionContext.Provider>
    );
};

export function useExcelFileSection() {
    const context = useContext(ExcelFileSectionContext);
    if (!context) throw new Error('useExcelFileSection debe usarse dentro de ExcelFileSectionProvider');
    return context;
}