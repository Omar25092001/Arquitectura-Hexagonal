import { Route, Routes } from "react-router-dom"
import FuenteDatos from '@/pages/FuenteDatos';
import Variables from '@/pages/Variables';
import Algoritmo from "@/pages/Algoritmo";

function UsuariosRoutes() {
  return (
    <Routes>
       <Route path="/fuente-datos" element={<FuenteDatos/>} />
        <Route path="/variables" element={<Variables/>} />
        <Route path="/algoritmo" element={<Algoritmo/>} />
    </Routes>
  );
}

export default UsuariosRoutes;