/**
 * lib/api.ts
 * Tiện ích gọi API + hook lấy dữ liệu cho frontend.
 * - useApi(path, fallback): trả về dữ liệu tĩnh (fallback) ngay, sau đó thay bằng
 *   dữ liệu DB khi API phản hồi. Nếu API lỗi -> giữ fallback (site không trắng).
 */
import { useEffect, useState, useCallback } from 'react';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parse(res: Response) {
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(body?.error || `Lỗi ${res.status}`, res.status);
  }
  return body;
}

export function apiGet<T = any>(path: string): Promise<T> {
  return fetch(path, { credentials: 'include' }).then(parse);
}

export function apiSend<T = any>(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: unknown,
): Promise<T> {
  return fetch(path, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(parse);
}

interface UseApiResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Lấy dữ liệu từ API cho các trang công khai, có dữ liệu tĩnh làm fallback.
 * @param path đường dẫn API (bỏ qua fetch nếu null)
 * @param fallback dữ liệu tĩnh hiển thị trong lúc tải / khi lỗi
 */
export function useApi<T>(
  path: string | null,
  fallback: T,
  transform?: (raw: any) => T,
): UseApiResult<T> {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState<boolean>(!!path);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    apiGet<any>(path)
      .then((res) => {
        if (!alive) return;
        setData(transform ? transform(res) : (res as T));
        setError(null);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        // Giữ fallback, chỉ ghi nhận lỗi.
        setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu');
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [path, tick]);

  return { data, loading, error, reload };
}

/** Biến settings [{key,value}] hoặc map -> hàm tiện lấy giá trị theo key. */
export function settingsGetter(map: Record<string, string> | undefined) {
  return (key: string, fallback = ''): string => map?.[key] ?? fallback;
}
