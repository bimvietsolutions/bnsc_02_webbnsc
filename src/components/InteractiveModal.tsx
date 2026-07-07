import React, { useState, useEffect } from 'react';
import { X, Check, Laptop, ShieldCheck, Download, Loader2, Play, Users, MapPin, Send, HelpCircle } from 'lucide-react';
import { apiSend } from '../lib/api';

interface InteractiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'download' | 'login' | 'register' | 'consult';
  selectedProductId?: string;
}

export default function InteractiveModal({ isOpen, onClose, initialTab = 'download', selectedProductId }: InteractiveModalProps) {
  const [activeTab, setActiveTab] = useState<'download' | 'login' | 'register' | 'consult'>(initialTab);
  
  // Form values
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('TP. Hồ Chí Minh');
  const [company, setCompany] = useState('');
  const [course, setCourse] = useState('dutoan-thucchien');
  
  // Interactive simulator states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDone, setIsDone] = useState(false);

  // Sync tab state when modal is toggled
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsDone(false);
      setSimulatedProgress(0);
      setIsSubmitting(false);
      setErrorMessage('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // List of Vietnamese Southern & Central key construction provinces
  const provinces = [
    'TP. Hồ Chí Minh', 'Cần Thơ', 'Vĩnh Long', 'An Giang', 'Đắk Lắk', 
    'Tây Ninh', 'Khánh Hòa', 'Gia Lai', 'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu'
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Quick structural validations
    if (!fullName || !phone || !email) {
      setErrorMessage('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    setIsSubmitting(true);

    // Lưu lead về DB (không chặn luồng UX mô phỏng bên dưới).
    const typeMap: Record<string, 'DOWNLOAD' | 'REGISTER' | 'CONSULT'> = {
      download: 'DOWNLOAD',
      register: 'REGISTER',
      consult: 'CONSULT',
    };
    const leadType = typeMap[activeTab];
    if (leadType) {
      apiSend('/api/public/leads', 'POST', {
        type: leadType,
        fullName,
        phone,
        email,
        province,
        company,
        productSlug: selectedProductId || undefined,
        courseSlug: activeTab === 'consult' ? course : undefined,
        source: `modal:${activeTab}`,
      }).catch(() => {
        /* im lặng: vẫn giữ trải nghiệm nếu API lỗi */
      });
    }

    if (activeTab === 'download') {
      // Simulate file download bar increments
      let progress = 0;
      const interval = setInterval(() => {
        progress += 8;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setIsSubmitting(false);
          setIsDone(true);
        }
        setSimulatedProgress(progress);
      }, 120);
    } else {
      // Simulate login / register/ consult appointments delays
      setTimeout(() => {
        setIsSubmitting(false);
        setIsDone(true);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark frosted overlay */}
      <div 
        className="absolute inset-0 bg-[#060f1e]/85 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-[#E1E5ED] overflow-hidden flex flex-col text-[#1A2332] animate-scaleUp z-10 text-left">
        
        {/* Top ribbon highlight */}
        <div className="h-1.5 bg-gradient-to-r from-[#1B5FA8] to-[#F5A623] w-full" />

        {/* Modal Header */}
        <div className="p-6 border-b border-[#E1E5ED] flex items-center justify-between bg-[#F7F9FC]">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#1B5FA8] uppercase font-bold">
              Cổng dịch vụ Bắc Nam
            </span>
            <h3 className="text-xl font-extrabold text-[#0B2545] tracking-tight mt-0.5">
              {activeTab === 'download' && 'Tải Phần Mềm Dự Toán BNSC'}
              {activeTab === 'login' && 'Đăng Nhập Khách Hàng'}
              {activeTab === 'register' && 'Đăng Ký Bản Quyền'}
              {activeTab === 'consult' && 'Đăng Ký Đào Tạo & Tư Vấn'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-[#0B2545] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Inner Tab Selection (Show only if not completed) */}
        {!isDone && (
          <div className="flex border-b border-[#E1E5ED] text-sm font-semibold bg-gray-50 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('download'); setErrorMessage(''); }}
              className={`flex-1 py-3 px-4 border-b-2 text-center whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'download' 
                  ? 'border-[#F5A623] text-[#0B2545] bg-white font-bold' 
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              📥 Tải dùng thử
            </button>
            <button
              onClick={() => { setActiveTab('consult'); setErrorMessage(''); }}
              className={`flex-1 py-3 px-4 border-b-2 text-center whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'consult' 
                  ? 'border-[#F5A623] text-[#0B2545] bg-white font-bold' 
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              📊 Đăng ký Học/Tư vấn
            </button>
            <button
              onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
              className={`flex-1 py-3 px-4 border-b-2 text-center whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'login' 
                  ? 'border-[#F5A623] text-[#0B2545] bg-white font-bold' 
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              🔑 Đăng nhập
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
              className={`flex-1 py-3 px-4 border-b-2 text-center whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'register' 
                  ? 'border-[#F5A623] text-[#0B2545] bg-white font-bold' 
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              ✨ Đăng ký khóa mới
            </button>
          </div>
        )}

        {/* Modal Main Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {isDone ? (
            /* Successful Interaction Screen */
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              
              {activeTab === 'download' ? (
                <>
                  <h4 className="text-xl font-bold text-[#0B2545] mb-2">Đăng ký thông tin thành công!</h4>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto mb-6">
                    Đường truyền dữ liệu tải xuống an toàn của Bắc Nam Software đang gửi bộ cài đặt tới máy tính của bạn.
                  </p>
                  
                  <div className="bg-[#F7F9FC] border border-[#E1E5ED] rounded-xl p-4 w-full text-left space-y-3.5 mb-6">
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-[#1B5FA8] shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs text-gray-400 block font-semibold uppercase">Tập tin tải về</span>
                        <span className="text-sm font-extrabold text-[#0B2545] break-all">DutoanBNSC_Setup_v1.20_Full_2026.zip</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-[#E1E5ED]">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs text-emerald-600 block font-bold uppercase">Chứng chỉ số an toàn SHA-256</span>
                        <span className="text-xs text-[#5A6475] font-mono select-all">Verified MD5: e2efbfcc5b364db3bd9db8</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#5A6475] italic leading-relaxed">
                    * Nếu quá trình tải xuống không bắt đầu tự động, vui lòng kiểm tra hộp thư email <strong className="font-semibold text-[#0B2545]">{email}</strong> để nhận liên kết thay thế trực tiếp từ máy chủ BNSC cloud.
                  </p>
                </>
              ) : activeTab === 'consult' ? (
                <>
                  <h4 className="text-xl font-bold text-[#0B2545] mb-2">Gửi lịch đăng ký thành công!</h4>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto mb-6">
                    Chuyên viên tư vấn xây dựng của Bắc Nam Software đã ghi nhận phiếu đăng ký của anh/chị <strong className="font-bold text-[#0B2545]">{fullName}</strong>.
                  </p>
                  <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl p-4 w-full text-emerald-800 text-sm font-medium">
                    📍 Điện thoại viên sẽ liên hệ lại qua SĐT <strong className="font-bold font-mono">{phone}</strong> trong vòng 15-30 phút để xác thực đăng ký giáo trình khóa học &amp; áp mã giảm giá 15%.
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-xl font-bold text-[#0B2545] mb-2">Kết nối hệ thống thành công!</h4>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto mb-6">
                    Chào mừng <strong className="font-bold text-[#0B2545]">{fullName || email}</strong> quay trở lại mạng lưới dự toán BNSC.
                  </p>
                  <div className="bg-[#E3F2FD] border border-[#BBDEFB] rounded-xl p-4 w-full text-sky-800 text-sm font-medium">
                    📂 Bạn đã truy cập cơ sở dữ liệu khóa bản quyền phần cứng. Đang chuyển hướng sang trang quản lý chỉ số Đơn giá sở Xây dựng...
                  </div>
                </>
              )}

              <button
                onClick={onClose}
                className="mt-8 bg-[#0B2545] hover:bg-[#1B5FA8] text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Đóng hộp thoại
              </button>
            </div>
          ) : (
            /* Forms Input Views */
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3.5 rounded-xl">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Informative tips based on current action tab */}
              {activeTab === 'download' && (
                <div className="text-xs text-slate-500 bg-[#1B5FA8]/5 border border-[#1B5FA8]/10 p-3 rounded-xl leading-normal">
                  💡 Nhập thông tin để nhận miễn phí khóa cứng ảo bản quyền học tập v1.20 kèm bộ dữ liệu đơn giá mới nhất của 63 Tỉnh thành cả nước.
                </div>
              )}

              {activeTab === 'consult' && (
                <div className="text-xs text-slate-500 bg-purple-50 border border-purple-100 p-3 rounded-xl leading-normal">
                  🎓 Các khóa chiêu sinh bồi dưỡng do trực tiếp giảng viên/ kỹ sư dày dặn thâm niên công phu hướng dẫn. Học viên được tài trợ trọn đời license Dự Toán BNSC.
                </div>
              )}

              {/* Common Fields: Name */}
              {activeTab !== 'login' && (
                <div>
                  <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5">
                    Họ & tên học viên / kỹ sư <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-[#E1E5ED] rounded-xl px-4 py-3 text-sm text-[#1A2332] focus:outline-none focus:border-[#1B5FA8] focus:ring-1 focus:ring-[#1B5FA8] transition-all"
                  />
                </div>
              )}

              {/* Double Column layout for Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5">
                    Số điện thoại liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="09xx.xxx.xxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-[#E1E5ED] rounded-xl px-4 py-3 text-sm text-[#1A2332] focus:outline-none focus:border-[#1B5FA8] focus:ring-1 focus:ring-[#1B5FA8] transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5">
                    Địa chỉ Email liên lạc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="kySuXaydung@bacnam.com.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#E1E5ED] rounded-xl px-4 py-3 text-sm text-[#1A2332] focus:outline-none focus:border-[#1B5FA8] focus:ring-1 focus:ring-[#1B5FA8] transition-all font-mono"
                  />
                </div>
              </div>

              {/* Extra Course field if we are registering consultancy */}
              {activeTab === 'consult' && (
                <div>
                  <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5">
                    Khóa đào tạo nghiệp vụ lựa chọn
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-white border border-[#E1E5ED] rounded-xl px-4 py-3 text-sm text-[#1A2332] focus:outline-none focus:border-[#1B5FA8] transition-all"
                  >
                    <option value="dutoan-thucchien">🏗️ Khóa lập Dự toán & Đo bóc khối lượng công trình</option>
                    <option value="dauthau-mang">💻 Nghiệp vụ Hồ Sơ Bìa & Đấu thầu qua mạng mới</option>
                    <option value="thanh-quyettoan">📐 Thanh quyết toán vốn đầu tư xây dựng</option>
                    <option value="tuvan-dongia">📜 Hợp tác xây dựng Đơn giá - Chỉ số giá (Sở XD)</option>
                  </select>
                </div>
              )}

              {/* Province Picker & Enterprise fields */}
              {activeTab !== 'login' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5">
                      Đơn giá Địa phương cần áp dụng
                    </label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full bg-white border border-[#E1E5ED] rounded-xl px-4 py-3 text-sm text-[#1A2332] focus:outline-none focus:border-[#1B5FA8] transition-all"
                    >
                      {provinces.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5">
                      Cơ quan / Doanh nghiệp hoạt động
                    </label>
                    <input
                      type="text"
                      placeholder="vd: Tổng Công ty CP Xây Dựng 1"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-white border border-[#E1E5ED] rounded-xl px-4 py-3 text-sm text-[#1A2332] focus:outline-none focus:border-[#1B5FA8] transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Password prompt only if logging in */}
              {activeTab === 'login' && (
                <div>
                  <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5">
                    Mật khẩu truy cập
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full bg-white border border-[#E1E5ED] rounded-xl px-4 py-3 text-sm text-[#1A2332] focus:outline-none focus:border-[#1B5FA8] focus:ring-1 focus:ring-[#1B5FA8] transition-all"
                  />
                  <div className="flex items-center justify-between mt-2.5">
                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                      <input type="checkbox" className="rounded text-[#1B5FA8]" /> Ghi nhớ đăng nhập
                    </label>
                    <a href="#reset" className="text-xs text-[#1B5FA8] hover:underline">Quên mật khẩu?</a>
                  </div>
                </div>
              )}

              {/* Terms of construction software usage disclaimer */}
              <p className="text-[10px] text-gray-400 leading-normal text-left pt-2">
                Bằng việc nhấp lệnh nộp hồ sơ, anh/chị đồng thuận cho phép Bắc Nam cung cấp tư vấn chính sách và bảo mật số điện thoại theo đúng Luật An toàn thông tin mạng hiện hành.
              </p>

              {/* Submit Buttons / Progress Bars simulation */}
              <div className="pt-4 border-t border-[#E1E5ED] mt-6 flex flex-col sm:flex-row items-center gap-3">
                {isSubmitting ? (
                  <div className="w-full">
                    {activeTab === 'download' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-[#1B5FA8] flex items-center gap-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang thiết lập tải gói setup...
                          </span>
                          <span className="text-gray-500">{simulatedProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-[#F5A623] h-full rounded-full transition-all duration-100" 
                            style={{ width: `${simulatedProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full bg-slate-100 text-slate-400 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mb-2"
                      >
                        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                        Vui lòng chờ trong giây lát...
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      type="submit"
                      className="w-full sm:flex-1 bg-[#0B2545] hover:bg-[#1B5FA8] text-white font-extrabold py-3.5 px-6 rounded-xl text-sm transition-all shadow-lg text-center cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                    >
                      {activeTab === 'download' && '📥 Bắt đầu tải bản v1.20'}
                      {activeTab === 'consult' && '🚀 Gửi thông tin đăng ký'}
                      {activeTab === 'login' && '🔑 Đăng nhập tài khoản'}
                      {activeTab === 'register' && '✨ Nhận khóa bản quyền'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-6 py-3.5 border border-[#E1E5ED] text-gray-500 hover:text-black font-semibold rounded-xl text-sm transition-colors cursor-pointer text-center"
                    >
                      Bỏ qua
                    </button>
                  </>
                )}
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
