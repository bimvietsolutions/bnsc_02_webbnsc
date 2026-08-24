/**
 * components/LoginPage.tsx — Trang đăng nhập /dang-nhap.
 *
 * Đây là trang đăng nhập DUY NHẤT của hệ thống: cả mật khẩu lẫn Google đều đổ
 * về cùng một phiên quản trị (cookie httpOnly do máy chủ đặt). /admin/login chỉ
 * còn là chuyển hướng về đây.
 *
 * Trước đây trang này chỉ là bản dựng giao diện: bấm Đăng nhập thì chờ 1,5 giây
 * rồi hiện "Đăng nhập thành công" mà không gọi API, không đặt cookie, không
 * chuyển trang — dễ khiến người dùng tưởng đã vào được.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Check, ArrowLeft, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import Seo from '../seo/Seo';
import { authConfig, authGoogle, authLogin, authMe, loadGoogleScript, safeNextPath } from '../lib/adminAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNextPath(searchParams.get('next'));

  const onBackToHome = () => navigate('/');
  const onRegisterClick = () => navigate('/?modal=register');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [showResetHint, setShowResetHint] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Đã có phiên đăng nhập thì vào thẳng, khỏi bắt nhập lại.
  useEffect(() => {
    let cancelled = false;
    authMe()
      .then(() => {
        if (!cancelled) navigate(next, { replace: true });
      })
      .catch(() => {
        if (!cancelled) setCheckingSession(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate, next]);

  // Nút "Đăng nhập bằng Google" chỉ hiện khi máy chủ có GOOGLE_CLIENT_ID.
  // rememberMe đọc qua ref để không phải khởi tạo lại nút mỗi lần tick ô đó.
  const rememberRef = useRef(rememberMe);
  rememberRef.current = rememberMe;

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
            setFormError('');
            setIsLoading(true);
            try {
              await authGoogle(credential, rememberRef.current);
              navigate(next, { replace: true });
            } catch (err: any) {
              setFormError(err?.message || 'Đăng nhập bằng Google thất bại.');
            } finally {
              setIsLoading(false);
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
        /* Không cấu hình Google -> chỉ còn đăng nhập bằng mật khẩu. */
      });
    return () => {
      cancelled = true;
    };
  }, [navigate, next]);

  const validateField = (name: 'email' | 'password', value: string) => {
    let err = '';
    if (name === 'email') {
      if (!value.trim()) err = 'Email không được để trống';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) err = 'Email không đúng định dạng';
    } else if (!value) {
      err = 'Mật khẩu không được để trống';
    }
    setErrors((prev) => ({ ...prev, [name]: err }));
    return !err;
  };

  const handleBlur = (name: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, name === 'email' ? email : password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setFormError('');

    const okEmail = validateField('email', email);
    const okPass = validateField('password', password);
    if (!okEmail || !okPass) return;

    setIsLoading(true);
    try {
      await authLogin(email.trim(), password, rememberMe);
      navigate(next, { replace: true });
    } catch (err: any) {
      setFormError(err?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field: 'email' | 'password', extraPadding = 'pr-4') =>
    `w-full h-11 bg-white border rounded-lg pl-10 ${extraPadding} text-sm text-[#1A2332] placeholder-gray-400 focus:outline-none transition-all ${
      touched[field]
        ? errors[field]
          ? 'border-[#ef4444] focus:ring-1 focus:ring-red-500'
          : 'border-[#22c55e] focus:ring-1 focus:ring-emerald-500'
        : 'border-[#E2E8F0] focus:border-[#2272C3] focus:ring-3 focus:ring-[#2272C3]/12'
    }`;

  return (
    <>
      <Seo
        title="Đăng nhập"
        description="Đăng nhập hệ thống quản trị nội dung Bắc Nam Software."
        path="/dang-nhap"
        noindex
      />
      <div id="login-module" className="min-h-screen w-full bg-[#F7F9FC] flex overflow-hidden font-sans relative">
        <button
          onClick={onBackToHome}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/95 border border-[#E2E8F0] hover:border-[#1B5FA8] hover:text-[#1B5FA8] px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 w-full">
          {/* CỘT TRÁI: bảng thương hiệu (ẩn trên mobile) */}
          <div className="hidden md:flex flex-col justify-between p-12 lg:p-16 relative overflow-hidden bg-gradient-to-br from-[#0B2545] to-[#1B5FA8] text-white text-left">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,114,195,0.25),transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 hero-grid opacity-15 pointer-events-none" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 shrink-0">
                <img
                  src="/brand/logo.png"
                  alt="Bac Nam Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-sm tracking-wider uppercase">Bắc Nam Software</span>
            </div>

            <div className="relative z-10 my-auto max-w-md space-y-6">
              <span className="text-xs uppercase tracking-widest text-[#F5A623] font-bold">
                Công nghệ đo bóc tối ưu
              </span>

              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                Phần mềm Dự toán <br />
                Xây dựng Chuyên nghiệp
              </h2>

              <p className="text-white/60 text-sm leading-relaxed">
                Giải pháp lập &amp; thẩm định dự toán tối ưu, bám sát các nghị định, chỉ thị hướng dẫn
                của ban ngành và Bộ Xây dựng Việt Nam.
              </p>

              <div className="w-10 h-1 bg-[#F5A623] rounded-full" />

              <ul className="space-y-4 pt-2">
                {[
                  'Cập nhật chính xác đơn giá 63 tỉnh thành',
                  'Đồng bộ Thông tư BXD mới nhất',
                  'Chế độ Hỗ trợ kỹ thuật chuyên gia 24/7',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="p-0.5 rounded-full bg-[#F5A623]/20 text-[#F5A623] shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs text-white/55">
              <span className="px-3 py-1.5 rounded-lg bg-white/10 font-bold backdrop-blur-sm">
                🛡️ Phiên bản v1.20
              </span>
              <span className="font-medium font-mono">BNSC Secure Portal</span>
            </div>
          </div>

          {/* CỘT PHẢI: biểu mẫu đăng nhập */}
          <div className="flex flex-col justify-center bg-white p-6 sm:p-12 lg:p-16 min-h-screen relative">
            <div className="md:hidden absolute top-0 left-0 right-0 h-[30vh] bg-gradient-to-b from-[#0B2545] to-[#1B5FA8] p-6 text-white flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <button
                  onClick={onBackToHome}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Trang chủ
                </button>
                <span className="text-xs font-bold text-[#F5A623]">Phiên bản v1.20</span>
              </div>

              <div className="pb-10 text-center">
                <h1 className="text-xl font-bold">Phần mềm Dự toán BNSC</h1>
                <p className="text-xs text-white/70 mt-1">Đăng nhập hệ thống quản trị</p>
              </div>
            </div>

            <div className="relative z-10 w-full max-w-sm mx-auto mt-[16vh] md:mt-0">
              <div className="text-center mb-6">
                <img
                  src="/brand/logo.png"
                  alt="BNSC Logo"
                  className="h-16 mx-auto object-contain drop-shadow-sm"
                />
              </div>

              <div className="text-center md:text-left mb-6">
                <h3 className="text-2xl font-extrabold text-[#0B2545] tracking-tight">Đăng nhập</h3>
                <p className="text-xs text-[#5A6475] mt-1.5 leading-normal">
                  Dành cho quản trị viên nội dung website. Đăng nhập bằng mật khẩu hoặc tài khoản
                  Google đã được cấp quyền.
                </p>
              </div>

              <div className="border-t border-[#E2E8F0] my-5" />

              {checkingSession ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#5A6475]">
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang kiểm tra phiên đăng nhập…
                </div>
              ) : (
                <>
                  {formError && (
                    <div
                      role="alert"
                      className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 mb-4 text-rose-700 text-xs font-semibold leading-relaxed flex items-start gap-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="login-email"
                        className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5 text-left"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          id="login-email"
                          type="email"
                          name="email"
                          autoComplete="email"
                          placeholder="admin@bacnam.com.vn"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (touched.email) validateField('email', e.target.value);
                          }}
                          onBlur={() => handleBlur('email')}
                          className={inputClass('email')}
                        />
                      </div>
                      {touched.email && errors.email && (
                        <p className="text-red-500 text-[11px] font-semibold mt-1.5 text-left">
                          ⚠️ {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="login-password"
                        className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5 text-left"
                      >
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          autoComplete="current-password"
                          placeholder="Mật khẩu của bạn"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (touched.password) validateField('password', e.target.value);
                          }}
                          onBlur={() => handleBlur('password')}
                          className={inputClass('password', 'pr-10')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {touched.password && errors.password && (
                        <p className="text-red-500 text-[11px] font-semibold mt-1.5 text-left">
                          ⚠️ {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1.5">
                      <label className="flex items-center gap-2 text-[#5A6475] font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-[#E2E8F0] text-[#1B5FA8] focus:ring-[#1B5FA8]"
                        />
                        Ghi nhớ đăng nhập
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowResetHint((v) => !v)}
                        className="text-[#1B5FA8] font-bold hover:underline"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>

                    {showResetHint && (
                      <p className="text-[11px] text-[#5A6475] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 leading-relaxed">
                        Hệ thống chưa có chức năng tự đặt lại mật khẩu. Vui lòng liên hệ quản trị viên
                        để được cấp lại.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-[#F5A623] hover:bg-[#D4891A] text-[#0B2545] font-extrabold rounded-[9px] text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang đăng nhập…</span>
                        </>
                      ) : (
                        <span>Đăng nhập</span>
                      )}
                    </button>
                  </form>

                  {/* Đăng nhập bằng Google — chỉ hiện khi máy chủ cấu hình GOOGLE_CLIENT_ID */}
                  <div className={googleEnabled ? 'block' : 'hidden'}>
                    <div className="relative my-7 flex items-center justify-center">
                      <span className="absolute inset-x-0 h-px bg-slate-200" />
                      <span className="relative bg-white px-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        hoặc
                      </span>
                    </div>
                  </div>
                  <div ref={googleBtnRef} className="flex justify-center" />

                  <div className="relative my-7 flex items-center justify-center">
                    <span className="absolute inset-x-0 h-px bg-slate-200" />
                    <span className="relative bg-white px-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      chưa có tài khoản?
                    </span>
                  </div>

                  <button
                    onClick={onRegisterClick}
                    className="w-full h-11 bg-transparent border border-[#E2E8F0] hover:border-[#1B5FA8] text-gray-700 hover:text-[#1B5FA8] font-bold rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    Đăng ký
                  </button>
                </>
              )}

              <div className="mt-12 text-center text-[10px] text-slate-400 font-medium">
                © 2026 Bắc Nam Software · bacnam.com.vn
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
