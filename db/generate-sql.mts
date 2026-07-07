/**
 * db/generate-sql.mts
 * Sinh file db/db.sql (DDL + INSERT dữ liệu) để chạy trực tiếp trong pgAdmin.
 *   Chạy: npx tsx db/generate-sql.mts
 * DDL lấy từ Prisma (db/_ddl.sql), phần INSERT dựng từ nội dung hiện tại.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newsArticles } from '../src/data/news.ts';
import { libraryArticles } from '../src/data/library.ts';
import { products, customersList, navLinks, heroStats } from '../src/data.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const p = (f: string) => resolve(__dirname, f);

// ---- helpers ----------------------------------------------------------------
const q = (v: unknown): string =>
  v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;
const arr = (a: string[]): string =>
  a.length ? `ARRAY[${a.map(q).join(', ')}]` : `ARRAY[]::text[]`;
const bool = (b: boolean) => (b ? 'true' : 'false');
const NOW = 'CURRENT_TIMESTAMP';

function catSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ---- dữ liệu chỉ có trong component -----------------------------------------
const softwareDropdownItems = [
  { name: 'Dự toán BNSC', href: '#du-toan' },
  { name: 'Quản lý Dự án BNSC', href: '#du-toan' },
  { name: 'Quản lý tiến độ BNSC', href: '#du-toan' },
  { name: 'Quản lý Vốn', href: '#du-toan' },
  { name: 'Phần mềm theo đơn đặt hàng', href: '#du-toan' },
];
const heroSlides = [
  { imageUrl: '/uploads/hero/meeting_gialai.png', caption: 'SXD GIA LAI: Công bố Đơn giá NC & Giá CM năm 2025 do BNSC tư vấn thực hiện' },
  { imageUrl: '/uploads/hero/training_lamdong.png', caption: 'SXD LÂM ĐỒNG: Đào tạo & tập huấn nghiệp vụ phần mềm Dự toán BNSC mới nhất' },
  { imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop', caption: 'SXD KHÁNH HÒA: Ứng dụng phổ biến BNSC lập dự toán công trình giao thông cấp bách' },
];
const consultingServices = [
  { title: 'Tư vấn Đơn giá Xây dựng & Máy thi công', description: 'Hỗ trợ các Sở Xây dựng khảo sát giá thị trường nhân công, tính toán nguyên lý giá ca máy bám sát Thông tư 11/2021/TT-BXD, số hóa đơn giá đưa lên máy chủ quốc gia.', iconName: 'Gavel' },
  { title: 'Xây dựng Định mức hạ tầng kỹ thuật đặc thù', description: 'Thiết lập định mức chi tiết cho các công tác xây lắp đặc thù địa phương (như duy tu hạ tầng kỹ thuật, cấp thoát nước, bảo dưỡng hạ tầng đường sắt) chưa có trong định mức Bộ Xây dựng.', iconName: 'FileText' },
];
const courses = [
  { slug: 'dutoan-thucchien', title: 'Lập Dự toán & Đo bóc khối lượng công trình', scheduleText: 'Khai giảng ngày 15 hằng tháng', duration: '12 buổi (Tối Thứ 2-4-6)', format: 'Trực tiếp tại VP & Trực tuyến qua Zoom', price: '1.800.000 VNĐ', coupon: 'Giảm 15% khi thanh toán sớm', slots: 'Chỉ còn 6 chỗ trống', trainer: 'Kỹ sư cao cấp Vũ Hoàng Nam (Mạng đấu thầu BNSC)' },
  { slug: 'dauthau-mang', title: 'Nghiệp vụ Đấu thầu qua mạng thế hệ mới', scheduleText: 'Khai giảng ngày 20 hằng tháng', duration: '4 buổi (Thứ 7 & Chủ Nhật)', format: 'Trực tuyến Zoom có quay lưu bài giảng', price: '1.200.000 VNĐ', coupon: 'Tặng kèm giáo trình đấu thầu mới nhất', slots: 'Chỉ còn 3 chỗ trống', trainer: 'Thạc sĩ Phan Văn Đạt (Trọng tài viên Kinh tế XD)' },
];
const homeFaqs = [
  { question: 'Phần mềm dự toán BNSC có xuất được bảng tính toán thép chi tiết không?', answer: 'Hoàn toàn được. BNSC tích hợp module đo bóc cốt thép chi tiết, cho phép liệt kê kích thước, đường kính, trọng lượng và tự động tổng hợp bảng thống kê hình dạng thép liên kết động sang Excel.' },
  { question: 'Bộ đơn giá nhân công & ca máy do Bắc Nam tư vấn có tính pháp lý như thế nào?', answer: 'Bộ cơ sở dữ liệu do BNSC xây dựng được thẩm định qua Hội đồng liên ngành Sở Tài chính - Sở Xây dựng và ban hành chính thức dưới Quyết định của UBND tỉnh, có giá trị pháp lý bắt buộc áp dụng trực tiếp.' },
  { question: 'Tôi tự học có sử dụng được phần mềm không? Có tài liệu không?', answer: 'Rất dễ dàng. Bắc Nam cung cấp hệ thống video mẫu có thuyết minh từ cơ bản đến nâng cao, kết hợp tài liệu hướng dẫn file PDF 150 trang chi tiết từng bước. Ngoài ra chúng tôi hỗ trợ cài đặt qua UltraViewer miễn phí.' },
];
const supportFaqs = [
  { question: 'Làm thế nào để kích hoạt bản quyền BNSC khi có khóa cứng?', answer: 'Anh/chị vui lòng cắm khóa cứng USB vào máy tính, mở phần mềm Dự toán BNSC lên, hệ thống sẽ tự động nhận diện Key bản quyền. Nếu hiện thông báo "Chưa có thiết bị", hãy gọi tổng đài kỹ thuật để nhận Driver hỗ trợ.' },
  { question: 'Phần mềm Dự toán BNSC có chạy được trên Excel 64-bit không?', answer: 'Dự toán BNSC chạy ổn định 100% trên cả Excel 32-bit và Excel 64-bit (từ phiên bản Office 2013 đến Office 365 mới nhất hiện nay).' },
  { question: 'Làm sao để cập nhật đơn giá, định mức các Tỉnh thành mới nhất?', answer: 'Mở phần mềm BNSC -> Chọn menu "Tính năng" -> Click "Tải đơn giá" -> Chọn Tỉnh thành cần làm việc và nhấn tải về hoàn toàn miễn phí.' },
];
const supportStaff = [
  { name: 'Kỹ sư Hoàng Lâm', phone: '0966966455', role: 'Trưởng bộ phận kỹ thuật', ext: 'Nhánh 1' },
  { name: 'Kỹ sư Quốc Khánh', phone: '0981757527', role: 'Support BNSC phía Nam', ext: 'Nhánh 2' },
  { name: 'Kỹ sư Minh Đức', phone: '0903310052', role: 'Tư vấn Chuyển giao & Đào tạo', ext: 'Nhánh 3' },
];
const remoteTools = [
  { name: 'UltraViewer (Khuyên dùng)', description: 'Phần mềm điều khiển máy tính xa cực nhẹ, phổ biến nhất tại Việt Nam. Được đội ngũ BNSC sử dụng để cài đặt trực tiếp cho khách hàng.', version: 'v6.6 (Bản mới nhất)', url: 'https://www.ultraviewer.net/vi/download.html', realUrl: null, badge: 'Bao gồm bộ cài sửa lỗi' },
  { name: 'TeamViewer Toàn cầu', description: 'Công cụ kết nối từ xa tiêu chuẩn quốc tế ổn định cao. Thích hợp cho doanh nghiệp có chính sách bảo mật mạng nội bộ nghiêm ngặt.', version: 'Bản Portable không cần cài', url: 'https://www.teamviewer.com/vi/download/windows/', realUrl: 'https://www.teamviewer.com/vi/download/windows/', badge: 'Kết nối mã hóa AES-256' },
];
const AI_SYSTEM_PROMPT = `Bạn là Trợ lý AI chính thức của Công ty Cổ phần Phần mềm Bắc Nam (BNSC). Hãy trả lời người dùng một cách thân thiện, chuyên nghiệp và lịch sự bằng tiếng Việt. Hỗ trợ về phần mềm Dự toán BNSC, đào tạo nghiệp vụ và các văn bản, thông tư xây dựng. Khuyến khích tải bộ cài mới nhất hoặc liên hệ Hotline/Zalo anh Khắc Tiệp: 0981757527.`;
const settings = [
  { key: 'site_name', value: 'Bắc Nam Software (BNSC)', group: 'general', label: 'Tên thương hiệu' },
  { key: 'software_version', value: 'v1.20', group: 'general', label: 'Phiên bản phần mềm' },
  { key: 'company_legal_name', value: 'Công ty Cổ phần Phần mềm và Tư vấn Xây dựng Bắc Nam (BNSC)', group: 'general', label: 'Tên pháp lý' },
  { key: 'business_license', value: '0310892095', group: 'general', label: 'Giấy phép ĐKKD' },
  { key: 'hotline_primary', value: '0966965075', group: 'contact', label: 'Hotline chính' },
  { key: 'hotline_secondary', value: '02866678995', group: 'contact', label: 'Hotline phụ' },
  { key: 'email', value: 'contact@bacnam.com.vn', group: 'contact', label: 'Email' },
  { key: 'address', value: 'Tòa nhà Indochina, số 4 Nguyễn Đình Chiểu, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh', group: 'contact', label: 'Địa chỉ' },
  { key: 'social_facebook', value: 'https://facebook.com', group: 'social', label: 'Facebook' },
  { key: 'social_youtube', value: 'https://youtube.com', group: 'social', label: 'YouTube' },
  { key: 'social_zalo', value: 'https://zalo.me', group: 'social', label: 'Zalo' },
  { key: 'announcement_enabled', value: 'true', group: 'announcement', label: 'Bật thanh thông báo' },
  { key: 'announcement_text', value: 'Chính thức phát hành Dự toán BNSC v1.20 với nhiều cập nhật định mức đột phá!', group: 'announcement', label: 'Nội dung thông báo' },
  { key: 'ai_system_prompt', value: AI_SYSTEM_PROMPT, group: 'ai', label: 'Prompt hệ thống Trợ lý AI' },
];

// ---- build INSERT statements ------------------------------------------------
const out: string[] = [];
const sec = (t: string) => out.push(`\n-- ${t}`);

// settings
sec('settings');
for (const s of settings)
  out.push(`INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES (${q(s.key)}, ${q(s.value)}, ${q(s.group)}, ${q(s.label)}, ${NOW});`);

// nav_links + submenu
sec('nav_links');
navLinks.forEach((l, i) =>
  out.push(`INSERT INTO "nav_links" ("name","href","sortOrder","updatedAt") VALUES (${q(l.name)}, ${q(l.href)}, ${i}, ${NOW});`),
);
softwareDropdownItems.forEach((c, i) =>
  out.push(`INSERT INTO "nav_links" ("name","href","sortOrder","parentId","updatedAt") VALUES (${q(c.name)}, ${q(c.href)}, ${i}, (SELECT "id" FROM "nav_links" WHERE "name" = 'Phần mềm' AND "parentId" IS NULL LIMIT 1), ${NOW});`),
);

// hero
sec('hero_slides');
heroSlides.forEach((s, i) =>
  out.push(`INSERT INTO "hero_slides" ("imageUrl","caption","sortOrder","updatedAt") VALUES (${q(s.imageUrl)}, ${q(s.caption)}, ${i}, ${NOW});`),
);
sec('hero_stats');
heroStats.forEach((s, i) =>
  out.push(`INSERT INTO "hero_stats" ("value","label","sortOrder") VALUES (${q(s.value)}, ${q(s.label)}, ${i});`),
);

// products
sec('products');
products.forEach((pr, i) =>
  out.push(`INSERT INTO "products" ("slug","name","isFeatured","badge","tagline","features","ctaText","iconName","sortOrder","updatedAt") VALUES (${q(pr.id)}, ${q(pr.name)}, ${bool(pr.isFeatured)}, ${q(pr.badge ?? null)}, ${q(pr.tagline)}, ${arr(pr.features)}, ${q(pr.ctaText)}, ${q(pr.iconName)}, ${i}, ${NOW});`),
);

// news
sec('news_categories');
const newsCats = [...new Set(newsArticles.map((a) => a.category))];
newsCats.forEach((n, i) =>
  out.push(`INSERT INTO "news_categories" ("slug","name","sortOrder") VALUES (${q(catSlug(n))}, ${q(n)}, ${i});`),
);
sec('news_articles');
for (const a of newsArticles)
  out.push(
    `INSERT INTO "news_articles" ("slug","title","excerpt","contentBody","imageUrl","categoryId","dateText","views","updatedAt") VALUES (${q(a.slug)}, ${q(a.title)}, ${q(a.excerpt)}, ${q(a.contentBody)}, ${q(a.imageUrl ?? null)}, (SELECT "id" FROM "news_categories" WHERE "name" = ${q(a.category)}), ${q(a.date)}, ${a.views}, ${NOW});`,
  );

// library
sec('library_categories');
const libCats = [...new Set(libraryArticles.map((a) => a.category))];
libCats.forEach((n, i) =>
  out.push(`INSERT INTO "library_categories" ("slug","name","sortOrder") VALUES (${q(catSlug(n))}, ${q(n)}, ${i});`),
);
sec('library_articles');
for (const a of libraryArticles)
  out.push(
    `INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES (${q(a.slug)}, ${q(a.title)}, ${q(a.summary)}, ${q(a.imageUrl ?? null)}, ${q(a.author ?? null)}, (SELECT "id" FROM "library_categories" WHERE "name" = ${q(a.category)}), ${q(a.date)}, ${a.views}, ${NOW});`,
  );

// customers
sec('customers');
customersList.forEach((c, i) =>
  out.push(`INSERT INTO "customers" ("name","subtext","sortOrder") VALUES (${q(c.name)}, ${q(c.subtext ?? null)}, ${i});`),
);

// consulting + courses
sec('consulting_services');
consultingServices.forEach((c, i) =>
  out.push(`INSERT INTO "consulting_services" ("title","description","iconName","sortOrder") VALUES (${q(c.title)}, ${q(c.description)}, ${q(c.iconName)}, ${i});`),
);
sec('courses');
courses.forEach((c, i) =>
  out.push(`INSERT INTO "courses" ("slug","title","scheduleText","duration","format","price","coupon","slots","trainer","sortOrder","updatedAt") VALUES (${q(c.slug)}, ${q(c.title)}, ${q(c.scheduleText)}, ${q(c.duration)}, ${q(c.format)}, ${q(c.price)}, ${q(c.coupon)}, ${q(c.slots)}, ${q(c.trainer)}, ${i}, ${NOW});`),
);

// faqs
sec('faqs');
homeFaqs.forEach((f, i) =>
  out.push(`INSERT INTO "faqs" ("scope","question","answer","sortOrder") VALUES ('HOME', ${q(f.question)}, ${q(f.answer)}, ${i});`),
);
supportFaqs.forEach((f, i) =>
  out.push(`INSERT INTO "faqs" ("scope","question","answer","sortOrder") VALUES ('SUPPORT', ${q(f.question)}, ${q(f.answer)}, ${i});`),
);

// support
sec('support_staff');
supportStaff.forEach((s, i) =>
  out.push(`INSERT INTO "support_staff" ("name","phone","role","ext","sortOrder") VALUES (${q(s.name)}, ${q(s.phone)}, ${q(s.role)}, ${q(s.ext)}, ${i});`),
);
sec('remote_tools');
remoteTools.forEach((t, i) =>
  out.push(`INSERT INTO "remote_tools" ("name","description","version","url","realUrl","badge","sortOrder") VALUES (${q(t.name)}, ${q(t.description)}, ${q(t.version)}, ${q(t.url)}, ${q(t.realUrl)}, ${q(t.badge)}, ${i});`),
);

// ---- ghép DDL + seed --------------------------------------------------------
const ddl = readFileSync(p('_ddl.sql'), 'utf8').trim();
const tables = [
  'media', 'admin_users', 'chat_messages', 'leads', 'remote_tools', 'support_staff',
  'faqs', 'courses', 'consulting_services', 'customers', 'library_articles',
  'library_categories', 'news_articles', 'news_categories', 'products', 'hero_stats',
  'hero_slides', 'nav_links', 'settings',
];
const enums = ['AdminRole', 'LeadStatus', 'LeadType', 'FaqScope'];
const reset = `-- --- RESET (cho phép chạy lại nhiều lần) — XÓA bảng cũ nếu đã tồn tại ---------
DROP TABLE IF EXISTS ${tables.map((t) => `"${t}"`).join(', ')} CASCADE;
DROP TYPE IF EXISTS ${enums.map((e) => `"${e}"`).join(', ')} CASCADE;

`;
const header = `-- =============================================================================
-- BNSC – Bắc Nam Software | db.sql (PostgreSQL)
-- Chạy trong pgAdmin: mở Query Tool trên database đích rồi Execute (F5) cả file.
-- Gồm: (0) reset + (1) tạo bảng/enum/khóa ngoại (DDL) + (2) nạp dữ liệu (INSERT).
-- Encoding: UTF-8. Yêu cầu PostgreSQL >= 13.
-- Lưu ý: khối RESET sẽ XÓA các bảng cùng tên nếu đã có. Bỏ nếu không muốn.
-- =============================================================================
SET client_encoding = 'UTF8';

`;
const full = `${header}${reset}${ddl}\n\n-- =============================================================================\n-- DỮ LIỆU (SEED)\n-- =============================================================================\nBEGIN;\n${out.join('\n')}\n\nCOMMIT;\n`;
writeFileSync(p('db.sql'), full, 'utf8');
console.log(`db.sql generated (${full.length} bytes, ${out.filter((l) => l.startsWith('INSERT')).length} INSERT).`);
