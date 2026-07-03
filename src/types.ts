/**
 * types.ts
 * Type definitions for BNSC (Bắc Nam Software) home screen
 */

export type CategoryType = 'Văn bản QPPL' | 'Nội bộ' | 'Chuyên ngành' | 'Khuyến mãi';

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
