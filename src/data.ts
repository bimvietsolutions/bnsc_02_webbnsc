import { NewsItem, ProductItem, NavLinkItem, CustomerItem } from './types';

export const navLinks: NavLinkItem[] = [
  { name: 'Trang chủ', href: '#trang-chu' },
  { name: 'Giới thiệu', href: '#gioi-thieu' },
  { name: 'Tin tức', href: '#tin-tuc' },
  { name: 'Thư viện', href: '#thuvien-tinhhuong' },
  { name: 'Phần mềm', href: '#du-toan' },
  { name: 'Tư vấn', href: '#tu-van' },
  { name: 'Đào tạo', href: '#dao-tao' },
  { name: 'Liên hệ', href: '#lien-he' }
];

export const heroStats = [
  { value: '20+', label: 'Sở Xây dựng hợp tác' },
  { value: '63', label: 'Tỉnh thành sử dụng' },
  { value: '15+', label: 'Năm kinh nghiệm' },
  { value: 'v1.20', label: 'Phiên bản mới nhất' }
];

export const products: ProductItem[] = [
  {
    id: 'du-toan-bnsc',
    name: 'Dự toán BNSC',
    isFeatured: true,
    badge: 'v1.20 Mới nhất',
    tagline: 'Phần mềm lập & thẩm định dự toán công trình hàng đầu Việt Nam hiện nay.',
    features: [
      'Lập, thẩm định dự toán & thanh quyết toán theo đúng quy định mới nhất của Bộ Xây dựng',
      'Tự động tra cứu & áp dụng Đơn giá nhân công, Giá ca máy từ các quyết định công bố',
      'Tự động cập nhật dữ liệu hao phí định mức chỉ với một chạm',
      'Xuất báo cáo Excel cực nhanh với đầy đủ công thức liên kết động linh hoạt'
    ],
    ctaText: 'Tải miễn phí',
    iconName: 'Laptop'
  },
  {
    id: 'tu-van-don-gia',
    name: 'Tư vấn Đơn giá',
    isFeatured: false,
    tagline: 'Đối tác chiến lược cung cấp dịch vụ tư vấn định mức đơn giá cho các Sở Xây dựng.',
    features: [
      'Xây dựng bộ Đơn giá nhân công, Giá ca máy thiết bị thi công thực tế cho địa phương',
      'Xây dựng giá ca máy chuyên dụng và chỉ số giá xây dựng định kỳ',
      'Đội ngũ chuyên gia dày dặn kinh nghiệm chuẩn hóa cơ sở dữ liệu số hóa nhanh chóng'
    ],
    ctaText: 'Đăng ký tư vấn',
    iconName: 'Scale'
  },
  {
    id: 'dao-tao-nghiep-vu',
    name: 'Đào tạo Nghiệp vụ',
    isFeatured: false,
    tagline: 'Bồi dưỡng kiến thức thực tế từ kỹ sư thực chiến cho nguồn nhân lực ngành Xây dựng.',
    features: [
      'Khóa học Lập & Thẩm tra Dự toán - Đo bóc khối lượng chuẩn chỉ',
      'Nghiệp vụ Đấu thầu qua mạng qua Hệ thống mạng đấu thầu quốc gia mới',
      'Thanh quyết toán hợp đồng xây dựng và xử lý hồ sơ hoàn công thực tế'
    ],
    ctaText: 'Xem lịch chiêu sinh',
    iconName: 'GraduationCap'
  }
];

