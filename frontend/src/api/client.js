import axios from 'axios';
import { clearAuthToken, getAuthToken } from '../lib/authToken';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Don't redirect on login/register requests themselves
      const url = err.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        clearAuthToken();
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
