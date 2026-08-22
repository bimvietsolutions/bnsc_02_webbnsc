/**
 * lib/publicData.ts
 * Dữ liệu tĩnh (fallback) khớp shape API công khai + hàm map dữ liệu DB về shape
 * mà các component đang dùng. Khi API phản hồi, dữ liệu DB thay cho fallback.
 */
import { products as staticProducts, customersList, navLinks, heroStats } from '../data';

// --- shapes (khớp API) -------------------------------------------------------
export interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  isFeatured: boolean;
  badge?: string | null;
  tagline: string;
  features: string[];
  ctaText: string;
  iconName: string;
}
export interface ApiNews {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  contentBody: string;
  imageUrl?: string | null;
  category: string;
  date: string;
  views: number;
}
export interface ApiLibrary {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content?: string | null;
  imageUrl?: string | null;
  author?: string | null;
  category: string;
  date: string;
  views: number;
}
export interface ApiCourse {
  slug: string;
  title: string;
  scheduleText?: string | null;
  duration?: string | null;
  format?: string | null;
  price?: string | null;
  coupon?: string | null;
  slots?: string | null;
  trainer?: string | null;
}
export interface ApiConsultingService {
  title: string;
  description: string;
  iconName?: string | null;
}
export interface ApiFaq {
  question: string;
  answer: string;
}
export interface ApiSupportStaff {
  name: string;
  phone: string;
  role?: string | null;
  ext?: string | null;
}
export interface ApiRemoteTool {
  name: string;
  description: string;
  version?: string | null;
  url: string;
  realUrl?: string | null;
  badge?: string | null;
}
export interface ApiHeroSlide {
  imageUrl: string;
  caption: string;
  /** Đích khi bấm vào slide; null nếu slide chỉ là ảnh minh họa. */
  linkUrl?: string | null;
}
export interface ApiNavLink {
  name: string;
  href: string;
  children?: ApiNavLink[];
}

// --- mappers: DB record -> shape component ----------------------------------
export const mapNews = (rows: any[]): ApiNews[] =>
  rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    contentBody: r.contentBody,
    imageUrl: r.imageUrl,
    category: typeof r.category === 'object' && r.category ? r.category.name : r.category,
    date: r.dateText ?? r.date ?? '',
    views: r.views ?? 0,
  }));

export const mapNewsOne = (r: any): ApiNews | null => (r ? mapNews([r])[0] : null);

export const mapLibrary = (rows: any[]): ApiLibrary[] =>
  rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    content: r.content,
    imageUrl: r.imageUrl,
    author: r.author,
    category: typeof r.category === 'object' && r.category ? r.category.name : r.category,
    date: r.dateText ?? r.date ?? '',
    views: r.views ?? 0,
  }));

export const mapLibraryOne = (r: any): ApiLibrary | null => (r ? mapLibrary([r])[0] : null);

export const mapProducts = (rows: any[]): ApiProduct[] =>
  rows.map((r) => ({
    id: r.slug ?? r.id,
    slug: r.slug ?? r.id,
    name: r.name,
    isFeatured: !!r.isFeatured,
    badge: r.badge,
    tagline: r.tagline,
    features: r.features ?? [],
    ctaText: r.ctaText,
    iconName: r.iconName,
  }));

// --- fallbacks (chỉ dùng khi API lỗi) ----------------------------------------
// Tin tức & thư viện KHÔNG có fallback tĩnh: nội dung thật nằm ở CSDL (bảng
// articles). Trả mảng rỗng để component hiện trạng thái trống thay vì hiển thị
// bài giả với slug đã chết.
export const newsFallback: ApiNews[] = [];
export const libraryFallback: ApiLibrary[] = [];

export const productsFallback: ApiProduct[] = mapProducts(staticProducts as any[]);



