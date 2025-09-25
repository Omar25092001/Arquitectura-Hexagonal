import {lazy} from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PrivateRouteUsuario } from './PrivateRouteUsuario';
import { PrivateRouteAdmin } from './PrivateRouteAdmin';
const UsuariosRoutes = lazy(() => import('./UsuarioRoutes'));
const AdminRoutes = lazy(() => import('./AdminRoutes'));
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
            <Route path="/admin/*" element= {
                <PrivateRouteAdmin>
                    <AdminRoutes />
                </PrivateRouteAdmin>
            } />
        </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;