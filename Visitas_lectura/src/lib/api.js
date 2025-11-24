import axios from 'axios';
import Cookies from 'js-cookie';

// URL base de tu API de visitas
const API_URL = 'https://visitas-empresa.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de petición: agrega el token si existe
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  const scheme = Cookies.get('auth_scheme') || 'Bearer';
  if (token) {
    config.headers.Authorization = `${scheme} ${token}`;
  }
  return config;
});

// Interceptor de respuesta: maneja 401 (token inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);

// Funciones de autenticación
export const login = async (username, password) => {
  // Intentamos varias rutas comunes: JWT (/token/) y DRF token (/api-token-auth/)
  // Primero intentamos JWT endpoint
  try {
    const { data } = await api.post('/token/', { username, password });
    if (data.access) {
      Cookies.set('access_token', data.access, { expires: 1 });
      if (data.refresh) Cookies.set('refresh_token', data.refresh, { expires: 7 });
      Cookies.set('auth_scheme', 'Bearer');
      return data;
    }
  } catch (e) {
    // ignorar y probar siguiente endpoint
  }

  // Intentamos endpoint clásico de DRF TokenAuthentication
  try {
    const { data } = await api.post('/api-token-auth/', { username, password });
    if (data && data.token) {
      Cookies.set('access_token', data.token, { expires: 7 });
      Cookies.set('auth_scheme', 'Token');
      return data;
    }
    throw new Error('No se obtuvo token');
  } catch (err) {
    // Re-lanzamos el error para que la UI lo maneje
    throw err;
  }
};

export const setToken = (token, scheme = 'Bearer') => {
  Cookies.set('access_token', token, { expires: scheme === 'Bearer' ? 1 : 7 });
  Cookies.set('auth_scheme', scheme);
};

export const getToken = () => Cookies.get('access_token');

export const logout = () => {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// Endpoints para visitas
export const getVisitas = () => api.get('/visitas/'); // lista todas las visitas
export const getVisita = (id) => api.get(`/visitas/${id}/`); // detalle de una visita
export const deleteVisita = (id) => api.delete(`/visitas/${id}/`);
export const saveVisita = (data, id = null) => 
  id ? api.put(`/visitas/${id}/`, data) : api.post('/visitas/', data);

// Export default
export default api;
