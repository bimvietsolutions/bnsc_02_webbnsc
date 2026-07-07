/**
 * seo/siteConfig.ts
 * Cấu hình SEO dùng chung cho toàn site. Đổi `siteUrl` cho đúng tên miền
 * production (hoặc đặt biến môi trường VITE_SITE_URL khi build).
 */

export const siteConfig = {
  /** Tên miền chính (không có dấu "/" ở cuối). */
  siteUrl: (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://bacnam.com.vn',
  siteName: 'Bắc Nam Software (BNSC)',
  /** Tiêu đề mặc định / trang chủ. */
  defaultTitle: 'Phần mềm Dự toán BNSC | Bắc Nam Software (BNSC)',
  /** Mẫu tiêu đề cho các trang con: "%s | Bắc Nam Software (BNSC)". */
  titleTemplate: '%s | Bắc Nam Software (BNSC)',
  defaultDescription:
    'Phần mềm Dự toán BNSC – giải pháp lập, thẩm định dự toán, dự thầu và thanh quyết toán công trình hàng đầu Việt Nam. Cập nhật đầy đủ định mức, đơn giá 63 tỉnh thành theo Thông tư Bộ Xây dựng.',
  keywords: [
    'phần mềm dự toán',
    'dự toán BNSC',
    'Bắc Nam Software',
    'lập dự toán',
    'dự thầu',
    'thanh quyết toán',
    'đơn giá xây dựng',
    'định mức xây dựng',
    'đo bóc khối lượng',
    'phần mềm xây dựng',
  ],
  locale: 'vi_VN',
  lang: 'vi',
  /** Ảnh chia sẻ mạng xã hội mặc định (nên là ảnh tuyệt đối 1200x630). */
  defaultImage: 'https://bacnam.com.vn/uploads/logo/logo_60b98e41a181e3.png',
  twitterHandle: '@bacnamsoftware',
  organization: {
    name: 'Công ty Cổ phần Phần mềm và Tư vấn Xây dựng Bắc Nam',
    legalName: 'Công ty Cổ phần Phần mềm và Tư vấn Xây dựng Bắc Nam (BNSC)',
    logo: 'https://bacnam.com.vn/uploads/logo/logo_60b98e41a181e3.png',
    phone: '+84966965075',
    email: 'contact@bacnam.com.vn',
    address: {
      street: 'Tòa nhà Indochina, số 4 Nguyễn Đình Chiểu, Phường Đa Kao, Quận 1',
      city: 'TP. Hồ Chí Minh',
      country: 'VN',
    },
    sameAs: ['https://facebook.com', 'https://youtube.com', 'https://zalo.me'],
  },
} as const;

/** Ghép URL tuyệt đối từ path tương đối. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
