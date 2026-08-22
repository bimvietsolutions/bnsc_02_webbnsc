/**
 * scripts/legacy/transform.mts
 * Các phép biến đổi thuần (không chạm DB) dùng cho ETL — tách riêng để kiểm thử
 * được: giải mã entity, làm sạch HTML, rewrite URL ảnh, sinh text thuần/tóm tắt.
 */
import sanitizeHtml from 'sanitize-html';
import { decodeHTML } from 'entities';
import type { MediaManifest } from './mirror-media.mts';
import { toLegacyUploadPath } from './mirror-media.mts';
import { LEGACY_HOST } from './paths.mts';

/**
 * Allowlist thẻ/thuộc tính cho nội dung bài viết cũ.
 * Bám sát thống kê thẻ thực tế: span/strong/p/em/a/table/li/img/iframe/h1...
 * Bỏ hẳn script, style, form, event handler.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr', 'div', 'span', 'section', 'blockquote', 'pre', 'code',
    'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'mark', 'small',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    'a', 'img', 'figure', 'figcaption', 'iframe', 'video', 'source',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'title', 'frameborder'],
    video: ['src', 'controls', 'poster', 'width', 'height'],
    source: ['src', 'type'],
    table: ['border', 'cellpadding', 'cellspacing'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
    col: ['span', 'width'],
    '*': ['style'],
  },
  // Giữ style trình bày cơ bản, loại bỏ position/behavior nguy hiểm
  allowedStyles: {
    '*': {
      'text-align': [/^(left|right|center|justify)$/],
      'font-weight': [/^(bold|normal|[1-9]00)$/],
      'font-style': [/^(italic|normal)$/],
      'text-decoration': [/^[\w\s-]+$/],
      color: [/^#[0-9a-fA-F]{3,8}$/, /^rgba?\([\d\s,.%]+\)$/],
      'background-color': [/^#[0-9a-fA-F]{3,8}$/, /^rgba?\([\d\s,.%]+\)$/],
      width: [/^\d+(\.\d+)?(px|%|em|rem)$/],
      height: [/^\d+(\.\d+)?(px|%|em|rem)$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowedIframeHostnames: [
    'www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com',
    'player.vimeo.com', 'drive.google.com', 'docs.google.com', 'www.facebook.com',
  ],
  transformTags: {
    // Link ra ngoài mở tab mới và không rò rỉ referrer
    a: (tagName, attribs) => {
      const href = attribs.href ?? '';
      const isExternal = /^https?:\/\//i.test(href) && !href.includes(LEGACY_HOST);
      return {
        tagName,
        attribs: isExternal
          ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
          : attribs,
      };
    },
    // Ảnh trong bài luôn lazy-load
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
    // h1 trong nội dung hạ xuống h2 (h1 dành cho tiêu đề bài)
    h1: 'h2',
  },
};

/** Giải mã HTML entity còn sót trong dữ liệu cũ (&ocirc; &agrave; &yacute;...). */
export function decodeEntities(input: string | null | undefined): string {
  if (!input) return '';
  let out = decodeHTML(input);
  // Một số bản ghi bị mã hóa hai lần
  if (/&[a-z]+;|&#\d+;/i.test(out)) out = decodeHTML(out);
  return out;
}

/** Chuẩn hóa tiêu đề/tóm tắt: giải mã entity, gộp khoảng trắng. */
export function cleanText(input: string | null | undefined): string {
  return decodeEntities(input).replace(/\s+/g, ' ').trim();
}

/**
 * Đổi mọi URL ảnh thuộc site cũ sang đường dẫn đã mirror.
 * Ảnh chưa mirror được (manifest báo lỗi) giữ URL tuyệt đối để không vỡ bài.
 */
export function rewriteMediaUrl(raw: string | null | undefined, manifest: MediaManifest): string | null {
  if (!raw) return null;
  const uploadPath = toLegacyUploadPath(raw);
  if (!uploadPath) {
    const decoded = decodeEntities(raw).trim();
    return decoded || null;
  }
  const entry = manifest[uploadPath];
  if (entry?.ok) return entry.url;
  return `https://${LEGACY_HOST}/${uploadPath}`;
}

/** Làm sạch HTML + rewrite toàn bộ src ảnh bên trong. */
export function sanitizeContent(rawHtml: string | null | undefined, manifest: MediaManifest): string {
  const decoded = decodeEntities(rawHtml);
  if (!decoded.trim()) return '';

  let rewritten = decoded.replace(
    /(<img[^>]+src=)(["'])([^"']+)\2/gi,
    (whole, prefix: string, quote: string, url: string) => {
      const next = rewriteMediaUrl(url, manifest);
      return next ? `${prefix}${quote}${next}${quote}` : whole;
    },
  );

  // Trình soạn thảo cũ nhúng video bằng URL thiếu giao thức ("//www.youtube...").
  // Ép về https để iframe không cố tải qua http và bị chặn nội dung hỗn hợp.
  rewritten = rewritten.replace(/(<iframe[^>]+src=)(["'])\/\//gi, '$1$2https://');

  return sanitizeHtml(rewritten, SANITIZE_OPTIONS).trim();
}

/** Bóc text thuần từ HTML để phục vụ tìm kiếm và sinh tóm tắt. */
export function htmlToText(html: string): string {
  if (!html) return '';
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cắt tóm tắt tại ranh giới từ, tối đa `max` ký tự. */
export function buildSummary(existing: string | null | undefined, text: string, max = 220): string | null {
  const given = cleanText(existing);
  if (given) return given;
  if (!text) return null;
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

/** "2021-03-09 08:59:49" -> Date; trả null nếu không hợp lệ hoặc là zero-date. */
export function parseLegacyDate(input: string | null | undefined): Date | null {
  if (!input || input.startsWith('0000')) return null;
  const d = new Date(input.replace(' ', 'T') + '+07:00'); // DB cũ lưu giờ VN
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Chuỗi ngày hiển thị tiếng Việt: "18 Thg 5, 2026". */
export function formatDateText(date: Date | null): string | null {
  if (!date) return null;
  const vn = new Date(date.getTime() + 7 * 3600_000); // quy về giờ VN
  return `${vn.getUTCDate()} Thg ${vn.getUTCMonth() + 1}, ${vn.getUTCFullYear()}`;
}

/**
 * Bắt URL YouTube ở bất kỳ đâu trong một đoạn text.
 * Chấp nhận cả dạng thiếu giao thức ("//www.youtube.com/embed/...") — trình
 * soạn thảo cũ nhúng video theo kiểu này — và luôn trả về URL https đầy đủ.
 */
function firstYoutubeUrl(text: string): string | null {
  const m =
    text.match(/(?:https?:)?\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/[\w-]+/i) ??
    text.match(/(?:https?:)?\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+/i) ??
    text.match(/(?:https?:)?\/\/youtu\.be\/[\w-]+/i);
  if (!m) return null;
  return m[0].startsWith('//') ? `https:${m[0]}` : m[0];
}

/**
 * Lấy URL video THỰC SỰ được nhúng trong bài.
 *
 * Quan trọng: chỉ nhận video nhúng bằng <iframe>. 257/555 bài cũ có link
 * YouTube nằm trong thân bài chỉ vì dòng kêu gọi "đăng ký kênh Dự toán BNSC" ở
 * cuối bài — nếu bắt mọi link YouTube thì gần như bài nào cũng bị gắn nhãn
 * video và thẻ bài nào cũng hiện icon ▶.
 *
 * @param isVideoPost bài có post_type = 'video' ở CSDL cũ thì nới lỏng, chấp
 *        nhận cả link YouTube thường.
 */
export function extractVideoUrl(html: string, isVideoPost = false): string | null {
  for (const m of html.matchAll(/<iframe[^>]+src="([^"]+)"/gi)) {
    const url = firstYoutubeUrl(m[1]);
    if (url) return url;
  }
  return isVideoPost ? firstYoutubeUrl(html) : null;
}

export const __testables = { SANITIZE_OPTIONS };
