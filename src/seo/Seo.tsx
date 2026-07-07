/**
 * seo/Seo.tsx
 * Quản lý thẻ <head> theo từng trang cho SPA. Cập nhật động (imperative) để đảm
 * bảo KHÔNG bị trùng thẻ khi điều hướng: title, description, canonical, Open
 * Graph, Twitter và JSON-LD đều được upsert theo khóa. JSON-LD được dọn khi
 * rời trang.
 */
import { useEffect } from 'react';
import { siteConfig, absoluteUrl } from './siteConfig';

export interface SeoProps {
  /** Tiêu đề trang (chưa gồm hậu tố thương hiệu). Bỏ trống -> tiêu đề mặc định. */
  title?: string;
  description?: string;
  /** Path tương đối, ví dụ "/tin-tuc". Dùng để tạo canonical + og:url. */
  path?: string;
  /** Ảnh chia sẻ (tuyệt đối). */
  image?: string;
  /** "website" | "article" ... */
  type?: 'website' | 'article';
  /** Chặn lập chỉ mục (trang 404, đăng nhập...). */
  noindex?: boolean;
  keywords?: string[];
  /** Dữ liệu có cấu trúc JSON-LD (object hoặc mảng object). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const MANAGED_ATTR = 'data-seo';

function upsertMeta(key: 'name' | 'property', value: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${value}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(key, value);
    el.setAttribute(MANAGED_ATTR, '');
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    el.setAttribute(MANAGED_ATTR, '');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function Seo({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  noindex = false,
  keywords,
  jsonLd,
}: SeoProps) {
  const fullTitle = title
    ? siteConfig.titleTemplate.replace('%s', title)
    : siteConfig.defaultTitle;
  const desc = description || siteConfig.defaultDescription;
  const canonical = absoluteUrl(path);
  const ogImage = image || siteConfig.defaultImage;
  const kw = (keywords && keywords.length ? keywords : siteConfig.keywords).join(', ');
  const jsonLdList = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const jsonLdKey = JSON.stringify(jsonLdList);

  useEffect(() => {
    document.title = fullTitle;
    document.documentElement.lang = siteConfig.lang;

    upsertMeta('name', 'description', desc);
    upsertMeta('name', 'keywords', kw);
    upsertMeta(
      'name',
      'robots',
      noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    );
    upsertLink('canonical', canonical);

    upsertMeta('property', 'og:site_name', siteConfig.siteName);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:locale', siteConfig.locale);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', ogImage);
    upsertMeta('name', 'twitter:site', siteConfig.twitterHandle);
  }, [fullTitle, desc, kw, canonical, ogImage, type, noindex]);

  // JSON-LD: thêm khi vào trang, gỡ khi rời để tránh tích tụ.
  useEffect(() => {
    const nodes = jsonLdList.map((data) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute(MANAGED_ATTR, 'jsonld');
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
      return script;
    });
    return () => nodes.forEach((n) => n.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonLdKey]);

  return null;
}
