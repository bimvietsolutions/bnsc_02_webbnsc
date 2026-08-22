/**
 * admin/AdminLogin.tsx — Đăng nhập trang quản trị (mật khẩu + Google).
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from './AuthContext';
import { authConfig } from './api';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

/** Tải script Google Identity Services một lần rồi tái sử dụng. */
function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('gis-load-failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('gis-load-failed'));
    document.head.appendChild(s);
  });
}

export default function AdminLogin() {
  const { login, loginWithGoogle } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo nút "Đăng nhập bằng Google" nếu máy chủ có cấu hình Client ID.
  useEffect(() => {
    let cancelled = false;
    authConfig()
      .then(async ({ googleClientId }) => {
        if (!googleClientId || cancelled) return;
        await loadGoogleScript();
        if (cancelled || !window.google || !googleBtnRef.current) return;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async ({ credential }) => {
            setError('');
            try {
              await loginWithGoogle(credential);
              navigate('/admin');
            } catch (err: any) {
              setError(err?.message || 'Đăng nhập bằng Google thất bại.');
            }
          },
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          shape: 'rectangular',
          locale: 'vi',
        });
        setGoogleEnabled(true);
      })
      .catch(() => {
        /* Không có cấu hình Google -> chỉ hiện đăng nhập mật khẩu. */
      });
    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B2545] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#0B2545] text-[#F5A623] flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-extrabold text-[#0B2545]">BNSC Admin</h1>
          <p className="text-xs text-slate-500 mt-1">Hệ thống quản trị nội dung</p>
        </div>

        {error && (
          <div className="mb-4 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wide">Email</span>
            <div className="relative mt-1.5">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 border border-slate-200 rounded-lg pl-10 pr-3 text-sm focus:border-[#1B5FA8] focus:outline-none"
                placeholder="admin@bacnam.com.vn"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wide">Mật khẩu</span>
            <div className="relative mt-1.5">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 border border-slate-200 rounded-lg pl-10 pr-3 text-sm focus:border-[#1B5FA8] focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#F5A623] hover:bg-[#E09413] text-[#0B2545] font-extrabold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Đăng nhập
          </button>
        </form>

        {/* Đăng nhập bằng Google (chỉ hiện khi máy chủ cấu hình GOOGLE_CLIENT_ID) */}
        <div className={googleEnabled ? 'block' : 'hidden'}>
          <div className="mt-5 flex items-center gap-3 text-slate-300">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase">hoặc</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </div>
        <div ref={googleBtnRef} className="mt-4 flex justify-center" />
      </div>
    </div>
  );
}
