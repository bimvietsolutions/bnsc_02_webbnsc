import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, FileText, Calendar, Eye, RefreshCw, User, MessageSquare, 
  Share2, ThumbsUp, HelpCircle, ThumbsDown, Paperclip, Download, 
  ChevronRight, ChevronDown, List, Film, Flame, Monitor, AlertCircle, 
  Facebook, Copy, CheckCircle
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: 'Download' | 'Cài đặt' | 'Sử dụng' | 'Thẩm định' | 'Tình huống khác' | 'Lập Dự toán - Dự thầu';
  categoryColor: string;
  author: string;
  date: string;
  updatedDate?: string;
  views: number;
  comments: number;
  excerpt: string;
  videoUrl?: string;
  filePath?: string;
  fileSize?: string;
}

// Dummy/structured same-group articles list for Sidebar Left
const sidebarArticles = [
  { id: '2.50', title: '2.50 Hướng dẫn khởi tạo biểu mẫu dự toán mới', active: false },
  { id: '2.51', title: '2.51 Lập Dự toán - Dự thầu xây dựng công trình', active: true },
  { id: '2.52', title: '2.52 Cấu hình thông số chung và phân cấp công trình', active: false },
  { id: '2.53', title: '2.53 Tra cứu mã hiệu và hiệu chỉnh định mức đơn giá', active: false },
  { id: '2.54', title: '2.54 Quản lý bảng tổng hợp kinh phí hạng mục', active: false },
  { id: '2.55', title: '2.55 Tính toán cự ly và chi phí vận chuyển vật liệu', active: false },
  { id: '2.56', title: '2.56 Áp dụng hệ số bù giá nhân công và ca máy trực tiếp', active: false },
  { id: '2.57', title: '2.57 Kết xuất và liên kết bảng biểu dự thầu sang Excel', active: false }
];

// Related articles list at the bottom (3 cards)
const relatedArticles = [
  {
    id: '301',
    title: '2.0 Giới thiệu tính năng chính của phần mềm Dự toán BNSC',
    category: 'Sử dụng',
    views: 5985,
    date: '10/5/2022',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: '302',
    title: '2.1 Giới thiệu trực quan giao diện làm việc chính',
    category: 'Sử dụng',
    views: 5555,
    date: '29/3/2020',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: '303',
    title: '2.2 Phương thức Tạo / Mở / Lưu tệp công trình',
    category: 'Sử dụng',
    views: 4995,
    date: '28/3/2020',
    imageUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=400&q=80'
  }
];

// Hot news side panel list
const hotNews = [
  {
    id: '1',
    title: 'DỰ TOÁN BNSC: Cập nhật Nghị định 214/2025/NĐ-CP nhanh nhất',
    views: '12.4k',
    author: 'Kỹ sư Hoàng',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '2',
    title: 'Khắc phục lỗi không kích hoạt được Add-in Excel trên Office 365',
    views: '8.5k',
    author: 'Bộ phận IT',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '3',
    title: 'Giải pháp cấu hình tính toán bù giá ca máy theo thông tư mới',
    views: '7.9k',
    author: 'Phòng Pháp chế',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '4',
    title: 'Tải miễn phí bộ đơn giá dịch vụ ích công ích đô thị mới 2026',
    views: '6.1k',
    author: 'Dự toán Support',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80'
  }
];

interface ArticleDetailPageProps {
  onBackToHome: () => void;
  onDownloadCtaClick?: () => void;
}

