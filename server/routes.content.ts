/**
 * server/routes.content.ts
 * API nội dung hợp nhất (Article/Category/Tag/Series) — mount tại /api/public.
 *
 * Nguyên tắc quan trọng: endpoint DANH SÁCH không bao giờ trả contentHtml.
 * Với 555 bài × ~19KB nội dung, trả cả nội dung sẽ tạo payload vài MB mỗi lần
 * gọi (đây chính là lỗi G2/G3 trong plan/07). Chỉ trang chi tiết mới nạp nội dung.
 */
import express, { type Router, type Request, type Response, type NextFunction } from 'express';
import { Prisma, type ContentSection } from '@prisma/client';
import { prisma } from './db';

type Handler = (req: Request, res: Response) => Promise<unknown> | unknown;
const ah =
  (fn: Handler) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

const SECTIONS = ['NEWS', 'LIBRARY', 'CONSULTING', 'TRAINING'] as const;

export const SECTION_PREFIX: Record<ContentSection, string> = {
  NEWS: '/tin-tuc',
  LIBRARY: '/thu-vien',
  CONSULTING: '/tu-van',
  TRAINING: '/dao-tao',
};

function parseSection(value: unknown): ContentSection | undefined {
  const upper = String(value ?? '').toUpperCase();
  return (SECTIONS as readonly string[]).includes(upper) ? (upper as ContentSection) : undefined;
}

/** Các cột trả về cho DANH SÁCH — cố tình bỏ contentHtml/contentText. */
const LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  coverUrl: true,
  thumbUrl: true,
  coverAlt: true,
  section: true,
  publishedAt: true,
  dateText: true,
  views: true,
  isFeatured: true,
  isRecommended: true,
  isBreaking: true,
  videoUrl: true,
  category: { select: { id: true, slug: true, name: true, color: true, emoji: true } },
} satisfies Prisma.ArticleSelect;

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

/** Điều kiện lọc dùng chung cho list và count. */
function buildWhere(req: Request): Prisma.ArticleWhereInput {
  const where: Prisma.ArticleWhereInput = { isPublished: true };

  const section = parseSection(req.query.section);
  if (section) where.section = section;

  const category = String(req.query.category ?? '').trim();
  if (category && category !== 'all') where.category = { slug: category };

  const tag = String(req.query.tag ?? '').trim();
  if (tag) where.tags = { some: { slug: tag } };

  const q = String(req.query.q ?? '').trim();
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { summary: { contains: q, mode: 'insensitive' } },
      { contentText: { contains: q, mode: 'insensitive' } },
    ];
  }

  const featured = req.query.featured;
  if (featured === '1' || featured === 'true') where.isFeatured = true;
  if (req.query.slider === '1' || req.query.slider === 'true') where.isSlider = true;

  return where;
}

function buildOrderBy(sort: unknown): Prisma.ArticleOrderByWithRelationInput[] {
  switch (String(sort ?? 'newest')) {
    case 'popular':
      return [{ views: 'desc' }, { id: 'desc' }];
    case 'oldest':
      return [{ publishedAt: 'asc' }, { id: 'asc' }];
    case 'title':
      return [{ title: 'asc' }];
    default:
      return [{ publishedAt: 'desc' }, { id: 'desc' }];
  }
}

