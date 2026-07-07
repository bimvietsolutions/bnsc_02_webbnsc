/**
 * slug.ts
 * Chuyển tiêu đề tiếng Việt (có dấu) thành slug URL sạch, ổn định cho SEO.
 */

const VIETNAMESE_MAP: Record<string, string> = {
  à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
  ă: 'a', ằ: 'a', ắ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
  â: 'a', ầ: 'a', ấ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
  đ: 'd',
  è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
  ê: 'e', ề: 'e', ế: 'e', ể: 'e', ễ: 'e', ệ: 'e',
  ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
  ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
  ô: 'o', ồ: 'o', ố: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
  ơ: 'o', ờ: 'o', ớ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
  ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
  ư: 'u', ừ: 'u', ứ: 'u', ử: 'u', ữ: 'u', ự: 'u',
  ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
};

export function slugify(input: string): string {
  const lower = input.toLowerCase().trim();
  let out = '';
  for (const ch of lower) {
    out += VIETNAMESE_MAP[ch] ?? ch;
  }
  return out
    .replace(/[^a-z0-9\s-]/g, '') // bỏ ký tự đặc biệt
    .replace(/[\s-]+/g, '-') // gộp khoảng trắng/gạch nối
    .replace(/^-+|-+$/g, ''); // bỏ gạch nối đầu/cuối
}

/**
 * Đảm bảo slug là duy nhất trong một tập hợp (thêm hậu tố số khi trùng).
 */
export function uniqueSlug(base: string, used: Set<string>): string {
  let slug = slugify(base) || 'bai-viet';
  let candidate = slug;
  let i = 2;
  while (used.has(candidate)) {
    candidate = `${slug}-${i}`;
    i += 1;
  }
  used.add(candidate);
  return candidate;
}
