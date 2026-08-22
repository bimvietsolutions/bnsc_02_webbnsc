/**
 * scripts/legacy/load-export.mts
 * Đọc 5 file JSON export từ phpMyAdmin của database bacnamco_beta.
 *
 * Mỗi file là một mảnh của mảng JSON lớn (plugin export cắt theo bảng), nên có
 * thể bắt đầu bằng dấu phẩy và thiếu dấu đóng ngoặc — hàm dưới chuẩn hóa lại.
 */
import fs from 'node:fs';
import path from 'node:path';
import { resolveExportDir } from './paths.mts';

export interface LegacyCategory {
  id: string;
  lang_id: string;
  name: string;
  title: string;
  name_slug: string;
  parent_id: string;
  service_id: string;
  description: string;
  sort_order: string;
  keywords: string;
  color: string | null;
  block_type: string | null;
  category_order: string;
  show_at_homepage: string | null;
  show_on_menu: string | null;
  created_at: string;
}

export interface LegacyPost {
  id: string;
  lang_id: string;
  title: string;
  title_slug: string;
  keywords: string | null;
  summary: string | null;
  content: string | null;
  category_id: string | null;
  image_big: string | null;
  image_default: string | null;
  image_slider: string | null;
  image_mid: string | null;
  image_small: string | null;
  image_mime: string | null;
  optional_url: string | null;
  pageviews: string;
  is_slider: string;
  slider_order: string;
  is_featured: string;
  is_recommended: string;
  is_breaking: string;
  visibility: string;
  post_type: string;
  video_path: string | null;
  image_url: string | null;
  video_url: string | null;
  video_embed_code: string | null;
  status: string;
  image_description: string | null;
  updated_at: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface LegacyImage {
  id: string;
  image_big: string | null;
  image_default: string | null;
  image_slider: string | null;
  image_mid: string | null;
  image_small: string | null;
  image_mime: string | null;
  file_name: string | null;
  user_id: string | null;
}

export interface LegacySeries {
  id: string;
  title: string;
  parent_id: string | null;
  post_id: string | null;
  slug: string;
  sort_order: string;
  status: string;
}

export interface LegacyTag {
  id: string;
  post_id: string;
  tag: string;
  tag_slug: string;
}

export interface LegacyExport {
  categories: LegacyCategory[];
  posts: LegacyPost[];
  images: LegacyImage[];
  series: LegacySeries[];
  tags: LegacyTag[];
}

const FILES = {
  categories: 'bacnamco_beta_table_categories.json',
  posts: 'bacnamco_beta_table_posts.json',
  images: 'bacnamco_beta_table_images.json',
  series: 'bacnamco_beta_table_series.json',
  tags: 'bacnamco_beta_table_tags.json',
} as const;

function readTable<T>(dir: string, file: string): T[] {
  let raw = fs.readFileSync(path.join(dir, file), 'utf8').trim();
  if (raw.startsWith(',')) raw = raw.slice(1);
  if (raw.endsWith(',')) raw = raw.slice(0, -1);
  if (!raw.endsWith('}')) raw += '}';
  const parsed = JSON.parse(raw) as { data?: T[] };
  if (!Array.isArray(parsed.data)) throw new Error(`${file}: không có mảng "data"`);
  return parsed.data;
}

export function loadExport(): LegacyExport {
  const dir = resolveExportDir();
  return {
    categories: readTable<LegacyCategory>(dir, FILES.categories),
    posts: readTable<LegacyPost>(dir, FILES.posts),
    images: readTable<LegacyImage>(dir, FILES.images),
    series: readTable<LegacySeries>(dir, FILES.series),
    tags: readTable<LegacyTag>(dir, FILES.tags),
  };
}
