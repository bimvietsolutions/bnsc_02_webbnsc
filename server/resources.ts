/**
 * server/resources.ts
 * Khai báo các "resource" cho CRUD admin generic: ánh xạ slug -> Prisma delegate,
 * thứ tự mặc định, và hook biến đổi dữ liệu khi đọc/ghi (vd băm mật khẩu admin).
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
}

const bySort: ResourceCfg['orderBy'] = [{ sortOrder: 'asc' }, { id: 'asc' }];

export const resources: Record<string, ResourceCfg> = {
  settings: { delegate: () => prisma.setting, orderBy: [{ group: 'asc' }, { id: 'asc' }] },
  'nav-links': { delegate: () => prisma.navLink, orderBy: bySort },
  'hero-slides': { delegate: () => prisma.heroSlide, orderBy: bySort },
  'hero-stats': { delegate: () => prisma.heroStat, orderBy: bySort },
  products: { delegate: () => prisma.product, orderBy: bySort },
  'news-categories': { delegate: () => prisma.newsCategory, orderBy: bySort },
  news: {
    delegate: () => prisma.newsArticle,
    orderBy: [{ id: 'desc' }],
    include: { category: true },
  },
  'library-categories': { delegate: () => prisma.libraryCategory, orderBy: bySort },
  library: {
    delegate: () => prisma.libraryArticle,
    orderBy: [{ id: 'desc' }],
    include: { category: true },
  },
  customers: { delegate: () => prisma.customer, orderBy: bySort },
  'consulting-services': { delegate: () => prisma.consultingService, orderBy: bySort },
  courses: { delegate: () => prisma.course, orderBy: bySort },
  faqs: { delegate: () => prisma.faq, orderBy: [{ scope: 'asc' }, { sortOrder: 'asc' }] },
  'support-staff': { delegate: () => prisma.supportStaff, orderBy: bySort },
  'remote-tools': { delegate: () => prisma.remoteTool, orderBy: bySort },
  media: { delegate: () => prisma.media, orderBy: [{ id: 'desc' }] },
  leads: { delegate: () => prisma.lead, orderBy: [{ createdAt: 'desc' }] },
  'admin-users': {
    delegate: () => prisma.adminUser,
    orderBy: [{ id: 'asc' }],
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
  // bỏ quan hệ đã include (chỉ ghi khóa ngoại *Id)
  delete clone.category;
  return clone;
}
