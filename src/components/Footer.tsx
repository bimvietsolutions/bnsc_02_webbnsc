import React from 'react';
import { Phone, Mail, MapPin, Facebook, Youtube, Send, Globe, MessageCircle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="lien-he" className="bg-[#060f1e] text-gray-300 pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Links & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          
          {/* Column 1: Brand Directory (4/12 wide) */}
          <div className="lg:col-span-4 flex flex-col items-start text-left gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-11 h-11 shrink-0">
                <img 
                  src="https://bacnam.com.vn/uploads/logo/logo_60b98e41a181e3.png" 
                  alt="Bac Nam Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-extrabold text-base tracking-wide leading-none uppercase">
                  Bắc Nam Software
                </span>
                <span className="text-[10px] text-gray-500 tracking-wider font-semibold uppercase mt-0.5">
                  BNSC / Định hình giá trị xây dựng
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed mt-2">
              Công ty phần mềm và tư vấn xây dựng hàng đầu Việt Nam. Chuyên môn hóa cao độ trong lĩnh vực lập dự toán, quản lý chi phí đầu tư dự án và bồi dưỡng nghiệp vụ thực chiến.
            </p>

            <div className="space-y-3.5 mt-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#F5A623] shrink-0 mt-0.5" />
                <span className="text-gray-300 leading-relaxed">
                  Tòa nhà Indochina, số 4 Nguyễn Đình Chiểu, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#F5A623] shrink-0" />
                <a href="tel:0966965075" className="hover:text-[#F5A623] transition-colors font-mono">
                  0966.965.075 / (028) 6.678.995
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#F5A623] shrink-0" />
                <a href="mailto:contact@bacnam.com.vn" className="hover:text-[#F5A623] transition-colors font-mono">
                  contact@bacnam.com.vn
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Products Directory (2/12 wide) */}
          <div className="lg:col-span-2 flex flex-col items-start text-left gap-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white border-b-2 border-[#1B5FA8] pb-1.5 leading-none">
              Sản phẩm
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#du-toan" className="hover:text-[#F5A623] transition-colors">Dự toán BNSC (v1.20)</a></li>
              <li><a href="#du-toan" className="hover:text-[#F5A623] transition-colors">Dự thầu & Đấu thầu</a></li>
              <li><a href="#du-toan" className="hover:text-[#F5A623] transition-colors">Thanh quyết toán BNSC</a></li>
              <li><a href="#du-toan" className="hover:text-[#F5A623] transition-colors">Khóa cứng điện tử</a></li>
              <li><a href="#du-toan" className="hover:text-[#F5A623] transition-colors">Cơ sở dữ liệu Đơn giá</a></li>
            </ul>
          </div>

          {/* Column 3: Services (3/12 wide) */}
          <div className="lg:col-span-3 flex flex-col items-start text-left gap-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white border-b-2 border-[#1B5FA8] pb-1.5 leading-none">
              Dịch vụ Tư vấn
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#tu-van" className="hover:text-[#F5A623] transition-colors">Tư vấn xây dựng Chỉ số giá Sở XD</a></li>
              <li><a href="#tu-van" className="hover:text-[#F5A623] transition-colors">Khảo sát & Lập Đơn giá nhân công</a></li>
              <li><a href="#tu-van" className="hover:text-[#F5A623] transition-colors">Tính toán Bảng giá ca máy lắp đặt</a></li>
              <li><a href="#tu-van" className="hover:text-[#F5A623] transition-colors">Thẩm định dự toán phần mềm độc lập</a></li>
              <li><a href="#tu-van" className="hover:text-[#F5A623] transition-colors">Tư vấn đấu thầu qua mạng quốc gia</a></li>
            </ul>
          </div>

          {/* Column 4: Customer Support & Resources (3/12 wide) */}
          <div className="lg:col-span-3 flex flex-col items-start text-left gap-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white border-b-2 border-[#1B5FA8] pb-1.5 leading-none">
              Liên kết Hỗ trợ
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#dao-tao" className="hover:text-[#F5A623] transition-colors">Khóa học Đo bóc khối lượng</a></li>
              <li><a href="#dao-tao" className="hover:text-[#F5A623] transition-colors">Khóa bồi dưỡng Kế toán Xây dựng</a></li>
              <li><a href="#tin-tuc" className="hover:text-[#F5A623] transition-colors">Tra cứu Nghị định - Luật Xây dựng</a></li>
              <li><a href="#tin-tuc" className="hover:text-[#F5A623] transition-colors">Tài liệu hướng dẫn sử dụng PDF</a></li>
              <li><a href="#trang-chu" className="hover:text-[#F5A623] transition-colors">Kênh hỗ trợ kỹ thuật UltraViewer</a></li>
            </ul>
          </div>

        </div>

        {/* Divider separator */}
        <div className="border-t border-white/5 pt-8 mt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Copyright notes */}
            <div className="text-xs text-gray-500 text-center md:text-left leading-normal">
              <p>&copy; {currentYear} Công ty Cổ phần Phần mềm và Tư vấn Xây dựng Bắc Nam (BNSC). Bảo lưu mọi quyền.</p>
              <p className="mt-1">Giấy phép đăng ký kinh doanh số: 0310892095 cấp bởi Sở Kế hoạch và Đầu tư TP.HCM.</p>
            </div>

            {/* Social icons line */}
            <div className="flex items-center gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-[#1877F2] flex items-center justify-center transition-all"
                title="BNSC Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-[#FF0000] flex items-center justify-center transition-all"
                title="BNSC YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="https://zalo.me" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-sky-400 flex items-center justify-center transition-all font-black text-sm"
                title="BNSC Zalo Support"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a 
                href="mailto:contact@bacnam.com.vn" 
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-[#F5A623] flex items-center justify-center transition-all"
                title="Email BNSC"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
}
