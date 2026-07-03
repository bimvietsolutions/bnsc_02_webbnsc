import React, { useState, useMemo } from 'react';
import { Calendar, Eye, ArrowRight, BookOpen, ChevronRight, Search, X, User } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  views: number;
  category: 'Văn bản QPPL' | 'Nội bộ' | 'Chuyên ngành' | 'Khuyến mãi';
  excerpt: string;
  imageUrl?: string;
  contentBody?: string;
}

// 13 high-fidelity real news items extracted directly from current local directives and user screenshots
const LOCAL_NEWS_DATA: NewsItem[] = [
  {
    id: 1,
    title: 'Vĩnh Long: Quyết định 325 và 327/QĐ-SXD Công bộ đơn giá nhân công & máy thi công năm 2026',
    date: '18 Thg 5, 2026',
    views: 367,
    category: 'Văn bản QPPL',
    excerpt: 'Ngày 18/5/2026, Sở Xây dựng tỉnh Vĩnh Long đã ký ban hành các Quyết định 325/QĐ-SXD và 327/QĐ-SXD về việc công bố đơn giá nhân công xây dựng và giá ca máy thi công làm cơ sở quản lý chi phí đầu tư xây dựng trên địa bàn tỉnh.',
    contentBody: `Căn cứ Nghị định số 10/2021/NĐ-CP ngày 09/02/2021 của Chính phủ về quản lý chi phí đầu tư xây dựng;
Căn cứ Thông tư số 11/2021/TT-BXD ngày 31/8/2021 của Bộ trưởng Bộ Xây dựng hướng dẫn một số nội dung xác định và quản lý chi phí đầu tư xây dựng;

Sở Xây dựng tỉnh Vĩnh Long chính thức ban hành:
1. Quyết định số 325/QĐ-SXD công bố Đơn giá nhân công xây dựng năm 2026 trên địa bàn tỉnh Vĩnh Long.
2. Quyết định số 327/QĐ-SXD công bố Bảng giá ca máy và thiết bị thi công xây dựng năm 2026 trên địa bàn tỉnh Vĩnh Long.

Các quyết định này có hiệu lực kể từ ngày ký. Phần mềm dự toán BNSC đã cập nhật đầy đủ cơ sở dữ liệu của các quyết định nêu trên, hỗ trợ quý khách hàng tra cứu và áp dụng tự động cho các công trình nhanh nhất.`
  },
  {
    id: 2,
    title: 'An Giang: Quyết định 2116/QĐ-UBND Công bổ đơn giá NC & MTC năm 2026',
    date: '6 Thg 5, 2026',
    views: 226,
    category: 'Văn bản QPPL',
    excerpt: 'Ủy ban nhân dân tỉnh An Giang công bố bộ đơn giá nhân công mới nhất và bảng giá ca máy thi công làm cơ sở quản lý chi phí đầu tư xây dựng công trình trên địa bàn tỉnh An Giang chính xác hơn.',
    contentBody: `Ủy ban nhân dân tỉnh An Giang công bố Quyết định số 2116/QĐ-UBND ban hành bảng công bố giá nhân công và máy thi công đầu năm 2026 bám sát biến động thị trường lao động xây dựng thực tế và các quy định của Chính phủ.

Dữ liệu mới đã được chuẩn hóa vào máy chủ gốc của phần mềm BNSC. Người sử dụng chỉ cần mở tính năng "Tải đơn giá" là có thể cập nhật ngay lập tức toàn bộ định mức và hệ số nhân công tương ứng cho khu vực I, II, III.`
  },
  {
    id: 3,
    title: 'Cần Thơ: Quyết định 595/QĐ-SXD Công bố đơn giá NC & MTC năm 2026',
    date: '5 Thg 5, 2026',
    views: 644,
    category: 'Văn bản QPPL',
    excerpt: 'Sở Xây dựng TP. Cần Thơ chính thức ban hành bảng công bố giá nhân công và máy thi công đầu năm 2026 bám sát biến động thị trường lao động xây dựng thực tế và các quy định của Chính phủ.',
    contentBody: `Sở Xây dựng TP. Cần Thơ ban hành Quyết định số 595/QĐ-SXD công bố giá nhân công xây dựng quý mới quốc gia năm 2026. Bảng đơn giá làm cơ sở để các cá nhân, doanh nghiệp lập báo cáo nghiên cứu khả thi, khảo sát xây dựng dự thầu cho tất cả hạng mục trung tâm thành phố và ngoại thành quận huyện.`
  },
  {
    id: 4,
    title: 'Lễ ký thỏa thuận hợp tác với Phân hiệu trường Đại học GTVT tại TP.HCM',
    date: '10 Thg 5, 2022',
    views: 3900,
    category: 'Nội bộ',
    excerpt: 'Bắc Nam Software ký kết biên bản ghi nhớ toàn diện cùng Trường Đại học Giao thông vận tải Phân hiệu tại TP.HCM nhằm tài trợ gói phần mềm bản quyền Dự toán BNSC.',
    contentBody: `Tại buổi lễ ký kết trang trọng, đại diện lãnh đạo Bắc Nam Software và Ban Giám hiệu Phân hiệu Trường Đại học Giao thông vận tải tại TP.HCM đã thống nhất các điều khoản hợp tác dài hạn.

Theo đó, Bắc Nam Software tài trợ bản quyền miễn phí phần mềm Dự toán BNSC phục vụ công tác giảng dạy môn Kinh tế xây dựng và Đo bóc khối lượng, hỗ trợ giáo trình đào tạo, tổ chức kiểm tra và cấp chứng chỉ định mức uy tín cho sinh viên năm cuối.`
  },
  {
    id: 5,
    title: 'Cần Thơ: Quyết định 27/2026/QĐ-UBND ban hành Định mức vận chuyển đặc thù đường thủy',
    date: '19 Thg 3, 2026',
    views: 390,
    category: 'Văn bản QPPL',
    excerpt: 'Ủy ban nhân dân thành phố Cần Thơ quy định về định mức dự toán vận chuyển hàng hóa đặc thù bằng phương tiện đường thùy phục vụ công tác xây lắp, vận hành đường sông.',
    contentBody: `UBND TP. Cần Thơ vừa ban hành Quyết định 27/2026/QĐ-UBND về định mức vận chuyển vật liệu đặc thù qua cano, sà lan và tàu cứu hộ đường sông nội tỉnh. Đây là cơ sở cốt lõi để các doanh nghiệp thi công cầu đường thủy, nạo vét kênh rạch nội vùng ĐBSCL lập dự toán chi phí chính xác.`
  },
  {
    id: 6,
    title: 'Đắk Lắk: QĐ 21/2026/QĐ-UBND ban hành Bộ đơn giá dịch vụ công ích đô thị năm 2026',
    date: '13 Thg 3, 2026',
    views: 580,
    category: 'Chuyên ngành',
    excerpt: 'UBND tỉnh Đắk Lắk ban hành Bộ đơn giá làm cơ sở xác định chi phí các dịch vụ rác thải, xử lý cây xanh và chiếu sáng khu đô thị lớn.',
    contentBody: `Quyết định số 21/2026/QĐ-UBND quy định đơn giá dịch vụ công ích đô thị trên địa bàn tỉnh Đắk Lắk bao gồm: 
- Thu gom, vận chuyển và xử lý chất thải rắn sinh hoạt.
- Duy trì hệ thống cây xanh, tỉa cành định kỳ phòng bão.
- Duy trì hệ thống chiếu sáng công cộng đô thị thông minh.

Dữ liệu đặc thù này đã được tổng hợp chi tiết và cập nhật đầy đủ vào ứng dụng Dự toán BNSC phục vụ đắc lực cho các Công ty Môi trường Đô thị địa phương.`
  },
  {
    id: 7,
    title: 'BỘ XÂY DỰNG: Thông tư 04/2026/TT-BXD Định mức bảo dưỡng kết cấu hạ tầng đường sắt quốc gia',
    date: '30 Thg 1, 2026',
    views: 727,
    category: 'Văn bản QPPL',
    excerpt: 'Thông tư số 04/2026/TT-BXD của Bộ Xây dựng quy định về định mức dự toán bảo dưỡng kỹ thuật, sửa chữa định kỳ kết cấu hạ tầng đường sắt quốc gia.',
    contentBody: `Bộ Xây dựng ban hành Thông tư số 04/2026/TT-BXD quy định định mức dự toán bảo dưỡng trực tiếp hệ thống tà vẹt, đường ray, cầu hầm sắt quốc gia. Thông tư là cơ sở để các Ban Quản lý Dự án Đường sắt lập kế hoạch vốn bảo trì hằng năm.`
  },
  {
    id: 8,
    title: 'Đà Nẵng: Quyết định 152-153/QĐ-SXD Công bố đơn giá NC & MTC năm 2026',
    date: '12 Thg 2, 2026',
    views: 3295,
    category: 'Văn bản QPPL',
    excerpt: 'Sở Xây dựng TP. Đà Nẵng công bố các đơn giá nhân công tương ứng trên địa bàn Hải Châu, Liên Chiểu, Ngũ Hành Sơn giúp đồng bộ kiểm tra xây lắp số.',
    contentBody: `Các Quyết định số 152 và 153/QĐ-SXD điều chỉnh chính thức hệ số lương nhân công các nhóm 1 đến nhóm 4 và chi phí thuê máy rải nhựa, máy xúc cơ giới trên địa bàn Đà Nẵng. Bắc Nam Software đã cập nhật tệp đơn giá lên đám mây, khách hàng có thể cài đặt dễ dàng.`
  },
  {
    id: 9,
    title: 'TCT Tân Cảng Sài Gòn (Bộ Quốc phòng): Ứng dụng 31 bộ phần mềm Dự toán BNSC',
    date: '15 Thg 12, 2017',
    views: 3452,
    category: 'Nội bộ',
    excerpt: 'Ứng dụng thử nghiệm thành công 31 bộ giấy phép Dự toán BNSC cho hoạt động xây dựng công trình cảng biển Hải đoàn tiền phương quốc phòng.',
    contentBody: `Đáp ứng yêu cầu nghiêm ngặt về tiến độ và độ bảo mật kỹ thuật quốc phòng, Tổng công ty Tân Cảng Sài Gòn đã ký kết sở hữu bản quyền hàng loạt phần mềm BNSC, hướng tới số hóa hoàn toàn sơ đồ tổng mức đầu tư xây dựng quân cảng.`
  },
  {
    id: 10,
    title: 'CHÚC MỪNG NĂM MỚI BÍNH NGỌ 2026 – Thông báo lịch nghỉ Tết và ưu đãi đặc biệt',
    date: '1 Thg 1, 2025',
    views: 1523,
    category: 'Khuyến mãi',
    excerpt: 'Lời tri ân và kính chúc Tết gửi tới hàng nghìn kỹ sư, cơ quan quản lý chuyên môn cùng chương trình giảm giá lên đến 15% khóa cứng BNSC.',
    contentBody: `Bắc Nam Software kính chúc Quý Khách hàng, Quý Đối tác một năm mới Bính Ngọ 2026 an khang thịnh vượng!
Lịch nghỉ tết kéo dài từ ngày 26 âm lịch đến mùng 6 âm lịch. Nhằm tri ân khách hàng, Bắc Nam áp dụng chương trình ưu đãi đặc biệt 15% trực tiếp khi nâng cấp khóa cứng hoặc cập nhật tệp định mức chuyên dụng.`
  },
  {
    id: 11,
    title: 'Ban QLĐTXD Y tế TP.HCM: Ứng dụng phần mềm Dự toán BNSC để thẩm tra dự toán',
    date: '15 Thg 10, 2017',
    views: 3545,
    category: 'Nội bộ',
    excerpt: 'Triển khai công tác chuẩn hóa dự toán bệnh viện công nghệ cao trên phạm vi thành phố dựa trên giải pháp chuyên sâu của BNSC.',
    contentBody: `Giải pháp phần mềm từ BNSC giúp tối ưu hóa 45% thời gian đo bóc khối lượng, đối soát mã hóa danh mục thiết bị y tế chuyên dụng nhập khẩu cho Ban Quản lý đầu tư xây dựng các công trình Y tế TP.HCM.`
  },
  {
    id: 12,
    title: 'Cần Thơ: QĐ 50/2025/QĐ-UBND ban hành Định mức dự toán các công tác xây dựng đặc thù',
    date: '15 Thg 12, 2025',
    views: 171,
    category: 'Chuyên ngành',
    excerpt: 'Bộ định mức chuyên môn bổ sung cho các công tác phục hồi, bảo tồn di sản sông nước ĐBSCL và trùng tu di tích văn hóa.',
    contentBody: `Công bố chi tiết nhóm công việc đặc trưng tôn tạo di sản kiến trúc trên sông vùng Nam Bộ. Phần mềm BNSC đã số hóa và gắn mã nội bộ giúp việc áp dụng định mức không gặp bất kỳ vướng mắc nào.`
  },
  {
    id: 13,
    title: 'Lễ ký kết hợp tác với Trường Cao đẳng Xây dựng số 2 (Bộ Xây dựng)',
    date: '23 Thg 4, 2022',
    views: 3791,
    category: 'Nội bộ',
    excerpt: 'Hỗ trợ sinh viên thực tập tiếp cận sớm với các công nghệ thẩm định dự toán hàng đầu phục vụ thiết thực đồ án tốt nghiệp.',
    contentBody: `Lễ ký kết diễn ra thành công tốt đẹp mở ra nhiều cơ hội thực tập, việc làm trực tiếp tại phòng dự án liên kết của Bắc Nam Software dành cho những sinh viên xuất sắc của trường.`
  }
];

