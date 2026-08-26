/**
 * seo/brand.ts
 * Nguồn sự thật DUY NHẤT cho nhận diện thương hiệu (logo, favicon, tên, mô tả,
 * màu chủ đạo, tên miền mặc định).
 *
 * Tệp này KHÔNG dùng `import.meta.env` để vite.config.ts (chạy trong Node) cũng
 * import được: plugin `brandHtml` bơm các giá trị dưới đây vào index.html, còn
 * phía trình duyệt thì siteConfig.ts và các component import lại. Nhờ vậy đổi
 * logo/favicon/tiêu đề chỉ phải sửa đúng một chỗ.
 *
 * Tài nguyên ảnh nằm trong repo tại `static/` (publicDir của Vite) nên đi cùng
 * bản build. Tuyệt đối không trỏ sang hosting cũ: ngày tắt hosting đó là logo
 * hỏng toàn site.
 */

/** Logo chính, dùng cho Navbar/Footer/trang đăng nhập/og:image/JSON-LD. */
export const LOGO_PATH = '/brand/bnsc-logo.png';

/** Favicon + apple-touch-icon. */
export const FAVICON_PATH = '/favicon.png';

/** Loại MIME của favicon, để index.html không phải đoán. */
export const FAVICON_TYPE = 'image/png';

/** Tên miền chính thức mặc định (ghi đè bằng VITE_SITE_URL lúc build). */
export const DEFAULT_SITE_URL = 'https://bacnam.com.vn';

export const BRAND_NAME = 'Bắc Nam Software (BNSC)';

/** Tên rút gọn dùng trong UI (footer, wordmark một dòng). */
export const BRAND_SHORT_NAME = 'Bắc Nam Software';

/** Tên hiển thị cạnh logo: dòng trên / dòng dưới. */
export const BRAND_WORDMARK = { primary: 'Bắc Nam', secondary: 'Software' } as const;

/** Chữ alt dùng chung cho mọi thẻ <img> logo. */
export const LOGO_ALT = 'Logo Bắc Nam Software (BNSC)';

export const DEFAULT_TITLE = 'Phần mềm Dự toán BNSC | Bắc Nam Software (BNSC)';

export const TITLE_TEMPLATE = '%s | Bắc Nam Software (BNSC)';

export const DEFAULT_DESCRIPTION =
  'Phần mềm Dự toán BNSC – giải pháp lập, thẩm định dự toán, dự thầu và thanh quyết toán công trình hàng đầu Việt Nam. Cập nhật đầy đủ định mức, đơn giá 63 tỉnh thành theo Thông tư Bộ Xây dựng.';

/** Mô tả ngắn cho Open Graph (fallback tĩnh trong index.html). */
export const OG_DESCRIPTION =
  'Giải pháp lập, thẩm định dự toán, dự thầu và thanh quyết toán công trình hàng đầu Việt Nam.';

/** Màu thanh trình duyệt trên mobile. */
export const THEME_COLOR = '#0B2545';

export const LOCALE = 'vi_VN';
export const LANG = 'vi';
