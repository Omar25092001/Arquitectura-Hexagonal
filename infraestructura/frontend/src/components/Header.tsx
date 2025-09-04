import { IoMdLogOut } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/user.store';
const Header = () => {
  const navigate = useNavigate();
  const { handleLogout: logout} = useUserStore();

  const handleLogout = () => {
    localStorage.clear();
    logout(); 
    navigate('/');
  }

  return (
    <header className="flex justify-between items-center px-5 py-5">
      <div className="text-white font-bold text-2xl">Configuración del Digital Twin</div>
      <div className="flex items-center gap-4">
        <span className="text-white font-medium text-sm">Desloguearse</span>
        <button
          onClick={handleLogout}
          className="text-white hover:text-gray-300 transition-colors">
          <IoMdLogOut className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;