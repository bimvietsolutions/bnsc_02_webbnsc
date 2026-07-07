/**
 * admin/Dashboard.tsx — Tổng quan số liệu.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, BookOpen, Package, Inbox, Users, GraduationCap, Loader2 } from 'lucide-react';
import { adminStats } from './api';

const cards = [
  { key: 'news', label: 'Tin tức', icon: Newspaper, to: '/admin/news', color: 'bg-sky-500' },
  { key: 'library', label: 'Bài thư viện', icon: BookOpen, to: '/admin/library', color: 'bg-emerald-500' },
  { key: 'products', label: 'Sản phẩm', icon: Package, to: '/admin/products', color: 'bg-violet-500' },
  { key: 'customers', label: 'Khách hàng', icon: Users, to: '/admin/customers', color: 'bg-amber-500' },
  { key: 'courses', label: 'Khóa học', icon: GraduationCap, to: '/admin/courses', color: 'bg-rose-500' },
  { key: 'leads', label: 'Lead', icon: Inbox, to: '/admin/leads', color: 'bg-[#0B2545]' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminStats()
      .then((s) => setStats(s as Record<string, number>))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[#0B2545] mb-1">Tổng quan</h1>
      <p className="text-sm text-slate-500 mb-6">Quản trị toàn bộ nội dung website Bắc Nam Software.</p>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Đang tải số liệu…
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            const value = stats?.[c.key] ?? 0;
            return (
              <Link
                key={c.key}
                to={c.to}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow flex items-center gap-4"
              >
                <div className={`w-11 h-11 rounded-xl text-white flex items-center justify-center ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#0B2545] tabular-nums">{value}</p>
                  <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                </div>
                {c.key === 'leads' && (stats?.newLeads ?? 0) > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                    {stats?.newLeads} mới
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
