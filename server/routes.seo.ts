/**
 * server/routes.seo.ts
 * Hai việc giữ SEO khi chuyển từ website cũ sang:
 *
 *  1. redirectMiddleware — URL cũ dạng bacnam.com.vn/<slug> (không có tiền tố)
 *     được 301 sang đường dẫn mới /tin-tuc/<slug>, /thu-vien/<slug>...
 *     Bảng `redirects` do script import sinh ra (1 dòng / bài).
 *  2. sitemapHandler — sinh sitemap.xml từ CSDL thay cho tệp tĩnh.
 */
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { prisma } from './db';
import { SECTION_PREFIX } from './routes.content';

/** Tiền tố không bao giờ là slug bài viết -> bỏ qua cho nhanh. */
const IGNORED_PREFIXES = [
  '/api', '/uploads', '/assets', '/admin', '/health',
  '/tin-tuc', '/thu-vien', '/tu-van', '/dao-tao', '/tag', '/huong-dan',
  '/dang-nhap', '/ho-tro-ky-thuat', '/@vite', '/@react-refresh', '/src', '/node_modules',
];

/**
 * Bộ nhớ đệm bảng redirect. 555 dòng nên nạp hết vào RAM là hợp lý; tránh một
 * truy vấn DB cho mọi request 404 tiềm năng (và cho cả request tài nguyên tĩnh).
 */
let cache: Map<string, { to: string; status: number }> | null = null;
let cacheAt = 0;
const CACHE_TTL_MS = 5 * 60_000;

async function getRedirects() {
  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) return cache;
  const rows = await prisma.redirect.findMany({ select: { from: true, to: true, status: true } });
  cache = new Map(rows.map((r) => [r.from, { to: r.to, status: r.status }]));
  cacheAt = Date.now();
  return cache;
}

/** Xóa cache khi admin sửa bảng redirect. */
export function invalidateRedirectCache(): void {
  cache = null;
}

export function createRedirectMiddleware(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();

    const pathname = req.path;
    // Chỉ xét đường dẫn 1 cấp, không có phần mở rộng tệp
    if (pathname === '/' || pathname.indexOf('/', 1) !== -1 || pathname.includes('.')) return next();
    if (IGNORED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return next();

    getRedirects()
      .then((map) => {
        const hit = map.get(pathname);
        if (!hit) return next();
        // Đếm lượt dùng (không chặn phản hồi)
        prisma.redirect
          .updateMany({ where: { from: pathname }, data: { hits: { increment: 1 } } })
          .catch(() => {});
        res.redirect(hit.status || 301, hit.to);
      })
      .catch(() => next()); // mất DB thì bỏ qua redirect, không làm hỏng trang
  };
}

const STATIC_ROUTES: { path: string; changefreq: string; priority: string }[] = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/tin-tuc', changefreq: 'daily', priority: '0.9' },
  { path: '/thu-vien', changefreq: 'weekly', priority: '0.9' },
  { path: '/tu-van', changefreq: 'weekly', priority: '0.8' },
  { path: '/dao-tao', changefreq: 'weekly', priority: '0.8' },
  { path: '/huong-dan', changefreq: 'weekly', priority: '0.8' },
  { path: '/ho-tro-ky-thuat', changefreq: 'monthly', priority: '0.7' },
];

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);

/**
 * Tên miền gốc cho sitemap. APP_URL có thể còn là chuỗi giữ chỗ (vd "MY_APP_URL"
 * do AI Studio chèn) — nếu không phải URL http(s) hợp lệ thì bỏ qua, tránh sinh
 * ra sitemap toàn đường dẫn rác nộp cho Google.
 */
function siteOrigin(req: Request): string {
  const configured = (process.env.APP_URL ?? '').trim();
  if (/^https?:\/\/[^\s/]+/i.test(configured)) return configured.replace(/\/+$/, '');
  if (configured) {
    console.warn(`APP_URL không hợp lệ ("${configured}") — sitemap dùng host của request.`);
  }
  return `${req.protocol}://${req.get('host')}`;
}

export function createSitemapHandler(): RequestHandler {
  return async (req: Request, res: Response) => {
    const base = siteOrigin(req);
    try {
      const [articles, categories, tags] = await Promise.all([
        prisma.article.findMany({
          where: { isPublished: true },
          select: { slug: true, section: true, publishedAt: true, sourceUpdatedAt: true },
          orderBy: { publishedAt: 'desc' },
        }),
        prisma.category.findMany({
          where: { isActive: true, parentId: { not: null } },
          select: { slug: true, section: true },
        }),
        prisma.tag.findMany({ select: { slug: true } }),
      ]);

      const urls: string[] = [];
      const push = (loc: string, lastmod?: Date | null, changefreq = 'weekly', priority = '0.6') =>
        urls.push(
          `  <url>\n    <loc>${escapeXml(base + loc)}</loc>` +
            (lastmod ? `\n    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : '') +
            `\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
        );

      for (const r of STATIC_ROUTES) push(r.path, null, r.changefreq, r.priority);
      for (const c of categories) push(`${SECTION_PREFIX[c.section]}?danh-muc=${c.slug}`, null, 'weekly', '0.7');
      for (const a of articles)
        push(`${SECTION_PREFIX[a.section]}/${a.slug}`, a.sourceUpdatedAt ?? a.publishedAt, 'monthly', '0.8');
      for (const t of tags) push(`/tag/${t.slug}`, null, 'monthly', '0.5');

      res.type('application/xml').send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
      );
    } catch (err) {
      console.error('sitemap error:', err);
      // Mất DB -> để express.static phục vụ tệp sitemap.xml tĩnh dự phòng
      res.status(503).type('text/plain').send('sitemap tạm thời không khả dụng');
    }
  };
}
