import React, { useState, useEffect } from 'react';
import { Menu, X, User, ArrowRight, ShieldCheck, ChevronDown } from 'lucide-react';
import { navLinks } from '../data';

interface NavbarProps {
  onDownloadClick: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const softwareDropdownItems = [
  { name: 'Dự toán BNSC', href: '#du-toan' },
  { name: 'Quản lý Dự án BNSC', href: '#du-toan' },
  { name: 'Quản lý tiến độ BNSC', href: '#du-toan' },
  { name: 'Quản lý Vốn', href: '#du-toan' },
  { name: 'Phần mềm theo đơn đặt hàng', href: '#du-toan' }
];

export default function Navbar({ onDownloadClick, onLoginClick, onRegisterClick }: NavbarProps) {
  const [activeSection, setActiveSection] = useState('trang-chu');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  // Monitor scrolling to highlight section and add shadow/solid background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Simple active link detection based on section elements
      const scrollPosition = window.scrollY + 120;
      const sections = ['trang-chu', 'gioi-thieu', 'tin-tuc', 'thuvien-tinhhuong', 'du-toan', 'tu-van', 'dao-tao', 'lien-he'];
      
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setIsMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80; // height of navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header 
      id="navbar-sticky"
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/97 shadow-md backdrop-blur-md border-b border-slate-100 py-3' 
          : 'bg-white/90 border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Brand Section */}
          <a 
            href="#trang-chu"
            onClick={(e) => { e.preventDefault(); handleLinkClick('#trang-chu'); }}
            className="flex items-center gap-3 group"
          >
            <div className="relative flex items-center justify-center w-11 h-11 transition-transform duration-300 group-hover:scale-105 shrink-0">
              <img 
                src="https://bacnam.com.vn/uploads/logo/logo_60b98e41a181e3.png" 
                alt="Bac Nam Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="flex flex-col">
              <span className="text-[#1A1A18] font-medium text-lg tracking-wide leading-none uppercase group-hover:text-[#E09413] transition-colors font-sans">
                Bắc Nam
              </span>
              <span className="text-[10px] text-slate-500 tracking-widest font-medium uppercase mt-1.5 group-hover:text-slate-800 transition-colors font-sans leading-none">
                SOFTWARE
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              
              if (link.name === 'Phần mềm') {
                return (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(link.href);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-1 cursor-pointer relative ${
                        isActive 
                          ? 'text-[#E09413] font-medium' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#E09413]' : 'text-slate-400'}`} />
                      {isActive && (
                        <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#E09413] rounded-full" />
                      )}
                    </button>
                    
                    {/* Dropdown Menu Overlay */}
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 transition-all duration-200 z-50 ${
                      isDropdownOpen 
                        ? 'opacity-100 translate-y-0 visible pointer-events-auto' 
                        : 'opacity-0 -translate-y-1 invisible pointer-events-none'
                    }`}>
                      <div className="bg-white border border-slate-100 rounded-xl shadow-lg py-2.5">
                        {softwareDropdownItems.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            onClick={(e) => {
                              e.preventDefault();
                              setIsDropdownOpen(false);
                              handleLinkClick(item.href);
                            }}
                            className="block px-4 py-2 text-[13.5px] text-slate-600 hover:text-[#E09413] hover:bg-slate-50 font-normal transition-colors text-left"
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.href);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 relative ${
                    isActive 
                      ? 'text-[#E09413] font-medium' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#E09413] rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* User Sign-In Action Area */}
          <div className="hidden lg:flex items-center gap-3">
            <button 
              onClick={onLoginClick}
              className="text-slate-600 hover:text-slate-900 text-sm font-medium px-4 py-2 rounded-lg transition-all border border-transparent hover:border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-500" />
              Đăng nhập
            </button>
            <button 
              onClick={onRegisterClick}
              className="bg-gradient-to-r from-[#F5A623] to-[#E09413] hover:brightness-110 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center gap-1 cursor-pointer"
            >
              Đăng ký
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onDownloadClick}
              className="px-3 py-1.5 bg-gradient-to-r from-[#F5A623] to-[#E09413] text-white font-medium text-xs rounded-md shadow-sm hover:brightness-110 transition-all"
            >
              Tải v1.20
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-[#E09413]" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-2xl py-6 px-4 animate-fadeIn z-55">
          <nav className="flex flex-col gap-2 mb-6">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              
              if (link.name === 'Phần mềm') {
                return (
                  <div key={link.name} className="flex flex-col">
                    <button
                      onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                      className={`px-4 py-3 rounded-lg text-base transition-all flex items-center justify-between text-left ${
                        isActive 
                          ? 'bg-amber-50 text-[#E09413] font-medium' 
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-normal'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileDropdownOpen ? 'rotate-180 text-[#E09413]' : 'text-slate-500'}`} />
                    </button>
                    
                    {/* Collapsible Submenu List */}
                    {isMobileDropdownOpen && (
                      <div className="pl-4 pr-2 flex flex-col gap-1 mt-1 border-l-2 border-slate-100 ml-4">
                        {softwareDropdownItems.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            onClick={(e) => {
                              e.preventDefault();
                              setIsMobileMenuOpen(false);
                              handleLinkClick(item.href);
                            }}
                            className="px-4 py-2 text-[14px] text-slate-600 hover:text-[#E09413] rounded-md hover:bg-slate-50 transition-colors text-left"
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.href);
                  }}
                  className={`px-4 py-3 rounded-lg text-base transition-all text-left ${
                    isActive 
                      ? 'bg-amber-50 text-[#E09413] border-l-4 border-[#E09413] font-medium' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-normal'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
            <button 
              onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }}
              className="w-full text-center text-slate-700 hover:text-slate-950 font-medium py-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-emerald-500" />
              Đăng nhập tài khoản
            </button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); onRegisterClick(); }}
              className="w-full text-center bg-gradient-to-r from-[#F5A623] to-[#E09413] text-white font-medium py-3 rounded-lg hover:brightness-110 flex items-center justify-center gap-2 shadow-md transition-all"
            >
              Đăng ký mua bản quyền
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Phần mềm chính hãng được bảo hành bởi Bắc Nam Software
          </div>
        </div>
      )}
    </header>
  );
}
