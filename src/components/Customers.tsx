import React from 'react';
import { Building2, Landmark, TowerControl, ShieldCheck, HeartPulse } from 'lucide-react';
import { customersList } from '../data';

export default function Customers() {
  // Mini icon helpers for local client classifications
  const getClientIcon = (name: string) => {
    const size = "w-5 h-5 text-[#F5A623] shrink-0";
    if (name.includes('Sở Xây Dựng') || name.includes('SXD')) {
      return <Landmark className={size} />;
    }
    if (name.includes('ĐH')) {
      return <Building2 className={size} />;
    }
    if (name.includes('Y tế')) {
      return <HeartPulse className={size} />;
    }
    return <Building2 className={size} />;
  };

  return (
    <section id="gioi-thieu" className="py-20 bg-[#0B2545] text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-[#1B5FA8]/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#F5A623]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F5A623]">
            Đối Tác Uy Tín Phát Triển
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3 mb-5">
            Được Tin Dùng Bởi Các Cơ Quan & Doanh Nghiệp Lớn
          </h2>
          <div className="h-1 w-16 bg-[#F5A623] mx-auto rounded-full" />
          <p className="text-gray-300 text-sm sm:text-base mt-4">
            Bắc Nam hân hạnh đóng vai trò tư vấn xây dựng dữ liệu định mức đơn giá và cung cấp phần mềm lõi cho các Sở Xây dựng, Tổng công ty Nhà nước và các học viện hàng đầu.
          </p>
        </div>

        {/* 5-Column Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {customersList.map((customer, idx) => (
            <div
              key={idx}
              className="bg-white hover:bg-gray-50 flex items-center gap-3.5 px-4 py-4 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-white/10 group cursor-pointer"
            >
              <div className="p-2.5 rounded-lg bg-[#0B2545]/5 group-hover:bg-[#0B2545]/10 transition-colors">
                {getClientIcon(customer.name)}
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-sm font-extrabold text-[#0B2545] tracking-tight leading-tight group-hover:text-[#1B5FA8] transition-colors truncate">
                  {customer.name}
                </h4>
                {customer.subtext && (
                  <span className="text-[10px] text-[#5A6475] font-semibold tracking-wide uppercase leading-none block mt-1 truncate">
                    {customer.subtext}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Co-signed quality assurance banner */}
        <div className="mt-14 p-6 rounded-2xl bg-white/5 border border-white/10 max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6 text-left">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#1B5FA8] to-[#F5A623] p-[2.5px] shrink-0">
            <div className="w-full h-full bg-[#0B2545] rounded-[9px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#F5A623]" />
            </div>
          </div>
          <div>
            <h4 className="text-base font-bold text-[#F5A623]">Độ tin cậy được kiểm chứng pháp lý</h4>
            <p className="text-sm text-gray-300 mt-1 leading-relaxed">
              Các thuật toán tính chênh lệch vật liệu, hệ số bù nhân công và đơn giá máy thi công trong phần mềm BNSC được thẩm định chặt chẽ, đảm bảo tuyệt đối sự trùng khớp sai lệch số liệu khi trình nộp các Bộ kiểm toán, Thanh tra nhà nước.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
