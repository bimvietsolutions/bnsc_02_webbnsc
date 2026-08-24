/**
 * lib/adminAuth.ts
 * Gọi API phiên đăng nhập quản trị + nạp Google Identity Services.
 *
 * Đặt ở lib/ chứ không phải admin/ để trang đăng nhập công khai (/dang-nhap)
 * dùng được mà không kéo cả chunk admin (~56 KB) vào bundle chính.
 */
import { apiGet, apiSend } from './api';

export interface AdminUser {
  id: number;
  email: string;
  name?: string | null;
  role: string;
}

/**
 * @param remember false -> máy chủ đặt cookie phiên (mất khi đóng trình duyệt)
 *        thay vì cookie 7 ngày.
 */
export const authLogin = (email: string, password: string, remember = true) =>
  apiSend<{ user: AdminUser }>('/api/admin/auth/login', 'POST', { email, password, remember });

export const authLogout = () => apiSend('/api/admin/auth/logout', 'POST');

export const authMe = () => apiGet<{ user: AdminUser }>('/api/admin/auth/me');

/** Đổi ID token của Google lấy phiên đăng nhập admin. */
export const authGoogle = (credential: string, remember = true) =>
  apiSend<{ user: AdminUser }>('/api/admin/auth/google', 'POST', { credential, remember });

/** Lấy cấu hình đăng nhập (có bật Google hay không). */
export const authConfig = () =>
  apiGet<{ googleClientId: string | null }>('/api/admin/auth/config');

const GIS_SRC = 'https://accounts.google.com/gsi/client';

/** Tải script Google Identity Services một lần rồi tái sử dụng. */
export function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('gis-load-failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('gis-load-failed'));
    document.head.appendChild(s);
  });
}

/**
 * Lọc tham số ?next= để tránh open redirect: chỉ nhận đường dẫn nội bộ.
 * Chặn "//evil.com" (trình duyệt hiểu là URL tuyệt đối) và mọi thứ có scheme.
 */
export function safeNextPath(raw: string | null, fallback = '/admin'): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  return raw;
}
