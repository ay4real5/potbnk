import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { clearAuthToken, getAuthToken, setAuthToken } from '../lib/authToken';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getAuthToken());

  const login = useCallback(async (identity, password) => {
    const normalizedIdentity = (identity || '').trim().toLowerCase();
    const params = new URLSearchParams();
    params.append('username', normalizedIdentity);
    params.append('password', password);
    const { data } = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    setAuthToken(data.access_token);
    setToken(data.access_token);
    const { data: me } = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
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
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        fetchMe,
        supabase,
        isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