export default function ArticleDetailPage({ onBackToHome, onDownloadCtaClick }: ArticleDetailPageProps) {
  // Reading percentage state
  const [scrollPercent, setScrollPercent] = useState(0);
  // Feedback click status ('like' | 'neutral' | 'dislike' | null)
  const [feedback, setFeedback] = useState<'like' | 'neutral' | 'dislike' | null>(null);
  // Show copy Toast
  const [showToast, setShowToast] = useState(false);
  // Mobile Left Sidebar Accordion Toggle
  const [leftSidebarOpenOnMobile, setLeftSidebarOpenOnMobile] = useState(false);
  // Active heading ID state for scrollspy
  const [activeHeadingId, setActiveHeadingId] = useState('tong-quan');
  // Sticky bottom bar visible on mobile
  const [showStickyBottom, setShowStickyBottom] = useState(false);
  // Track bottom of navbar to position progress bar
  const [navbarBottom, setNavbarBottom] = useState(80);

  // References to track heading nodes
  const headingsRef = {
    'tong-quan': useRef<HTMLDivElement>(null),
    'huongdan-quy-trinh': useRef<HTMLDivElement>(null),
    'bang-du-lieu': useRef<HTMLDivElement>(null),
    'cac-luu-y': useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const handleScroll = () => {
      // 1. Reading progress computation
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollPercent(scrolled);

      // 2. Mobile sticky bottom trigger when scroll is over 30%
      setShowStickyBottom(scrolled > 30);

      // 3. ScrollSpy heading detector
      let currentActive = 'tong-quan';
      const offsetMargin = 150; // offset so header isn't under navbar before triggering

      for (const [id, ref] of Object.entries(headingsRef)) {
        if (ref.current) {
          const top = ref.current.getBoundingClientRect().top + window.scrollY;
          if (window.scrollY >= top - offsetMargin) {
            currentActive = id;
          }
        }
      }
      setActiveHeadingId(currentActive);

      // 4. Dynamic navbar bottom calculation to avoid overlapping top banner
      const navbarEl = document.getElementById('navbar-sticky');
      if (navbarEl) {
        setNavbarBottom(navbarEl.getBoundingClientRect().bottom);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Run once at start
    handleScroll();
    
    // Second calculation after mount/layout paint
    const timer = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const scrollToSection = (id: 'tong-quan' | 'huongdan-quy-trinh' | 'bang-du-lieu' | 'cac-luu-y') => {
    const ref = headingsRef[id];
    if (ref && ref.current) {
      const topOffset = 100; // Account for sticky navbar
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - topOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleNavToSection = (sectionId: string) => {
    onBackToHome();
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        const topOffset = 100; // Height of sticky navbar + offset
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - topOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 120);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#1A2332] selection:bg-[#F5A623]/30 selection:text-[#0B2545] font-sans pt-[72px] lg:pt-[80px]">
      
      {/* 3b. Reading progress bar fixed at the top (under sticky navbar) */}
      <div 
        className="fixed left-0 w-full h-[4px] bg-slate-200 z-50 transition-all duration-75"
        style={{ top: `${navbarBottom}px` }}
      >
        <div 
          className="h-full bg-gradient-to-r from-[#1B5FA8] to-[#F5A623] transition-all duration-100 ease-out"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      {/* Copy notification Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#0B2545] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-50 border border-[#1B5FA8]/30 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">Đã sao chép liên kết vào bộ nhớ tạm!</span>
        </div>
      )}

      {/* 1. BREADCRUMB */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <button 
              onClick={onBackToHome}
              className="hover:text-[#1B5FA8] transition-colors cursor-pointer text-gray-500"
            >
              Trang chủ
            </button>
            <span className="text-[#CBD5E1]">›</span>
            <button 
              onClick={() => handleNavToSection('du-toan')}
              className="hover:text-[#1B5FA8] transition-colors cursor-pointer text-gray-500"
            >
              Dự toán BNSC
            </button>
            <span className="text-[#CBD5E1]">›</span>
            <button 
              onClick={() => handleNavToSection('thuvien-tinhhuong')}
              className="hover:text-[#1B5FA8] transition-colors cursor-pointer text-gray-500"
            >
              Sử dụng
            </button>
            <span className="text-[#CBD5E1]">›</span>
            <button 
              onClick={scrollToTop}
              className="hover:text-[#1B5FA8] transition-colors cursor-pointer text-[#0B2545] font-semibold text-left truncate max-w-[150px] sm:max-w-none"
              title="Cuộn lên đầu bài viết"
            >
              2.51 Lập Dự toán - Dự thầu...
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mobile Left Sidebar Accordion Trigger Toggle */}
        <div className="md:hidden mb-6 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
          <button 
            onClick={() => setLeftSidebarOpenOnMobile(!leftSidebarOpenOnMobile)}
            className="w-full flex items-center justify-between p-4 bg-[#0B2545] text-white"
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <List className="w-4 h-4 text-[#F5A623]" />
              <span>Sử dụng phần mềm (28 bài viết)</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${leftSidebarOpenOnMobile ? 'rotate-180' : ''}`} />
          </button>
          
          {leftSidebarOpenOnMobile && (
            <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] space-y-1 max-h-[300px] overflow-y-auto">
              {sidebarArticles.map((art) => (
                <button
                  key={art.id}
                  onClick={() => {
                    if (art.id !== '2.51') {
                      alert(`Bạn đang mở bài viết mẫu: ${art.title}`);
                    }
                    setLeftSidebarOpenOnMobile(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs leading-relaxed transition-all flex items-start gap-2 ${
                    art.active 
                      ? 'bg-[#1B5FA8]/10 border-l-4 border-[#1B5FA8] text-[#0B2545] font-bold' 
                      : 'text-gray-600 hover:bg-gray-150'
                  }`}
                >
                  <span className="mt-0.5 select-none">📄</span>
                  <span className="block truncate">{art.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3-COLUMN STRUCTURAL LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-8 items-start">
          
          {/* 2. SIDEBAR TRÁI — Mục lục nhóm bài (md: 1 col, lg: 3 col) */}
          <aside className="hidden md:block md:col-span-1 lg:col-span-3 sticky top-[100px] space-y-6">
            
            {/* Box "Mục lục trang" (sticky on desktop, now placed on the left side above Software Category) */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm text-left">
              <span className="block text-[#0B2545] font-extrabold text-[11px] uppercase tracking-wider mb-3 pb-2 border-b border-[#E2E8F0]">
                📌 Mục lục trang này
              </span>
              <div className="space-y-2 text-xs border-l-2 border-[#E2E8F0] pl-3.5 ml-1">
                <button 
                  onClick={() => scrollToSection('tong-quan')}
                  className={`block text-left relative -left-[16px] pl-3.5 border-l-2 hover:text-[#1B5FA8] transition-colors cursor-pointer ${activeHeadingId === 'tong-quan' ? 'text-[#1B5FA8] font-bold border-[#1B5FA8]' : 'text-gray-500 border-transparent'}`}
                >
                  1. Tổng quan phương pháp
                </button>
                <button 
                  onClick={() => scrollToSection('huongdan-quy-trinh')}
                  className={`block text-left relative -left-[16px] pl-3.5 border-l-2 hover:text-[#1B5FA8] transition-colors cursor-pointer ${activeHeadingId === 'huongdan-quy-trinh' ? 'text-[#1B5FA8] font-bold border-[#1B5FA8]' : 'text-gray-500 border-transparent'}`}
                >
                  2. Quy trình liên thông
                </button>
                <button 
                  onClick={() => scrollToSection('bang-du-lieu')}
                  className={`block text-left relative -left-[16px] pl-3.5 border-l-2 hover:text-[#1B5FA8] transition-colors cursor-pointer ${activeHeadingId === 'bang-du-lieu' ? 'text-[#1B5FA8] font-bold border-[#1B5FA8]' : 'text-gray-500 border-transparent'}`}
                >
                  3. Bảng dữ liệu thầu mẫu
                </button>
                <button 
                  onClick={() => scrollToSection('cac-luu-y')}
                  className={`block text-left relative -left-[16px] pl-3.5 border-l-2 hover:text-[#1B5FA8] transition-colors cursor-pointer ${activeHeadingId === 'cac-luu-y' ? 'text-[#1B5FA8] font-bold border-[#1B5FA8]' : 'text-gray-500 border-transparent'}`}
                >
                  4. Các lưu ý quan trọng
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
              
              {/* Header sidebar */}
              <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between border-b border-[#1B5FA8]/20">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Danh mục</span>
                  <span className="text-sm font-black tracking-tight">Sử dụng phần mềm</span>
                </div>
                <span className="bg-[#F5A623] text-[#0B2545] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  28 bài
                </span>
              </div>

              {/* Scrollable Group List */}
              <div className="p-2 space-y-1 max-h-[58vh] overflow-y-auto custom-scrollbar">
                {sidebarArticles.map((art) => (
                  <button
                    key={art.id}
                    onClick={() => {
                      if (art.id !== '2.51') {
                        alert(`Chi tiết bài viết: ${art.title} đang được biên soạn thông tin chính xác. Chúng tôi hiển thị thông tin bài viết 2.51 để tham chiếu chi tiết.`);
                      }
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex items-start gap-2 border-l-2 leading-snug ${
                      art.active 
                        ? 'bg-[#1B5FA8]/8 border-[#1B5FA8] text-[#0B2545] font-bold shadow-sm' 
                        : 'border-transparent text-[#5A6475] hover:bg-[#F7F9FC] hover:text-[#0B2545]'
                    }`}
                  >
                    <span className="mt-0.5">📄</span>
                    <span className="line-clamp-2">{art.title}</span>
                  </button>
                ))}
              </div>

              {/* Bottom "Xem tất cả danh mục" button */}
              <div className="p-3 bg-slate-50 border-t border-[#E2E8F0] text-center">
                <button 
                  onClick={onBackToHome}
                  className="text-[11px] text-[#1B5FA8] hover:text-[#0B2545] font-extrabold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <span>Xem tất cả danh mục</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          </aside>

          {/* 3. NỘI DUNG CHÍNH (md: 3 col, lg: 6 col) */}
          <main className="col-span-1 md:col-span-3 lg:col-span-6 bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-8 shadow-sm">
            
            {/* Back to Home CTA trigger */}
            <button 
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs text-[#1B5FA8] hover:text-[#0B2545] font-bold mb-6 group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Quay lại Thư viện</span>
            </button>

            {/* 3a. Header bài viết */}
            <div className="mb-6">
              <span className="inline-block bg-[rgba(40,167,69,0.12)] text-[#28a745] px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-[0.06em] mb-3.5 border border-[#28a745]/15">
                🟢 Sử dụng phần mềm
              </span>
              
              <h1 className="text-[24px] font-medium text-[#1A1A18] leading-[1.25] mb-4 tracking-[-0.02em]">
                2.51 Lập Dự toán - Dự thầu xây dựng công trình
              </h1>

              {/* Meta information row */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-150">
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium text-[#1A1A18]">
                    <span className="w-6 h-6 rounded-full bg-[#1B5FA8] text-white text-[10px] flex items-center justify-center font-medium">KT</span>
                    <span>Khắc Tiệp</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-slate-500 font-normal">2 Thg 6, 2025</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-slate-500 font-normal">CN: 13 Thg 8, 2025</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-slate-500 font-normal">11,476</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-slate-500 font-normal">0</span>
                  </span>
                </div>

                {/* Micro Actions */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopyLink}
                    className="p-2 bg-slate-100 hover:bg-[#1B5FA8] hover:text-white rounded-lg text-gray-600 transition-all cursor-pointer"
                    title="Sao chép liên kết"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => window.open('https://facebook.com', '_blank')}
                    className="p-2 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-gray-600 transition-all cursor-pointer"
                    title="Chia sẻ Facebook"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Gray box excerpt block */}
            <div className="bg-[rgba(27,95,168,0.04)] border-l-4 border-[#1B5FA8] p-4 rounded-r-xl mb-8">
              <p className="text-[#73726C] text-[14px] font-normal leading-[1.5] italic">
                "Bài hướng dẫn chi tiết phương thức Lập Dự toán - Dự thầu xây dựng công trình tích hợp định mức và đơn giá chuẩn nhất theo các văn bản Thông tư 11/2021/TT-BXD, Thông tư 12/2021/TT-BXD, Thông tư 13/2021/TT-BXD ban hành bởi Bộ Xây dựng."
              </p>
            </div>

            {/* 3c. Table of Contents (Mục lục bài viết) */}
            <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5 mb-8">
              <h4 className="text-[#0B2545] font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 mb-3">
                <span>📋 Nội dung bài viết</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <button 
                    onClick={() => scrollToSection('tong-quan')}
                    className={`text-left hover:text-[#1B5FA8] hover:underline cursor-pointer ${activeHeadingId === 'tong-quan' ? 'font-bold text-[#1B5FA8]' : 'text-[#5A6475]'}`}
                  >
                    1. Tổng quan phương pháp Lập Dự toán thầu
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('huongdan-quy-trinh')}
                    className={`text-left hover:text-[#1B5FA8] hover:underline cursor-pointer ${activeHeadingId === 'huongdan-quy-trinh' ? 'font-bold text-[#1B5FA8]' : 'text-[#5A6475]'}`}
                  >
                    2. Quy trình 4 bước thực hiện liên thông trong BNSC
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('bang-du-lieu')}
                    className={`text-left hover:text-[#1B5FA8] hover:underline cursor-pointer ${activeHeadingId === 'bang-du-lieu' ? 'font-bold text-[#1B5FA8]' : 'text-[#5A6475]'}`}
                  >
                    3. Bảng phân phối giá gói thầu mẫu tham chiếu
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('cac-luu-y')}
                    className={`text-left hover:text-[#1B5FA8] hover:underline cursor-pointer ${activeHeadingId === 'cac-luu-y' ? 'font-bold text-[#1B5FA8]' : 'text-[#5A6475]'}`}
                  >
                    4. Các điểm quy định kỹ thuật cần lưu ý
                  </button>
                </li>
              </ul>
            </div>

            {/* 3e. ARTICLE BODY & DOCUMENT CONTENT */}
            <div className="prose max-w-none text-sm sm:text-base text-[#1A2332] space-y-6 leading-relaxed">
              
              {/* Section 1 */}
              <div id="tong-quan" ref={headingsRef['tong-quan']} className="scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-bold text-[#0B2545] border-l-4 border-[#F5A623] pl-3.5 mb-4">
                  1. Tổng quan phương pháp Lập Dự toán thầu
                </h2>
                <p>
                  Lập dự toán thầu và dự thầu công trình xây dựng là khâu can hệ mật thiết trực tiếp nâng cao năng lực cạnh tranh của các nhà thầu thi công. Trong môi trường quản lý xây dựng mới, việc áp dụng đồng bộ cơ sở dữ liệu định mức ban hành kèm thông tư Bộ Xây dựng là yêu cầu có tính chất bắt buộc.
                </p>
                <p>
                  Phần mềm <strong>Dự toán BNSC</strong> đã được lập trình giải thuật thông minh giúp kết nối đồng bộ trực tiếp hàng trăm bảng đơn giá xây dựng tại 63 tỉnh thành phố thông qua cơ chế cập nhật tự động trực tuyến đám mây bảo mật.
                </p>
              </div>

              {/* 3d. Video Section (if any) */}
              <div className="my-8">
                <span className="block font-bold text-[#0B2545] text-xs sm:text-sm uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-[#1B5FA8]" />
                  <span>▶ Video hướng dẫn thực hành trực quan:</span>
                </span>
                
                {/* 16:9 Video Box Wrapper */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-lg">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1" 
                    title="BNSC YouTube Tutorial"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                {/* Warning callout block underneath the video */}
                <div className="mt-3.5 bg-[#FFF8EC] border border-[#F5A623]/30 rounded-xl p-3 flex gap-2.5 items-start">
                  <AlertCircle className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 leading-relaxed m-0">
                    🔔 Hãy truy cập vào <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#1B5FA8] font-bold underline hover:text-[#0B2545]">Kênh Youtube Dự toán BNSC</a> chính thức và nhấn <strong>ĐĂNG KÝ</strong> để không bỏ lỡ các số tư vấn tình huống thực tế khác định kỳ hàng tuần.
                  </p>
                </div>
              </div>

              {/* Section 2 */}
              <div id="huongdan-quy-trinh" ref={headingsRef['huongdan-quy-trinh']} className="scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-bold text-[#0B2545] border-l-4 border-[#F5A623] pl-3.5 mb-4">
                  2. Quy trình 4 bước thực hiện liên thông trong BNSC
                </h2>
                <p>
                  Để lập một tệp dự án thầu hoàn thiện từ đầu tới công đoạn báo cáo xuất toán, người dùng hãy làm theo đúng chỉ dẫn 4 thao tác cốt lõi sau:
                </p>

                <ol className="list-decimal list-inside space-y-3 bg-slate-50 p-5 rounded-2xl border border-gray-150">
                  <li>
                    <strong className="text-[#0B2545]">Khai báo cơ sở dữ liệu nền:</strong> Chọn nạp danh mục đơn giá xây dựng địa phương tại các tỉnh thành tương ứng nơi dự án thi công.
                  </li>
                  <li>
                    <strong className="text-[#0B2545]">Tra dữ liệu mã hiệu công việc:</strong> Gõ mã hiệu như <em>AF.12111</em> hoặc gõ nhanh từ khóa bất kỳ để phần mềm truy xuất định mức hao phí nhân công, ca máy, vật liệu tương ứng.
                  </li>
                  <li>
                    <strong className="text-[#0B2545]">Tính toán bảng Giá vật tư:</strong> Nhập giá thị trường thực tế, bảng tính cự ly vận tải nâng cao và hao phí phụ trợ để bù trừ chuẩn vào tổng thầu.
                  </li>
                  <li>
                    <strong className="text-[#0B2545]">Tổng hợp kinh phí hạng mục:</strong> Sử dụng hệ mẫu chuẩn thông tư quy định áp dụng hệ số điều chỉnh tối ưu rồi kiểm tra lỗi trước khi in ấn xuất hồ sơ.
                  </li>
                </ol>
              </div>

              {/* Mock premium illustrations or screen mockups inside article body */}
              <div className="my-8 rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-slate-50 p-1">
                <img 
                  src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=700&q=80" 
                  alt="Mô tả giao diện lập dự toán BNSC"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto rounded-lg object-cover max-h-[340px]"
                />
                <div className="text-center py-2 bg-white text-xs text-gray-500 italic border-t border-[#E2E8F0]">
                  Hình 1: Đồ thị trực quan hoá phân bổ các chi phí cấu thành nên hạng mục công trình xây lắp.
                </div>
              </div>

              {/* Section 3 */}
              <div id="bang-du-lieu" ref={headingsRef['bang-du-lieu']} className="scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-bold text-[#0B2545] border-l-4 border-[#F5A623] pl-3.5 mb-4">
                  3. Bảng phân phối giá gói thầu mẫu tham chiếu
                </h2>
                <p>
                  Dưới đây là cơ cấu biểu phí tính toán định lượng cho một hạng mục chuẩn đã được thẩm định tự động thông qua công cụ phân tách dòng thầu của hệ thống phần mềm BNSC:
                </p>

                {/* Styled standard table structure */}
                <div className="overflow-x-auto my-6 border border-slate-200 rounded-xl shadow-sm">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#0B2545] text-white">
                        <th className="p-3 font-medium text-[11px] uppercase tracking-[0.04em]">Mã hiệu</th>
                        <th className="p-3 font-medium text-[11px] uppercase tracking-[0.04em]">Tên quy cách công tác</th>
                        <th className="p-3 font-medium text-[11px] uppercase tracking-[0.04em] text-right">Đơn vị</th>
                        <th className="p-3 font-medium text-[11px] uppercase tracking-[0.04em] text-right">Hệ số K</th>
                        <th className="p-3 font-medium text-[11px] uppercase tracking-[0.04em] text-right text-amber-500">Đơn giá thầu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-medium text-[#1B5FA8]">AF.11112</td>
                        <td className="p-3 font-normal text-slate-800">Bê tông cốt thép lót móng đường kính đá 1x2</td>
                        <td className="p-3 text-right font-normal text-slate-600">m³</td>
                        <td className="p-3 text-right font-mono font-normal text-slate-600 tabular-nums">1.025</td>
                        <td className="p-3 text-right text-[#0B2545] font-normal text-[13px] tracking-[-0.01em] tabular-nums">đ1.850.000</td>
                      </tr>
                      <tr className="bg-[#F7F9FC] hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-medium text-[#1B5FA8]">AG.12314</td>
                        <td className="p-3 font-normal text-slate-800">Lắp dựng ván khuôn móng bằng thép tấm định hình</td>
                        <td className="p-3 text-right font-normal text-slate-600">100m²</td>
                        <td className="p-3 text-right font-mono font-normal text-slate-600 tabular-nums">0.950</td>
                        <td className="p-3 text-right text-[#0B2545] font-normal text-[13px] tracking-[-0.01em] tabular-nums">đ6.240.000</td>
                      </tr>
                      <tr className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-medium text-[#1B5FA8]">AI.25141</td>
                        <td className="p-3 font-normal text-slate-800">Gia công chế tạo cốt thép móng đường kính d ≤ 18mm</td>
                        <td className="p-3 text-right font-normal text-slate-600">tấn</td>
                        <td className="p-3 text-right font-mono font-normal text-slate-600 tabular-nums">1.000</td>
                        <td className="p-3 text-right text-[#0B2545] font-normal text-[13px] tracking-[-0.01em] tabular-nums">đ15.800.000</td>
                      </tr>
                      <tr className="bg-[#F7F9FC] hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-medium text-[#1B5FA8]">AK.41201</td>
                        <td className="p-3 font-normal text-slate-800">Sản xuất vận chuyển vữa bê tông nhựa hạt trung</td>
                        <td className="p-3 text-right font-normal text-slate-600">m³</td>
                        <td className="p-3 text-right font-mono font-normal text-slate-600 tabular-nums">1.120</td>
                        <td className="p-3 text-right text-[#0B2545] font-normal text-[13px] tracking-[-0.01em] tabular-nums">đ2.420.000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4 */}
              <div id="cac-luu-y" ref={headingsRef['cac-luu-y']} className="scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-bold text-[#0B2545] border-l-4 border-[#F5A623] pl-3.5 mb-4">
                  4. Các điểm quy định kỹ thuật cần lưu ý
                </h2>
                <p>
                  Khi làm hồ sơ đấu thầu trên máy tính, kỹ sư xây dựng đặc biệt cần kiểm tra chéo các thông số vật liệu để tránh bị loại vì lỗi hình thức:
                </p>
                <p>
                  - Luôn cập nhật đầy đủ bảng giá thuế VAT mới ban hành đúng thời điểm quy hoạch quyết định dự thầu.<br/>
                  - Không tự ý sửa đổi thủ công tên mã hiệu gốc của Định mức Bộ Xây dựng trong phần mềm để liên kết biểu thức Excel xuất thầu hoạt động thông suốt.
                </p>
              </div>

            </div>

            {/* 3f. File đính kèm tài liệu học tập (nếu có) */}
            <div className="mt-10 bg-[rgba(27,95,168,0.05)] border-2 border-dashed border-[#1B5FA8]/20 rounded-2xl p-5 text-left">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#1B5FA8]/10 text-[#1B5FA8] rounded-xl flex items-center justify-center font-bold">
                    <Paperclip className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-[14px] font-bold text-[#0B2545] mb-0.5">Tài liệu lập thầu BNSC tham khảo</h5>
                    <span className="text-xs text-gray-500 font-mono">DutoanBNSC_Huongdan_2.51.pdf (12.4 MB)</span>
                  </div>
                </div>
                
                <a 
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert('Đang chuẩn bị gói dữ liệu. Tài liệu hướng dẫn bản đẹp định dạng PDF sẽ được tải về máy của bạn ngay lập tức.'); }}
                  className="bg-[#1B5FA8] text-white hover:bg-[#0B2545] font-extrabold text-xs px-5 py-3 rounded-lg flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải xuống tài liệu</span>
                </a>
              </div>
            </div>

            {/* 3g. Feedback cuối bài */}
            <div className="mt-10 pt-8 border-t border-[#E1E5ED] text-center">
              <p className="text-[#0B2545] font-extrabold text-sm mb-4">Bài viết này có hữu ích với bạn không?</p>
              
              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={() => setFeedback('like')}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    feedback === 'like' 
                      ? 'bg-emerald-500 border-transparent text-white shadow-md' 
                      : 'bg-white border-[#E2E8F0] hover:border-emerald-500 hover:text-emerald-500 text-gray-600'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>👍 Có ích</span>
                </button>

                <button
                  onClick={() => setFeedback('neutral')}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    feedback === 'neutral' 
                      ? 'bg-amber-500 border-transparent text-white shadow-md' 
                      : 'bg-white border-[#E2E8F0] hover:border-amber-500 hover:text-amber-500 text-gray-600'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>🤔 Chưa rõ</span>
                </button>

                <button
                  onClick={() => setFeedback('dislike')}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    feedback === 'dislike' 
                      ? 'bg-rose-500 border-transparent text-white shadow-md' 
                      : 'bg-white border-[#E2E8F0] hover:border-rose-500 hover:text-rose-500 text-gray-600'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>👎 Không giải quyết được</span>
                </button>
              </div>

              {feedback && (
                <p className="mt-4 text-xs font-semibold text-emerald-500 animate-pulse">
                  ✨ Chân thành cám ơn đóng góp của bạn! Phản hồi của bạn đã được gửi đến Ban biên tập BNSC.
                </p>
              )}
            </div>

            {/* 3h. Bài viết liên quan (Related) */}
            <div className="mt-12 pt-8 border-t border-[#E1E5ED]">
              <h4 className="text-sm font-extrabold uppercase text-[#0B2545] tracking-widest mb-6 flex items-center gap-1.5">
                <span>🔄 Xem tiếp trong nhóm này</span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedArticles.map((rel) => (
                  <article 
                    key={rel.id} 
                    className="bg-white rounded-xl overflow-hidden border border-[#E2E8F0] hover:shadow-md transition-shadow group cursor-pointer text-left flex flex-col justify-between"
                    onClick={() => {
                      alert(`Đang tải dữ liệu hướng dẫn cùng nhóm: ${rel.title}`);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                      <img 
                        src={rel.imageUrl} 
                        alt={rel.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 bg-[#0B2545] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase font-mono">
                        {rel.category}
                      </span>
                    </div>

                    <div className="p-3">
                      <h5 className="text-[12.5px] font-bold text-[#0B2545] leading-snug line-clamp-2 group-hover:text-[#1B5FA8] transition-colors">
                        {rel.title}
                      </h5>
                      <div className="mt-2 text-[10px] text-gray-400 font-mono flex items-center justify-between">
                        <span>👁 {rel.views.toLocaleString()} views</span>
                        <span>{rel.date}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

          </main>

          {/* 4. SIDEBAR PHẢI (md: 4 col, lg: 3 col) */}
          <aside className="col-span-1 md:col-span-4 lg:col-span-3 space-y-6 lg:self-start lg:sticky lg:top-[100px]">
            
            {/* 4a. Box "Tin Hot" */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#0B2545] text-white p-3.5 flex items-center gap-2 font-black text-xs uppercase tracking-wider border-b border-[#1B5FA8]/20">
                <Flame className="w-4 h-4 text-[#F5A623] animate-pulse" />
                <span>🔥 TIN HOT NHẤT</span>
              </div>
              
              <div className="divide-y divide-[#E2E8F0]">
                {hotNews.map((news) => (
                  <div 
                    key={news.id} 
                    className="p-3 hover:bg-slate-50 transition-colors flex gap-2.5 items-start cursor-pointer text-left"
                    onClick={() => {
                      alert(`Chúng tôi đang liên kết thông thầu bài cập nhật: ${news.title}`);
                    }}
                  >
                    <img 
                      src={news.imageUrl} 
                      alt={news.title}
                      className="w-14 h-14 object-cover rounded-lg shrink-0 border border-[#CBD5E1]"
                    />
                    <div className="min-w-0">
                      <h5 className="text-[12px] font-bold text-[#0B2545] leading-snug line-clamp-2 hover:text-[#1B5FA8] transition-colors mb-1">
                        {news.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                        <span className="truncate max-w-[60px]">{news.author}</span>
                        <span>•</span>
                        <span>👁 {news.views}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>



            {/* 4c. Box CTA Download */}
            <div className="bg-gradient-to-br from-[#0B2545] to-[#1B5FA8] text-white p-5 rounded-2xl shadow-md text-left relative overflow-hidden">
              <div className="absolute right-[-20px] bottom-[-20px] text-white/5 font-black text-6xl pointer-events-none select-none">
                v1.20
              </div>
              
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-ping" />
                <span className="text-[10px] text-[#F5A623] font-black uppercase tracking-widest">Bản cập nhật v1.20</span>
              </div>
              
              <h4 className="text-sm font-bold leading-relaxed mb-1 text-white">
                Tải phần mềm BNSC mới nhất
              </h4>
              <p className="text-xs text-gray-300 leading-normal mb-4">
                Hỗ trợ trọn vẹn toàn bộ các Thông tư, Nghị định và đơn giá mới nhất của năm 2026.
              </p>

              <button 
                onClick={onDownloadCtaClick}
                className="w-full bg-[#F5A623] text-[#0B2545] hover:bg-white text-xs font-black py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>⬇ Download bộ quà tặng ngay</span>
              </button>
            </div>

            {/* 4d. Social Share Widgets */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm text-left">
              <span className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-3">
                Chia sẻ bài hướng dẫn này:
              </span>
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => window.open('https://facebook.com', '_blank')}
                  className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => window.open('https://youtube.com', '_blank')}
                  className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleCopyLink}
                  className="w-9 h-9 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-600 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                  title="Copy link bài"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

          </aside>

        </div>

      </div>

      {/* 5. STICKY BOTTOM BAR (mobile only) */}
      {showStickyBottom && (
        <div className="md:hidden fixed bottom-0 left-0 w-full h-[56px] bg-white border-t border-[#CBD5E1] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] z-40 flex items-center justify-between px-4">
          <div className="min-w-0 pr-3 text-left">
            <span className="text-[10px] text-[#28a745] font-bold uppercase block tracking-wider">Đang xem hướng dẫn</span>
            <span className="text-xs font-bold text-[#0B2545] truncate block">
              2.51 Lập Dự toán - Dự thầu thầu...
            </span>
          </div>

          <button 
            onClick={onDownloadCtaClick}
            className="bg-[#1B5FA8] hover:bg-[#0B2545] text-white font-extrabold text-[11px] px-3.5 py-2.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Download className="w-3 h-3" />
            <span>Tải BNSC</span>
          </button>
        </div>
      )}

    </div>
  );
}
