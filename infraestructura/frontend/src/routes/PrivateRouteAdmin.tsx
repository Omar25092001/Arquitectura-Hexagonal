import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "@/store/user.store";

interface PrivateRouteProps {
    children: ReactNode;
}

export const PrivateRouteAdmin = ({ children }: PrivateRouteProps) => {
    const isLogged = useUserStore((state) => state.user.isLogged);
    let rol= useUserStore.getState().user.rol; 
    const location = useLocation();


  
    if (!isLogged || rol !== "admin") {
      return <Navigate to="/" state={{ from: location }} />;
    }

  
    return <>{children}</>;
};