import axios from 'axios';
import { clearAuthToken, getAuthToken } from '../lib/authToken';

const isLocalApiHost = (value = '') =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(value);

const resolveApiBaseUrl = () => {
  const configured = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    ''
  ).trim();

  if (!configured) return '/api';
  if (configured.startsWith('/')) return configured;

  // Guardrail: never let production bundles call localhost APIs.
  if (import.meta.env.PROD && isLocalApiHost(configured)) {
    console.warn('Ignoring localhost API URL in production, falling back to /api');
    return '/api';
  }

  return configured;
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
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
