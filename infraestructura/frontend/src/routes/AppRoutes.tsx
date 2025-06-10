import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import FuenteDatos from '@/pages/FuenteDatos';
const AppRoutes = () => {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login/>} />
            <Route path="/fuente-datos" element={<FuenteDatos/>} />
        </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;