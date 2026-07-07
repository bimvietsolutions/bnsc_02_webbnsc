/**
 * server/auth.ts
 * Xác thực admin bằng JWT lưu trong cookie httpOnly + mật khẩu bcrypt.
 */
import type { Request, Response, NextFunction, Router } from 'express';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

const COOKIE_NAME = 'bnsc_admin';
const JWT_SECRET = process.env.JWT_SECRET || 'bnsc-dev-secret-CHANGE-ME';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày
const isProd = process.env.NODE_ENV === 'production';

if (isProd && JWT_SECRET === 'bnsc-dev-secret-CHANGE-ME') {
  console.warn('⚠ JWT_SECRET chưa được đặt trong môi trường production!');
}

export interface AdminPayload {
  id: number;
  email: string;
  role: string;
}

export interface AuthedRequest extends Request {
  admin?: AdminPayload;
}

function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/** Middleware: yêu cầu đăng nhập admin. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Chưa đăng nhập.' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET) as AdminPayload;
    next();
  } catch {
    res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }
}

export function createAuthRouter(): Router {
  const router = express.Router();

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body ?? {};
      if (!email || !password)
        return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu.' });

      const user = await prisma.adminUser.findUnique({ where: { email: String(email) } });
      if (!user || !user.isActive)
        return res.status(401).json({ error: 'Tài khoản không tồn tại hoặc bị khóa.' });

      const ok = await bcrypt.compare(String(password), user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });

      const payload: AdminPayload = { id: user.id, email: user.email, role: user.role };
      const token = signToken(payload);
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        maxAge: MAX_AGE_MS,
        path: '/',
      });
      await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (e) {
      console.error('login error', e);
      res.status(500).json({ error: 'Lỗi máy chủ khi đăng nhập.' });
    }
  });

  router.post('/logout', (_req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
  });

  router.get('/me', requireAuth, async (req: AuthedRequest, res) => {
    const user = await prisma.adminUser.findUnique({
      where: { id: req.admin!.id },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Không hợp lệ.' });
    res.json({ user });
  });

  return router;
}
