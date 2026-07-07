/**
 * admin/AdminLayout.tsx — Khung quản trị: sidebar nhóm resource + topbar + Outlet.
 */
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu as MenuIcon, X, ExternalLink } from 'lucide-react';
import { useAdminAuth } from './AuthContext';
import { resourceDefs, resourceGroups } from './resources';

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const doLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive ? 'bg-[#1B5FA8] text-white font-semibold' : 'text-slate-300 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 w-64 bg-[#0B2545] text-white flex flex-col transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-white/10 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-[#F5A623] text-[#0B2545] font-black flex items-center justify-center text-sm">
            BN
          </span>
          <span className="font-extrabold tracking-wide">BNSC Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <NavLink to="/admin" end className={linkClass} onClick={() => setOpen(false)}>
            <LayoutDashboard className="w-4 h-4" /> Tổng quan
          </NavLink>

          {resourceGroups.map((group) => {
            const items = resourceDefs.filter((r) => r.group === group);
            if (!items.length) return null;
            return (
              <div key={group}>
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {group}
                </p>
                <div className="space-y-0.5">
                  {items.map((r) => {
                    const Icon = r.icon;
                    return (
                      <NavLink
                        key={r.slug}
                        to={`/admin/${r.slug}`}
                        className={linkClass}
                        onClick={() => setOpen(false)}
                      >
                        <Icon className="w-4 h-4 shrink-0" /> {r.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setOpen(true)}>
            {open ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="text-xs font-semibold text-[#1B5FA8] hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Xem website
            </Link>
            <span className="text-sm text-slate-600 hidden sm:block">
              {user?.name || user?.email}
            </span>
            <button
              onClick={doLogout}
              className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