export const heroFallback: { slides: ApiHeroSlide[]; stats: { value: string; label: string }[] } = {
  slides: [
    { imageUrl: '/uploads/hero/meeting_gialai.png', caption: 'SXD GIA LAI: Công bố Đơn giá NC & Giá CM năm 2025 do BNSC tư vấn thực hiện' },
    { imageUrl: '/uploads/hero/training_lamdong.png', caption: 'SXD LÂM ĐỒNG: Đào tạo & tập huấn nghiệp vụ phần mềm Dự toán BNSC mới nhất' },
    { imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop', caption: 'SXD KHÁNH HÒA: Ứng dụng phổ biến BNSC lập dự toán công trình giao thông cấp bách' },
  ],
  stats: heroStats.map((s) => ({ value: s.value, label: s.label })),
};

export const customersFallback = customersList.map((c) => ({ name: c.name, subtext: c.subtext }));

export const consultingFallback: { services: ApiConsultingService[]; courses: ApiCourse[] } = {
  services: [
    { title: 'Tư vấn Đơn giá Xây dựng & Máy thi công', description: 'Hỗ trợ các Sở Xây dựng khảo sát giá thị trường nhân công, tính toán nguyên lý giá ca máy bám sát Thông tư 11/2021/TT-BXD, số hóa đơn giá đưa lên máy chủ quốc gia.', iconName: 'Gavel' },
    { title: 'Xây dựng Định mức hạ tầng kỹ thuật đặc thù', description: 'Thiết lập định mức chi tiết cho các công tác xây lắp đặc thù địa phương (như duy tu hạ tầng kỹ thuật, cấp thoát nước, bảo dưỡng hạ tầng đường sắt) chưa có trong định mức Bộ Xây dựng.', iconName: 'FileText' },
  ],
  courses: [
    { slug: 'dutoan-thucchien', title: 'Lập Dự toán & Đo bóc khối lượng công trình', scheduleText: 'Khai giảng ngày 15 hằng tháng', duration: '12 buổi (Tối Thứ 2-4-6)', format: 'Trực tiếp tại VP & Trực tuyến qua Zoom', price: '1.800.000 VNĐ', coupon: 'Giảm 15% khi thanh toán sớm', slots: 'Chỉ còn 6 chỗ trống', trainer: 'Kỹ sư cao cấp Vũ Hoàng Nam (Mạng đấu thầu BNSC)' },
    { slug: 'dauthau-mang', title: 'Nghiệp vụ Đấu thầu qua mạng thế hệ mới', scheduleText: 'Khai giảng ngày 20 hằng tháng', duration: '4 buổi (Thứ 7 & Chủ Nhật)', format: 'Trực tuyến Zoom có quay lưu bài giảng', price: '1.200.000 VNĐ', coupon: 'Tặng kèm giáo trình đấu thầu mới nhất', slots: 'Chỉ còn 3 chỗ trống', trainer: 'Thạc sĩ Phan Văn Đạt (Trọng tài viên Kinh tế XD)' },
  ],
};

export const faqsHomeFallback: ApiFaq[] = [
  { question: 'Phần mềm dự toán BNSC có xuất được bảng tính toán thép chi tiết không?', answer: 'Hoàn toàn được. BNSC tích hợp module đo bóc cốt thép chi tiết, cho phép liệt kê kích thước, đường kính, trọng lượng và tự động tổng hợp bảng thống kê hình dạng thép liên kết động sang Excel.' },
  { question: 'Bộ đơn giá nhân công & ca máy do Bắc Nam tư vấn có tính pháp lý như thế nào?', answer: 'Bộ cơ sở dữ liệu do BNSC xây dựng được thẩm định qua Hội đồng liên ngành Sở Tài chính - Sở Xây dựng và ban hành chính thức dưới Quyết định của UBND tỉnh, có giá trị pháp lý bắt buộc áp dụng trực tiếp.' },
  { question: 'Tôi tự học có sử dụng được phần mềm không? Có tài liệu không?', answer: 'Rất dễ dàng. Bắc Nam cung cấp hệ thống video mẫu có thuyết minh từ cơ bản đến nâng cao, kết hợp tài liệu hướng dẫn file PDF 150 trang chi tiết từng bước. Ngoài ra chúng tôi hỗ trợ cài đặt qua UltraViewer miễn phí.' },
];

export const faqsSupportFallback: ApiFaq[] = [
  { question: 'Làm thế nào để kích hoạt bản quyền BNSC khi có khóa cứng?', answer: 'Anh/chị vui lòng cắm khóa cứng USB vào máy tính, mở phần mềm Dự toán BNSC lên, hệ thống sẽ tự động nhận diện Key bản quyền. Nếu hiện thông báo "Chưa có thiết bị", hãy gọi tổng đài kỹ thuật để nhận Driver hỗ trợ.' },
  { question: 'Phần mềm Dự toán BNSC có chạy được trên Excel 64-bit không?', answer: 'Dự toán BNSC chạy ổn định 100% trên cả Excel 32-bit và Excel 64-bit (từ phiên bản Office 2013 đến Office 365 mới nhất hiện nay).' },
  { question: 'Làm sao để cập nhật đơn giá, định mức các Tỉnh thành mới nhất?', answer: 'Mở phần mềm BNSC -> Chọn menu "Tính năng" -> Click "Tải đơn giá" -> Chọn Tỉnh thành cần làm việc và nhấn tải về hoàn toàn miễn phí.' },
];

export const supportFallback: { staff: ApiSupportStaff[]; tools: ApiRemoteTool[] } = {
  staff: [
    { name: 'Kỹ sư Hoàng Lâm', phone: '0966966455', role: 'Trưởng bộ phận kỹ thuật', ext: 'Nhánh 1' },
    { name: 'Kỹ sư Quốc Khánh', phone: '0981757527', role: 'Support BNSC phía Nam', ext: 'Nhánh 2' },
    { name: 'Kỹ sư Minh Đức', phone: '0903310052', role: 'Tư vấn Chuyển giao & Đào tạo', ext: 'Nhánh 3' },
  ],
  tools: [
    { name: 'UltraViewer (Khuyên dùng)', description: 'Phần mềm điều khiển máy tính xa cực nhẹ, phổ biến nhất tại Việt Nam. Được đội ngũ BNSC sử dụng để cài đặt trực tiếp cho khách hàng.', version: 'v6.6 (Bản mới nhất)', url: 'https://www.ultraviewer.net/vi/download.html', realUrl: null, badge: 'Bao gồm bộ cài sửa lỗi' },
    { name: 'TeamViewer Toàn cầu', description: 'Công cụ kết nối từ xa tiêu chuẩn quốc tế ổn định cao. Thích hợp cho doanh nghiệp có chính sách bảo mật mạng nội bộ nghiêm ngặt.', version: 'Bản Portable không cần cài', url: 'https://www.teamviewer.com/vi/download/windows/', realUrl: 'https://www.teamviewer.com/vi/download/windows/', badge: 'Kết nối mã hóa AES-256' },
  ],
};

export const navFallback: ApiNavLink[] = navLinks.map((l) => {
  if (l.name === 'Phần mềm') {
    return {
      name: l.name,
      href: l.href,
      children: [
        { name: 'Dự toán BNSC', href: '#du-toan' },
        { name: 'Quản lý Dự án BNSC', href: '#du-toan' },
        { name: 'Quản lý tiến độ BNSC', href: '#du-toan' },
        { name: 'Quản lý Vốn', href: '#du-toan' },
        { name: 'Phần mềm theo đơn đặt hàng', href: '#du-toan' },
      ],
    };
  }
  return { name: l.name, href: l.href };
});

export const settingsFallback: Record<string, string> = {
  site_name: 'Bắc Nam Software (BNSC)',
  software_version: 'v1.20',
  hotline_primary: '0966965075',
  hotline_secondary: '02866678995',
  email: 'contact@bacnam.com.vn',
  address: 'Tòa nhà Indochina, số 4 Nguyễn Đình Chiểu, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh',
  social_facebook: 'https://facebook.com',
  social_youtube: 'https://youtube.com',
  social_zalo: 'https://zalo.me',
  business_license: '0310892095',
  announcement_enabled: 'true',
  announcement_text: 'Chính thức phát hành Dự toán BNSC v1.20 với nhiều cập nhật định mức đột phá!',
};