export const newsData: NewsItem[] = [
  {
    id: 1,
    title: 'Vĩnh Long: QĐ 325 và 327/QĐ-SXD Công bố đơn giá NC & MTC năm 2026',
    date: '18/05/2026',
    views: 362,
    category: 'Văn bản QPPL',
    excerpt: 'Sở Xây dựng tỉnh Vĩnh Long ban hành các Quyết định về Đơn giá nhân công xây dựng và Giá ca máy thiết bị thi công năm 2026 theo hướng dẫn Thông tư 11/2021/TT-BXD, hỗ trợ đồng bộ dữ liệu vào phần mềm BNSC...',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    title: 'An Giang: QĐ 2116/QĐ-UBND Công bố đơn giá NC & MTC năm 2026',
    date: '06/05/2026',
    views: 224,
    category: 'Văn bản QPPL',
    excerpt: 'Ủy ban nhân dân tỉnh An Giang công bố bộ đơn giá nhân công mới nhất và bảng giá ca máy thi công làm cơ sở quản lý chi phí đầu tư xây dựng công trình trên địa bàn tỉnh An Giang chính xác hơn...',
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d564fa7f174e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: 'Cần Thơ: QĐ 595/QĐ-SXD Công bố đơn giá NC & MTC năm 2026',
    date: '05/05/2026',
    views: 641,
    category: 'Văn bản QPPL',
    excerpt: 'Sở Xây dựng TP. Cần Thơ chính thức ban hành bảng công bố giá nhân công và máy thi công đầu năm 2026 bám sát biến động thị trường lao động xây dựng thực tế và các quy định của Chính phủ...',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    title: 'BỘ XÂY DỰNG: TT 04/2026/TT-BXD Định mức bảo dưỡng KCHT đường sắt',
    date: '30/01/2026',
    views: 726,
    category: 'Chuyên ngành',
    excerpt: 'Thông tư số 04/2026/TT-BXD của Bộ Xây dựng quy định về định mức dự toán bảo dưỡng kỹ thuật, sửa chữa định kỳ kết cấu hạ tầng đường sắt quốc gia, bắt đầu có hiệu lực thi hành ngay từ quý I năm 2026...',
    imageUrl: 'https://images.unsplash.com/photo-1517089539094-de823e311a84?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 5,
    title: 'Lễ ký hợp tác với ĐH GTVT tại TP.HCM',
    date: '10/05/2022',
    views: 3900,
    category: 'Nội bộ',
    excerpt: 'Bắc Nam Software ký kết biên bản ghi nhớ toàn diện cùng Trường Đại học Giao thông vận tải Phân hiệu tại TP.HCM nhằm tài trợ gói phần mềm bản quyền Dự toán BNSC và hỗ trợ giáo trình đào tạo giảng dạy SV...',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 6,
    title: 'Khuyến mãi đặc biệt: Ưu đãi 15% kỷ niệm 15 năm thành lập Bắc Nam Software',
    date: '12/04/2026',
    views: 850,
    category: 'Khuyến mãi',
    excerpt: 'Nhân dịp kỷ niệm 15 năm hình thành phát triển, Bắc Nam tri ân quý khách hàng xây dựng chương trình hỗ trợ tặng kèm bản vẽ thiết kế và giảm ngay 15% khi mua mới hoặc nâng cấp khóa cứng BNSC.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 7,
    title: 'Tặng 100 license học tập miễn phí cho Sinh viên ngành Kinh tế Xây dựng',
    date: '20/03/2026',
    views: 1205,
    category: 'Khuyến mãi',
    excerpt: 'Hỗ trợ hành trang vào nghề dành cho các bạn sinh viên trực chuẩn bị thực tập thăng tiến, Bắc Nam dành tặng 100 license bản quyền phần mềm hỗ trợ học thuật đẩy đủ tính năng sử dụng trong 6 tháng.',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80'
  }
];

export const customersList: CustomerItem[] = [
  { name: 'TCT Tân Cảng Sài Gòn', subtext: 'Bộ Quốc Phòng' },
  { name: 'Ban QLĐTXD Y tế TP.HCM', subtext: 'Nâng Cao Cơ Sở Vật Chất Y Tế' },
  { name: 'Sở Xây Dựng TP. HCM', subtext: 'Cơ Quan Quản Lý Nhà Nước' },
  { name: 'Sở Xây Dựng Đắk Lắk', subtext: 'Cơ Quan Quản Lý Nhà Nước' },
  { name: 'BIWASE', subtext: 'TCT Nước & Môi Trường Bình Dương' },
  { name: 'Sở Xây Dựng Tây Ninh', subtext: 'Cơ Quan Quản Lý Nhà Nước' },
  { name: 'Sở Xây Dựng Khánh Hòa', subtext: 'Cơ Quan Quản Lý Nhà Nước' },
  { name: 'Sở Xây Dựng Gia Lai', subtext: 'Cơ Quan Quản Lý Nhà Nước' },
  { name: 'ĐH Xây dựng Miền Tây', subtext: 'Nguồn Nhân Lực Chất Lượng Cao' },
  { name: 'Cục CT Phía Nam', subtext: 'Bộ Xây dựng' }
];
