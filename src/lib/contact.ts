/**
 * lib/contact.ts
 * Thông tin liên hệ dùng chung (hotline, email) cho mọi component.
 *
 * Trước đây số hotline bị gõ cứng ở 4 nơi với 2 giá trị khác nhau
 * (0966.965.075 ở trang Tư vấn & Đào tạo, 0966966455 ở khung chat và trang Hỗ
 * trợ kỹ thuật) nên đổi số là chắc chắn sót. Nay tất cả đọc từ
 * /api/public/settings, fallback nằm ở `settingsFallback`.
 */
import { useApi, settingsGetter } from './api';
import { settingsFallback } from './publicData';

/** "0966966455" -> "0966.966.455" để hiển thị; giữ nguyên nếu không phải 10 số. */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 10) return raw;
  return `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7)}`;
}

export function useContactInfo() {
  const { data: settings } = useApi('/api/public/settings', settingsFallback);
  const s = settingsGetter(settings);

  /** Số thô, dùng cho href="tel:". */
  const hotline = s('hotline_primary', settingsFallback.hotline_primary);
  const hotlineSecondary = s('hotline_secondary', settingsFallback.hotline_secondary);
  const email = s('email', settingsFallback.email);
  const zaloName = s('zalo_support_name', settingsFallback.zalo_support_name);
  const zaloPhone = s('zalo_support_phone', settingsFallback.zalo_support_phone);

  return {
    hotline,
    /** Số đã chấm nhóm, dùng để hiển thị. */
    hotlineDisplay: formatPhone(hotline),
    hotlineHref: `tel:${hotline}`,
    hotlineSecondary,
    hotlineSecondaryDisplay: formatPhone(hotlineSecondary),
    email,
    emailHref: `mailto:${email}`,
    zaloName,
    zaloPhone,
    zaloHref: `https://zalo.me/${zaloPhone}`,
    /** Truy cập các key khác của settings mà không cần gọi API lần nữa. */
    get: s,
  };
}
