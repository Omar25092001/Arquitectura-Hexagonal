import axios from 'axios';

const API_URL = import.meta.env.VITE_API_ENDPOINT;

type UsuarioLogin = {
    correo: string;
    contrasena: string;
}

export async function registrarUsuario() {
    try {
        const response = await axios.get(`${API_URL}/api/usuarios`);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error al obtener los climas:', error);
        throw error;
    }
}

export async function loginUsuario(usuario: UsuarioLogin) {
    try {
        const response = await axios.post(`${API_URL}/api/usuarios/login`, usuario);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw error;
    }
}

export async function obtenerUsuarios() {
    try {
        const response = await axios.get(`${API_URL}/api/usuarios/usuarios`);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        throw error;
    }
}

export async function crearUsuario(usuario: { nombre: string; correo: string; contrasena: string }) {
    try {
        const response = await axios.post(`${API_URL}/api/usuarios/`, usuario);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        throw error;
    } 
}

export async function editarEstadoUsuario(id: string, estado: boolean){
    try {
        const response = await axios.patch(`${API_URL}/api/usuarios/estado/${id}`, { estado });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error al editar el estado del usuario:', error);
        throw error;
    }
}

export async function editarPrimeraVezUsuario(id: string, primeravez: boolean){
    try {
        const response = await axios.patch(`${API_URL}/api/usuarios/primeraVez/${id}`, { primeravez });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error al editar el estado del usuario:', error);
        throw error;
    }
}