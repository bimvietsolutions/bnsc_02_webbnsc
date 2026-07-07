import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Eye, ArrowRight, BookOpen, ChevronRight, Search, X, User } from 'lucide-react';
import { useApi } from '../lib/api';
import { newsFallback, mapNews, type ApiNews } from '../lib/publicData';

type NewsItem = ApiNews;

export default function NewsSection() {
  const navigate = useNavigate();
  const { data: newsArticles } = useApi('/api/public/news', newsFallback, mapNews);
  const [selectedTab, setSelectedTab] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const openArticle = (item: NewsItem) => navigate(`/tin-tuc/${item.slug}`);

  const tabs = ['Tất cả', 'Nội bộ', 'Chuyên ngành', 'Văn bản QPPL', 'Khuyến mãi'];

  // Preserved static category counts to perfectly align with user's screenshot counts
  const tabCounts: Record<string, number> = {
    'Tất cả': 42,
    'Nội bộ': 12,
    'Chuyên ngành': 18,
    'Văn bản QPPL': 28,
    'Khuyến mãi': 5
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Văn bản QPPL':
        return {
          bg: 'bg-[#1B5FA8]/10',
          text: 'text-[#1B5FA8]',
          border: 'border-[#1B5FA8]/20'
        };
      case 'Nội bộ':
        return {
          bg: 'bg-[#28a745]/10',
          text: 'text-[#28a745]',
          border: 'border-[#28a745]/20'
        };
      case 'Chuyên ngành':
        return {
          bg: 'bg-[#6f42c1]/10',
          text: 'text-[#6f42c1]',
          border: 'border-[#6f42c1]/20'
        };
      case 'Khuyến mãi':
        return {
          bg: 'bg-[#f5a623]/10',
          text: 'text-[#D4891A]',
          border: 'border-[#f5a623]/20'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          border: 'border-gray-200'
        };
    }
  };

  // Process data (Filter & Sort)
  const processedNews = useMemo(() => {
    let result = [...newsArticles];

    // Filter by Tab
    if (selectedTab !== 'Tất cả') {
      result = result.filter(item => item.category === selectedTab);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.excerpt.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'views') {
      result.sort((a, b) => b.views - a.views);
    } else {
      // Natural / ID / Newest order
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [newsArticles, selectedTab, searchQuery, sortBy]);

  // Extract featured layout (1 Large card and 3 Stacked list cards)
  const { featuredItem, listItems, remainingGridItems } = useMemo(() => {
    // Top section only appears if we are in "Tất cả" (or have plenty of items) and no active query on Page 1
    const useFeaturedLayout = selectedTab === 'Tất cả' && searchQuery.trim() === '' && currentPage === 1;

    if (!useFeaturedLayout || processedNews.length < 4) {
      return { 
        featuredItem: null, 
        listItems: [], 
        remainingGridItems: processedNews 
      };
    }

    const first = processedNews[0];
    const stack = processedNews.slice(1, 4);
    const grid = processedNews.slice(4);

    return {
      featuredItem: first,
      listItems: stack,
      remainingGridItems: grid
    };
  }, [processedNews, selectedTab, searchQuery, currentPage]);

  // Pagination for grid items
  const itemsPerPage = 6;
  const paginatedGridItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return remainingGridItems.slice(startIndex, startIndex + itemsPerPage);
  }, [remainingGridItems, currentPage]);

  const totalPages = Math.max(1, Math.ceil(remainingGridItems.length / itemsPerPage));

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <section id="tin-tuc" className="bg-[#F7F9FC] pb-24 text-left">
      
      {/* 1. Header Banner - Matching the style of dark themed hero segment with subtle grid decoration */}
      <div className="bg-[#0B2545] text-white py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1B5FA8_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-5 h-[1.5px] bg-[#F5A623]"></span>
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#F5A623]">
              TIN TỨC & CẬP NHẬT
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-medium tracking-[-0.02em] mt-1 text-white leading-[1.1]">
            Tin tức Bắc Nam Software
          </h1>
          <p className="text-slate-400 text-[14px] mt-2 max-w-2xl mx-auto leading-[1.5] font-normal">
            Văn bản pháp luật, thông tin nội bộ, chuyên ngành xây dựng và khuyến mãi mới nhất
          </p>
        </div>
      </div>

      {/* 2. Filter Tab bar and Sort selection row */}
      <div className="border-b border-[#E1E5ED] bg-white sticky top-[64px] lg:top-[80px] z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-3">
            
            {/* Left Tabs with numeric counts inside rounded capsules */}
            <div className="flex items-center gap-5 overflow-x-auto whitespace-nowrap scrollbar-none pb-1.5 sm:pb-0">
              {tabs.map((tab) => {
                const isActive = selectedTab === tab;
                const count = tabCounts[tab] || 0;
                return (
                  <button
                    key={tab}
                    onClick={() => { 
                      setSelectedTab(tab); 
                      setCurrentPage(1); 
                      setSearchQuery('');
                    }}
                    className={`text-[13px] py-1.5 relative border-b-2 font-normal cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
                      isActive 
                        ? 'border-[#185FA5] text-[#185FA5] font-medium' 
                        : 'border-transparent text-[#73726C] hover:text-[#1A1A18]'
                    }`}
                  >
                    <span>{tab}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium transition-all tabular-nums ${
                      isActive 
                        ? 'bg-[#185FA5]/10 text-[#185FA5]' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Side Search & Sort */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Dynamic search input box */}
              <div className="relative w-full sm:w-52 md:w-60">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Tìm tin nhanh..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-[13px] text-[#1A1A18] placeholder-gray-400 focus:outline-none focus:border-[#185FA5] focus:bg-white transition-colors font-sans"
                />
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 text-[13px] text-[#73726C]">
                <span className="font-normal text-slate-400">Sắp xếp:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-[#E1E5ED] rounded-lg px-2 py-1 font-medium text-[#1A1A18] text-[13px] outline-none cursor-pointer focus:border-[#185FA5] hover:bg-slate-50"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="views">Lượt xem nhiều</option>
                </select>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* 3. Main Body Context Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {processedNews.length === 0 ? (
          /* Empty layout state */
          <div className="bg-white rounded-2xl border border-[#E1E5ED] p-16 text-center text-gray-500 shadow-sm max-w-xl mx-auto my-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-[#0B2545] mb-2">Chưa tìm thấy tin tức tương ứng</h3>
            <p className="text-sm text-gray-400 mb-4 font-medium">Bộ lọc hoặc từ khóa tìm kiếm của bạn hiện chưa có kết quả phù hợp nào trên cơ sở dữ liệu.</p>
            <button 
              onClick={() => { setSelectedTab('Tất cả'); setSearchQuery(''); }}
              className="text-sm font-bold text-[#1B5FA8] hover:underline"
            >
              Xem tất cả tin tức &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Top Row: Featured Layout (Displays ONLY on page 1 of 'Tất cả' tab with no search) */}
            {featuredItem && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
                
                {/* Left Large Column - Primary Article */}
                <div 
                  className="lg:col-span-7 flex flex-col group cursor-pointer"
                  onClick={() => openArticle(featuredItem)}
                >
                  <article className="bg-white rounded-xl overflow-hidden border border-[#E1E5ED] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex-1 flex flex-col justify-between">
                    
                    {/* BNSC Watermarked Gradient Placeholder or Image */}
                    <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#0B2545] flex items-center justify-center shrink-0">
                      <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] opacity-10"></div>
                      <span className="text-4xl font-medium tracking-widest text-white/5 select-none font-mono">
                        BNSC
                      </span>
                      
                      {/* Badge overlying image */}
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-0.5 bg-[#0B2545]/90 border border-white/10 backdrop-blur text-[11px] font-medium text-[#F5A623] rounded flex items-center gap-1 shadow-sm">
                          {featuredItem.category}
                        </span>
                      </div>
                    </div>

                    {/* Meta and description values */}
                    <div className="p-4 text-left flex-1 flex flex-col justify-between">
                      <div>
                        {/* Meta indicators */}
                        <div className="flex items-center gap-2.5 text-[11px] text-[#73726C] mb-2 font-normal">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#185FA5]" /> {featuredItem.date}
                          </span>
                          <span className="text-gray-300 select-none">•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-[#73726C]" /> {featuredItem.views.toLocaleString()} lượt xem
                          </span>
                        </div>

                        <h3 className="text-[16px] sm:text-[18px] font-medium text-[#1A1A18] leading-[1.3] mb-1.5 group-hover:text-[#185FA5] transition-colors line-clamp-2">
                          {featuredItem.title}
                        </h3>

                        <p className="text-[#73726C] text-[13px] leading-[1.5] line-clamp-2 mb-4">
                          {featuredItem.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11.5px] text-[#73726C] mt-auto pt-3 border-t border-slate-100 font-normal">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-[#185FA5]" /> Khắc Tiệp (Ban Biên Tập)
                        </span>
                        <span className="hover:text-[#185FA5] text-[#185FA5] font-medium flex items-center gap-0.5">
                          Đọc chi tiết <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                  </article>
                </div>

                {/* Right Stacked Column - 3 Secondary Articles */}
                <div className="lg:col-span-5 flex flex-col justify-start gap-3">
                  {listItems.map((item) => {
                    const theme = getCategoryTheme(item.category);
                    return (
                      <article
                        key={item.id}
                        onClick={() => openArticle(item)}
                        className="bg-white rounded-xl border border-[#E1E5ED] p-3 flex items-center gap-3 hover:shadow-md hover:border-l-4 hover:border-l-[#185FA5] hover:translate-x-0.5 cursor-pointer transition-all duration-200 group text-left"
                      >
                        {/* Left rounded square image block with letters "BN" watermark */}
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative bg-[#0B2545] shadow-inner">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2545] to-[#133760] opacity-90"></div>
                          <span className="text-[14px] font-medium text-white/5 font-mono select-none">
                            BN
                          </span>
                        </div>

                        {/* Title and Badge parameters */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-normal border ${theme.bg} ${theme.text} ${theme.border}`}>
                              {item.category}
                            </span>
                            <span className="text-[11px] text-[#73726C] font-normal flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#185FA5]" /> {item.date}
                            </span>
                          </div>

                          <h4 className="text-[13px] font-medium text-[#1A1A18] tracking-normal leading-[1.3] line-clamp-2 group-hover:text-[#185FA5] transition-colors">
                            {item.title}
                          </h4>

                          <div className="flex items-center gap-1 text-[11px] text-[#73726C] mt-1 font-normal">
                            <Eye className="w-3 h-3 text-slate-300" />
                            <span className="tabular-nums">{item.views.toLocaleString()} lượt xem</span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

              </div>
            )}

            {/* Bottom segment: Listing Grid under the horizontal divider */}
            <div className="space-y-5">
              
              {/* Golden Line accent heading */}
              <div className="flex items-center gap-2 border-b border-[#E1E5ED] pb-2.5">
                <span className="w-4 h-[2px] bg-[#F5A623] rounded-full"></span>
                <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#1A1A18]">
                  TẤT CẢ BÀI VIẾT
                </span>
              </div>

              {/* Grid block of other items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedGridItems.map((item) => {
                  const theme = getCategoryTheme(item.category);
                  return (
                    <article
                      key={item.id}
                      onClick={() => openArticle(item)}
                      className="bg-white rounded-xl overflow-hidden border border-[#E1E5ED] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer group text-left"
                    >
                      {/* Image header with BNSC watermark */}
                      <div className="relative h-36 w-full overflow-hidden bg-[#0B2545] flex items-center justify-center shrink-0">
                        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px] opacity-10"></div>
                        <span className="text-2xl font-medium tracking-wider text-white/5 select-none font-mono">
                          BNSC
                        </span>
                      </div>

                      {/* Info & titles */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Segment styling */}
                          <div className="mb-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-normal border ${theme.bg} ${theme.text} ${theme.border}`}>
                              {item.category}
                            </span>
                          </div>

                          <h3 className="text-[14px] font-medium text-[#1A1A18] leading-[1.35] mb-2 group-hover:text-[#185FA5] transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </div>

                        {/* Card metadata block */}
                        <div className="flex items-center justify-between text-[11px] text-[#73726C] mt-3 pt-2 border-t border-slate-50 font-normal select-none">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#185FA5]" /> {item.date}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Eye className="w-3.5 h-3.5 text-slate-300" /> <span className="tabular-nums">{item.views.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>

                    </article>
                  );
                })}
              </div>

              {/* Pagination controls with direct numbering */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-6">
                  {/* Prev button */}
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[#1A1A18] transition-all cursor-pointer"
                  >
                    &larr;
                  </button>

                  {/* Progressive page counters */}
                  {Array.from({ length: totalPages }, (_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = currentPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8.5 h-8.5 rounded-lg text-[13px] font-medium flex items-center justify-center transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-[#0B2545] text-white shadow-sm' 
                            : 'bg-white border border-slate-200 text-[#1A1A18] hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[#1A1A18] transition-all cursor-pointer"
                  >
                    &rarr;
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

      </div>


    </section>
  );
}
