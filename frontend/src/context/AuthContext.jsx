import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      if (savedToken) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data.data.user);
          setToken(savedToken);
        } catch {
          // Token expired or invalid
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    const res = await authAPI.login({ email, password });
    const { user: userData, token: newToken } = res.data.data;
    setUser(userData);
    setToken(newToken);
    
    if (rememberMe) {
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('auth_token', newToken);
      sessionStorage.setItem('auth_user', JSON.stringify(userData));
    }
    
    return res.data;
  }, []);

  const loginPetugas = useCallback(async (nip, password, rememberMe = false) => {
    const res = await authAPI.loginPetugas({ nip, password });
    const { user: userData, token: newToken } = res.data.data;
    setUser(userData);
    setToken(newToken);
    
    if (rememberMe) {
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('auth_token', newToken);
      sessionStorage.setItem('auth_user', JSON.stringify(userData));
    }
    
    return res.data;
  }, []);

  const register = useCallback(async (name, email, password, confirmPassword) => {
    const res = await authAPI.register({ name, email, password, confirmPassword });
    // Do NOT automatically log in after registration
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout errors
    }
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }, []);

  const loginWithToken = useCallback(async (newToken) => {
    setToken(newToken);
    localStorage.setItem('auth_token', newToken);
    try {
      const res = await authAPI.getProfile();
      setUser(res.data.data.user);
      localStorage.setItem('auth_user', JSON.stringify(res.data.data.user));
    } catch {
      setToken(null);
      localStorage.removeItem('auth_token');
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    loginPetugas,
    register,
    logout,
    loginWithToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
