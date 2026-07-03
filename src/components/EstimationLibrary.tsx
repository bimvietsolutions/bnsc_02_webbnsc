import React, { useState, useMemo } from 'react';
import { Download, Settings, Play, ShieldAlert, FileCheck, HelpCircle, BookOpen, User, Calendar, Eye, Search, ChevronRight } from 'lucide-react';

interface LibraryItem {
  id: number;
  title: string;
  category: 'Download' | 'Cài đặt' | 'Sử dụng' | 'Thẩm định' | 'Tình huống khác' | 'Lập Dự toán - Dự thầu';
  date: string;
  views: number;
  author: string;
  imageUrl?: string;
}

interface EstimationLibraryProps {
  onSelectArticle?: (id: number) => void;
}

export default function EstimationLibrary({ onSelectArticle }: EstimationLibraryProps) {
  const [activeTab, setActiveTab] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(8);

  const tabs = [
    { name: 'Tất cả', emoji: '📚' },
    { name: 'Download', emoji: '⬇' },
    { name: 'Cài đặt', emoji: '⚙' },
    { name: 'Sử dụng', emoji: '▶' },
    { name: 'Thẩm định', emoji: '🔍' },
    { name: 'Tình huống khác', emoji: '💡' },
    { name: 'Lập Dự toán - Dự thầu', emoji: '📋' }
  ];

  // Raw data from guidelines
  const libraryItems: LibraryItem[] = [
    // Download Group
    {
      id: 101,
      title: 'Bộ cài DỰ TOÁN BNSC (cập nhật đến ngày 01/3/2022)',
      category: 'Download',
      date: '11/06/2025',
      views: 30614,
      author: 'BNSC Support',
      imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 102,
      title: 'Tổng hợp Đơn giá XDCT và DVCI; Đơn giá Nhân công, Giá ca máy các tỉnh thành',
      category: 'Download',
      date: '14/08/2025',
      views: 21079,
      author: 'BNSC Tech',
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80'
    },
    // Cài đặt Group
    {
      id: 201,
      title: '1.20 DỰ TOÁN BNSC: Cập nhật TT 08/2025/TT-BXD; TT 70/2025/TT-BTC và NĐ 214/2025/NĐ-CP',
      category: 'Cài đặt',
      date: '13/06/2025',
      views: 6301,
      author: 'Bản Quyền BNSC',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 202,
      title: '1.1 Cài đặt phần mềm DỰ TOÁN BNSC',
      category: 'Cài đặt',
      date: '10/06/2025',
      views: 19750,
      author: 'Phòng Kỹ thuật BNSC',
      imageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 203,
      title: '1.19 DỰ TOÁN BNSC: Cập nhật TT 09/2024/TT-BXD ngày 30/8/2024',
      category: 'Cài đặt',
      date: '24/09/2024',
      views: 5656,
      author: 'Hội đồng Thẩm định',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 204,
      title: '1.17 DỰ TOÁN BNSC: Cập nhật Nghị định 24/2024/NĐ-CP',
      category: 'Cài đặt',
      date: '02/03/2024',
      views: 5945,
      author: 'BNSC Pháp chế',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80'
    },
    // Sử dụng Group
    {
      id: 301,
      title: '2.0 Giới thiệu tính năng chính phần mềm',
      category: 'Sử dụng',
      date: '10/05/2022',
      views: 5985,
      author: 'Kỹ sư Vũ Hoàng',
      imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 302,
      title: '2.1 Giới thiệu giao diện chính phần mềm',
      category: 'Sử dụng',
      date: '29/03/2020',
      views: 5555,
      author: 'BNSC Admin',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 303,
      title: '2.2 Tạo / Mở / Lưu công trình',
      category: 'Sử dụng',
      date: '28/03/2020',
      views: 4995,
      author: 'BNSC Training',
      imageUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 304,
      title: '2.51 Lập Dự toán - Dự thầu xây dựng công trình',
      category: 'Sử dụng',
      date: '02/06/2025',
      views: 11476,
      author: 'ThS. Phan Đạt',
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 305,
      title: '2.76 Tính chi phí vận chuyển theo TT 12/2021/TT-BXD',
      category: 'Sử dụng',
      date: '14/01/2020',
      views: 13040,
      author: 'Phòng Kỹ thuật',
      imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80'
    },
    // Thẩm định Group
    {
      id: 401,
      title: '3.1 Thẩm định file Dự toán BNSC',
      category: 'Thẩm định',
      date: '09/05/2022',
      views: 12463,
      author: 'Kiểm toán Nhà nước',
      imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 402,
      title: '3.2 Thẩm định file Dự toán khác',
      category: 'Thẩm định',
      date: '07/05/2022',
      views: 5124,
      author: 'Hội thảo Chuyên môn',
      imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=400&q=80'
    },
    // Tình huống khác Group
    {
      id: 501,
      title: "4.1 Không tạo mới được công trình, Kích hoạt Add-in 'Dutoan BNSC'",
      category: 'Tình huống khác',
      date: '31/12/2019',
      views: 8535,
      author: 'Hỗ trợ Từ xa',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 502,
      title: '4.2 Không tìm thấy khóa cứng',
      category: 'Tình huống khác',
      date: '30/12/2019',
      views: 5350,
      author: 'BNSC Cấp phép',
      imageUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 503,
      title: "4.4 Lỗi khởi tạo 'Could not find a part of the path C:\\Thuvien'",
      category: 'Tình huống khác',
      date: '29/12/2019',
      views: 5890,
      author: 'BNSC Khắc phục',
      imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&q=80'
    },
    // Lập Dự toán - Dự thầu Group
    {
      id: 601,
      title: '5.2 Lập Dự toán theo phương pháp bù trừ chênh lệch, giá Dự thầu tại Đắk Lắk năm 2021',
      category: 'Lập Dự toán - Dự thầu',
      date: '01/04/2021',
      views: 3301,
      author: 'Sở XD Đắk Lắk',
      imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 602,
      title: '5.3 Lập Dự toán, giá Dự thầu tại Long An năm 2022',
      category: 'Lập Dự toán - Dự thầu',
      date: '22/02/2022',
      views: 3083,
      author: 'Hội đồng Long An',
      imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 603,
      title: '5.4 Lập Dự toán theo phương pháp bù trừ chênh lệch, giá Dự thầu tại Tiền Giang năm 2023',
      category: 'Lập Dự toán - Dự thầu',
      date: '01/06/2025',
      views: 5009,
      author: 'Sở XD Tiền Giang',
      imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 604,
      title: '5.5 Lập Dự toán theo phương pháp trực tiếp, giá Gói thầu XD tại Hồ Chí Minh năm 2023',
      category: 'Lập Dự toán - Dự thầu',
      date: '05/05/2025',
      views: 4716,
      author: 'VPĐD Hồ Chí Minh',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80'
    }
  ];

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
        item.author.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, searchQuery]);

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
                  onClick={() => onSelectArticle?.(item.id)}
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
