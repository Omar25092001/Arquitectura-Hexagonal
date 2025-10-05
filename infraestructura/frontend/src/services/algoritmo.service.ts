import axios from 'axios';

const API_URL = import.meta.env.VITE_API_ENDPOINT;

type DatosPrediccion = {
    nombreModelo: string;
    valores: number[];
    nPasos: number;
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
        const response = await axios.get(`${API_URL}/api/algoritmos/${usuarioId}`);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error al obtener los algoritmos:', error);
        throw error;
    }
}

export async function ejecutarAlgoritmo(datos: DatosPrediccion) {
    try {
        const response = await axios.post(`${API_URL}/api/algoritmos/ejecutar`, datos);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error al ejecutar el algoritmo:', error);
        throw error;
    }
}