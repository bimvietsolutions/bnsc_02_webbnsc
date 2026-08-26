/**
 * lib/settingsKeys.ts
 * Danh sách khóa cấu hình được phép lộ ra API công khai.
 *
 * `/api/public/settings` trước đây trả về NGUYÊN bảng Setting cho mọi khách ẩn
 * danh — bao gồm cả `ai_system_prompt`. Chưa có khóa nào là bí mật, nhưng trang
 * Cấu hình site cho phép admin tự tạo khóa mới, nên chỉ cần một lần ai đó lưu
 * token/API key vào đó là nó ra Internet ngay lập tức. Whitelist đảo ngược mặc
 * định: khóa mới mặc định RIÊNG TƯ, muốn công khai phải thêm tên vào đây.
 */
export const PUBLIC_SETTING_KEYS = [
  'site_name',
  'software_version',
  'company_legal_name',
  'business_license',
  'hotline_primary',
  'hotline_secondary',
  'email',
  'address',
  'social_facebook',
  'social_youtube',
  'social_zalo',
  'zalo_support_name',
  'zalo_support_phone',
  'announcement_enabled',
  'announcement_text',
] as const;

export type PublicSettingKey = (typeof PUBLIC_SETTING_KEYS)[number];

const PUBLIC_KEY_SET: ReadonlySet<string> = new Set(PUBLIC_SETTING_KEYS);

export function isPublicSettingKey(key: string): key is PublicSettingKey {
  return PUBLIC_KEY_SET.has(key);
}
