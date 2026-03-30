import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { PermissionKey, SessionUser } from '@/types/domain';

type AuthContextType = {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string, deviceName: string) => Promise<{ deviceApprovalRequired?: boolean }>;
  logout: () => Promise<void>;
  hasPermission: (p: PermissionKey) => boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await api<{ user: SessionUser | null }>('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const login = async (email: string, password: string, deviceName: string) => {
    const deviceId = localStorage.getItem('device_id') ?? crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
    const result = await api<{ user?: SessionUser; deviceApprovalRequired?: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, deviceId, deviceName }),
    });
    if (result.user) setUser(result.user);
    return result;
  };

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const hasPermission = (permission: PermissionKey) => !!user && (user.isAdmin || user.permissions.includes(permission));

  const value = useMemo(() => ({ user, loading, login, logout, hasPermission, refresh }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
