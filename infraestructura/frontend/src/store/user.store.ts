//import { JwtPayload } from 'jwt-decode';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { JwtPayload } from 'jwt-decode'; 

import { customCookieStorage } from './cookie-storage';

interface State{
    user:{
        id:number
        nombre: string;
        rol: string;
        token: JwtPayload;
        isLogged: boolean;
    }
}

interface Actions{
    handleLogin: (id:number, nombre:string, rol:string, token:JwtPayload) => void;
    handleLogout: () => void;
}

export const useUserStore =create<State & Actions>()(
    persist(
        (set) => ({
            user: {
                id: 0,
                nombre: '',
                rol: '',
                token: {},
                isLogged: false
            },
            handleLogin: (id, nombre:string, rol:string, token:JwtPayload) => {
                set({user: {id,nombre,rol,token, isLogged: true}});
            },
            handleLogout: () => {
                set({user: {id:0,nombre:'',rol: '',token:{}, isLogged: false}});
                Cookies.remove("user-storage");
                localStorage.clear();
            }
        }),
        {
            name: 'user-storage',
            storage: customCookieStorage
        }
    ))