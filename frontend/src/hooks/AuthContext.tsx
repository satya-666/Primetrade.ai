import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../utils/api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; errors?: { field?: string; message: string }[] }>;
  register: (email: string, password: string) => Promise<{ success: boolean; message: string; errors?: { field?: string; message: string }[] }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = api.getTokens().accessToken;
    if (token && !getStoredUser()) {
      api.clearTokens();
    }

    function onAuthLogout() {
      localStorage.removeItem('user');
      setUser(null);
    }
    window.addEventListener('auth:logout', onAuthLogout);
    return () => window.removeEventListener('auth:logout', onAuthLogout);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    if (res.success && res.data) {
      api.setTokens(res.data.accessToken, res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res;
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await api.auth.register(email, password);
    if (res.success && res.data) {
      api.setTokens(res.data.accessToken, res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    api.clearTokens();
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
