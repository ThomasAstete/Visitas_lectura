// lib/api.js - Versión para navegador

import Cookies from 'js-cookie';

const API_URL = 'https://visitas-empresa.onrender.com/api';

// Función para hacer requests con autenticación
async function apiRequest(url, options = {}) {
  const token = Cookies.get('access_token');
  const scheme = Cookies.get('auth_scheme') || 'Bearer';
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `${scheme} ${token}`;
  }

  // Debug: mostrar token y headers en consola (útil durante desarrollo)
  try {
    console.debug('[apiRequest] URL:', `${API_URL}${url}`);
    console.debug('[apiRequest] Authorization:', headers.Authorization);
    console.debug('[apiRequest] headers:', headers);
  } catch (e) {
    // noop en entornos donde console no esté disponible
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    logout();
    throw new Error('Token inválido');
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

// Funciones de autenticación
export const login = async (username, password) => {
  // Intentamos endpoint JWT
  try {
    const response = await fetch(`${API_URL}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access) {
        Cookies.set('access_token', data.access, { expires: 1 });
        if (data.refresh) Cookies.set('refresh_token', data.refresh, { expires: 7 });
        Cookies.set('auth_scheme', 'Bearer');
        return data;
      }
    }
  } catch (e) {
    // ignorar y probar siguiente endpoint
  }

  // Intentamos endpoint DRF TokenAuthentication
  try {
    const response = await fetch(`${API_URL}/api/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.token) {
        Cookies.set('access_token', data.token, { expires: 7 });
        Cookies.set('auth_scheme', 'Token');
        return data;
      }
    }
    
    throw new Error('Credenciales incorrectas');
  } catch (err) {
    throw new Error('Error de conexión o credenciales incorrectas');
  }
};

export const logout = () => {
  try {
    // Preferir usar js-cookie cuando esté disponible
    if (Cookies && typeof Cookies.remove === 'function') {
      try {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('auth_scheme');
      } catch (e) {
        console.warn('[logout] js-cookie remove failed:', e);
      }
    } else if (typeof document !== 'undefined') {
      // Fallback: eliminar cookies manualmente
      document.cookie = 'access_token=; Max-Age=0; path=/;';
      document.cookie = 'refresh_token=; Max-Age=0; path=/;';
      document.cookie = 'auth_scheme=; Max-Age=0; path=/;';
    }
  } catch (e) {
    console.error('[logout] Error clearing cookies:', e);
  }

  // Redirigir al login de forma segura
  try {
    if (typeof window !== 'undefined') {
      // Preferir assign para mantener historial menos agresivo
      window.location.assign('/login');
    }
  } catch (e) {
    console.error('[logout] Error redirecting to /login:', e);
  }
};

// Endpoints para visitas
export const getVisitas = async () => {
  const data = await apiRequest('/visitas/');
  try {
    console.debug('[getVisitas] raw response:', data);
  } catch (e) {
    // noop
  }

  // Normalizar distintas formas de respuesta a un array
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && Array.isArray(data.data)) return data.data;

  // Si el backend devolviera un objeto con arrays en propiedades, buscar el primero
  if (data && typeof data === 'object') {
    const arr = Object.values(data).find(v => Array.isArray(v));
    if (Array.isArray(arr)) return arr;
  }

  // Por defecto devolver array vacío para evitar errores en componentes
  return [];
};
/**
 * Obtener series agregadas desde el backend.
 * period: 'today' | 'month' | 'year' or 'hour' | 'day' | 'month'
 * params: objeto opcional { year, month, day }
 * Espera que el backend devuelva { labels: [...], data: [...] } u otras formas normalizables.
 */
export const getVisitasAgg = async (period = 'month', params = {}) => {
  const qs = new URLSearchParams({ period, ...params }).toString();
  const data = await apiRequest(`/visitas/aggregated/?${qs}`);

  // Normalizar distintas respuestas posibles
  if (!data) return { labels: [], data: [] };
  if (Array.isArray(data)) {
    // Si el backend devolvió sólo un array de valores, construir labels simples
    return { labels: data.map((_, i) => String(i)), data };
  }
  if (data.labels && Array.isArray(data.data)) return { labels: data.labels, data: data.data };
  if (Array.isArray(data.results) && data.results.length && data.results[0].hasOwnProperty('label')) {
    // Formato: [{label: '01', value: 3}, ...]
    return { labels: data.results.map(r => r.label), data: data.results.map(r => r.value) };
  }
  // Buscar primer par de arrays en objeto
  if (typeof data === 'object') {
    const labels = Array.isArray(data.labels) ? data.labels : null;
    const values = Array.isArray(data.data) ? data.data : null;
    if (labels && values) return { labels, data: values };
  }

  return { labels: [], data: [] };
};
export const getVisita = (id) => apiRequest(`/visitas/${id}/`);
export const deleteVisita = (id) => apiRequest(`/visitas/${id}/`, { method: 'DELETE' });
export const saveVisita = (data, id = null) => 
  id 
    ? apiRequest(`/visitas/${id}/`, { method: 'PUT', body: JSON.stringify(data) })
    : apiRequest('/visitas/', { method: 'POST', body: JSON.stringify(data) });