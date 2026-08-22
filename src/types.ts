/**
 * types.ts
 * Type definitions for BNSC (Bắc Nam Software) home screen
 */

/**
 * Tên danh mục. Trước đây là union 4 giá trị cứng nên mỗi lần biên tập viên
 * thêm danh mục trong trang quản trị là mã nguồn không biên dịch được. Danh mục
 * nay do CSDL quyết định (bảng `categories`), nên đây chỉ còn là chuỗi.
 */
export type CategoryType = string;

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  views: number;
  category: CategoryType;
  excerpt?: string;
  imageUrl?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  isFeatured: boolean;
  badge?: string;
  tagline: string;
  features: string[];
  ctaText: string;
  iconName: string; // Used to pick appropriate Lucide icons
}

export interface NavLinkItem {
  name: string;
  href: string;
}

export interface CustomerItem {
  name: string;
  subtext?: string;
}
