// lib/api.js - Versión para navegador

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
    const response = await fetch(`${API_URL}/api-token-auth/`, {
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
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  Cookies.remove('auth_scheme');
  window.location.href = '/login';
};

// Endpoints para visitas
export const getVisitas = () => apiRequest('/visitas/');
export const getVisita = (id) => apiRequest(`/visitas/${id}/`);
export const deleteVisita = (id) => apiRequest(`/visitas/${id}/`, { method: 'DELETE' });
export const saveVisita = (data, id = null) => 
  id 
    ? apiRequest(`/visitas/${id}/`, { method: 'PUT', body: JSON.stringify(data) })
    : apiRequest('/visitas/', { method: 'POST', body: JSON.stringify(data) });