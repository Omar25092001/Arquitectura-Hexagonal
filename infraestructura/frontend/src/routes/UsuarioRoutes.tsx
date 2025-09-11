import { Route, Routes } from "react-router-dom"
import FuenteDatos from '@/pages/FuenteDatos';
import Variables from '@/pages/Variables';
import Algoritmo from "@/pages/Algoritmo";
import Ejecucion from "@/pages/Ejecucion";

function UsuariosRoutes() {
  return (
    <Routes>
       <Route path="/fuente-datos" element={<FuenteDatos/>} />
        <Route path="/variables" element={<Variables/>} />
        <Route path="/algoritmo" element={<Algoritmo/>} />
        <Route path="/ejecucion" element={<Ejecucion/>} />
    </Routes>
  );
}

export default UsuariosRoutes;