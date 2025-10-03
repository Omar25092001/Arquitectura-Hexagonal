import { Route, Routes } from "react-router-dom";
import FuenteDatos from '@/pages/FuenteDatos';
import Variables from '@/pages/Variables';
import Ejecucion from "@/pages/Ejecucion";
import { ExcelFileSectionProvider } from "@/components/shared/ExcelFileSectionContext";

function UsuariosRoutes() {
  return (
    <ExcelFileSectionProvider>
      <Routes>
        <Route path="/fuente-datos" element={<FuenteDatos />} />
        <Route path="/variables" element={<Variables />} />
        <Route path="/ejecucion" element={<Ejecucion />} />
      </Routes>
    </ExcelFileSectionProvider>
  );
}

export default UsuariosRoutes;