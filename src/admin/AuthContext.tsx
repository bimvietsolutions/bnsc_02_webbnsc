/**
 * admin/AuthContext.tsx
 * Quản lý phiên đăng nhập admin (đọc /me khi khởi động, logout).
 * Việc đăng nhập do trang công khai /dang-nhap đảm nhận.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authLogout, authMe, type AdminUser } from './api';

interface AuthCtx {
  user: AdminUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
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

  const logout = async () => {
    await authLogout().catch(() => {});
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, logout }}>{children}</Ctx.Provider>
  );
}

export const useAdminAuth = () => useContext(Ctx);
