/**
 * admin/AdminApp.tsx — Ứng dụng quản trị (mount tại /admin/*).
 */
import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AdminAuthProvider, useAdminAuth } from './AuthContext';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import ResourceList from './ResourceList';
import ResourceForm from './ResourceForm';

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAdminAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="w-6 h-6 animate-spin text-[#1B5FA8]" />
      </div>
    );
  }
  if (!user) return <Navigate to="/dang-nhap?next=/admin" replace />;
  return <>{children}</>;
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* Trang đăng nhập duy nhất nằm ở /dang-nhap; giữ route này cho link cũ. */}
        <Route path="login" element={<Navigate to="/dang-nhap?next=/admin" replace />} />
        <Route
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path=":resource" element={<ResourceList />} />
          <Route path=":resource/new" element={<ResourceForm />} />
          <Route path=":resource/:id" element={<ResourceForm />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
