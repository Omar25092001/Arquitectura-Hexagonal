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