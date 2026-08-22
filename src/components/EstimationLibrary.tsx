import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Settings, Play, ShieldAlert, FileCheck, HelpCircle, BookOpen, User, Calendar, Eye, Search, ChevronRight } from 'lucide-react';
import { useApi } from '../lib/api';
import { useCategories } from '../lib/content';
import { libraryFallback, mapLibrary, type ApiLibrary } from '../lib/publicData';

type LibraryItem = ApiLibrary;

export default function EstimationLibrary() {
  const navigate = useNavigate();
  const { data: libraryItems } = useApi('/api/public/library', libraryFallback, mapLibrary);
  const [activeTab, setActiveTab] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(8);

  // Tab lấy từ CSDL; emoji lưu ngay trên bản ghi danh mục (cột `emoji`).
  const { leaves: libraryCategories } = useCategories('LIBRARY');

  const tabs = useMemo(
    () => [
      { name: 'Tất cả', emoji: '📚' },
      ...libraryCategories.map((c) => ({ name: c.name, emoji: c.emoji ?? '📄' })),
    ],
    [libraryCategories],
  );

  // Map category to color scheme specifications
  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'Download':
        return 'bg-[#1B5FA8] text-white';
      case 'Cài đặt':
        return 'bg-[rgba(27,95,168,0.12)] text-[#1B5FA8] border border-[#1B5FA8]/10';
      case 'Sử dụng':
        return 'bg-[rgba(40,167,69,0.12)] text-[#28a745] border border-[#28a745]/10';
      case 'Thẩm định':
        return 'bg-[rgba(111,66,193,0.12)] text-[#6f42c1] border border-[#6f42c1]/10';
      case 'Tình huống khác':
        return 'bg-[rgba(245,166,35,0.15)] text-[#D4891A] border border-[#F5A623]/20';
      case 'Lập Dự toán - Dự thầu':
        return 'bg-[rgba(220,53,69,0.1)] text-[#dc3545] border border-[#dc3545]/10';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Extract leading numbers safely from titles (e.g. "1.20", "2.51")
  const parseVersionPrefix = (title: string) => {
    const match = title.match(/^([0-9]+\.[0-9]+)\s/);
    if (match) {
      return {
        prefix: match[1],
        rest: title.substring(match[1].length).trim()
      };
    }
    return {
      prefix: '',
      rest: title
    };
  };

  // Live filter list depending on Category Selection & Text searches
  const filteredItems = useMemo(() => {
    let list = libraryItems;
    if (activeTab !== 'Tất cả') {
      list = list.filter(item => item.category === activeTab);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(item =>
        item.title.toLowerCase().includes(q) ||
        (item.author ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [libraryItems, activeTab, searchQuery]);

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const loadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  return (
    <section id="thuvien-tinhhuong" className="py-12 bg-white border-t border-[#E1E5ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-1 h-1 rounded-full bg-[#F5A623]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#185FA5]">
              Thư viện hướng dẫn sử dụng
            </span>
            <span className="w-1 h-1 rounded-full bg-[#F5A623]" />
          </div>
          
          <h2 className="text-[24px] font-medium text-[#1A1A18] tracking-[-0.02em] leading-[1.25] mb-3">
            Tình huống sử dụng Dự toán BNSC
          </h2>
          <div className="h-[2px] w-12 bg-[#F5A623] mx-auto rounded-full mb-3" />
          <p className="text-[#73726C] text-[14px] leading-[1.5] font-normal">
            Kho tài liệu chuyên môn và hướng dẫn giải pháp khắc phục sự cố, cấu hình kỹ thuật từ đội ngũ kỹ sư BNSC chính hãng.
          </p>
        </div>

        {/* Tab bar (sticky khi scroll qua) */}
        <div className="sticky top-[72px] lg:top-[80px] z-25 bg-white/95 backdrop-blur-md py-3 mb-8 border-b border-[#E1E5ED] -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-all duration-200">
          <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            
            {/* Scrollable pills bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 xl:pb-0 scrollbar-none scroll-smooth shrink-0 min-w-0">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => { setActiveTab(tab.name); setVisibleCount(8); }}
                    className={`px-3.5 py-2 rounded-full text-[13px] transition-all whitespace-nowrap cursor-pointer border ${
                      isActive 
                        ? 'bg-[#0B2545] text-white font-medium border-transparent shadow-sm' 
                        : 'bg-white text-[#73726C] font-normal border-[#E2E8F0] hover:border-[#1B5FA8] hover:text-[#0B2545]'
                    }`}
                  >
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Inline search filter */}
            <div className="relative w-full xl:w-80 shrink-0">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Tra cứu tình huống, mã hiệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-[14px] font-normal outline-none focus:border-[#1B5FA8] transition-colors shadow-sm text-[#1A1A18]"
              />
            </div>

          </div>
        </div>

        {/* Library Grid Layout */}
        {displayedItems.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-10 px-6 bg-slate-50 rounded-xl border border-dashed border-[#E1E5ED]">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-[15px] font-medium text-[#1A1A18] mb-1">Không có kết quả hướng dẫn</h4>
            <p className="text-[12px] text-[#73726C]">Thử gõ một từ khóa chung khác hoặc nhấp vào tab "Tất cả" để xem toàn bộ sơ sở dữ liệu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayedItems.map((item) => {
              const { prefix, rest } = parseVersionPrefix(item.title);
              
              return (
                <article
                  key={item.id}
                  onClick={() => navigate(`/thu-vien/${item.slug}`)}
                  className="bg-white rounded-xl overflow-hidden border border-[#E1E5ED] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between cursor-pointer"
                >
                  {/* Aspect-Ratio Video Crop thumbnail */}
                  <div className="relative aspect-video w-full bg-[#0B2545] overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      <img
                        loading="lazy"
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}

                    {/* Gradient Screen overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B2545]/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    
                    {/* Floating BNSC watermark */}
                    <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none select-none">
                      <span className="text-white/5 font-medium text-xl tracking-wider uppercase">BNSC</span>
                    </div>

                    {/* Hanging Category Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-normal ${getCategoryClass(item.category)}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Text Description Body */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between text-left">
                    <div>
                      {/* Leading index number indicator if we parsed any */}
                      {prefix ? (
                        <span className="text-[11px] font-medium text-[#854F0B] bg-[#F5A623]/10 px-1.5 py-0.5 rounded mr-1.5 mb-1 inline-block font-mono">
                          {prefix}
                        </span>
                      ) : null}

                      {/* Clamped title text */}
                      <h3 className="text-[14px] font-medium text-[#1A1A18] leading-[1.4] tracking-normal mb-1.5 group-hover:text-[#185FA5] transition-colors line-clamp-2">
                        {rest}
                      </h3>
                    </div>

                    {/* Metadata line */}
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#73726C] font-normal">
                        <span className="truncate max-w-[100px]">{item.author}</span>
                        <span className="text-gray-300 select-none">•</span>
                        <span className="tabular-nums">{item.date}</span>
                        <span className="text-gray-300 select-none">•</span>
                        <span className="tabular-nums whitespace-nowrap">{item.views.toLocaleString()} lượt xem</span>
                      </div>

                      {/* Hover action indicator inline */}
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-[#185FA5] font-medium transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 duration-200 h-0 group-hover:h-4 overflow-hidden">
                        <span>Chi tiết bài viết</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>

                  </div>

                </article>
              );
            })}
          </div>
        )}

        {/* Load more logic button */}
        {filteredItems.length > visibleCount && (
          <div className="mt-12 text-center">
            <button
              onClick={loadMore}
              className="bg-transparent border-2 border-[#1B5FA8]/20 hover:border-[#1B5FA8] text-[#1B5FA8] font-extrabold px-8 py-3 rounded-xl text-sm transition-all focus:outline-none cursor-pointer hover:bg-[#1B5FA8]/5"
            >
              📚 Xem thêm bài hướng dẫn khác
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
