import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('uns_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  const persistToken = useCallback((value) => {
    if (value) {
      localStorage.setItem('uns_token', value);
    } else {
      localStorage.removeItem('uns_token');
    }
    setToken(value);
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data.user);
    } catch (error) {
      persistToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [persistToken]);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token, fetchProfile]);

  const handleAuthSuccess = useCallback(
    (payload) => {
      persistToken(payload.token);
      setUser(payload.user);
    },
    [persistToken]
  );

  const login = useCallback(
    async ({ email, password }) => {
      const { data } = await api.post('/api/auth/login', { email, password });
      handleAuthSuccess(data);
      return data;
    },
    [handleAuthSuccess]
  );

  const register = useCallback(
    async ({ email, username, password }) => {
      const { data } = await api.post('/api/auth/register', { email, username, password });
      handleAuthSuccess(data);
      return data;
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
  }, [persistToken]);

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout, refreshProfile: fetchProfile }),
    [token, user, loading, login, register, logout, fetchProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
