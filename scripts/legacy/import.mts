/**
 * scripts/legacy/import.mts
 * P2 — Nạp toàn bộ dữ liệu website cũ vào CSDL mới.
 *
 * Thứ tự: Category (cây) -> Article -> Tag -> SeriesNode -> Redirect.
 * Script idempotent: chạy lại nhiều lần cho cùng kết quả (upsert theo legacyId),
 * nên có thể chạy trước rồi chạy lại sau khi mirror ảnh xong để cập nhật URL.
 *
 * Chạy:
 *   npm run legacy:import
 *   npm run legacy:import -- --dry-run     # chỉ in thống kê, không ghi DB
 *   npm run legacy:import -- --only-published
 */
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient, type ContentSection } from '@prisma/client';
import { loadExport, type LegacyCategory, type LegacyPost } from './load-export.mts';
import { IMPORT_REPORT, MEDIA_MANIFEST } from './paths.mts';
import type { MediaManifest } from './mirror-media.mts';
import {
  buildSummary,
  cleanText,
  extractVideoUrl,
  formatDateText,
  htmlToText,
  parseLegacyDate,
  rewriteMediaUrl,
  sanitizeContent,
} from './transform.mts';

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_PUBLISHED = process.argv.includes('--only-published');

/** Danh mục gốc của site cũ -> mảng nội dung ở site mới. */
const ROOT_SECTION: Record<string, ContentSection> = {
  '1': 'NEWS', // Tin tức
  '13': 'LIBRARY', // Dự toán BNSC
  '4': 'CONSULTING', // Tư vấn
  '14': 'TRAINING', // Đào Tạo
};

/** Tiền tố URL của từng mảng — dùng cho bảng redirect. */
export const SECTION_PREFIX: Record<ContentSection, string> = {
  NEWS: '/tin-tuc',
  LIBRARY: '/thu-vien',
  CONSULTING: '/tu-van',
  TRAINING: '/dao-tao',
};

/** Emoji tab của Thư viện (giữ đúng giao diện EstimationLibrary hiện có). */
const CATEGORY_EMOJI: Record<string, string> = {
  download: '⬇',
  'cai-dat-du-toan-bnsc': '⚙',
  'su-dung-du-toan-bnsc': '▶',
  'tham-dinh-du-toan-bnsc': '🔍',
  'tinh-huong-khac-du-toan-bnsc': '💡',
  'lap-du-toan-du-thau': '📋',
};

/** Bài không có danh mục -> gán vào Tin tức / Chuyên ngành. */
const FALLBACK_CATEGORY_LEGACY_ID = '10';

function loadManifest(): MediaManifest {
  if (!fs.existsSync(MEDIA_MANIFEST)) {
    console.warn(
      `[import] CẢNH BÁO: chưa có ${MEDIA_MANIFEST}. Ảnh sẽ giữ URL tuyệt đối về bacnam.com.vn.\n` +
        '          Chạy "npm run legacy:mirror" trước rồi import lại để rewrite URL.',
    );
    return {};
  }
  return JSON.parse(fs.readFileSync(MEDIA_MANIFEST, 'utf8')) as MediaManifest;
}

/** Tìm danh mục gốc của một danh mục bất kỳ trong cây cũ. */
function rootOf(cat: LegacyCategory, byId: Map<string, LegacyCategory>): LegacyCategory {
  let current = cat;
  const seen = new Set<string>();
  while (current.parent_id !== '0' && byId.has(current.parent_id) && !seen.has(current.id)) {
    seen.add(current.id);
    current = byId.get(current.parent_id)!;
  }
  return current;
}

function sectionOf(cat: LegacyCategory, byId: Map<string, LegacyCategory>): ContentSection {
  return ROOT_SECTION[rootOf(cat, byId).id] ?? 'NEWS';
}

