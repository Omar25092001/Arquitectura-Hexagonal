import axios from 'axios';
import { useUserStore } from '@/store/user.store';
const API_URL = import.meta.env.VITE_API_ENDPOINT || '';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  try {
    const token = useUserStore.getState().user.token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
}, error => Promise.reject(error));

export default api;