import React from 'react';
import { Laptop, Scale, GraduationCap, Check, HelpCircle, FileSpreadsheet, ArrowUpRight } from 'lucide-react';
import { products } from '../data';
import { useUiActions } from '../context/UiActions';

export default function Products() {
  const { openDownload, openConsult } = useUiActions();

  const onProductCtaClick = (productId: string) => {
    if (productId === 'du-toan-bnsc') {
      openDownload(productId);
    } else {
      openConsult(productId);
    }
  };

  // Simple mapping of string iconName to Lucide components
  const getIcon = (name: string, isFeatured: boolean) => {
    const size = "w-6 h-6";
    const featuredStyle = "text-[#F5A623]";
    
    switch (name) {
      case 'Laptop':
        return <Laptop className={`${size} ${isFeatured ? featuredStyle : 'text-[#1B5FA8]'}`} />;
      case 'Scale':
        return <Scale className={`${size} text-purple-500`} />;
      case 'GraduationCap':
        return <GraduationCap className={`${size} text-emerald-500`} />;
      default:
        return <HelpCircle className={size} />;
    }
  };

  return (
    <section id="du-toan" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1B5FA8] bg-[#1B5FA8]/10 px-3.5 py-1.5 rounded-full inline-block">
            Giải Pháp Công Nghệ Xây Dựng
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] tracking-tight mt-4 mb-5">
            Sản phẩm & Dịch vụ Nổi bật của Bắc Nam Software
          </h2>
          <div className="h-1 w-20 bg-[#F5A623] mx-auto rounded-full" />
          <p className="text-[#5A6475] text-base sm:text-lg mt-5 leading-relaxed">
            Hỗ trợ toàn diện công tác quản lý chi phí đầu tư xây dựng công trình, từ khâu đào tạo nghiệp vụ, lập hồ sơ thầu, thẩm định đơn giá đến tối ưu chỉ số giá địa phương.
          </p>
        </div>

        {/* 3-Column Bento/Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {products.map((product) => {
            const isFeatured = product.isFeatured;
            
            return (
              <div
                key={product.id}
                className={`flex flex-col justify-between rounded-[14px] p-8 transition-all duration-300 relative group overflow-hidden ${
                  isFeatured 
                    ? 'bg-gradient-to-b from-[#0B2545] to-[#12315a] text-white shadow-xl shadow-[#0B2545]/20 hover:shadow-2xl hover:shadow-[#0B2545]/25 hover:-translate-y-1.5' 
                    : 'bg-white border border-[#E1E5ED] text-[#1A2332] shadow-sm hover:shadow-lg hover:border-[#1B5FA8]/30 hover:-translate-y-1.5'
                }`}
              >
                {/* Visual Accent glow for cards */}
                {isFeatured && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#F5A623]/25 to-transparent rounded-bl-full pointer-events-none" />
                )}

                <div>
                  
                  {/* Top line: Icon and badge */}
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className={`p-3.5 rounded-xl flex items-center justify-center ${
                      isFeatured ? 'bg-white/10' : 'bg-[#1B5FA8]/8'
                    }`}>
                      {getIcon(product.iconName, isFeatured)}
                    </div>
                    {product.badge && (
                      <span className="font-bold text-xs px-3 py-1 rounded-full bg-[#F5A623] text-[#0B2545] uppercase tracking-wider animate-pulse">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Tagline */}
                  <h3 className={`text-2xl font-extrabold tracking-tight mb-3 ${
                    isFeatured ? 'text-white' : 'text-[#0B2545]'
                  }`}>
                    {product.name}
                  </h3>
                  <p className={`text-sm mb-6 ${
                    isFeatured ? 'text-gray-300' : 'text-[#5A6475]'
                  }`}>
                    {product.tagline}
                  </p>

                  <div className={`border-t my-6 ${isFeatured ? 'border-white/10' : 'border-[#E1E5ED]'}`} />

                  {/* Bullet features */}
                  <div className="space-y-4 mb-8">
                    <span className={`block uppercase font-bold text-xs tracking-wider ${
                      isFeatured ? 'text-[#F5A623]' : 'text-[#1B5FA8]'
                    }`}>
                      Tính năng & Lợi ích:
                    </span>
                    <ul className="space-y-3">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-left">
                          <div className={`p-0.5 rounded-full mt-0.5 shrink-0 ${
                            isFeatured ? 'bg-emerald-500/20 text-[#F5A623]' : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </div>
                          <span className={`text-sm leading-relaxed ${
                            isFeatured ? 'text-gray-200' : 'text-[#1A2332]/85'
                          }`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Footer Trigger Button */}
                <button
                  onClick={() => onProductCtaClick(product.id)}
                  className={`w-full py-3.5 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-98 cursor-pointer ${
                    isFeatured
                      ? 'bg-[#F5A623] hover:bg-[#F5A623]/90 text-[#0B2545] shadow-lg hover:shadow-[#F5A623]/20'
                      : 'bg-transparent border-2 border-[#1B5FA8] text-[#1B5FA8] hover:bg-[#1B5FA8] hover:text-white'
                  }`}
                >
                  <span>{product.ctaText}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>

              </div>
            );
          })}
        </div>
        
        {/* Help desk disclaimer */}
        <div className="mt-12 text-center p-5 rounded-2xl bg-[#F7F9FC] border border-[#E1E5ED] inline-flex items-center flex-wrap justify-center gap-3.5 text-sm text-[#5A6475] mx-auto w-full">
          <FileSpreadsheet className="w-5 h-5 text-[#1B5FA8]" />
          <span>
            Bạn đang sử dụng phiên bản Dự toán BNSC cũ? Gặp khó khăn khi áp mã đơn giá?
          </span>
          <a
            href="#tu-van"
            className="text-[#1B5FA8] font-bold hover:underline inline-flex items-center gap-0.5"
          >
            Liên hệ chuyên viên kỹ thuật ngay &rarr;
          </a>
        </div>

      </div>
    </section>
  );
}
