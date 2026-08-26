import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Play, Compass, Settings, Eye, MessageSquare, Calendar, User } from 'lucide-react';
import { useUiActions } from '../context/UiActions';
import { scrollToId } from '../utils/scroll';
import { useApi } from '../lib/api';
import { heroFallback } from '../lib/publicData';

export default function Hero() {
  const navigate = useNavigate();
  const { openDownload } = useUiActions();
  const onDownloadClick = () => openDownload();
  const onVideoClick = () => scrollToId('tu-van');
  // Slide lấy từ API kèm linkUrl trỏ đúng bài viết; slide thủ công không có
  // link thì không bấm được (trước đây bấm vào là rơi vào slug tĩnh đã chết).
  const onSlideClick = (linkUrl?: string | null) => {
    if (linkUrl) navigate(linkUrl);
  };

  // Hero (slide + số liệu) lấy từ API, fallback dữ liệu tĩnh.
  const { data: hero } = useApi('/api/public/hero', heroFallback);
  const slides = hero.slides;
  const heroStats = hero.stats;

  const [activeSlide, setActiveSlide] = useState(0);

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section 
      id="trang-chu" 
      className="relative bg-[#0B2545] text-white pt-10 pb-16 lg:pt-14 lg:pb-20 overflow-hidden"
    >
      {/* Radiant Glow Lights */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#1B5FA8]/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-12 right-10 w-80 h-80 rounded-full bg-[#F5A623]/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
        
        {/* Row 1: Slider and Cards (Region 4 and Region 3 align perfectly in height) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full mb-8">
          
          {/* Left Column (8/12 cols): Slider "HOẠT ĐỘNG & SỰ KIỆN NỔI BẬT BNSC" */}
          <div className="lg:col-span-8 flex flex-col gap-4 text-left w-full">
            
            {/* Visual Label */}
            <div className="flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#F5A623]"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#F5A623]">
                HOẠT ĐỘNG & SỰ KIỆN NỔI BẬT BNSC
              </span>
            </div>

            {/* Slider Container */}
            <div className="relative flex-1 aspect-[16/9] md:aspect-[1.73/1] rounded-2xl overflow-hidden border border-white/[0.08] bg-slate-950/60 shadow-xl group w-full min-h-[350px] md:min-h-[410px]">
              {/* Active Slide Image */}
              {slides.map((slide, idx) => (
                <div
                  key={idx}
                  onClick={() => onSlideClick(slide.linkUrl)}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    slide.linkUrl ? 'cursor-pointer' : ''
                  } ${
                    idx === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.caption}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.015]"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Subtle Dark Caption Overlay at the bottom */}
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent p-5 sm:p-6 select-none pt-20">
                    <p className="text-sm sm:text-base lg:text-lg font-bold text-white h-auto leading-snug text-left drop-shadow-md tracking-normal border-l-4 border-[#F5A623] pl-3.5">
                      {slide.caption}
                    </p>
                  </div>
                </div>
              ))}

              {/* Left/Right manual sliders arrows */}
              <button
                onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/65 cursor-pointer z-20 border border-white/5 outline-none text-xl font-bold"
                aria-label="Previous Slide"
              >
                &lsaquo;
              </button>
              <button
                onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/65 cursor-pointer z-20 border border-white/5 outline-none text-xl font-bold"
                aria-label="Next Slide"
              >
                &rsaquo;
              </button>

              {/* Pagination Dots with active styles */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/35 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 border-none outline-none cursor-pointer ${
                      idx === activeSlide 
                        ? 'bg-[#F5A623] scale-125' 
                        : 'bg-white/50 hover:bg-white'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4/12 cols): Right Cards Stack (Region 3) */}
          <div className="lg:col-span-4 flex flex-col gap-4 text-left w-full">
            
            {/* Visual Label */}
            <div className="flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#10B981]"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#10B981]">
                PHIÊN BẢN CẬP NHẬT MỚI NHẤT
              </span>
            </div>

            {/* Cards Stack */}
            <div className="flex-1 flex flex-col gap-4 h-full">
              
              {/* Green Card "2.76 Sử dụng" */}
              <div className="relative flex-1 rounded-2xl bg-slate-900/40 hover:bg-slate-900/55 transition-all duration-300 border border-[#10B981]/15 hover:border-[#10B981]/35 flex flex-col justify-between p-5 group cursor-pointer shadow-sm hover:shadow-lg hover:shadow-[#10B981]/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/[0.03] rounded-bl-[100px] pointer-events-none blur-2xl group-hover:bg-[#10B981]/[0.06] transition-all" />
                
                <div className="flex items-start gap-4">
                  {/* Article Thumbnail Image */}
                  <div className="w-24 h-[76px] sm:w-[104px] sm:h-20 shrink-0 rounded-xl overflow-hidden border border-white/[0.08] relative group-hover:border-[#10B981]/35 transition-colors duration-300">
                    <img 
                      src="/img/tin-van-chuyen.jpg" 
                      alt="2.76 Tính chi phí vận chuyển" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col text-left">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[9px] uppercase font-bold tracking-widest bg-[#10B981]/15 text-[#34d399] px-2 py-0.5 rounded-full border border-[#10B981]/10">
                        Sử dụng
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-medium">v2.76</span>
                    </div>
                    <h4 className="text-[13px] sm:text-[14px] font-bold text-white/95 leading-snug tracking-wide group-hover:text-[#10B981] transition-colors line-clamp-2">
                      2.76 Tính chi phí vận chuyển theo Định mức Thông tư 12/2021/TT-BXD
                    </h4>
                    <p className="text-[11px] text-slate-400/90 mt-1 line-clamp-2 leading-relaxed">
                      Hướng dẫn phương pháp tính toán cự ly, tra cứu định mức phương tiện vận chuyển bộ, ô tô tự đổ theo phụ lục mới.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-white/[0.04] flex items-center justify-between text-xs text-slate-400 font-medium flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="w-5 h-5 rounded-full border border-white/10 bg-[#1B5FA8] text-white text-[8px] font-bold flex items-center justify-center shrink-0"
                    >
                      KT
                    </span>
                    <span className="text-white/90">Khắc Tiệp</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">14/01/20</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-500" /> 13.045
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> 0
                    </span>
                  </div>
                </div>
              </div>

              {/* Orange Card "1.20 Cài đặt" */}
              <div className="relative flex-1 rounded-2xl bg-slate-900/40 hover:bg-slate-900/55 transition-all duration-300 border border-[#F5A623]/20 hover:border-[#F5A623]/40 flex flex-col justify-between p-5 group cursor-pointer shadow-sm hover:shadow-lg hover:shadow-[#F5A623]/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A623]/[0.03] rounded-bl-[100px] pointer-events-none blur-2xl group-hover:bg-[#F5A623]/[0.06] transition-all" />
                
                <div className="flex items-start gap-4">
                  {/* Article Thumbnail Image */}
                  <div className="w-24 h-[76px] sm:w-[104px] sm:h-20 shrink-0 rounded-xl overflow-hidden border border-white/[0.08] relative group-hover:border-[#F5A623]/35 transition-colors duration-300">
                    <img 
                      src="/img/tin-phien-ban.jpg" 
                      alt="1.20 DỰ TOÁN BNSC" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col text-left">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[9px] uppercase font-bold tracking-widest bg-[#F5A623]/15 text-[#fbbf24] px-2 py-0.5 rounded-full border border-[#F5A623]/10">
                        Cài đặt
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-medium">v1.20</span>
                    </div>
                    <h4 className="text-[13px] sm:text-[14px] font-bold text-white/95 leading-snug tracking-wide group-hover:text-[#F5A623] transition-colors line-clamp-2">
                      1.20 DỰ TOÁN BNSC: Cập nhật Thông tư 08/2025/TT-BXD; Thông tư 70/2025/TT-BTC
                    </h4>
                    <p className="text-[11px] text-slate-400/90 mt-1 line-clamp-2 leading-relaxed">
                      Tích hợp đầy đủ định mức xây dựng và phương pháp xác định đơn giá nhân công mới nhất theo tiêu chuẩn nhà nước.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-white/[0.04] flex items-center justify-between text-xs text-slate-400 font-medium flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="w-5 h-5 rounded-full border border-white/10 bg-[#1B5FA8] text-white text-[8px] font-bold flex items-center justify-center shrink-0"
                    >
                      KT
                    </span>
                    <span className="text-white/90">Khắc Tiệp</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">13/06/25</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-500" /> 6.306
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> 0
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Row 2: Stats Counter Row & CTAs Action Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6 pt-6 border-t border-white/[0.08] w-full">
          
          {/* Stats Column */}
          <div className="lg:col-span-8 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 text-left">
              {heroStats.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-start p-1">
                  <span className="text-[32px] font-medium text-[#F5A623] tracking-[-0.02em] leading-[1.1] tabular-nums">
                    {stat.value}
                  </span>
                  <span className="text-[12px] text-gray-400 font-normal tracking-normal mt-1 leading-[1.4]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons Column */}
          <div className="lg:col-span-4 w-full h-full flex items-center">
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 w-full self-stretch justify-end">
              <button 
                onClick={onDownloadClick}
                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#E09413] hover:from-[#fca92f] hover:to-[#cc6d0b] text-[#0B2545] font-medium text-[14px] transition-all duration-200 shadow-md shadow-[#F5A623]/10 hover:shadow-[#F5A623]/25 hover:scale-[1.012] active:scale-[0.988] cursor-pointer text-center"
              >
                <Download className="w-4.5 h-4.5 shrink-0" /> Tải phần mềm
              </button>
              
              <button 
                onClick={onVideoClick}
                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900/35 hover:bg-slate-900/60 border border-white/10 hover:border-white/20 text-white font-medium text-[14px] transition-all duration-150 cursor-pointer hover:scale-[1.012] active:scale-[0.988] text-center"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[#F5A623] shrink-0">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                Xem hướng dẫn sử dụng
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
