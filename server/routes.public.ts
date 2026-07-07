/**
 * server/routes.public.ts
 * API công khai (đọc) cho website + nhận lead từ form. Mount tại /api/public.
 * Tất cả chỉ trả về dữ liệu đang bật (isActive/isPublished).
 * Mọi handler bọc trong ah() để lỗi (vd mất kết nối DB) trả 500 thay vì làm sập
 * tiến trình — frontend sẽ tự dùng dữ liệu tĩnh (fallback).
 */
import express, { type Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from './db';

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
      const rows = await prisma.setting.findMany();
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

  router.get(
    '/hero',
    ah(async (_req, res) => {
      const [slides, stats] = await Promise.all([
        prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
        prisma.heroStat.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      ]);
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

  router.get(
    '/news',
    ah(async (_req, res) => {
      res.json(
        await prisma.newsArticle.findMany({
          where: { isPublished: true },
          include: { category: true },
          orderBy: { id: 'desc' },
        }),
      );
    }),
  );

  router.get(
    '/news/:slug',
    ah(async (req, res) => {
      const item = await prisma.newsArticle.findFirst({
        where: { slug: req.params.slug, isPublished: true },
        include: { category: true },
      });
      if (!item) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
      res.json(item);
    }),
  );

  router.get(
    '/library',
    ah(async (_req, res) => {
      res.json(
        await prisma.libraryArticle.findMany({
          where: { isPublished: true },
          include: { category: true },
          orderBy: { id: 'asc' },
        }),
      );
    }),
  );

  router.get(
    '/library/:slug',
    ah(async (req, res) => {
      const item = await prisma.libraryArticle.findFirst({
        where: { slug: req.params.slug, isPublished: true },
        include: { category: true },
      });
      if (!item) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
      res.json(item);
    }),
  );

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
