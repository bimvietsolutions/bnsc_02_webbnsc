/**
 * scripts/generate-sitemap.mts
 * Sinh public/sitemap.xml từ dữ liệu tin tức + thư viện.
 * Chạy: npm run sitemap  (đặt SITE_URL để đổi tên miền).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newsArticles } from '../src/data/news.ts';
import { libraryArticles } from '../src/data/library.ts';

const SITE_URL = (process.env.SITE_URL || 'https://bacnam.com.vn').replace(/\/$/, '');
const __dirname = dirname(fileURLToPath(import.meta.url));

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/tin-tuc', priority: '0.9', changefreq: 'daily' },
  { path: '/thu-vien', priority: '0.9', changefreq: 'weekly' },
  { path: '/ho-tro-ky-thuat', priority: '0.6', changefreq: 'monthly' },
];

const urls: { path: string; priority: string; changefreq: string }[] = [
  ...staticRoutes,
  ...newsArticles.map((a) => ({ path: `/tin-tuc/${a.slug}`, priority: '0.7', changefreq: 'monthly' })),
  ...libraryArticles.map((a) => ({ path: `/thu-vien/${a.slug}`, priority: '0.7', changefreq: 'monthly' })),
];

const body = urls
  .map(
    (u) =>
      `  <url>\n    <loc>${SITE_URL}${u.path}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

const outDir = resolve(__dirname, '../public');
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'sitemap.xml'), xml, 'utf8');
console.log(`sitemap.xml generated: ${urls.length} URLs -> ${SITE_URL}`);
