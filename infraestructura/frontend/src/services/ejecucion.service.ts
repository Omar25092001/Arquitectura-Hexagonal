import axios from 'axios';

const API_URL = import.meta.env.VITE_API_ENDPOINT;

export interface EjecucionAlgoritmo {
    id: string;
    usuarioId: string;
    nombreAlgoritmo: string;
    tipoAlgoritmo: 'predictivo' | 'optimizacion' | 'clasificacion';
    valoresEntrada: number[];
    variableSeleccionada: string;
    resultado: number[];
    fechaEjecucion: string;
    tiempoEjecucionMs: number;
}

export interface CrearEjecucionRequest {
    id: string;
    usuarioId: string;
    nombreAlgoritmo: string;
    tipoAlgoritmo: 'predictivo' | 'optimizacion' | 'clasificacion';
    valoresEntrada: number[];
    variableSeleccionada: string;
    fechaEjecucion: string;
    resultado: number[];
    tiempoEjecucion: number;
}

// Obtener todas las ejecuciones
export async function obtenerEjecuciones(): Promise<EjecucionAlgoritmo[]> {
    try {
        const response = await axios.get(`${API_URL}/api/ejecuciones`);
        return response.data.data; // Asumiendo que viene en response.data.data
    } catch (error) {
        console.error('Error al obtener ejecuciones:', error);
        throw error;
    }
}

// Obtener ejecuciones por usuario
export async function obtenerEjecucionesPorUsuario(usuarioId: string): Promise<EjecucionAlgoritmo[]> {
    try {
        const response = await axios.get(`${API_URL}/api/ejecuciones/usuario/${usuarioId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error al obtener ejecuciones del usuario:', error);
        throw error;
    }
}

// Crear ejecución manualmente
export async function crearEjecucion(datos: CrearEjecucionRequest): Promise<any> {
    try {
        const response = await axios.post(`${API_URL}/api/ejecuciones`, datos);
        return response.data;
    } catch (error) {
        console.error('Error al crear ejecución:', error);
        throw error;
    }
}