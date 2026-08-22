/**
 * server/resources.ts
 * Khai báo các "resource" cho CRUD admin generic: ánh xạ slug -> Prisma delegate,
 * thứ tự mặc định, trường cho phép tìm kiếm, và hook biến đổi dữ liệu khi
 * đọc/ghi (vd băm mật khẩu admin, gắn thẻ cho bài viết).
 */
import bcrypt from 'bcryptjs';
import { prisma } from './db';

export interface ResourceCfg {
  delegate: () => any;
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  /** Biến đổi dữ liệu trước khi create/update (vd hash password). */
  beforeWrite?: (data: Record<string, any>) => Promise<Record<string, any>> | Record<string, any>;
  /** Biến đổi bản ghi trước khi trả về (vd ẩn passwordHash). */
  afterRead?: (record: any) => any;
  /** include quan hệ khi trả về. */
  include?: Record<string, any>;
  /** Các cột chuỗi cho phép tìm kiếm bằng tham số ?q= ở trang danh sách. */
  searchFields?: string[];
  /** Các cột cho phép lọc chính xác bằng query string, vd ?section=NEWS. */
  filterFields?: string[];
  /** Bỏ bớt cột nặng khi trả DANH SÁCH (nội dung bài dài ~19KB/bản ghi). */
  listOmit?: string[];
}

const bySort: ResourceCfg['orderBy'] = [{ sortOrder: 'asc' }, { id: 'asc' }];

export const resources: Record<string, ResourceCfg> = {
  settings: { delegate: () => prisma.setting, orderBy: [{ group: 'asc' }, { id: 'asc' }], searchFields: ['key', 'label'] },
  'nav-links': { delegate: () => prisma.navLink, orderBy: bySort, searchFields: ['name', 'href'] },
  'hero-slides': { delegate: () => prisma.heroSlide, orderBy: bySort, searchFields: ['caption'] },
  'hero-stats': { delegate: () => prisma.heroStat, orderBy: bySort, searchFields: ['label'] },
  products: { delegate: () => prisma.product, orderBy: bySort, searchFields: ['name', 'slug'] },

  // --------------------------- nội dung hợp nhất ----------------------------
  articles: {
    delegate: () => prisma.article,
    orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
    include: { category: true, tags: true },
    searchFields: ['title', 'slug', 'summary'],
    filterFields: ['section', 'categoryId', 'isPublished'],
    // Danh sách 555 bài không cần kéo theo nội dung HTML
    listOmit: ['contentHtml', 'contentText'],
    beforeWrite: async (data) => {
      // Thẻ gửi lên dạng mảng slug -> tạo thẻ chưa có rồi nối quan hệ
      const tagSlugs: string[] | undefined = Array.isArray(data.tagSlugs) ? data.tagSlugs : undefined;
      delete data.tagSlugs;

      if (tagSlugs) {
        const cleaned = [...new Set(tagSlugs.map((s) => String(s).trim()).filter(Boolean))];
        for (const slug of cleaned) {
          await prisma.tag.upsert({
            where: { slug },
            create: { slug, name: slug.replace(/-/g, ' ') },
            update: {},
          });
        }
        data.tags = { set: cleaned.map((slug) => ({ slug })) };
      }

      // Ép kiểu số/ngày cho các trường gửi lên dưới dạng chuỗi từ form
      if (data.categoryId != null && data.categoryId !== '') data.categoryId = Number(data.categoryId);
      else if (data.categoryId === '') data.categoryId = null;
      for (const key of ['publishedAt', 'sourceUpdatedAt']) {
        if (typeof data[key] === 'string') data[key] = data[key] ? new Date(data[key]) : null;
      }
      return data;
    },
    afterRead: (record) =>
      record && Array.isArray(record.tags)
        ? { ...record, tagSlugs: record.tags.map((t: any) => t.slug) }
        : record,
  },
  categories: {
    delegate: () => prisma.category,
    orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
    include: { parent: { select: { id: true, name: true } } },
    searchFields: ['name', 'slug'],
    filterFields: ['section', 'parentId'],
    beforeWrite: (data) => {
      if (data.parentId != null && data.parentId !== '') data.parentId = Number(data.parentId);
      else data.parentId = null;
      return data;
    },
  },
  tags: {
    delegate: () => prisma.tag,
    orderBy: [{ name: 'asc' }],
    searchFields: ['name', 'slug'],
  },
  series: {
    delegate: () => prisma.seriesNode,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { article: { select: { id: true, title: true, slug: true } } },
    searchFields: ['title', 'slug'],
    filterFields: ['parentId'],
    beforeWrite: (data) => {
      for (const key of ['parentId', 'articleId']) {
        if (data[key] != null && data[key] !== '') data[key] = Number(data[key]);
        else data[key] = null;
      }
      return data;
    },
  },
  redirects: {
    delegate: () => prisma.redirect,
    orderBy: [{ hits: 'desc' }, { id: 'desc' }],
    searchFields: ['from', 'to'],
  },

  // ----------------------- bảng cũ (giữ tới khi cutover) --------------------
  'news-categories': { delegate: () => prisma.newsCategory, orderBy: bySort },
  news: { delegate: () => prisma.newsArticle, orderBy: [{ id: 'desc' }], include: { category: true } },
  'library-categories': { delegate: () => prisma.libraryCategory, orderBy: bySort },
  library: { delegate: () => prisma.libraryArticle, orderBy: [{ id: 'desc' }], include: { category: true } },

  customers: { delegate: () => prisma.customer, orderBy: bySort, searchFields: ['name'] },
  'consulting-services': { delegate: () => prisma.consultingService, orderBy: bySort, searchFields: ['title'] },
  courses: { delegate: () => prisma.course, orderBy: bySort, searchFields: ['title', 'slug'] },
  faqs: { delegate: () => prisma.faq, orderBy: [{ scope: 'asc' }, { sortOrder: 'asc' }], searchFields: ['question'] },
  'support-staff': { delegate: () => prisma.supportStaff, orderBy: bySort, searchFields: ['name', 'phone'] },
  'remote-tools': { delegate: () => prisma.remoteTool, orderBy: bySort, searchFields: ['name'] },
  media: { delegate: () => prisma.media, orderBy: [{ id: 'desc' }], searchFields: ['url', 'alt'] },
  leads: {
    delegate: () => prisma.lead,
    orderBy: [{ createdAt: 'desc' }],
    searchFields: ['fullName', 'phone', 'email', 'company'],
    filterFields: ['status', 'type'],
  },
  'admin-users': {
    delegate: () => prisma.adminUser,
    orderBy: [{ id: 'asc' }],
    searchFields: ['email', 'name'],
    beforeWrite: async (data) => {
      if (data.password) {
        data.passwordHash = await bcrypt.hash(String(data.password), 10);
      }
      delete data.password;
      return data;
    },
    afterRead: (record) => {
      if (record && typeof record === 'object' && 'passwordHash' in record) {
        const { passwordHash, ...rest } = record;
        return rest;
      }
      return record;
    },
  },
};

