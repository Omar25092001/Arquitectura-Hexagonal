import React from 'react';
import { IoMdLogOut } from "react-icons/io";
import { useNavigate } from 'react-router-dom';



const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí puedes agregar la lógica para cerrar sesión, como limpiar el estado de autenticación
    console.log('Deslogueado');
    navigate('/'); // Redirigir a la página de inicio o login
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