/**
 * server/routes.public.ts
 * API công khai (đọc) cho website + nhận lead từ form. Mount tại /api/public.
 * Tất cả chỉ trả về dữ liệu đang bật (isActive/isPublished).
 * Mọi handler bọc trong ah() để lỗi (vd mất kết nối DB) trả 500 thay vì làm sập
 * tiến trình — frontend sẽ tự dùng dữ liệu tĩnh (fallback).
 */
import express, { type Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from './db';
import { SECTION_PREFIX } from './routes.content';
import { PUBLIC_SETTING_KEYS } from '../src/lib/settingsKeys';

type Handler = (req: Request, res: Response) => Promise<unknown> | unknown;
const ah =
  (fn: Handler) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

export function createPublicRouter(): Router {
  const router = express.Router();

  router.get(
    '/settings',
    ah(async (_req, res) => {
      // Chỉ trả về các khóa nằm trong whitelist: xem src/lib/settingsKeys.ts.
      const rows = await prisma.setting.findMany({
        where: { key: { in: [...PUBLIC_SETTING_KEYS] } },
        select: { key: true, value: true },
      });
      const map: Record<string, string> = {};
      for (const s of rows) map[s.key] = s.value;
      res.json(map);
    }),
  );

  router.get(
    '/nav',
    ah(async (_req, res) => {
      const rows = await prisma.navLink.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      });
      const roots = rows.filter((r) => r.parentId === null);
      const tree = roots.map((r) => ({ ...r, children: rows.filter((c) => c.parentId === r.id) }));
      res.json(tree);
    }),
  );

  // Hero: ưu tiên các bài được đánh dấu isSlider (kế thừa 29 bài của site cũ);
  // nếu chưa có bài nào thì dùng bảng hero_slides nhập tay.
  router.get(
    '/hero',
    ah(async (_req, res) => {
      const [sliderArticles, manualSlides, stats] = await Promise.all([
        prisma.article.findMany({
          where: { isPublished: true, isSlider: true, coverUrl: { not: null } },
          orderBy: [{ sliderOrder: 'asc' }, { publishedAt: 'desc' }],
          take: 12,
          select: { title: true, slug: true, section: true, coverUrl: true },
        }),
        prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
        prisma.heroStat.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      ]);

      const slides = sliderArticles.length
        ? sliderArticles.map((a) => ({
            imageUrl: a.coverUrl!,
            caption: a.title,
            linkUrl: `${SECTION_PREFIX[a.section]}/${a.slug}`,
          }))
        : manualSlides;

      res.json({ slides, stats });
    }),
  );

  router.get(
    '/products',
    ah(async (_req, res) => {
      res.json(
        await prisma.product.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      );
    }),
  );

  router.get(
    '/consulting',
    ah(async (_req, res) => {
      const [services, courses] = await Promise.all([
        prisma.consultingService.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
        prisma.course.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      ]);
      res.json({ services, courses });
    }),
  );

  router.get(
    '/faqs',
    ah(async (req, res) => {
      const scope = req.query.scope === 'SUPPORT' ? 'SUPPORT' : 'HOME';
      res.json(
        await prisma.faq.findMany({ where: { isActive: true, scope }, orderBy: { sortOrder: 'asc' } }),
      );
    }),
  );

  router.get(
    '/customers',
    ah(async (_req, res) => {
      res.json(
        await prisma.customer.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      );
    }),
  );

  router.get(
    '/support',
    ah(async (_req, res) => {
      const [staff, tools] = await Promise.all([
        prisma.supportStaff.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
        prisma.remoteTool.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      ]);
      res.json({ staff, tools });
    }),
  );

  // ---------------------------------------------------------------------------
  // Alias tương thích ngược: /news và /library nay đọc từ bảng `articles` hợp
  // nhất và trả đúng shape mà mapNews/mapLibrary ở frontend đang dùng.
  // Khác biệt với bản cũ: CÓ phân trang và danh sách KHÔNG kèm nội dung bài
  // (555 bài × ~19KB sẽ tạo payload vài MB). Dùng /articles cho tính năng mới.
  // ---------------------------------------------------------------------------
  const aliasList = (section: 'NEWS' | 'LIBRARY') =>
    ah(async (req: Request, res: Response) => {
      const take = Math.min(Number(req.query.limit) || 60, 200);
      const rows = await prisma.article.findMany({
        where: { isPublished: true, section },
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        take,
        select: {
          id: true, slug: true, title: true, summary: true, coverUrl: true, thumbUrl: true,
          author: true, dateText: true, publishedAt: true, views: true,
          category: { select: { name: true, slug: true } },
        },
      });
      res.json(
        rows.map((r) => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          excerpt: r.summary ?? '',
          summary: r.summary ?? '',
          contentBody: '', // danh sách không kèm nội dung — xem endpoint chi tiết
          content: null,
          imageUrl: r.coverUrl ?? r.thumbUrl,
          author: r.author,
          category: r.category,
          dateText: r.dateText,
          publishedAt: r.publishedAt,
          views: r.views,
        })),
      );
    });

  const aliasDetail = (section: 'NEWS' | 'LIBRARY') =>
    ah(async (req: Request, res: Response) => {
      const item = await prisma.article.findFirst({
        where: { slug: req.params.slug, isPublished: true, section },
        include: { category: { select: { name: true, slug: true } } },
      });
      if (!item) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
      res.json({
        ...item,
        excerpt: item.summary ?? '',
        contentBody: item.contentHtml ?? '',
        content: item.contentHtml,
        imageUrl: item.coverUrl ?? item.thumbUrl,
      });
    });

  router.get('/news', aliasList('NEWS'));
  router.get('/news/:slug', aliasDetail('NEWS'));
  router.get('/library', aliasList('LIBRARY'));
  router.get('/library/:slug', aliasDetail('LIBRARY'));

  // Nhận lead từ form (Tải / Đăng ký / Tư vấn)
  router.post(
    '/leads',
    ah(async (req, res) => {
      const { type, fullName, phone, email, province, company, productSlug, courseSlug, note, source } =
        req.body ?? {};
      if (!fullName || !phone)
        return res.status(400).json({ error: 'Vui lòng nhập họ tên và số điện thoại.' });

      const allowed = ['DOWNLOAD', 'REGISTER', 'CONSULT'];
      const leadType = allowed.includes(type) ? type : 'REGISTER';

      const lead = await prisma.lead.create({
        data: {
          type: leadType,
          fullName: String(fullName).slice(0, 200),
          phone: String(phone).slice(0, 40),
          email: email ? String(email).slice(0, 200) : null,
          province: province ? String(province).slice(0, 120) : null,
          company: company ? String(company).slice(0, 200) : null,
          productSlug: productSlug ? String(productSlug) : null,
          courseSlug: courseSlug ? String(courseSlug) : null,
          note: note ? String(note).slice(0, 2000) : null,
          source: source ? String(source).slice(0, 120) : null,
        },
      });
      res.status(201).json({ ok: true, id: lead.id });
    }),
  );

  return router;
}
