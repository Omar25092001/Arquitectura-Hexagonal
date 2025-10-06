import { IoMdLogOut } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/store/user.store';
import { History, ArrowLeft } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogout: logout } = useUserStore();

  const handleLogout = () => {
    localStorage.clear();
    logout();
    navigate('/');
  }

  const isHistorialPage = location.pathname === '/usuario/historial';

  const handleNavigateToHistorial = () => {
    // Guardar la ubicación actual antes de navegar
    navigate('/usuario/historial', { state: { from: location.pathname } });
  };

  const handleNavigateBack = () => {
    // Si hay un "from" en el estado, regresar ahí, sino ir al dashboard
    const from = location.state?.from || '/dashboard';
    navigate(from);
  };

  return (
    <header className="flex justify-between items-center px-5 py-5">
      <div className="text-white font-bold text-xl sm:text-2xl">
        Configuración del Digital Twin
      </div>
      
      <div className="flex items-center gap-3">
        {/* Botones de navegación - siempre visibles */}
        {!isHistorialPage ? (
          <button
            onClick={handleNavigateToHistorial}
            className="flex items-center gap-2 px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Historial</span>
          </button>
        ) : (
          <button
            onClick={handleNavigateBack}
            className="flex items-center gap-2 px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver</span>
          </button>
        )}

        {/* Botón de Logout */}
        <div className="flex items-center gap-2 border-l border-gray-600 pl-3">
          <span className="text-white font-medium text-sm hidden md:inline">
            Cerrar sesión
          </span>
          <button
            onClick={handleLogout}
            className="text-white hover:text-orange-400 transition-colors p-2 hover:bg-background rounded-lg"
            title="Cerrar sesión"
          >
            <IoMdLogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;