import React, { useState } from 'react';
import { ShieldCheck, GraduationCap, Calendar, Users, MapPin, ArrowRight, Gavel, HelpCircle, FileText, CheckCircle } from 'lucide-react';
import { useUiActions } from '../context/UiActions';
import { useApi } from '../lib/api';
import { consultingFallback, faqsHomeFallback } from '../lib/publicData';
import { useContactInfo } from '../lib/contact';

const consultIcon = (name?: string | null) => {
  switch (name) {
    case 'Gavel':
      return <Gavel className="w-5 h-5 text-[#F5A623]" />;
    case 'FileText':
      return <FileText className="w-5 h-5 text-[#1B5FA8]" />;
    default:
      return <ShieldCheck className="w-5 h-5 text-[#1B5FA8]" />;
  }
};

export default function ConsultingAndTraining() {
  const { openConsult } = useUiActions();
  const onRegisterClick = (courseName: string) => openConsult(courseName);
  // Frequently asked questions (FAQs) or consultative elements
  const [activeQuestion, setActiveQuestion] = useState<number | null>(0);

  const { hotlineDisplay } = useContactInfo();
  const { data: consulting } = useApi('/api/public/consulting', consultingFallback);
  const { data: faqRows } = useApi('/api/public/faqs?scope=HOME', faqsHomeFallback);

  const consultations = consulting.services.map((s) => ({
    title: s.title,
    desc: s.description,
    icon: consultIcon(s.iconName),
  }));
  const courses = consulting.courses.map((c) => ({
    id: c.slug,
    title: c.title,
    date: c.scheduleText,
    duration: c.duration,
    type: c.format,
    price: c.price,
    coupon: c.coupon,
    slots: c.slots,
    trainer: c.trainer,
  }));
  const faqs = faqRows.map((f) => ({ q: f.question, a: f.answer }));

  return (
    <div className="bg-white">
      
      {/* 1. CONSULTING SECTION (#tu-van) */}
      <section id="tu-van" className="py-20 bg-gradient-to-b from-white to-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Left Box: Consulting Capabilities */}
            <div className="lg:col-span-6 flex flex-col justify-center text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1B5FA8] bg-[#1B5FA8]/10 px-3 py-1.5 rounded-full inline-block mb-3">
                Kinh tế xây dựng & Thể chế pháp luật
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] tracking-tight mb-6">
                Chuyên môn Tư vấn Đơn giá &amp; Định mức Địa phương
              </h2>
              <p className="text-[#5A6475] text-base leading-relaxed mb-8">
                Tự hào là đối tác cốt lõi của hơn <strong className="text-[#0B2545]">20 Sở Xây dựng các tỉnh thành</strong> phía Nam và Tây Nguyên. Chúng tôi hỗ trợ tư vấn số hóa dữ liệu, đảm bảo phân cấp đo bóc dự toán chính xác bám sát thực tế thị trường.
              </p>

              <div className="space-y-6">
                {consultations.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-5 rounded-xl bg-white border border-[#E1E5ED] shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-3 bg-gray-50 rounded-xl shrink-0 h-fit">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#0B2545] text-base mb-1">{item.title}</h4>
                      <p className="text-sm text-[#5A6475] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Box: Interactive FAQ Forum */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="bg-[#0B2545] rounded-2xl p-8 text-white relative overflow-hidden text-left h-full flex flex-col justify-between shadow-xl">
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <HelpCircle className="w-5 h-5 text-[#F5A623]" />
                    <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">Hộp giải đáp kỹ thuật nghiệp vụ</span>
                  </div>
                  
                  <h3 className="text-xl font-bold tracking-tight mb-2">Thắc mắc thường gặp của Kỹ Sư</h3>
                  <p className="text-sm text-gray-300 mb-8">Nhấp vào câu hỏi bên dưới để tham khảo câu trả lời nhanh từ hội đồng chuyên viên kỹ thuật BNSC.</p>
                  
                  <div className="space-y-3">
                    {faqs.map((faq, idx) => {
                      const isActive = activeQuestion === idx;
                      return (
                        <div 
                          key={idx} 
                          className="border border-white/10 rounded-xl overflow-hidden transition-all duration-300"
                        >
                          <button
                            type="button"
                            onClick={() => setActiveQuestion(isActive ? null : idx)}
                            className="w-full text-left px-5 py-4 font-bold text-sm flex items-center justify-between gap-3 bg-white/5 hover:bg-white/10 transition-colors focus:outline-none"
                          >
                            <span>{faq.q}</span>
                            <span className="text-[#F5A623] leading-none">{isActive ? '−' : '+'}</span>
                          </button>
                          
                          {isActive && (
                            <div className="px-5 py-4 text-xs sm:text-sm text-gray-300 bg-white/[0.02] border-t border-white/5 leading-relaxed font-normal">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-xs text-gray-400 flex items-center justify-between">
                  <span>Hotline khẩn cấp: {hotlineDisplay}</span>
                  <a href="#footer" className="text-[#F5A623] hover:underline flex items-center gap-0.5">Đặt câu hỏi khác &rarr;</a>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. TRAINING SECTION (#dao-tao) */}
      <section id="dao-tao" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Headline */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-full inline-block">
              Bồi Dưỡng Nghiệp Vụ Thực Tế
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] tracking-tight mt-4 mb-4">
              Chương trình Đào tạo Nghiệp vụ Xây dựng &amp; Đấu thầu
            </h2>
            <div className="h-1 w-16 bg-[#F5A623] mx-auto rounded-full" />
            <p className="text-[#5A6475] text-base mt-4 leading-relaxed">
              Các khóa học thực chiến ngắn hạn bồi dưỡng kỹ năng lập hồ sơ thầu, kiểm toán quyết toán và tối ưu quản lý chi phí. Cấp chứng nhận chính hãng sau khi tốt nghiệp.
            </p>
          </div>

          {/* Training Cards Grid (2 columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {courses.map((course) => (
              <div 
                key={course.id}
                className="bg-white rounded-2xl border border-[#E1E5ED] p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all text-left relative overflow-hidden group hover:border-[#1B5FA8]/20"
              >
                {/* Side glow and intake indicators */}
                <span className="absolute top-4 right-4 text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full animate-pulse">
                  🔥 {course.slots}
                </span>

                <div>
                  
                  <div className="flex items-center gap-2 text-[#1B5FA8] mb-4">
                    <GraduationCap className="w-6 h-6 shrink-0" />
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#1B5FA8]">Khóa bồi dưỡng thực hành</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#0B2545] tracking-tight leading-tight mb-4 group-hover:text-[#1B5FA8] transition-colors">
                    {course.title}
                  </h3>

                  <div className="space-y-3.5 my-6 text-sm">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4.5 h-4.5 text-[#F5A623]" />
                      <span className="text-gray-700"><strong>Thời gian:</strong> {course.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4.5 h-4.5 text-[#1B5FA8]" />
                      <span className="text-gray-700"><strong>Giảng viên:</strong> {course.trainer}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4.5 h-4.5 text-purple-500" />
                      <span className="text-gray-700"><strong>Hình thức &amp; Thời lượng:</strong> {course.type} ({course.duration})</span>
                    </div>
                  </div>

                </div>

                <div className="pt-6 border-t border-[#E1E5ED] mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-xs text-slate-400 block font-semibold leading-none">Học phí niêm yết</span>
                    <span className="text-lg font-extrabold text-[#0B2545] leading-none block mt-1">{course.price}</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">{course.coupon}</span>
                  </div>
                  
                  <button
                    onClick={() => onRegisterClick(course.id)}
                    className="bg-[#0B2545] hover:bg-[#1B5FA8] text-white font-extrabold px-6 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Lấy giáo trình &amp; Đăng ký</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Training Partners block */}
          <div className="bg-[#F7F9FC] border border-[#E1E5ED] rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 mt-12 text-left">
            <div className="flex items-center gap-2 bg-[#0B2545] text-[#F5A623] text-xs font-extrabold px-4 py-3 rounded-xl shrink-0 uppercase tracking-widest">
              💼 Liên kết Đại học
            </div>
            <p className="text-[#5A6475] text-xs sm:text-sm leading-relaxed">
              Bắc Nam Software tự hào bàn giao gói học thuật bản quyền Dự toán BNSC trị giá hàng trăm triệu VNĐ hỗ trợ giảng dạy trực tiếp tại các trường đối tác chiến lược: <strong className="text-[#0B2545]">ĐH Giao thông Vận tải (Phân hiệu TP.HCM)</strong>, <strong className="text-[#0B2545]">ĐH Xây dựng Miền Tây</strong>, <strong className="text-[#0B2545]">Học viện Cán bộ Quản lý Xây dựng thuộc Bộ Xây dựng</strong>.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
