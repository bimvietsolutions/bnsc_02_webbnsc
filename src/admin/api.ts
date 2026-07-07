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
}

export const adminList = <T = any>(resource: string) => apiGet<ListResult<T>>(base(resource));
export const adminGet = <T = any>(resource: string, id: number | string) =>
  apiGet<{ data: T }>(`${base(resource)}/${id}`);
export const adminCreate = <T = any>(resource: string, data: unknown) =>
  apiSend<{ data: T }>(base(resource), 'POST', data);
export const adminUpdate = <T = any>(resource: string, id: number | string, data: unknown) =>
  apiSend<{ data: T }>(`${base(resource)}/${id}`, 'PUT', data);
export const adminRemove = (resource: string, id: number | string) =>
  apiSend(`${base(resource)}/${id}`, 'DELETE');

export const adminStats = () => apiGet('/api/admin/stats');

// Auth
export const authLogin = (email: string, password: string) =>
  apiSend('/api/admin/auth/login', 'POST', { email, password });
export const authLogout = () => apiSend('/api/admin/auth/logout', 'POST');
export const authMe = () => apiGet<{ user: AdminUser }>('/api/admin/auth/me');

export interface AdminUser {
  id: number;
  email: string;
  name?: string | null;
  role: string;
}
