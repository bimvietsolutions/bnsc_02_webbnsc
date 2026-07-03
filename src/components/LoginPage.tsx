import React, { useState } from 'react';
import { Eye, EyeOff, Check, ArrowLeft, Loader2, Smartphone, ShieldCheck, Mail, Lock } from 'lucide-react';

interface LoginPageProps {
  onBackToHome: () => void;
  onRegisterClick?: () => void;
}

export default function LoginPage({ onBackToHome, onRegisterClick }: LoginPageProps) {
  // Field values
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [successMessage, setSuccessMessage] = useState('');

  const validateField = (name: 'username' | 'password', value: string) => {
    let err = '';
    if (name === 'username') {
      if (!value.trim()) {
        err = 'Tên đăng nhập hoặc email không được để trống';
      } else if (value.length < 4) {
        err = 'Tên đăng nhập tối thiểu 4 ký tự';
      }
    } else {
      if (!value) {
        err = 'Mật khẩu không được để trống';
      } else if (value.length < 6) {
        err = 'Mật khẩu tối thiểu 6 ký tự để đảm bảo an toàn';
      }
    }
    setErrors(prev => ({ ...prev, [name]: err }));
    return !err;
  };

  const handleBlur = (name: 'username' | 'password') => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, name === 'username' ? username : password);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    const isUserValid = validateField('username', username);
    const isPassValid = validateField('password', password);

    if (!isUserValid || !isPassValid) return;

    // Trigger loading spinner demo (1.5s delay)
    setIsLoading(true);
    setSuccessMessage('');

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Đăng nhập thành công! Kết nối máy chủ Dự toán BNSC thành công.');
    }, 1500);
  };

  return (
    <div id="login-module" className="min-h-screen w-full bg-[#F7F9FC] flex overflow-hidden font-sans relative">
      
      {/* Absolute Back Link for preview escape */}
      <button 
        onClick={onBackToHome}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/95 border border-[#E2E8F0] hover:border-[#1B5FA8] hover:text-[#1B5FA8] px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
      </button>

      {/* 2-Side grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full">
        
        {/* LEFT COLUMN: BRANDING PANEL (Hidden on Mobile) */}
        <div className="hidden md:flex flex-col justify-between p-12 lg:p-16 relative overflow-hidden bg-gradient-to-br from-[#0B2545] to-[#1B5FA8] text-white text-left">
          
          {/* Accent mesh background overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,114,195,0.25),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 hero-grid opacity-15 pointer-events-none" />

          {/* Top Line Brand */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 shrink-0">
              <img 
                src="https://bacnam.com.vn/uploads/logo/logo_60b98e41a181e3.png" 
                alt="Bac Nam Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-extrabold text-sm tracking-wider uppercase">Bắc Nam Software</span>
          </div>

          {/* Centered Pitch Message */}
          <div className="relative z-10 my-auto max-w-md space-y-6">
            
            <span className="text-xs uppercase tracking-widest text-[#F5A623] font-bold">
              Công nghệ đo bóc tối ưu
            </span>
            
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Phần mềm Dự toán <br />
              Xây dựng Chuyên nghiệp
            </h2>
            
            <p className="text-white/60 text-sm leading-relaxed">
              Giải pháp lập &amp; thẩm định dự toán tối ưu, bám sát các nghị định, chỉ thị hướng dẫn của ban ngành và Bộ Xây dựng Việt Nam.
            </p>

            {/* Micro Gold Line divider */}
            <div className="w-10 h-1 bg-[#F5A623] rounded-full" />

            {/* List items with checkmarks */}
            <ul className="space-y-4 pt-2">
              <li className="flex items-center gap-3 text-sm">
                <div className="p-0.5 rounded-full bg-[#F5A623]/20 text-[#F5A623] shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <span>Cập nhật chính xác đơn giá 63 tỉnh thành</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="p-0.5 rounded-full bg-[#F5A623]/20 text-[#F5A623] shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <span>Đồng bộ Thông tư BXD mới nhất</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="p-0.5 rounded-full bg-[#F5A623]/20 text-[#F5A623] shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <span>Chế độ Hỗ trợ kỹ thuật chuyên gia 24/7</span>
              </li>
            </ul>

          </div>

          {/* Bottom Version Indicator */}
          <div className="relative z-10 flex items-center justify-between text-xs text-white/55">
            <span className="px-3 py-1.5 rounded-lg bg-white/10 font-bold backdrop-blur-sm">🛡️ Phiên bản v1.20</span>
            <span className="font-medium font-mono">BNSC Secure Portal</span>
          </div>

        </div>

        {/* RIGHT COLUMN: LOGIN FORM PANEL */}
        <div className="flex flex-col justify-center bg-white p-6 sm:p-12 lg:p-16 min-h-screen relative">
          
          {/* Mobile-only background gradient header (30vh decoration as specified) */}
          <div className="md:hidden absolute top-0 left-0 right-0 h-[30vh] bg-gradient-to-b from-[#0B2545] to-[#1B5FA8] p-6 text-white flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <button 
                onClick={onBackToHome}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Thống kê
              </button>
              <span className="text-xs font-bold text-[#F5A623]">Phiên bản v1.20</span>
            </div>
            
            <div className="pb-10 text-center">
              <h1 className="text-xl font-bold">Phần mềm Dự toán BNSC</h1>
              <p className="text-xs text-white/70 mt-1">Đăng nhập tài khoản cơ sở dữ liệu</p>
            </div>
          </div>

          {/* Form Scroll Container */}
          <div className="relative z-10 w-full max-w-sm mx-auto mt-[16vh] md:mt-0">
            
            {/* Real Logo from URL header */}
            <div className="text-center mb-6">
              <img 
                src="https://bacnam.com.vn/uploads/logo/logo_60b98e41a181e3.png" 
                alt="BNSC Logo" 
                referrerPolicy="no-referrer"
                className="h-16 mx-auto object-contain drop-shadow-sm"
              />
            </div>

            {/* Title & Muted details */}
            <div className="text-center md:text-left mb-6">
              <h3 className="text-2xl font-extrabold text-[#0B2545] tracking-tight">
                Đăng nhập
              </h3>
              <p className="text-xs text-[#5A6475] mt-1.5 leading-normal">
                Chào mừng trở lại! Vui lòng đăng nhập để đồng bộ cơ sở dữ liệu khóa cứng và hồ sơ công trình của bạn.
              </p>
            </div>

            <div className="border-t border-[#E2E8F0] my-5" />

            {/* Success Prompt */}
            {successMessage && (
              <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl p-4 mb-4 text-emerald-800 text-xs font-semibold leading-relaxed">
                🎉 {successMessage}
              </div>
            )}

            {/* Interactive Login Input form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Field A: Username or Email */}
              <div>
                <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5 text-left">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="username"
                    placeholder="Nhập tên đăng nhập hoặc email"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (touched.username) validateField('username', e.target.value);
                    }}
                    onBlur={() => handleBlur('username')}
                    className={`w-full h-11 bg-white border rounded-lg pl-10 pr-4 text-sm text-[#1A2332] placeholder-gray-400 focus:outline-none transition-all ${
                      touched.username
                        ? errors.username
                          ? 'border-[#ef4444] focus:ring-1 focus:ring-red-500'
                          : 'border-[#22c55e] focus:ring-1 focus:ring-emerald-500'
                        : 'border-[#E2E8F0] focus:border-[#2272C3] focus:ring-3 focus:ring-[#2272C3]/12'
                    }`}
                  />
                </div>
                {touched.username && errors.username && (
                  <p className="text-red-500 text-[11px] font-semibold mt-1.5 text-left">
                    ⚠️ {errors.username}
                  </p>
                )}
              </div>

              {/* Field B: Passwords with visibility toggles */}
              <div>
                <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5 text-left">
                  Mật khẩu đăng nhập <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Mật khẩu của bạn"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) validateField('password', e.target.value);
                    }}
                    onBlur={() => handleBlur('password')}
                    className={`w-full h-11 bg-white border rounded-lg pl-10 pr-10 text-sm text-[#1A2332] placeholder-gray-400 focus:outline-none transition-all ${
                      touched.password
                        ? errors.password
                          ? 'border-[#ef4444] focus:ring-1 focus:ring-red-500'
                          : 'border-[#22c55e] focus:ring-1 focus:ring-emerald-500'
                        : 'border-[#E2E8F0] focus:border-[#2272C3] focus:ring-3 focus:ring-[#2272C3]/12'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-500 text-[11px] font-semibold mt-1.5 text-left">
                    ⚠️ {errors.password}
                  </p>
                )}
              </div>

              {/* Remember State / Forget link */}
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
                <a 
                  href="#reset" 
                  onClick={(e) => { e.preventDefault(); alert("Hệ thống khôi phục mật khẩu đã được liên kết với số điện thoại đăng ký ban đầu. Vui lòng liên hệ Hotline BNSC."); }}
                  className="text-[#1B5FA8] font-bold hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>

              {/* Action Button: Loading spinners triggered */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#F5A623] hover:bg-[#D4891A] text-[#0B2545] font-extrabold rounded-[9px] text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Đang kết kết nối...</span>
                  </>
                ) : (
                  <span>Đăng nhập</span>
                )}
              </button>

            </form>

            {/* Separator block */}
            <div className="relative my-7 flex items-center justify-center">
              <span className="absolute inset-x-0 h-px bg-slate-200" />
              <span className="relative bg-white px-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                hoặc
              </span>
            </div>

            {/* Ghost style Registration redirect button */}
            <button
              onClick={onRegisterClick || onBackToHome}
              className="w-full h-11 bg-transparent border-1.5 border-[#E2E8F0] hover:border-[#1B5FA8] text-gray-700 hover:text-[#1B5FA8] font-bold rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              Đăng ký tài khoản mới bảo quyền
            </button>

            {/* Small Footer Signature */}
            <div className="mt-12 text-center text-[10px] text-slate-400 font-medium">
              © 2026 Bắc Nam Software · bacnam.com.vn
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
