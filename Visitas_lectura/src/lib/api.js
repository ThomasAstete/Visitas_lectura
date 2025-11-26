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
    console.debug('[login] /token/ status:', response.status);
    const data = await response.json().catch(() => null);
    console.debug('[login] /token/ response json:', data);

    if (response.ok && data) {
      if (data.access) {
        Cookies.set('access_token', data.access, { expires: 1 });
        if (data.refresh) Cookies.set('refresh_token', data.refresh, { expires: 7 });
        Cookies.set('auth_scheme', 'Bearer');
        console.debug('[login] Stored cookies:', {
          access_token: Cookies.get('access_token'),
          auth_scheme: Cookies.get('auth_scheme'),
        });
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
    console.debug('[login] /api-token-auth/ status:', response.status);
    const data = await response.json().catch(() => null);
    console.debug('[login] /api-token-auth/ response json:', data);

    if (response.ok && data) {
      if (data && data.token) {
        Cookies.set('access_token', data.token, { expires: 7 });
        Cookies.set('auth_scheme', 'Token');
        console.debug('[login] Stored cookies (token):', {
          access_token: Cookies.get('access_token'),
          auth_scheme: Cookies.get('auth_scheme'),
        });
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