import React from 'react';
import { IoMdLogOut } from "react-icons/io";

const Header = () => {
  return (
    <header className="flex justify-between items-center px-5 py-5">
      <div className="text-white font-bold text-2xl">Configuración del Digital Twin</div>   
      <div className="flex items-center gap-4">
        <span className="text-white font-medium text-sm">Desloguearse</span>
        <button className="text-white hover:text-gray-300 transition-colors">
          <IoMdLogOut className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;