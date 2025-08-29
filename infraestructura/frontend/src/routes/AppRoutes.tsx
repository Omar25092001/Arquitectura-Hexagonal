import {lazy} from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PrivateRouteUsuario } from './PrivateRouteUsuario';
const UsuariosRoutes = lazy(() => import('./UsuarioRoutes'));
import Login from '../pages/Login';

const AppRoutes = () => {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login/>} />
            <Route path="/usuario/*" element= {
                <PrivateRouteUsuario>
                    <UsuariosRoutes />
                </PrivateRouteUsuario>
            } />
        </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;