import api from './api';

const API_URL = import.meta.env.VITE_API_ENDPOINT;

export const guardarSesionXmi = async (
    usuarioId: string, 
    liveData: any[]
) => {
    try {
        const response = await api.post(`${API_URL}/api/xmi/guardar-sesion`, {
            usuarioId,
            liveData
        });
        return response.data;
    } catch (error) {
        console.error("Error en xmi.service al guardar:", error);
        throw error;
    }
};