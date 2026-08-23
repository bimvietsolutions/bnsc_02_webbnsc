/**
 * scripts/legacy/paths.mts
 * Đường dẫn dùng chung cho bộ script migration dữ liệu website cũ.
 *
 * Thư mục export (5 file JSON của phpMyAdmin) lấy theo thứ tự ưu tiên:
 *   1. biến môi trường LEGACY_EXPORT_DIR
 *   2. tham số dòng lệnh --export=<đường dẫn>
 *   3. mặc định: ../bacnamco_beta.json cạnh thư mục dự án
 */
import path from 'node:path';
import fs from 'node:fs';

export const PROJECT_ROOT = process.cwd();

/** Nơi lưu ảnh mirror về từ site cũ; nằm trong public/uploads nên được phục vụ tĩnh. */
export const LEGACY_MEDIA_DIR = path.join(PROJECT_ROOT, 'public', 'uploads', 'legacy');

/** Tiền tố URL công khai tương ứng với LEGACY_MEDIA_DIR. */
export const LEGACY_MEDIA_URL_PREFIX = '/uploads/legacy';

/**
 * Nơi lưu tệp trung gian của ETL (manifest, báo cáo).
 *
 * Phải nằm trong public/uploads vì đó là thư mục DUY NHẤT được gắn volume khi
 * chạy bằng container: mirror và import là hai container khác nhau, nếu để tệp
 * trong mã nguồn thì nó nằm ở lớp ghi của container và biến mất khi container
 * bị xoá — import sẽ không bao giờ thấy manifest, và mọi ảnh giữ nguyên URL
 * tuyệt đối về site cũ. Thư mục mã nguồn trong image cũng thuộc root nên uid
 * chạy container không ghi được (EACCES).
 *
 * Đặt trong thư mục ẩn ".legacy" để express.static không phục vụ ra ngoài
 * (mặc định dotfiles: 'ignore' -> trả 404): manifest liệt kê toàn bộ đường dẫn
 * ảnh, không có lý do gì để công khai.
 */
export const LEGACY_META_DIR =
  process.env.LEGACY_META_DIR?.trim() || path.join(PROJECT_ROOT, 'public', 'uploads', '.legacy');

/** Manifest ánh xạ URL cũ -> đường dẫn mới, do mirror-media sinh ra, ETL đọc lại. */
export const MEDIA_MANIFEST = path.join(LEGACY_META_DIR, 'media-manifest.json');

/** Báo cáo đối soát sau khi import. */
export const IMPORT_REPORT = path.join(LEGACY_META_DIR, 'import-report.json');

/** Host của website cũ — dùng để nhận diện URL nội bộ cần rewrite. */
export const LEGACY_HOST = 'bacnam.com.vn';
export const LEGACY_ORIGIN = `https://${LEGACY_HOST}`;

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

export function resolveExportDir(): string {
  const candidates = [
    process.env.LEGACY_EXPORT_DIR,
    argValue('export'),
    path.resolve(PROJECT_ROOT, '..', 'bacnamco_beta.json'),
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'bacnamco_beta_table_posts.json'))) return dir;
  }
  throw new Error(
    `Không tìm thấy thư mục export. Đã thử:\n${candidates.map((c) => '  - ' + c).join('\n')}\n` +
      'Đặt LEGACY_EXPORT_DIR hoặc truyền --export=<đường dẫn>.',
  );
}
