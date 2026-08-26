/**
 * seo/siteConfig.ts
 * Cấu hình SEO dùng chung cho toàn site. Đổi `siteUrl` cho đúng tên miền
 * production (hoặc đặt biến môi trường VITE_SITE_URL khi build).
 *
 * Mọi hằng số nhận diện thương hiệu (logo, favicon, tên, mô tả, màu) nằm ở
 * `./brand` — tệp đó là nguồn duy nhất và cũng được vite.config.ts dùng để bơm
 * vào index.html.
 */
import {
  BRAND_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_SITE_URL,
  DEFAULT_TITLE,
  LANG,
  LOCALE,
  LOGO_PATH,
  SOCIAL,
  TITLE_TEMPLATE,
} from './brand';

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || DEFAULT_SITE_URL;

export { FAVICON_PATH, LOGO_ALT, LOGO_PATH } from './brand';

export const siteConfig = {
  /** Tên miền chính (không có dấu "/" ở cuối). */
  siteUrl: SITE_URL,
  siteName: BRAND_NAME,
  /** Tiêu đề mặc định / trang chủ. */
  defaultTitle: DEFAULT_TITLE,
  /** Mẫu tiêu đề cho các trang con: "%s | Bắc Nam Software (BNSC)". */
  titleTemplate: TITLE_TEMPLATE,
  defaultDescription: DEFAULT_DESCRIPTION,
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
  locale: LOCALE,
  lang: LANG,
  /** Ảnh chia sẻ mạng xã hội mặc định (nên là ảnh tuyệt đối 1200x630). */
  defaultImage: `${SITE_URL}${LOGO_PATH}`,
  twitterHandle: '@bacnamsoftware',
  organization: {
    name: 'Công ty Cổ phần Phần mềm và Tư vấn Xây dựng Bắc Nam',
    legalName: 'Công ty Cổ phần Phần mềm và Tư vấn Xây dựng Bắc Nam (BNSC)',
    logo: `${SITE_URL}${LOGO_PATH}`,
    phone: '+84966966455',
    email: 'contact@bacnam.com.vn',
    address: {
      street: 'Tòa nhà Indochina, số 4 Nguyễn Đình Chiểu, Phường Đa Kao, Quận 1',
      city: 'TP. Hồ Chí Minh',
      country: 'VN',
    },
    sameAs: [SOCIAL.facebook, SOCIAL.youtube, SOCIAL.zalo],
  },
} as const;

/** Ghép URL tuyệt đối từ path tương đối. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
