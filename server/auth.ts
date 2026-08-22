/**
 * server/auth.ts
 * Xác thực admin bằng JWT lưu trong cookie httpOnly + mật khẩu bcrypt.
 */
import type { Request, Response, NextFunction, Router } from 'express';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from './db';

const COOKIE_NAME = 'bnsc_admin';
const JWT_SECRET = process.env.JWT_SECRET || 'bnsc-dev-secret-CHANGE-ME';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày
const isProd = process.env.NODE_ENV === 'production';

// Đăng nhập bằng Google (tùy chọn): chỉ bật khi có GOOGLE_CLIENT_ID.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// Dừng hẳn thay vì cảnh báo: chuỗi dự phòng nằm công khai trong mã nguồn, nên
// nếu production chạy với nó thì bất kỳ ai đọc repo cũng ký được cookie phiên
// admin hợp lệ. Thà deploy đỏ còn hơn chạy với phiên đăng nhập giả mạo được.
if (isProd && JWT_SECRET === 'bnsc-dev-secret-CHANGE-ME') {
  throw new Error(
    'JWT_SECRET chưa được đặt. Production không được dùng chuỗi dự phòng công khai — ' +
      'đặt JWT_SECRET trong .env rồi khởi động lại container.',
  );
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

/** Đặt cookie phiên đăng nhập (dùng chung cho login mật khẩu và Google). */
function setSessionCookie(res: Response, payload: AdminPayload) {
  res.cookie(COOKIE_NAME, signToken(payload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: MAX_AGE_MS,
    path: '/',
  });
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
      setSessionCookie(res, payload);
      await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (e) {
      console.error('login error', e);
      res.status(500).json({ error: 'Lỗi máy chủ khi đăng nhập.' });
    }
  });

  // Cấu hình đăng nhập cho frontend: có bật Google hay không, và Client ID.
  router.get('/config', (_req, res) => {
    res.json({ googleClientId: GOOGLE_CLIENT_ID || null });
  });

  // Đăng nhập bằng Google: nhận ID token (credential) từ Google Identity
  // Services, xác thực chữ ký + audience, rồi so khớp với tài khoản admin đã
  // tồn tại theo email đã được Google xác minh (không tự tạo tài khoản mới).
  router.post('/google', async (req, res) => {
    try {
      if (!googleClient)
        return res.status(400).json({ error: 'Đăng nhập bằng Google chưa được cấu hình.' });

      const { credential } = req.body ?? {};
      if (!credential)
        return res.status(400).json({ error: 'Thiếu thông tin xác thực từ Google.' });

      let ticket;
      try {
        ticket = await googleClient.verifyIdToken({
          idToken: String(credential),
          audience: GOOGLE_CLIENT_ID,
        });
      } catch {
        return res.status(401).json({ error: 'Phiên đăng nhập Google không hợp lệ.' });
      }

      const p = ticket.getPayload();
      if (!p?.email || !p.email_verified)
        return res.status(401).json({ error: 'Email Google chưa được xác minh.' });

      const user = await prisma.adminUser.findUnique({ where: { email: p.email } });
      if (!user || !user.isActive)
        return res
          .status(403)
          .json({ error: 'Tài khoản Google này chưa được cấp quyền quản trị.' });

      const payload: AdminPayload = { id: user.id, email: user.email, role: user.role };
      setSessionCookie(res, payload);
      await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (e) {
      console.error('google login error', e);
      res.status(500).json({ error: 'Lỗi máy chủ khi đăng nhập bằng Google.' });
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