export function createContentRouter(): Router {
  const router = express.Router();

  // ------------------------------------------------------------- danh mục
  router.get(
    '/categories',
    ah(async (req, res) => {
      const section = parseSection(req.query.section);
      const rows = await prisma.category.findMany({
        where: { isActive: true, ...(section ? { section } : {}) },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        select: {
          id: true, slug: true, name: true, title: true, section: true, parentId: true,
          color: true, emoji: true, sortOrder: true, showOnMenu: true, showAtHomepage: true,
          _count: { select: { articles: { where: { isPublished: true } } } },
        },
      });
      const items = rows.map((r) => ({ ...r, articleCount: r._count.articles, _count: undefined }));
      // Trả cả dạng phẳng và dạng cây để client tự chọn
      const roots = items.filter((r) => r.parentId === null);
      res.json({
        items,
        tree: roots.map((r) => ({ ...r, children: items.filter((c) => c.parentId === r.id) })),
      });
    }),
  );

  // ----------------------------------------------------------------- thẻ
  router.get(
    '/tags',
    ah(async (req, res) => {
      const section = parseSection(req.query.section);
      const limit = clampInt(req.query.limit, 100, 1, 500);
      const rows = await prisma.tag.findMany({
        select: {
          id: true, slug: true, name: true,
          _count: {
            select: {
              articles: { where: { isPublished: true, ...(section ? { section } : {}) } },
            },
          },
        },
      });
      res.json(
        rows
          .map((r) => ({ id: r.id, slug: r.slug, name: r.name, articleCount: r._count.articles }))
          .filter((r) => r.articleCount > 0)
          .sort((a, b) => b.articleCount - a.articleCount || a.name.localeCompare(b.name, 'vi'))
          .slice(0, limit),
      );
    }),
  );

  // ------------------------------------------------- mục lục giáo trình
  router.get(
    '/series',
    ah(async (_req, res) => {
      const rows = await prisma.seriesNode.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        select: {
          id: true, title: true, slug: true, parentId: true, sortOrder: true,
          article: { select: { slug: true, section: true, views: true, isPublished: true } },
        },
      });
      const build = (parentId: number | null): unknown[] =>
        rows
          .filter((r) => r.parentId === parentId)
          .map((r) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            href: r.article?.isPublished
              ? `${SECTION_PREFIX[r.article.section]}/${r.article.slug}`
              : null,
            views: r.article?.views ?? null,
            children: build(r.id),
          }));
      res.json(build(null));
    }),
  );

  // ------------------------------------------------------ danh sách bài
  router.get(
    '/articles',
    ah(async (req, res) => {
      const page = clampInt(req.query.page, 1, 1, 10_000);
      const pageSize = clampInt(req.query.pageSize, 12, 1, 60);
      const where = buildWhere(req);

      const [items, total] = await Promise.all([
        prisma.article.findMany({
          where,
          select: LIST_SELECT,
          orderBy: buildOrderBy(req.query.sort),
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.article.count({ where }),
      ]);

      res.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
    }),
  );

  // ------------------------------------------------------- chi tiết bài
  router.get(
    '/articles/:slug',
    ah(async (req, res) => {
      const article = await prisma.article.findFirst({
        where: { slug: req.params.slug, isPublished: true },
        include: {
          category: { select: { id: true, slug: true, name: true, color: true, emoji: true } },
          tags: { select: { slug: true, name: true } },
        },
      });
      if (!article) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });

      // Điều hướng trước/sau trong mục lục giáo trình (nếu bài thuộc series)
      const node = await prisma.seriesNode.findFirst({
        where: { articleId: article.id, isActive: true },
        select: { id: true, parentId: true, sortOrder: true },
      });

      let prev = null;
      let next = null;
      if (node?.parentId) {
        const siblings = await prisma.seriesNode.findMany({
          where: { parentId: node.parentId, isActive: true, article: { isPublished: true } },
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          select: { id: true, title: true, article: { select: { slug: true, section: true } } },
        });
        const idx = siblings.findIndex((s) => s.id === node.id);
        const toLink = (s: (typeof siblings)[number] | undefined) =>
          s?.article ? { title: s.title, href: `${SECTION_PREFIX[s.article.section]}/${s.article.slug}` } : null;
        prev = toLink(siblings[idx - 1]);
        next = toLink(siblings[idx + 1]);
      }

      // Bài liên quan: ưu tiên cùng thẻ, bù thêm cùng danh mục
      const tagSlugs = article.tags.map((t) => t.slug);
      const related = await prisma.article.findMany({
        where: {
          isPublished: true,
          id: { not: article.id },
          OR: [
            ...(tagSlugs.length ? [{ tags: { some: { slug: { in: tagSlugs } } } }] : []),
            ...(article.categoryId ? [{ categoryId: article.categoryId }] : []),
          ],
        },
        select: LIST_SELECT,
        orderBy: [{ publishedAt: 'desc' }],
        take: 6,
      });

      res.json({ ...article, prev, next, related });
    }),
  );

  // --------------------------------------------------- tăng lượt xem
  // Chống lặp bằng cookie mỗi bài, hạn 12 giờ. Lỗi ở đây không được ảnh hưởng
  // tới trải nghiệm đọc nên luôn trả 200.
  router.post(
    '/articles/:slug/view',
    ah(async (req, res) => {
      const cookieName = `v_${req.params.slug}`.slice(0, 60).replace(/[^\w-]/g, '');
      if (req.cookies?.[cookieName]) return res.json({ ok: true, counted: false });

      const updated = await prisma.article
        .updateMany({ where: { slug: req.params.slug, isPublished: true }, data: { views: { increment: 1 } } })
        .catch(() => ({ count: 0 }));

      if (updated.count > 0) {
        res.cookie(cookieName, '1', {
          maxAge: 12 * 3600 * 1000,
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        });
      }
      res.json({ ok: true, counted: updated.count > 0 });
    }),
  );

  return router;
}
