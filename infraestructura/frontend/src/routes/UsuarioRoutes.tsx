import { Route, Routes } from "react-router-dom"
import FuenteDatos from '@/pages/FuenteDatos';
import Variables from '@/pages/Variables';

function UsuariosRoutes() {
  return (
    <Routes>
       <Route path="/fuente-datos" element={<FuenteDatos/>} />
        <Route path="/variables" element={<Variables/>} />
    </Routes>
  );
}

export default UsuariosRoutes;