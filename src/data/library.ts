/**
 * data/library.ts
 * Nguồn dữ liệu tập trung cho Thư viện hướng dẫn / tình huống sử dụng.
 * Mỗi mục có `slug` để tạo trang chi tiết riêng (/thu-vien/:slug) phục vụ SEO.
 */
import { uniqueSlug } from '../utils/slug';

export type LibraryCategory =
  | 'Download'
  | 'Cài đặt'
  | 'Sử dụng'
  | 'Thẩm định'
  | 'Tình huống khác'
  | 'Lập Dự toán - Dự thầu';

export interface LibraryArticle {
  id: number;
  slug: string;
  title: string;
  category: LibraryCategory;
  date: string;
  views: number;
  author: string;
  imageUrl?: string;
  /** Mô tả ngắn dùng cho meta description và đoạn tóm tắt đầu bài. */
  summary: string;
}

type RawLibrary = Omit<LibraryArticle, 'slug'>;

const RAW_LIBRARY: RawLibrary[] = [
  // Download Group
  {
    id: 101,
    title: 'Bộ cài DỰ TOÁN BNSC (cập nhật đến ngày 01/3/2022)',
    category: 'Download',
    date: '11/06/2025',
    views: 30614,
    author: 'BNSC Support',
    imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=400&q=80',
    summary: 'Tải bộ cài đặt phần mềm Dự toán BNSC bản mới nhất, tích hợp đầy đủ định mức, đơn giá và các thông tư của Bộ Xây dựng.',
  },
  {
    id: 102,
    title: 'Tổng hợp Đơn giá XDCT và DVCI; Đơn giá Nhân công, Giá ca máy các tỉnh thành',
    category: 'Download',
    date: '14/08/2025',
    views: 21079,
    author: 'BNSC Tech',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
    summary: 'Kho dữ liệu đơn giá xây dựng công trình, dịch vụ công ích, đơn giá nhân công và giá ca máy tổng hợp theo 63 tỉnh thành.',
  },
  // Cài đặt Group
  {
    id: 201,
    title: '1.20 DỰ TOÁN BNSC: Cập nhật TT 08/2025/TT-BXD; TT 70/2025/TT-BTC và NĐ 214/2025/NĐ-CP',
    category: 'Cài đặt',
    date: '13/06/2025',
    views: 6301,
    author: 'Bản Quyền BNSC',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80',
    summary: 'Hướng dẫn cập nhật phiên bản 1.20 tích hợp Thông tư 08/2025/TT-BXD, Thông tư 70/2025/TT-BTC và Nghị định 214/2025/NĐ-CP.',
  },
  {
    id: 202,
    title: '1.1 Cài đặt phần mềm DỰ TOÁN BNSC',
    category: 'Cài đặt',
    date: '10/06/2025',
    views: 19750,
    author: 'Phòng Kỹ thuật BNSC',
    imageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=400&q=80',
    summary: 'Các bước cài đặt phần mềm Dự toán BNSC trên máy tính Windows, kích hoạt Add-in Excel và cấu hình ban đầu.',
  },
  {
    id: 203,
    title: '1.19 DỰ TOÁN BNSC: Cập nhật TT 09/2024/TT-BXD ngày 30/8/2024',
    category: 'Cài đặt',
    date: '24/09/2024',
    views: 5656,
    author: 'Hội đồng Thẩm định',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
    summary: 'Nội dung cập nhật phiên bản 1.19 áp dụng Thông tư 09/2024/TT-BXD ngày 30/8/2024 của Bộ Xây dựng.',
  },
  {
    id: 204,
    title: '1.17 DỰ TOÁN BNSC: Cập nhật Nghị định 24/2024/NĐ-CP',
    category: 'Cài đặt',
    date: '02/03/2024',
    views: 5945,
    author: 'BNSC Pháp chế',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    summary: 'Hướng dẫn cập nhật phần mềm theo Nghị định 24/2024/NĐ-CP về quản lý chi phí đầu tư xây dựng.',
  },
  // Sử dụng Group
  {
    id: 301,
    title: '2.0 Giới thiệu tính năng chính phần mềm',
    category: 'Sử dụng',
    date: '10/05/2022',
    views: 5985,
    author: 'Kỹ sư Vũ Hoàng',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80',
    summary: 'Tổng quan các tính năng nổi bật của phần mềm Dự toán BNSC dành cho kỹ sư lập dự toán và thẩm định.',
  },
  {
    id: 302,
    title: '2.1 Giới thiệu giao diện chính phần mềm',
    category: 'Sử dụng',
    date: '29/03/2020',
    views: 5555,
    author: 'BNSC Admin',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
    summary: 'Làm quen với giao diện làm việc chính, thanh công cụ và các vùng thao tác của phần mềm Dự toán BNSC.',
  },
  {
    id: 303,
    title: '2.2 Tạo / Mở / Lưu công trình',
    category: 'Sử dụng',
    date: '28/03/2020',
    views: 4995,
    author: 'BNSC Training',
    imageUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=400&q=80',
    summary: 'Hướng dẫn thao tác tạo mới, mở và lưu tệp công trình dự toán trong phần mềm BNSC.',
  },
  {
    id: 304,
    title: '2.51 Lập Dự toán - Dự thầu xây dựng công trình',
    category: 'Sử dụng',
    date: '02/06/2025',
    views: 11476,
    author: 'ThS. Phan Đạt',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80',
    summary: 'Hướng dẫn chi tiết phương thức Lập Dự toán - Dự thầu xây dựng công trình tích hợp định mức và đơn giá theo Thông tư 11, 12, 13/2021/TT-BXD.',
  },
  {
    id: 305,
    title: '2.76 Tính chi phí vận chuyển theo TT 12/2021/TT-BXD',
    category: 'Sử dụng',
    date: '14/01/2020',
    views: 13040,
    author: 'Phòng Kỹ thuật',
    imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80',
    summary: 'Phương pháp tính cự ly và chi phí vận chuyển vật liệu theo Thông tư 12/2021/TT-BXD ngay trong phần mềm.',
  },
  // Thẩm định Group
  {
    id: 401,
    title: '3.1 Thẩm định file Dự toán BNSC',
    category: 'Thẩm định',
    date: '09/05/2022',
    views: 12463,
    author: 'Kiểm toán Nhà nước',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80',
    summary: 'Quy trình thẩm định, kiểm tra chéo tệp dự toán lập bằng phần mềm BNSC đảm bảo đúng quy định.',
  },
  {
    id: 402,
    title: '3.2 Thẩm định file Dự toán khác',
    category: 'Thẩm định',
    date: '07/05/2022',
    views: 5124,
    author: 'Hội thảo Chuyên môn',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=400&q=80',
    summary: 'Cách nhập và thẩm định các tệp dự toán được lập từ phần mềm khác trên nền BNSC.',
  },
  // Tình huống khác Group
  {
    id: 501,
    title: "4.1 Không tạo mới được công trình, Kích hoạt Add-in 'Dutoan BNSC'",
    category: 'Tình huống khác',
    date: '31/12/2019',
    views: 8535,
    author: 'Hỗ trợ Từ xa',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
    summary: 'Khắc phục lỗi không tạo mới được công trình và cách kích hoạt lại Add-in Dutoan BNSC trên Excel.',
  },
  {
    id: 502,
    title: '4.2 Không tìm thấy khóa cứng',
    category: 'Tình huống khác',
    date: '30/12/2019',
    views: 5350,
    author: 'BNSC Cấp phép',
    imageUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=400&q=80',
    summary: 'Xử lý sự cố phần mềm không nhận khóa cứng bản quyền và cách kiểm tra driver USB.',
  },
  {
    id: 503,
    title: "4.4 Lỗi khởi tạo 'Could not find a part of the path C:\\Thuvien'",
    category: 'Tình huống khác',
    date: '29/12/2019',
    views: 5890,
    author: 'BNSC Khắc phục',
    imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&q=80',
    summary: "Cách khắc phục lỗi khởi tạo 'Could not find a part of the path C:\\Thuvien' khi mở phần mềm.",
  },
  // Lập Dự toán - Dự thầu Group
  {
    id: 601,
    title: '5.2 Lập Dự toán theo phương pháp bù trừ chênh lệch, giá Dự thầu tại Đắk Lắk năm 2021',
    category: 'Lập Dự toán - Dự thầu',
    date: '01/04/2021',
    views: 3301,
    author: 'Sở XD Đắk Lắk',
    imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80',
    summary: 'Ví dụ thực tế lập dự toán theo phương pháp bù trừ chênh lệch và xác định giá dự thầu tại Đắk Lắk năm 2021.',
  },
  {
    id: 602,
    title: '5.3 Lập Dự toán, giá Dự thầu tại Long An năm 2022',
    category: 'Lập Dự toán - Dự thầu',
    date: '22/02/2022',
    views: 3083,
    author: 'Hội đồng Long An',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80',
    summary: 'Hướng dẫn lập dự toán và xác định giá dự thầu công trình tại Long An năm 2022.',
  },
  {
    id: 603,
    title: '5.4 Lập Dự toán theo phương pháp bù trừ chênh lệch, giá Dự thầu tại Tiền Giang năm 2023',
    category: 'Lập Dự toán - Dự thầu',
    date: '01/06/2025',
    views: 5009,
    author: 'Sở XD Tiền Giang',
    imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80',
    summary: 'Ví dụ lập dự toán theo phương pháp bù trừ chênh lệch và giá dự thầu tại Tiền Giang năm 2023.',
  },
  {
    id: 604,
    title: '5.5 Lập Dự toán theo phương pháp trực tiếp, giá Gói thầu XD tại Hồ Chí Minh năm 2023',
    category: 'Lập Dự toán - Dự thầu',
    date: '05/05/2025',
    views: 4716,
    author: 'VPĐD Hồ Chí Minh',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
    summary: 'Hướng dẫn lập dự toán theo phương pháp trực tiếp và xác định giá gói thầu xây dựng tại TP.HCM năm 2023.',
  },
];

const usedSlugs = new Set<string>();
export const libraryArticles: LibraryArticle[] = RAW_LIBRARY.map((item) => ({
  ...item,
  slug: uniqueSlug(item.title, usedSlugs),
}));

const bySlug = new Map(libraryArticles.map((a) => [a.slug, a]));
const byId = new Map(libraryArticles.map((a) => [a.id, a]));

export const getLibraryBySlug = (slug: string): LibraryArticle | undefined => bySlug.get(slug);
export const getLibraryById = (id: number): LibraryArticle | undefined => byId.get(id);

/** Slug của bài viết mẫu (2.51) dùng cho các CTA "xem bài hướng dẫn". */
export const SAMPLE_ARTICLE_SLUG =
  libraryArticles.find((a) => a.id === 304)?.slug ?? libraryArticles[0].slug;
