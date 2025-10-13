import api from './api';

const API_URL = import.meta.env.VITE_API_ENDPOINT;

export interface DatosPrediccion {
    usuarioId: string;
    nombreModelo: string;
    valores: number[];
    nPasos?: number;
    objetivo?: string;
    iteraciones?: number;
    umbralConfianza?: number;
}

export type Algoritmo = {
    id: string;
    nombre: string;
    usuarioId: string;
    rutaArchivo: string;
    fechaCreacion: string;
}

export async function obtenerAlgoritmos(usuarioId: string) {
    try {
        const response = await api.get(`${API_URL}/api/algoritmos/${usuarioId}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener los algoritmos:', error);
        throw error;
    }
}

export async function ejecutarAlgoritmo(datos: DatosPrediccion) {
    try {
        const response = await api.post(`${API_URL}/api/algoritmos/ejecutar`, datos);
        return response.data;
    } catch (error) {
        console.error('Error al ejecutar el algoritmo:', error);
        throw error;
    }
}
