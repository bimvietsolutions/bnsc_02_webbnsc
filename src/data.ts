import { ProductItem, NavLinkItem, CustomerItem } from './types';

/**
 * Menu chính. Bốn mảng nội dung nay có trang riêng (dữ liệu thật từ CSDL) nên
 * trỏ thẳng vào đường dẫn thay vì neo (#) trên trang chủ; các mục còn lại vẫn
 * là neo tới section của trang chủ.
 */
export const navLinks: NavLinkItem[] = [
  { name: 'Trang chủ', href: '#trang-chu' },
  { name: 'Giới thiệu', href: '#gioi-thieu' },
  { name: 'Tin tức', href: '/tin-tuc' },
  { name: 'Thư viện', href: '/thu-vien' },
  { name: 'Phần mềm', href: '#du-toan' },
  { name: 'Tư vấn', href: '/tu-van' },
  { name: 'Đào tạo', href: '/dao-tao' },
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
