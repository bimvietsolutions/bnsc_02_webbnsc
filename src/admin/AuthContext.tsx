/**
 * admin/AuthContext.tsx
 * Quản lý phiên đăng nhập admin (đọc /me khi khởi động, login, logout).
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authLogin, authLogout, authMe, type AdminUser } from './api';

interface AuthCtx {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authMe()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const r = await authLogin(email, password);
    setUser((r as any).user);
  };

  const logout = async () => {
    await authLogout().catch(() => {});
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAdminAuth = () => useContext(Ctx);