export default function NewsSection() {
  const [selectedTab, setSelectedTab] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeReadItem, setActiveReadItem] = useState<NewsItem | null>(null);

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
    let result = [...LOCAL_NEWS_DATA];

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
  }, [selectedTab, searchQuery, sortBy]);

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
                  onClick={() => setActiveReadItem(featuredItem)}
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
                        onClick={() => setActiveReadItem(item)}
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
                      onClick={() => setActiveReadItem(item)}
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

      {/* 4. Elegant Overlay Document Reader Modal */}
      {activeReadItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100">
            
            {/* Header top banner */}
            <div className="bg-[#0B2545] px-6 py-5 text-white flex items-center justify-between text-left">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#F5A623] font-extrabold">
                  {activeReadItem.category}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5 pr-8">
                  {activeReadItem.title}
                </h3>
              </div>
              <button 
                onClick={() => setActiveReadItem(null)}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg bg-white/10 hover:bg-white/25 transition-all cursor-pointer"
                aria-label="Đóng đọc tài liệu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reading window container */}
            <div className="p-6 sm:p-8 overflow-y-auto text-left space-y-6 flex-grow scrollbar-thin">
              
              {/* Document metadata panel */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 font-semibold pb-4 border-b border-slate-100">
                <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded">
                  <Calendar className="w-3.5 h-3.5 text-[#1B5FA8]" /> {activeReadItem.date}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded">
                  <Eye className="w-3.5 h-3.5 text-[#1B5FA8]" /> {activeReadItem.views.toLocaleString()} lượt đọc
                </span>
                <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded">
                  <User className="w-3.5 h-3.5 text-[#1B5FA8]" /> Ban Biên Tập BNSC
                </span>
              </div>

              {/* Actual Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B2545] leading-snug tracking-tight">
                {activeReadItem.title}
              </h2>

              {/* Excerpt Summary block */}
              <div className="bg-[#F7F9FC] border-l-4 border-[#F5A623] p-4 rounded-r-xl italic text-sm text-slate-600 leading-relaxed font-medium">
                "{activeReadItem.excerpt}"
              </div>

              {/* Structured body context */}
              <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4 font-normal">
                {activeReadItem.contentBody || `Hệ thống dữ liệu đang cập nhật chi tiết nội dung văn bản này. Mọi thắc mắc hoặc yêu cầu trích xuất hồ sơ gốc, quý khách hàng vui lòng liên hệ Ban biên tập hoặc Bộ phận hỗ trợ kỹ thuật Bắc Nam Software qua tổng đài hỗ trợ để được cung cấp văn bản hoàn thiện nhanh nhất.`}
              </div>

            </div>

            {/* Footer action bar */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={() => setActiveReadItem(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-[#0B2545] font-bold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer"
              >
                Đóng lại
              </button>
              <button 
                onClick={() => {
                  alert('Đang tải văn bản đính kèm từ cơ sở dữ liệu Sở Xây Dựng...');
                }}
                className="px-4 py-2 bg-[#1B5FA8] hover:bg-[#0B2545] text-white font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                Tải văn bản đính kèm &rarr;
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
