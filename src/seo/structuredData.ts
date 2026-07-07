/**
 * seo/structuredData.ts
 * Các hàm tạo dữ liệu có cấu trúc JSON-LD (schema.org) cho từng loại trang.
 */
import { siteConfig, absoluteUrl } from './siteConfig';

export function organizationSchema() {
  const org = siteConfig.organization;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    legalName: org.legalName,
    url: siteConfig.siteUrl,
    logo: org.logo,
    email: org.email,
    telephone: org.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: org.address.street,
      addressLocality: org.address.city,
      addressCountry: org.address.country,
    },
    sameAs: org.sameAs,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.siteName,
    url: siteConfig.siteUrl,
    inLanguage: siteConfig.lang,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.siteUrl}/tin-tuc?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function softwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Phần mềm Dự toán BNSC',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Windows',
    softwareVersion: '1.20',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'VND',
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.organization.name,
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  author?: string;
  datePublished?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    image: opts.image || siteConfig.defaultImage,
    mainEntityOfPage: absoluteUrl(opts.path),
    author: {
      '@type': 'Organization',
      name: opts.author || siteConfig.siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: siteConfig.organization.logo,
      },
    },
  };
}

export function itemListSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}
