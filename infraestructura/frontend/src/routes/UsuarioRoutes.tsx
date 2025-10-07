import { Route, Routes } from "react-router-dom";
import FuenteDatos from '@/pages/FuenteDatos';
import Variables from '@/pages/Variables';
import Ejecucion from "@/pages/Ejecucion";
import HistorialEjecuciones from "@/pages/HistorialEjecuciones";
import { ExcelFileSectionProvider } from "@/components/shared/ExcelFileSectionContext";
import { TutorialProvider } from "@/components/Tutorial/TutorialContext";
import TutorialOverlay from "@/components/Tutorial/TutorialOverlay";

function UsuariosRoutes() {
  return (
    <TutorialProvider>
      <ExcelFileSectionProvider>
        <Routes>
          <Route path="/fuente-datos" element={<FuenteDatos />} />
          <Route path="/variables" element={<Variables />} />
          <Route path="/ejecucion" element={<Ejecucion />} />
          <Route path="/historial" element={<HistorialEjecuciones/>} />
        </Routes>
        <TutorialOverlay />
      </ExcelFileSectionProvider>
    </TutorialProvider>
  );
}

export default UsuariosRoutes;