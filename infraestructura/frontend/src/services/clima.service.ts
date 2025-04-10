import axios from 'axios';

const API_URL = import.meta.env.VITE_API_ENDPOINT;

export async function obtenerClimas() {
  try {
    const response = await axios.get(`${API_URL}/clima/`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error al obtener los climas:', error);
    throw error;
  }
}