/** Loại bỏ các trường do hệ thống quản lý trước khi ghi. */
export function stripSystemFields(data: Record<string, any>): Record<string, any> {
  const clone = { ...data };
  delete clone.id;
  delete clone.createdAt;
  delete clone.updatedAt;
  // bỏ quan hệ đã include (chỉ ghi khóa ngoại *Id hoặc qua beforeWrite)
  delete clone.category;
  delete clone.parent;
  delete clone.children;
  delete clone.article;
  delete clone.articles;
  delete clone._count;
  if (Array.isArray(clone.tags)) delete clone.tags; // ghi qua tagSlugs
  return clone;
}

/**
 * Dựng mệnh đề `where` cho danh sách admin từ query string.
 * Chỉ nhận các cột đã khai báo trong searchFields/filterFields để tránh lộ dữ liệu.
 */
export function buildAdminWhere(cfg: ResourceCfg, query: Record<string, unknown>): Record<string, any> {
  const where: Record<string, any> = {};

  const q = String(query.q ?? '').trim();
  if (q && cfg.searchFields?.length) {
    where.OR = cfg.searchFields.map((field) => ({
      [field]: { contains: q, mode: 'insensitive' },
    }));
  }

  for (const field of cfg.filterFields ?? []) {
    const raw = query[field];
    if (raw === undefined || raw === '' || raw === null) continue;
    if (raw === 'true' || raw === 'false') where[field] = raw === 'true';
    else if (/^\d+$/.test(String(raw))) where[field] = Number(raw);
    else where[field] = String(raw);
  }

  return where;
}
