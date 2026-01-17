import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/services/api';

/**
 * User type from Flask backend
 */
export interface User {
  id: number;
  email: string;
  username: string;
  role: 'admin' | 'ketua' | 'pembina' | 'member';
  division_id?: number;
  must_change_password?: boolean;
  profile_picture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const userData = await api.get<User>('/api/me');
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    await api.post('/login', { email, password });
    await checkAuth();
  }

  async function logout() {
    await api.post('/logout');
    setUser(null);
  }

  async function refresh() {
    await checkAuth();
  }

  function hasRole(...roles: string[]) {
    if (!user) return false;
    return roles.includes(user.role);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
