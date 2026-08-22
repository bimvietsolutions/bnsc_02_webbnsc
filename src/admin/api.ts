/**
 * admin/api.ts
 * Lớp gọi API quản trị (dùng cookie httpOnly nên credentials: include đã có
 * trong lib/api). Tất cả thao tác CRUD đi qua /api/admin/resources/:resource.
 */
import { apiGet, apiSend } from '../lib/api';

const base = (resource: string) => `/api/admin/resources/${resource}`;

export interface ListResult<T = any> {
  data: T[];
  total: number;
  take?: number;
  skip?: number;
}

export interface ListParams {
  take?: number;
  skip?: number;
  /** Tìm kiếm trên các cột đã khai báo searchFields ở server/resources.ts. */
  q?: string;
  /** Lọc chính xác, vd { section: 'NEWS' }. */
  filters?: Record<string, string | number | boolean | undefined>;
}

export const adminList = <T = any>(resource: string, params: ListParams = {}) => {
  const qs = new URLSearchParams();
  if (params.take != null) qs.set('take', String(params.take));
  if (params.skip) qs.set('skip', String(params.skip));
  if (params.q?.trim()) qs.set('q', params.q.trim());
  for (const [key, value] of Object.entries(params.filters ?? {})) {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  }
  const query = qs.toString();
  return apiGet<ListResult<T>>(query ? `${base(resource)}?${query}` : base(resource));
};
export const adminGet = <T = any>(resource: string, id: number | string) =>
  apiGet<{ data: T }>(`${base(resource)}/${id}`);
export const adminCreate = <T = any>(resource: string, data: unknown) =>
  apiSend<{ data: T }>(base(resource), 'POST', data);
export const adminUpdate = <T = any>(resource: string, id: number | string, data: unknown) =>
  apiSend<{ data: T }>(`${base(resource)}/${id}`, 'PUT', data);
export const adminRemove = (resource: string, id: number | string) =>
  apiSend(`${base(resource)}/${id}`, 'DELETE');

export const adminStats = () => apiGet('/api/admin/stats');

/** Upload một tệp (ảnh/pdf) -> trả về { url }. */
export async function uploadFile(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', credentials: 'include', body: fd });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(body?.error || 'Lỗi upload');
  return body;
}

// Auth
export const authLogin = (email: string, password: string) =>
  apiSend('/api/admin/auth/login', 'POST', { email, password });
export const authLogout = () => apiSend('/api/admin/auth/logout', 'POST');
export const authMe = () => apiGet<{ user: AdminUser }>('/api/admin/auth/me');
/** Đổi ID token của Google lấy phiên đăng nhập admin. */
export const authGoogle = (credential: string) =>
  apiSend<{ user: AdminUser }>('/api/admin/auth/google', 'POST', { credential });
/** Lấy cấu hình đăng nhập (có bật Google hay không). */
export const authConfig = () =>
  apiGet<{ googleClientId: string | null }>('/api/admin/auth/config');

export interface AdminUser {
  id: number;
  email: string;
  name?: string | null;
  role: string;
}
