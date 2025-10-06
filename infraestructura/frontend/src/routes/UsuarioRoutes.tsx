import { Route, Routes } from "react-router-dom";
import FuenteDatos from '@/pages/FuenteDatos';
import Variables from '@/pages/Variables';
import Ejecucion from "@/pages/Ejecucion";
import HistorialEjecuciones from "@/pages/HistorialEjecuciones";
import { ExcelFileSectionProvider } from "@/components/shared/ExcelFileSectionContext";

function UsuariosRoutes() {
  return (
    <ExcelFileSectionProvider>
      <Routes>
        <Route path="/fuente-datos" element={<FuenteDatos />} />
        <Route path="/variables" element={<Variables />} />
        <Route path="/ejecucion" element={<Ejecucion />} />
        <Route path="/historial" element={<HistorialEjecuciones/>} />
      </Routes>
    </ExcelFileSectionProvider>
  );
}

export default UsuariosRoutes;