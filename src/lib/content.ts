/**
 * lib/content.ts
 * Kiểu dữ liệu + hook truy vấn cho API nội dung hợp nhất (/api/public/articles...).
 *
 * Khác với useApi (nạp một lần, có fallback tĩnh), các hook ở đây phục vụ danh
 * sách có phân trang/lọc/tìm kiếm nên gọi lại mỗi khi tham số đổi.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGet } from './api';

export type ContentSection = 'NEWS' | 'LIBRARY' | 'CONSULTING' | 'TRAINING';

export const SECTION_PATH: Record<ContentSection, string> = {
  NEWS: '/tin-tuc',
  LIBRARY: '/thu-vien',
  CONSULTING: '/tu-van',
  TRAINING: '/dao-tao',
};

export const SECTION_LABEL: Record<ContentSection, string> = {
  NEWS: 'Tin tức',
  LIBRARY: 'Thư viện',
  CONSULTING: 'Tư vấn',
  TRAINING: 'Đào tạo',
};

export interface ArticleCategory {
  id: number;
  slug: string;
  name: string;
  color?: string | null;
  emoji?: string | null;
}

export interface ArticleListItem {
  id: number;
  slug: string;
  title: string;
  summary?: string | null;
  coverUrl?: string | null;
  thumbUrl?: string | null;
  coverAlt?: string | null;
  section: ContentSection;
  publishedAt?: string | null;
  dateText?: string | null;
  views: number;
  isFeatured?: boolean;
  isRecommended?: boolean;
  isBreaking?: boolean;
  videoUrl?: string | null;
  category?: ArticleCategory | null;
}

export interface ArticleDetail extends ArticleListItem {
  contentHtml?: string | null;
  contentText?: string | null;
  author?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentSize?: string | null;
  embedHtml?: string | null;
  tags: { slug: string; name: string }[];
  prev: { title: string; href: string } | null;
  next: { title: string; href: string } | null;
  related: ArticleListItem[];
}

export interface CategoryNode extends ArticleCategory {
  title?: string | null;
  section: ContentSection;
  parentId: number | null;
  sortOrder: number;
  showOnMenu: boolean;
  showAtHomepage: boolean;
  articleCount: number;
  children?: CategoryNode[];
}

export interface SeriesNode {
  id: number;
  title: string;
  slug: string;
  href: string | null;
  views: number | null;
  children: SeriesNode[];
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ArticleQuery {
  section?: ContentSection;
  category?: string;
  tag?: string;
  q?: string;
  page?: number;
  pageSize?: number;
  sort?: 'newest' | 'oldest' | 'popular' | 'title';
  featured?: boolean;
}

function buildQueryString(query: ArticleQuery): string {
  const params = new URLSearchParams();
  if (query.section) params.set('section', query.section);
  if (query.category && query.category !== 'all') params.set('category', query.category);
  if (query.tag) params.set('tag', query.tag);
  if (query.q?.trim()) params.set('q', query.q.trim());
  if (query.page && query.page > 1) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.sort && query.sort !== 'newest') params.set('sort', query.sort);
  if (query.featured) params.set('featured', '1');
  const s = params.toString();
  return s ? `?${s}` : '';
}

const EMPTY_PAGE: Paged<ArticleListItem> = {
  items: [], total: 0, page: 1, pageSize: 12, totalPages: 0,
};

/** Danh sách bài có phân trang. Tự huỷ kết quả cũ khi tham số đổi liên tiếp. */
export function useArticles(query: ArticleQuery) {
  const [data, setData] = useState<Paged<ArticleListItem>>(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const qs = buildQueryString(query);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setLoading(true);
    apiGet<Paged<ArticleListItem>>(`/api/public/articles${qs}`)
      .then((res) => {
        if (id !== requestId.current) return; // đã có yêu cầu mới hơn
        setData(res);
        setError(null);
      })
      .catch((err: unknown) => {
        if (id !== requestId.current) return;
        setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.');
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [qs]);

  useEffect(load, [load]);

  return { ...data, loading, error, reload: load };
}

/** Chi tiết một bài + prev/next + bài liên quan. */
export function useArticle(slug: string | undefined) {
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    apiGet<ArticleDetail>(`/api/public/articles/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (cancelled) return;
        setArticle(res);
        // Ghi nhận lượt xem; thất bại không ảnh hưởng việc đọc bài.
        fetch(`/api/public/articles/${encodeURIComponent(slug)}/view`, {
          method: 'POST',
          credentials: 'include',
        }).catch(() => {});
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { article, loading, notFound };
}

/** Danh mục theo mảng nội dung (thay cho tab hardcode trong component). */
export function useCategories(section?: ContentSection) {
  const [items, setItems] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const qs = section ? `?section=${section}` : '';
    apiGet<{ items: CategoryNode[] }>(`/api/public/categories${qs}`)
      .then((res) => {
        if (!cancelled) setItems(res.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [section]);

  // Chỉ danh mục lá (có bài) mới dùng làm tab lọc
  const leaves = items.filter((c) => c.parentId !== null);
  return { items, leaves, loading };
}

/** Cây mục lục giáo trình "DỰ TOÁN BNSC". */
export function useSeries() {
  const [tree, setTree] = useState<SeriesNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGet<SeriesNode[]>('/api/public/series')
      .then((res) => {
        if (!cancelled) setTree(res ?? []);
      })
      .catch(() => {
        if (!cancelled) setTree([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { tree, loading };
}

/** Đường dẫn chi tiết của một bài theo mảng nội dung của nó. */
export function articleHref(item: Pick<ArticleListItem, 'section' | 'slug'>): string {
  return `${SECTION_PATH[item.section] ?? '/tin-tuc'}/${item.slug}`;
}

/** Ngày hiển thị: ưu tiên dateText đã chuẩn hoá, nếu không thì format publishedAt. */
export function displayDate(item: Pick<ArticleListItem, 'dateText' | 'publishedAt'>): string {
  if (item.dateText) return item.dateText;
  if (!item.publishedAt) return '';
  const d = new Date(item.publishedAt);
  return Number.isNaN(d.getTime())
    ? ''
    : `${d.getDate()} Thg ${d.getMonth() + 1}, ${d.getFullYear()}`;
}
