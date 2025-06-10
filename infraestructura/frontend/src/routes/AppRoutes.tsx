import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import FuenteDatos from '@/pages/FuenteDatos';
import Variables from '@/pages/Variables';
const AppRoutes = () => {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login/>} />
            <Route path="/fuente-datos" element={<FuenteDatos/>} />
            <Route path="/variables" element={<Variables/>} />
        </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;