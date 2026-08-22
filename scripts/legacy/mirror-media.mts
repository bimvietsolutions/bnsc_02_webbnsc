/**
 * scripts/legacy/mirror-media.mts
 * P3 — Tải toàn bộ ảnh của website cũ (bacnam.com.vn) về máy chủ mới.
 *
 * Nguồn URL: 5 cột ảnh của bảng posts + bảng images + mọi thẻ <img src> trong
 * nội dung bài. Chỉ mirror tài nguyên nằm dưới /uploads/ của site cũ; ảnh từ
 * host bên ngoài (Facebook CDN, báo chí...) giữ nguyên URL tuyệt đối.
 *
 * Chạy:
 *   npm run legacy:mirror                # tải tất cả (có thể chạy lại, bỏ qua file đã có)
 *   npm run legacy:mirror -- --limit=50  # thử nghiệm 50 file đầu
 *   npm run legacy:mirror -- --force     # tải lại cả file đã tồn tại
 *
 * Kết quả: public/uploads/legacy/... + scripts/legacy/media-manifest.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { decodeHTML } from 'entities';
import { loadExport } from './load-export.mts';
import { LEGACY_HOST, LEGACY_MEDIA_DIR, LEGACY_ORIGIN, MEDIA_MANIFEST } from './paths.mts';

const CONCURRENCY = Number(process.env.MIRROR_CONCURRENCY ?? 8);
const MAX_RETRY = 3;
const TIMEOUT_MS = 45_000;
const FORCE = process.argv.includes('--force');
const LIMIT = Number(
  process.argv.find((a) => a.startsWith('--limit='))?.slice('--limit='.length) ?? 0,
);

export interface MediaEntry {
  /** Đường dẫn tương đối gốc, vd "uploads/images/2021/03/image_750x_x.jpg" */
  source: string;
  /** URL công khai mới, vd "/uploads/legacy/images/2021/03/image_750x_x.jpg" */
  url: string;
  ok: boolean;
  bytes?: number;
  error?: string;
}

export type MediaManifest = Record<string, MediaEntry>;

/**
 * Chuẩn hóa một URL/đường dẫn ảnh về dạng "uploads/..." nếu nó thuộc site cũ.
 * Trả về null nếu là tài nguyên bên ngoài (không mirror).
 */
export function toLegacyUploadPath(rawInput: string): string | null {
  if (!rawInput) return null;
  let raw = decodeHTML(rawInput.trim());
  if (!raw || raw.startsWith('data:')) return null;

  // Bỏ query string và fragment
  raw = raw.split('#')[0];

  let pathname: string;
  if (/^https?:\/\//i.test(raw)) {
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      return null;
    }
    if (parsed.hostname !== LEGACY_HOST && parsed.hostname !== `www.${LEGACY_HOST}`) return null;
    pathname = parsed.pathname;
  } else if (raw.startsWith('//')) {
    return null;
  } else {
    pathname = raw.split('?')[0];
  }

  pathname = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (!pathname.toLowerCase().startsWith('uploads/')) return null;

  // Chặn path traversal
  const segments = pathname.split('/').filter((s) => s && s !== '.' && s !== '..');
  if (segments.length < 2) return null;
  return segments.join('/');
}

/** "uploads/images/2021/03/x.jpg" -> "/uploads/legacy/images/2021/03/x.jpg" */
export function publicUrlFor(uploadPath: string): string {
  return `/uploads/legacy/${uploadPath.slice('uploads/'.length)}`;
}

function localFileFor(uploadPath: string): string {
  return path.join(LEGACY_MEDIA_DIR, ...uploadPath.slice('uploads/'.length).split('/'));
}

/** Gom mọi URL ảnh duy nhất từ bản export. */
export function collectMediaPaths(): string[] {
  const { posts, images } = loadExport();
  const found = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value !== 'string') return;
    const p = toLegacyUploadPath(value);
    if (p) found.add(p);
  };

  const imageCols = ['image_big', 'image_default', 'image_slider', 'image_mid', 'image_small'];
  for (const row of images) for (const col of imageCols) add(row[col as keyof typeof row]);
  for (const post of posts) {
    for (const col of imageCols) add(post[col]);
    add(post.image_url);
    const html = post.content ?? '';
    for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/gi)) add(m[1]);
    for (const m of html.matchAll(/<img[^>]+src='([^']+)'/gi)) add(m[1]);
  }
  return [...found].sort();
}

async function download(uploadPath: string): Promise<MediaEntry> {
  const url = publicUrlFor(uploadPath);
  const dest = localFileFor(uploadPath);

  if (!FORCE && fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    return { source: uploadPath, url, ok: true, bytes: fs.statSync(dest).size };
  }

  const remote = `${LEGACY_ORIGIN}/${uploadPath.split('/').map(encodeURIComponent).join('/')}`;
  let lastError = '';

  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      const res = await fetch(remote, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { 'User-Agent': 'BNSC-migration/1.0', Referer: LEGACY_ORIGIN + '/' },
      });
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        // 404 thì không cần thử lại
        if (res.status === 404 || res.status === 410) break;
        throw new Error(lastError);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length === 0) {
        lastError = 'tệp rỗng';
        break;
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, buf);
      return { source: uploadPath, url, ok: true, bytes: buf.length };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < MAX_RETRY) await new Promise((r) => setTimeout(r, 400 * attempt * attempt));
    }
  }
  return { source: uploadPath, url, ok: false, error: lastError };
}

async function main() {
  let paths = collectMediaPaths();
  if (LIMIT > 0) paths = paths.slice(0, LIMIT);

  console.log(`[mirror] ${paths.length} tệp ảnh cần xử lý -> ${LEGACY_MEDIA_DIR}`);
  fs.mkdirSync(LEGACY_MEDIA_DIR, { recursive: true });

  const manifest: MediaManifest = {};
  let done = 0;
  let failed = 0;
  let bytes = 0;
  const startedAt = Date.now();

  let cursor = 0;
  async function worker() {
    while (cursor < paths.length) {
      const item = paths[cursor++];
      const entry = await download(item);
      manifest[item] = entry;
      done++;
      if (entry.ok) bytes += entry.bytes ?? 0;
      else failed++;
      if (done % 100 === 0 || done === paths.length) {
        const secs = ((Date.now() - startedAt) / 1000).toFixed(0);
        console.log(
          `[mirror] ${done}/${paths.length} | lỗi ${failed} | ${(bytes / 1048576).toFixed(1)} MB | ${secs}s`,
        );
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  fs.mkdirSync(path.dirname(MEDIA_MANIFEST), { recursive: true });
  fs.writeFileSync(MEDIA_MANIFEST, JSON.stringify(manifest, null, 1), 'utf8');

  console.log('\n=============================================');
  console.log(`Tổng      : ${paths.length} tệp`);
  console.log(`Thành công: ${paths.length - failed}`);
  console.log(`Thất bại  : ${failed}`);
  console.log(`Dung lượng: ${(bytes / 1048576).toFixed(1)} MB`);
  console.log(`Manifest  : ${MEDIA_MANIFEST}`);
  if (failed > 0) {
    console.log('\nDanh sách lỗi (tối đa 30 dòng đầu):');
    Object.values(manifest)
      .filter((e) => !e.ok)
      .slice(0, 30)
      .forEach((e) => console.log(`  ${e.error}\t${e.source}`));
  }
  console.log('=============================================');
}

// Chỉ chạy khi gọi trực tiếp, không chạy khi được import bởi ETL
if (process.argv[1] && process.argv[1].includes('mirror-media')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
