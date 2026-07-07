/**
 * server/routes.admin.ts
 * API quản trị (yêu cầu đăng nhập): CRUD generic cho mọi resource + thống kê.
 * Mount tại /api/admin.
 */
import express, { type Router } from 'express';
import { prisma } from './db';
import { requireAuth } from './auth';
import { resources, stripSystemFields } from './resources';

function getResource(name: string) {
  return resources[name];
}

export function createAdminRouter(): Router {
  const router = express.Router();

  // Tất cả route admin đều cần đăng nhập.
  router.use(requireAuth);

  // Thống kê tổng quan cho dashboard.
  router.get('/stats', async (_req, res) => {
    try {
      const [news, library, products, leads, newLeads, customers, courses] = await Promise.all([
        prisma.newsArticle.count(),
        prisma.libraryArticle.count(),
        prisma.product.count(),
        prisma.lead.count(),
        prisma.lead.count({ where: { status: 'NEW' } }),
        prisma.customer.count(),
        prisma.course.count(),
      ]);
      res.json({ news, library, products, leads, newLeads, customers, courses });
    } catch (e) {
      console.error('stats error', e);
      res.status(500).json({ error: 'Lỗi lấy thống kê.' });
    }
  });

  // Danh sách (có phân trang tùy chọn ?take=&skip=).
  router.get('/resources/:resource', async (req, res) => {
    const cfg = getResource(req.params.resource);
    if (!cfg) return res.status(404).json({ error: 'Resource không tồn tại.' });
    try {
      const take = req.query.take ? Math.min(Number(req.query.take), 200) : undefined;
      const skip = req.query.skip ? Number(req.query.skip) : undefined;
      const [rows, total] = await Promise.all([
        cfg.delegate().findMany({ orderBy: cfg.orderBy, include: cfg.include, take, skip }),
        cfg.delegate().count(),
      ]);
      const data = cfg.afterRead ? rows.map(cfg.afterRead) : rows;
      res.json({ data, total });
    } catch (e) {
      console.error('list error', e);
      res.status(500).json({ error: 'Lỗi lấy danh sách.' });
    }
  });

  // Một bản ghi.
  router.get('/resources/:resource/:id', async (req, res) => {
    const cfg = getResource(req.params.resource);
    if (!cfg) return res.status(404).json({ error: 'Resource không tồn tại.' });
    try {
      const record = await cfg.delegate().findUnique({
        where: { id: Number(req.params.id) },
        include: cfg.include,
      });
      if (!record) return res.status(404).json({ error: 'Không tìm thấy.' });
      res.json({ data: cfg.afterRead ? cfg.afterRead(record) : record });
    } catch (e) {
      console.error('get error', e);
      res.status(500).json({ error: 'Lỗi lấy dữ liệu.' });
    }
  });

  // Tạo mới.
  router.post('/resources/:resource', async (req, res) => {
    const cfg = getResource(req.params.resource);
    if (!cfg) return res.status(404).json({ error: 'Resource không tồn tại.' });
    try {
      let data = stripSystemFields(req.body ?? {});
      if (cfg.beforeWrite) data = await cfg.beforeWrite(data);
      const record = await cfg.delegate().create({ data });
      res.status(201).json({ data: cfg.afterRead ? cfg.afterRead(record) : record });
    } catch (e: any) {
      console.error('create error', e);
      res.status(400).json({ error: e?.message || 'Lỗi tạo mới.' });
    }
  });

  // Cập nhật.
  router.put('/resources/:resource/:id', async (req, res) => {
    const cfg = getResource(req.params.resource);
    if (!cfg) return res.status(404).json({ error: 'Resource không tồn tại.' });
    try {
      let data = stripSystemFields(req.body ?? {});
      if (cfg.beforeWrite) data = await cfg.beforeWrite(data);
      const record = await cfg.delegate().update({ where: { id: Number(req.params.id) }, data });
      res.json({ data: cfg.afterRead ? cfg.afterRead(record) : record });
    } catch (e: any) {
      console.error('update error', e);
      res.status(400).json({ error: e?.message || 'Lỗi cập nhật.' });
    }
  });

  // Xóa.
  router.delete('/resources/:resource/:id', async (req, res) => {
    const cfg = getResource(req.params.resource);
    if (!cfg) return res.status(404).json({ error: 'Resource không tồn tại.' });
    try {
      await cfg.delegate().delete({ where: { id: Number(req.params.id) } });
      res.json({ ok: true });
    } catch (e: any) {
      console.error('delete error', e);
      res.status(400).json({ error: e?.message || 'Lỗi xóa.' });
    }
  });

  return router;
}