async function main() {
  const legacy = loadExport();
  const manifest = loadManifest();
  const catById = new Map(legacy.categories.map((c) => [c.id, c]));

  const report = {
    ranAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    categories: 0,
    articles: 0,
    skippedArticles: 0,
    tags: 0,
    tagLinks: 0,
    seriesNodes: 0,
    seriesLinked: 0,
    redirects: 0,
    totalViews: 0,
    warnings: [] as string[],
  };

  // ---------------------------------------------------------------- categories
  // Ghi cha trước con để parentId luôn tồn tại.
  const ordered = [
    ...legacy.categories.filter((c) => c.parent_id === '0'),
    ...legacy.categories.filter((c) => c.parent_id !== '0'),
  ];
  const catIdMap = new Map<string, number>(); // legacy id -> new id
  const usedSlugs = new Set<string>();

  for (const cat of ordered) {
    const section = sectionOf(cat, catById);
    let slug = cat.name_slug?.trim() || `danh-muc-${cat.id}`;
    if (usedSlugs.has(slug)) {
      report.warnings.push(`Trùng slug danh mục "${slug}" (id ${cat.id}) -> đổi thành ${slug}-${cat.id}`);
      slug = `${slug}-${cat.id}`;
    }
    usedSlugs.add(slug);

    const data = {
      slug,
      name: cleanText(cat.name),
      title: cleanText(cat.title) || null,
      section,
      parentId: cat.parent_id === '0' ? null : (catIdMap.get(cat.parent_id) ?? null),
      description: cleanText(cat.description) || null,
      keywords: cleanText(cat.keywords) || null,
      color: cat.color || null,
      emoji: CATEGORY_EMOJI[cat.name_slug] ?? null,
      sortOrder: Number(cat.category_order ?? 0) || 0,
      showOnMenu: cat.show_on_menu === '1',
      showAtHomepage: cat.show_at_homepage === '1',
      isActive: true,
      legacyId: Number(cat.id),
    };

    if (DRY_RUN) {
      catIdMap.set(cat.id, -Number(cat.id));
    } else {
      const saved = await prisma.category.upsert({
        where: { legacyId: Number(cat.id) },
        create: data,
        update: data,
      });
      catIdMap.set(cat.id, saved.id);
    }
    report.categories++;
  }
  console.log(`[import] danh mục: ${report.categories}`);

  // ------------------------------------------------------------------ articles
  const articleIdMap = new Map<string, number>(); // legacy post id -> new id
  const posts: LegacyPost[] = ONLY_PUBLISHED
    ? legacy.posts.filter((p) => p.status === '1' && p.visibility === '1')
    : legacy.posts;

  for (const post of posts) {
    const legacyCatId = post.category_id && catById.has(post.category_id)
      ? post.category_id
      : FALLBACK_CATEGORY_LEGACY_ID;
    if (legacyCatId !== post.category_id) {
      report.warnings.push(`Bài #${post.id} không có danh mục hợp lệ -> gán vào Chuyên ngành`);
    }
    const cat = catById.get(legacyCatId)!;
    const section = sectionOf(cat, catById);

    const contentHtml = sanitizeContent(post.content, manifest);
    const contentText = htmlToText(contentHtml);
    const publishedAt = parseLegacyDate(post.created_at);
    const title = cleanText(post.title);

    const data = {
      slug: post.title_slug,
      title,
      summary: buildSummary(post.summary, contentText),
      contentHtml: contentHtml || null,
      contentText: contentText || null,
      section,
      categoryId: DRY_RUN ? null : catIdMap.get(legacyCatId)!,

      coverUrl: rewriteMediaUrl(post.image_default ?? post.image_big, manifest),
      thumbUrl: rewriteMediaUrl(post.image_mid ?? post.image_small, manifest),
      coverAlt: cleanText(post.image_description) || null,
      videoUrl: post.video_url?.trim() || extractVideoUrl(contentHtml, post.post_type === 'video'),
      embedHtml: post.video_embed_code?.trim() || null,

      author: null as string | null,
      publishedAt,
      sourceUpdatedAt: parseLegacyDate(post.updated_at),
      dateText: formatDateText(publishedAt),
      views: Number(post.pageviews ?? 0) || 0,

      isPublished: post.status === '1' && post.visibility === '1',
      isFeatured: post.is_featured === '1',
      isRecommended: post.is_recommended === '1',
      isBreaking: post.is_breaking === '1',
      isSlider: post.is_slider === '1',
      sliderOrder: Number(post.slider_order ?? 0) || 0,

      metaTitle: null as string | null,
      metaDescription: buildSummary(post.summary, contentText, 300),
      metaKeywords: cleanText(post.keywords) || null,
      ogImage: rewriteMediaUrl(post.image_big ?? post.image_default, manifest),
      canonicalUrl: post.optional_url?.startsWith('http') ? post.optional_url : null,

      legacyId: Number(post.id),
      legacyPath: `/${post.title_slug}`,
    };

    if (DRY_RUN) {
      articleIdMap.set(post.id, -Number(post.id));
    } else {
      const saved = await prisma.article.upsert({
        where: { legacyId: Number(post.id) },
        create: data,
        update: data,
      });
      articleIdMap.set(post.id, saved.id);
    }
    report.articles++;
    report.totalViews += data.views;
    if (report.articles % 100 === 0) console.log(`[import] bài viết: ${report.articles}/${posts.length}`);
  }
  report.skippedArticles = legacy.posts.length - posts.length;
  console.log(`[import] bài viết: ${report.articles} (bỏ qua ${report.skippedArticles})`);

  // ---------------------------------------------------------------------- tags
  const tagBySlug = new Map<string, { name: string; postIds: string[] }>();
  for (const t of legacy.tags) {
    const slug = t.tag_slug?.trim();
    if (!slug) continue;
    const entry = tagBySlug.get(slug) ?? { name: cleanText(t.tag), postIds: [] };
    if (articleIdMap.has(t.post_id)) entry.postIds.push(t.post_id);
    tagBySlug.set(slug, entry);
  }

  for (const [slug, entry] of tagBySlug) {
    report.tags++;
    if (DRY_RUN) {
      report.tagLinks += entry.postIds.length;
      continue;
    }
    const connect = entry.postIds.map((pid) => ({ id: articleIdMap.get(pid)! }));
    await prisma.tag.upsert({
      where: { slug },
      create: { slug, name: entry.name, articles: { connect } },
      update: { name: entry.name, articles: { set: connect } },
    });
    report.tagLinks += connect.length;
  }
  console.log(`[import] thẻ: ${report.tags} (${report.tagLinks} liên kết)`);

  // ------------------------------------------------------------- series (mục lục)
  const seriesById = new Map(legacy.series.map((s) => [s.id, s]));
  /** Độ sâu của node để ghi cha trước con. */
  const depthOf = (id: string): number => {
    let depth = 0;
    let cur = seriesById.get(id);
    const seen = new Set<string>();
    while (cur && cur.parent_id && cur.parent_id !== '0' && !seen.has(cur.id)) {
      seen.add(cur.id);
      cur = seriesById.get(cur.parent_id);
      depth++;
    }
    return depth;
  };
  const seriesOrdered = [...legacy.series].sort((a, b) => depthOf(a.id) - depthOf(b.id));
  const seriesIdMap = new Map<string, number>();

  for (const node of seriesOrdered) {
    const articleId =
      node.post_id && node.post_id !== '0' ? (articleIdMap.get(node.post_id) ?? null) : null;
    if (node.post_id && node.post_id !== '0' && articleId === null) {
      report.warnings.push(`Mục lục "${node.title}" trỏ tới bài #${node.post_id} không tồn tại`);
    }

    // DB cũ có vài node tự trỏ vào chính nó (parent_id = id). Nếu cứ thế nhập
    // thì parentId thành null và chúng nổi lên thành "giáo trình gốc" giả.
    // Xử lý: tách khỏi cây và tắt hiển thị, ghi cảnh báo để biên tập viên rà.
    const selfParent = node.parent_id === node.id;
    if (selfParent) {
      report.warnings.push(
        `Mục lục #${node.id} "${node.title}" tự trỏ vào chính nó -> tách khỏi cây và ẩn đi`,
      );
    }

    const data = {
      title: cleanText(node.title),
      slug: node.slug?.trim() || `muc-${node.id}`,
      parentId:
        !selfParent && node.parent_id && node.parent_id !== '0'
          ? (seriesIdMap.get(node.parent_id) ?? null)
          : null,
      articleId,
      sortOrder: Number(node.sort_order ?? 0) || 0,
      isActive: node.status === '1' && !selfParent,
      legacyId: Number(node.id),
    };
    if (DRY_RUN) {
      seriesIdMap.set(node.id, -Number(node.id));
    } else {
      const saved = await prisma.seriesNode.upsert({
        where: { legacyId: Number(node.id) },
        create: data,
        update: data,
      });
      seriesIdMap.set(node.id, saved.id);
    }
    report.seriesNodes++;
    if (articleId !== null) report.seriesLinked++;
  }
  console.log(`[import] mục lục: ${report.seriesNodes} node (${report.seriesLinked} gắn bài)`);

  // ----------------------------------------------------------------- redirects
  for (const post of posts) {
    const cat = catById.get(
      post.category_id && catById.has(post.category_id) ? post.category_id : FALLBACK_CATEGORY_LEGACY_ID,
    )!;
    const from = `/${post.title_slug}`;
    const to = `${SECTION_PREFIX[sectionOf(cat, catById)]}/${post.title_slug}`;
    if (!DRY_RUN) {
      await prisma.redirect.upsert({
        where: { from },
        create: { from, to, status: 301 },
        update: { to, status: 301 },
      });
    }
    report.redirects++;
  }
  console.log(`[import] redirect: ${report.redirects}`);

  // -------------------------------------------------------------------- report
  fs.mkdirSync(path.dirname(IMPORT_REPORT), { recursive: true });
  fs.writeFileSync(IMPORT_REPORT, JSON.stringify(report, null, 2), 'utf8');
  console.log('\n=============================================');
  console.log(`Danh mục   : ${report.categories}`);
  console.log(`Bài viết   : ${report.articles} (bỏ qua ${report.skippedArticles})`);
  console.log(`Tổng views : ${report.totalViews.toLocaleString('vi-VN')}`);
  console.log(`Thẻ        : ${report.tags} (${report.tagLinks} liên kết)`);
  console.log(`Mục lục    : ${report.seriesNodes} node, ${report.seriesLinked} gắn bài`);
  console.log(`Redirect   : ${report.redirects}`);
  console.log(`Cảnh báo   : ${report.warnings.length}`);
  report.warnings.slice(0, 15).forEach((w) => console.log(`   - ${w}`));
  console.log(`Báo cáo    : ${IMPORT_REPORT}`);
  if (DRY_RUN) console.log('\n(dry-run: KHÔNG ghi vào CSDL)');
  console.log('=============================================');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
