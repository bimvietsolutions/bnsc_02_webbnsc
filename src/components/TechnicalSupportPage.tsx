import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  Download,
  Users,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Cpu,
  Grid,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileDown,
  X
} from 'lucide-react';
import Seo from '../seo/Seo';
import { useApi } from '../lib/api';
import { supportFallback, faqsSupportFallback } from '../lib/publicData';

export default function TechnicalSupportPage() {
  const navigate = useNavigate();
  const onBackToHome = () => navigate('/');
  const [activeTab, setActiveTab] = useState<'all' | 'software' | 'documents'>('all');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [showVchatBanner, setShowVchatBanner] = useState(true);

  // Dynamically load vChat.vn Integration
  useEffect(() => {
    // Standard vChat.vn embed code configuration
    const scriptId = 'bnsc-vchat-addon';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = 'https://vchat.vn/service/embed.js?v=68051'; // Integrated vChat.vn identifier
      script.async = true;
      document.body.appendChild(script);
    }

    // Auto scroll to top
    window.scrollTo(0, 0);

    return () => {
      // Keep it loaded or let it run
    };
  }, []);

  const { data: support } = useApi('/api/public/support', supportFallback);
  const { data: faqRows } = useApi('/api/public/faqs?scope=SUPPORT', faqsSupportFallback);
  const supportStaff = support.staff;
  const remoteTools = support.tools.map((t) => ({ ...t, desc: t.description }));
  const faqItems = faqRows.map((f) => ({ q: f.question, a: f.answer }));

  const handleCopyPhone = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedPhone(num);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <>
    <Seo
      title="Hỗ trợ kỹ thuật"
      description="Trung tâm hỗ trợ kỹ thuật phần mềm Dự toán BNSC: hotline, hỗ trợ từ xa UltraViewer, tài liệu và đội ngũ kỹ sư sẵn sàng phục vụ."
      path="/ho-tro-ky-thuat"
    />
    <div className="min-h-screen bg-[#071426] text-white font-sans relative overflow-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-sky-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-[600px] h-[600px] bg-amber-500/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Corporate Header Section */}
      <header className="border-b border-white/[0.06] bg-slate-950/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center border border-white/5"
              title="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <img 
                src="/brand/logo.png" 
                alt="Logo" 
                className="w-9 h-9 object-contain"
              />
              <div className="hidden sm:block text-left">
                <h1 className="font-extrabold text-[15px] tracking-wider text-white uppercase">BẮC NAM SOFTWARE</h1>
                <p className="text-[10px] text-slate-400 font-medium">Đối tác Chuyển đổi số ngành Xây dựng Việt Nam</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-[11px] text-slate-400">Hỗ trợ kỹ thuật qua Hotline</span>
              <span className="text-sm font-bold text-[#F5A623] hover:underline">0966.966.455</span>
            </div>
            <a 
              href="mailto:contact@bacnam.com.vn" 
              className="text-xs bg-white/5 border border-white/[0.08] text-slate-300 hover:text-white px-3.5 py-1.8 rounded-xl hover:bg-white/10 transition-all font-medium"
            >
              Gửi Ticket Email
            </a>
          </div>
        </div>
      </header>

      {/* Main Structural Layout */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        
        {/* Page Hero Pitch */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-[#fbbf24] text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> Giờ Làm Việc: 08:00 - 17:30 (Thứ 2 - Thứ 7)
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Trung Tâm Hỗ Trợ Kỹ Thuật <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-[#fbbf24] to-yellow-500">BNSC</span>
          </h2>
          <p className="text-slate-300 text-[14px] sm:text-[15px] leading-relaxed">
            Hỗ trợ cài đặt phần mềm Dự toán BNSC dùng thử, hướng dẫn xử lý các lỗi kích hoạt bộ đơn giá định mức thông tư xây dựng, cập nhật chứng thư số hoàn toàn miễn phí.
          </p>
        </div>

        {/* vChat Notification Alert banner */}
        {showVchatBanner && (
          <div className="bg-gradient-to-r from-[#0F3A5F] to-[#0A2545]/90 border border-indigo-500/20 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#F5A623] to-[#fbbf24] flex items-center justify-center text-[#0B2545] shrink-0 font-extrabold shadow-lg">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[15px] text-white flex items-center gap-2">
                  Addon vChat.vn Đã Được Trực Quan Tích Hợp Thành Công!
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Công cụ hỗ trợ trực tuyến vChat.vn đã được nhúng vào hệ thống. Anh/chị có thể click vào bong bóng chat vChat ở góc phải màn hình bất cứ lúc nào để kết nối trực tiếp với đội ngũ kỹ thuật viên.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => {
                  // Standard direct invocation for vchat trigger
                  const vchatToggle = document.querySelector('.vchat-active, #vchat-root, #vchat-wrapper') as HTMLElement;
                  if (vchatToggle) {
                    vchatToggle.click();
                  } else {
                    alert("Addon vChat đang được kích hoạt tự động ở góc dưới bên phải màn hình!");
                  }
                }}
                className="px-4 py-2 bg-gradient-to-tr from-[#F5A623] to-yellow-500 text-slate-900 font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-[#F5A623]/20"
              >
                Mở vChat Ngay
              </button>
              <button 
                onClick={() => setShowVchatBanner(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Layout main blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLUMNS: INTERACTIVE SUPPORT TOOLS & DOWNLOADS */}
          <div className="lg:col-span-2 space-y-8 text-left">
            
            {/* Tool Download Section */}
            <section className="bg-slate-900/60 border border-white/[0.06] rounded-3xl p-6 relative">
              <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
                <FileDown className="w-5 h-5 text-amber-500" /> Tải Công Cụ Kết Nối Từ Xa
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Tải một trong hai phần mềm sau để các kỹ sư BNSC có thể truy cập hỗ trợ hướng dẫn trực tiếp trên màn hình máy tính của anh/chị.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {remoteTools.map((tool, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-white/[0.04] hover:border-amber-500/20 rounded-2xl p-5 hover:bg-slate-950 transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="text-[11px] font-bold tracking-wider uppercase text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/15">
                          {tool.badge}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-medium">{tool.version}</span>
                      </div>
                      <h4 className="font-bold text-[15px] text-white group-hover:text-amber-400 transition-colors mb-2">
                        {tool.name}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        {tool.desc}
                      </p>
                    </div>
                    
                    <a 
                      href={tool.realUrl || tool.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-amber-500 hover:text-[#0B2545] rounded-xl text-xs font-bold text-slate-350 hover:scale-[1.012] transition-all border border-white/5 group-hover:border-amber-500/10"
                    >
                      <Download className="w-3.5 h-3.5" /> Tải Ngay (Link Gốc) <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* Simulated Live Chat Integration Desk Frame */}
            <section className="bg-slate-900/60 border border-white/[0.06] rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-500 animate-pulse" /> Đăng Ký Yêu Cầu Kỹ Thuật Nhanh
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Nếu bộ phận hỗ trợ bận, hãy điền mẫu sau. Kỹ thuật viên sẽ gọi lại hỗ trợ ngay lập tức.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-start">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[11px] text-slate-300 font-semibold tracking-wider font-mono">XỬ LÝ TRONG 5 PHÚT</span>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                alert("Đã tiếp nhận yêu cầu hỗ trợ kỹ thuật thành công! Một kỹ sư BNSC sẽ liên hệ trực tiếp đến số điện thoại của anh/chị tối đa trong 5 phút nữa.");
                const target = e.target as HTMLFormElement;
                target.reset();
              }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-left">
                    <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5">Họ và tên quý khách</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ví dụ: Nguyễn Văn A" 
                      className="w-full bg-slate-950/80 border border-white/[0.08] hover:border-white/20 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition-all"
                    />
                  </div>
                  <div className="text-left">
                    <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5">Số điện thoại liên hệ</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="Ví dụ: 0912345678" 
                      className="w-full bg-slate-950/80 border border-white/[0.08] hover:border-white/20 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition-all"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5">Chi tiết vấn đề cần kỹ thuật hỗ trợ</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Ví dụ: Tôi cần hướng dẫn cài đặt phần mềm thử nghiệm Dự toán BNSC phiên bản mới, hoặc lỗi khóa cứng USB không sáng đèn..." 
                    className="w-full bg-slate-950/80 border border-white/[0.08] hover:border-white/20 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none placeholder-slate-600 transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 font-black text-sm tracking-wide rounded-xl hover:scale-[1.008] transition-all cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" /> Gửi Yêu Cầu Hỗ Trợ Ngay
                </button>
              </form>
            </section>
          </div>

          {/* RIGHT COLUMN: HOTLINE TELEPHONE DIRECTORY */}
          <div className="space-y-6 text-left">
            
            {/* Staff list panel */}
            <div className="bg-slate-900/60 border border-white/[0.06] rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" /> Kỹ Sư Hỗ Trợ Trực Tiếp
              </h3>
              <p className="text-[11px] text-slate-400 mb-5">
                Vui lòng click vào số điện thoại bên dưới để gọi điện nhanh hoặc sao chép nhanh số liên lạc.
              </p>

              <div className="space-y-4">
                {supportStaff.map((staff, idx) => (
                  <div key={idx} className="bg-slate-950/50 hover:bg-slate-950 border border-white/[0.04] hover:border-white/10 rounded-2xl p-4 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-[13px] text-white">{staff.name}</h4>
                      <span className="text-[9px] uppercase font-bold text-[#A5C9FF] bg-sky-500/15 border border-sky-450/20 px-2 py-0.5 rounded-full">{staff.ext}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">{staff.role}</p>
                    
                    <div className="flex items-center gap-2 w-full">
                      <a 
                        href={`tel:${staff.phone}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.8 bg-gradient-to-tr from-[#0F3A5F] to-[#1B5FA8]/50 hover:brightness-110 text-white rounded-lg text-xs font-semibold"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" /> {staff.phone}
                      </a>
                      <button 
                        onClick={() => handleCopyPhone(staff.phone)}
                        className="p-1 px-2 hover:bg-white/5 rounded-lg border border-white/5 text-[10px] text-slate-400 hover:text-white transition-all cursor-pointer"
                      >
                        {copiedPhone === staff.phone ? 'Đã lưu!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick troubleshooting tips */}
            <div className="bg-slate-900/60 border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" /> Hỏi Đáp Kỹ Thuật Nhanh
              </h3>
              
              <div className="space-y-4">
                {faqItems.map((item, idx) => (
                  <div key={idx} className="border-b border-white/[0.04] pb-3 last:border-none last:pb-0">
                    <h5 className="font-bold text-xs text-amber-400 mb-1 leading-snug">
                      {item.q}
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>

      <footer className="border-t border-white/[0.06] py-6 bg-slate-950 mt-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 Bản quyền thuộc Công ty Phần mềm Bắc Nam (BNSC). Tất cả quyền được bảo lưu.</span>
          <button 
            onClick={onBackToHome}
            className="text-amber-500 hover:underline font-bold"
          >
            Quay lại trang chủ &rarr;
          </button>
        </div>
      </footer>

    </div>
    </>
  );
}
