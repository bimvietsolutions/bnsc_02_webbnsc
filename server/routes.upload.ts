/**
 * server/routes.upload.ts
 * Upload ảnh/tệp cho admin (yêu cầu đăng nhập). Lưu vào public/uploads/, trả về
 * URL /uploads/<file>. Cùng thư mục được express phục vụ tĩnh ở cả dev lẫn prod.
 */
import path from 'path';
import fs from 'fs';
import express, { type Router } from 'express';
import multer from 'multer';
import { prisma } from './db';
import { requireAuth } from './auth';

export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif',
  'application/pdf',
]);

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const base = slugifyName(path.basename(file.originalname, ext)) || 'file';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${base}-${unique}${ext.toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(new Error('Định dạng tệp không được hỗ trợ.'));
  },
});

export function createUploadRouter(): Router {
  const router = express.Router();
  router.use(requireAuth);

  router.post('/', (req, res) => {
    upload.single('file')(req, res, async (err: any) => {
      if (err) return res.status(400).json({ error: err.message || 'Lỗi upload.' });
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) return res.status(400).json({ error: 'Không có tệp.' });

      const url = `/uploads/${file.filename}`;
      // Ghi sổ media (không chặn nếu DB lỗi).
      try {
        await prisma.media.create({
          data: { url, mimeType: file.mimetype, sizeBytes: file.size, alt: file.originalname },
        });
      } catch {
        /* bỏ qua nếu DB chưa sẵn sàng */
      }
      res.status(201).json({ url, mimeType: file.mimetype, sizeBytes: file.size });
    });
  });

  return router;
}
