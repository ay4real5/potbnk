import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = useCallback(async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const { data } = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    const { data: me } = await api.get('/auth/me');
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const fetchMe = useCallback(async () => {
    if (!token) return null;
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      return data;
    } catch {
      logout();
      return null;
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
