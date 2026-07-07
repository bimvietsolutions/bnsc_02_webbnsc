-- =============================================================================
-- BNSC – Bắc Nam Software | db.sql (PostgreSQL)
-- Chạy trong pgAdmin: mở Query Tool trên database đích rồi Execute (F5) cả file.
-- Gồm: (0) reset + (1) tạo bảng/enum/khóa ngoại (DDL) + (2) nạp dữ liệu (INSERT).
-- Encoding: UTF-8. Yêu cầu PostgreSQL >= 13.
-- Lưu ý: khối RESET sẽ XÓA các bảng cùng tên nếu đã có. Bỏ nếu không muốn.
-- =============================================================================
SET client_encoding = 'UTF8';

-- --- RESET (cho phép chạy lại nhiều lần) — XÓA bảng cũ nếu đã tồn tại ---------
DROP TABLE IF EXISTS "media", "admin_users", "chat_messages", "leads", "remote_tools", "support_staff", "faqs", "courses", "consulting_services", "customers", "library_articles", "library_categories", "news_articles", "news_categories", "products", "hero_stats", "hero_slides", "nav_links", "settings" CASCADE;
DROP TYPE IF EXISTS "AdminRole", "LeadStatus", "LeadType", "FaqScope" CASCADE;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "FaqScope" AS ENUM ('HOME', 'SUPPORT');

-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('DOWNLOAD', 'REGISTER', 'CONSULT');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'DONE', 'SPAM');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'EDITOR');

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "group" TEXT,
    "label" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nav_links" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nav_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_slides" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "linkUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_stats" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hero_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "tagline" TEXT NOT NULL,
    "features" TEXT[],
    "ctaText" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_categories" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "news_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "contentBody" TEXT NOT NULL,
    "imageUrl" TEXT,
    "author" TEXT DEFAULT 'Ban Biên Tập BNSC',
    "categoryId" INTEGER NOT NULL,
    "dateText" TEXT,
    "publishedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_categories" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "library_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_articles" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "author" TEXT,
    "categoryId" INTEGER NOT NULL,
    "dateText" TEXT,
    "publishedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "attachmentSize" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subtext" TEXT,
    "logoUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consulting_services" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "consulting_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scheduleText" TEXT,
    "duration" TEXT,
    "format" TEXT,
    "price" TEXT,
    "coupon" TEXT,
    "slots" TEXT,
    "trainer" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" SERIAL NOT NULL,
    "scope" "FaqScope" NOT NULL DEFAULT 'HOME',
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_staff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT,
    "ext" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "support_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remote_tools" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" TEXT,
    "url" TEXT NOT NULL,
    "realUrl" TEXT,
    "badge" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "remote_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "type" "LeadType" NOT NULL DEFAULT 'REGISTER',
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "province" TEXT,
    "company" TEXT,
    "productSlug" TEXT,
    "courseSlug" TEXT,
    "note" TEXT,
    "source" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "nav_links_parentId_idx" ON "nav_links"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_slug_key" ON "news_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_name_key" ON "news_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_slug_key" ON "news_articles"("slug");

-- CreateIndex
CREATE INDEX "news_articles_categoryId_idx" ON "news_articles"("categoryId");

-- CreateIndex
CREATE INDEX "news_articles_isPublished_publishedAt_idx" ON "news_articles"("isPublished", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "library_categories_slug_key" ON "library_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "library_categories_name_key" ON "library_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "library_articles_slug_key" ON "library_articles"("slug");

-- CreateIndex
CREATE INDEX "library_articles_categoryId_idx" ON "library_articles"("categoryId");

-- CreateIndex
CREATE INDEX "library_articles_isPublished_publishedAt_idx" ON "library_articles"("isPublished", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "faqs_scope_idx" ON "faqs"("scope");

-- CreateIndex
CREATE INDEX "leads_type_status_idx" ON "leads"("type", "status");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");

-- CreateIndex
CREATE INDEX "chat_messages_sessionId_idx" ON "chat_messages"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- AddForeignKey
ALTER TABLE "nav_links" ADD CONSTRAINT "nav_links_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "nav_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "news_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_articles" ADD CONSTRAINT "library_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "library_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================
-- DỮ LIỆU (SEED)
-- =============================================================================
BEGIN;

-- settings
INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES ('site_name', 'Bắc Nam Software (BNSC)', 'general', 'Tên thương hiệu', CURRENT_TIMESTAMP);
INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES ('software_version', 'v1.20', 'general', 'Phiên bản phần mềm', CURRENT_TIMESTAMP);
INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES ('company_legal_name', 'Công ty Cổ phần Phần mềm và Tư vấn Xây dựng Bắc Nam (BNSC)', 'general', 'Tên pháp lý', CURRENT_TIMESTAMP);
INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES ('business_license', '0310892095', 'general', 'Giấy phép ĐKKD', CURRENT_TIMESTAMP);
INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES ('hotline_primary', '0966965075', 'contact', 'Hotline chính', CURRENT_TIMESTAMP);
INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES ('hotline_secondary', '02866678995', 'contact', 'Hotline phụ', CURRENT_TIMESTAMP);
INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES ('email', 'contact@bacnam.com.vn', 'contact', 'Email', CURRENT_TIMESTAMP);
INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES ('address', 'Tòa nhà Indochina, số 4 Nguyễn Đình Chiểu, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh', 'contact', 'Địa chỉ', CURRENT_TIMESTAMP);
INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES ('social_facebook', 'https://facebook.com', 'social', 'Facebook', CURRENT_TIMESTAMP);
INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES ('social_youtube', 'https://youtube.com', 'social', 'YouTube', CURRENT_TIMESTAMP);
INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES ('social_zalo', 'https://zalo.me', 'social', 'Zalo', CURRENT_TIMESTAMP);
INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES ('announcement_enabled', 'true', 'announcement', 'Bật thanh thông báo', CURRENT_TIMESTAMP);
INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES ('announcement_text', 'Chính thức phát hành Dự toán BNSC v1.20 với nhiều cập nhật định mức đột phá!', 'announcement', 'Nội dung thông báo', CURRENT_TIMESTAMP);
INSERT INTO "settings" ("key","value","group","label","updatedAt") VALUES ('ai_system_prompt', 'Bạn là Trợ lý AI chính thức của Công ty Cổ phần Phần mềm Bắc Nam (BNSC). Hãy trả lời người dùng một cách thân thiện, chuyên nghiệp và lịch sự bằng tiếng Việt. Hỗ trợ về phần mềm Dự toán BNSC, đào tạo nghiệp vụ và các văn bản, thông tư xây dựng. Khuyến khích tải bộ cài mới nhất hoặc liên hệ Hotline/Zalo anh Khắc Tiệp: 0981757527.', 'ai', 'Prompt hệ thống Trợ lý AI', CURRENT_TIMESTAMP);

-- nav_links
INSERT INTO "nav_links" ("name","href","sortOrder","updatedAt") VALUES ('Trang chủ', '#trang-chu', 0, CURRENT_TIMESTAMP);
INSERT INTO "nav_links" ("name","href","sortOrder","updatedAt") VALUES ('Giới thiệu', '#gioi-thieu', 1, CURRENT_TIMESTAMP);
INSERT INTO "nav_links" ("name","href","sortOrder","updatedAt") VALUES ('Tin tức', '#tin-tuc', 2, CURRENT_TIMESTAMP);
INSERT INTO "nav_links" ("name","href","sortOrder","updatedAt") VALUES ('Thư viện', '#thuvien-tinhhuong', 3, CURRENT_TIMESTAMP);
INSERT INTO "nav_links" ("name","href","sortOrder","updatedAt") VALUES ('Phần mềm', '#du-toan', 4, CURRENT_TIMESTAMP);
INSERT INTO "nav_links" ("name","href","sortOrder","updatedAt") VALUES ('Tư vấn', '#tu-van', 5, CURRENT_TIMESTAMP);
INSERT INTO "nav_links" ("name","href","sortOrder","updatedAt") VALUES ('Đào tạo', '#dao-tao', 6, CURRENT_TIMESTAMP);
INSERT INTO "nav_links" ("name","href","sortOrder","updatedAt") VALUES ('Liên hệ', '#lien-he', 7, CURRENT_TIMESTAMP);
INSERT INTO "nav_links" ("name","href","sortOrder","parentId","updatedAt") VALUES ('Dự toán BNSC', '#du-toan', 0, (SELECT "id" FROM "nav_links" WHERE "name" = 'Phần mềm' AND "parentId" IS NULL LIMIT 1), CURRENT_TIMESTAMP);
INSERT INTO "nav_links" ("name","href","sortOrder","parentId","updatedAt") VALUES ('Quản lý Dự án BNSC', '#du-toan', 1, (SELECT "id" FROM "nav_links" WHERE "name" = 'Phần mềm' AND "parentId" IS NULL LIMIT 1), CURRENT_TIMESTAMP);
INSERT INTO "nav_links" ("name","href","sortOrder","parentId","updatedAt") VALUES ('Quản lý tiến độ BNSC', '#du-toan', 2, (SELECT "id" FROM "nav_links" WHERE "name" = 'Phần mềm' AND "parentId" IS NULL LIMIT 1), CURRENT_TIMESTAMP);
INSERT INTO "nav_links" ("name","href","sortOrder","parentId","updatedAt") VALUES ('Quản lý Vốn', '#du-toan', 3, (SELECT "id" FROM "nav_links" WHERE "name" = 'Phần mềm' AND "parentId" IS NULL LIMIT 1), CURRENT_TIMESTAMP);
INSERT INTO "nav_links" ("name","href","sortOrder","parentId","updatedAt") VALUES ('Phần mềm theo đơn đặt hàng', '#du-toan', 4, (SELECT "id" FROM "nav_links" WHERE "name" = 'Phần mềm' AND "parentId" IS NULL LIMIT 1), CURRENT_TIMESTAMP);

-- hero_slides
INSERT INTO "hero_slides" ("imageUrl","caption","sortOrder","updatedAt") VALUES ('/uploads/hero/meeting_gialai.png', 'SXD GIA LAI: Công bố Đơn giá NC & Giá CM năm 2025 do BNSC tư vấn thực hiện', 0, CURRENT_TIMESTAMP);
INSERT INTO "hero_slides" ("imageUrl","caption","sortOrder","updatedAt") VALUES ('/uploads/hero/training_lamdong.png', 'SXD LÂM ĐỒNG: Đào tạo & tập huấn nghiệp vụ phần mềm Dự toán BNSC mới nhất', 1, CURRENT_TIMESTAMP);
INSERT INTO "hero_slides" ("imageUrl","caption","sortOrder","updatedAt") VALUES ('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop', 'SXD KHÁNH HÒA: Ứng dụng phổ biến BNSC lập dự toán công trình giao thông cấp bách', 2, CURRENT_TIMESTAMP);

-- hero_stats
INSERT INTO "hero_stats" ("value","label","sortOrder") VALUES ('20+', 'Sở Xây dựng hợp tác', 0);
INSERT INTO "hero_stats" ("value","label","sortOrder") VALUES ('63', 'Tỉnh thành sử dụng', 1);
INSERT INTO "hero_stats" ("value","label","sortOrder") VALUES ('15+', 'Năm kinh nghiệm', 2);
INSERT INTO "hero_stats" ("value","label","sortOrder") VALUES ('v1.20', 'Phiên bản mới nhất', 3);

-- products
INSERT INTO "products" ("slug","name","isFeatured","badge","tagline","features","ctaText","iconName","sortOrder","updatedAt") VALUES ('du-toan-bnsc', 'Dự toán BNSC', true, 'v1.20 Mới nhất', 'Phần mềm lập & thẩm định dự toán công trình hàng đầu Việt Nam hiện nay.', ARRAY['Lập, thẩm định dự toán & thanh quyết toán theo đúng quy định mới nhất của Bộ Xây dựng', 'Tự động tra cứu & áp dụng Đơn giá nhân công, Giá ca máy từ các quyết định công bố', 'Tự động cập nhật dữ liệu hao phí định mức chỉ với một chạm', 'Xuất báo cáo Excel cực nhanh với đầy đủ công thức liên kết động linh hoạt'], 'Tải miễn phí', 'Laptop', 0, CURRENT_TIMESTAMP);
INSERT INTO "products" ("slug","name","isFeatured","badge","tagline","features","ctaText","iconName","sortOrder","updatedAt") VALUES ('tu-van-don-gia', 'Tư vấn Đơn giá', false, NULL, 'Đối tác chiến lược cung cấp dịch vụ tư vấn định mức đơn giá cho các Sở Xây dựng.', ARRAY['Xây dựng bộ Đơn giá nhân công, Giá ca máy thiết bị thi công thực tế cho địa phương', 'Xây dựng giá ca máy chuyên dụng và chỉ số giá xây dựng định kỳ', 'Đội ngũ chuyên gia dày dặn kinh nghiệm chuẩn hóa cơ sở dữ liệu số hóa nhanh chóng'], 'Đăng ký tư vấn', 'Scale', 1, CURRENT_TIMESTAMP);
INSERT INTO "products" ("slug","name","isFeatured","badge","tagline","features","ctaText","iconName","sortOrder","updatedAt") VALUES ('dao-tao-nghiep-vu', 'Đào tạo Nghiệp vụ', false, NULL, 'Bồi dưỡng kiến thức thực tế từ kỹ sư thực chiến cho nguồn nhân lực ngành Xây dựng.', ARRAY['Khóa học Lập & Thẩm tra Dự toán - Đo bóc khối lượng chuẩn chỉ', 'Nghiệp vụ Đấu thầu qua mạng qua Hệ thống mạng đấu thầu quốc gia mới', 'Thanh quyết toán hợp đồng xây dựng và xử lý hồ sơ hoàn công thực tế'], 'Xem lịch chiêu sinh', 'GraduationCap', 2, CURRENT_TIMESTAMP);

-- news_categories
INSERT INTO "news_categories" ("slug","name","sortOrder") VALUES ('van-ban-qppl', 'Văn bản QPPL', 0);
INSERT INTO "news_categories" ("slug","name","sortOrder") VALUES ('noi-bo', 'Nội bộ', 1);
INSERT INTO "news_categories" ("slug","name","sortOrder") VALUES ('chuyen-nganh', 'Chuyên ngành', 2);
INSERT INTO "news_categories" ("slug","name","sortOrder") VALUES ('khuyen-mai', 'Khuyến mãi', 3);

-- news_articles
INSERT INTO "news_articles" ("slug","title","excerpt","contentBody","imageUrl","categoryId","dateText","views","updatedAt") VALUES ('vinh-long-quyet-dinh-325-va-327qd-sxd-cong-bo-don-gia-nhan-cong-may-thi-cong-nam-2026', 'Vĩnh Long: Quyết định 325 và 327/QĐ-SXD Công bố đơn giá nhân công & máy thi công năm 2026', 'Ngày 18/5/2026, Sở Xây dựng tỉnh Vĩnh Long đã ký ban hành các Quyết định 325/QĐ-SXD và 327/QĐ-SXD về việc công bố đơn giá nhân công xây dựng và giá ca máy thi công làm cơ sở quản lý chi phí đầu tư xây dựng trên địa bàn tỉnh.', 'Căn cứ Nghị định số 10/2021/NĐ-CP ngày 09/02/2021 của Chính phủ về quản lý chi phí đầu tư xây dựng;
Căn cứ Thông tư số 11/2021/TT-BXD ngày 31/8/2021 của Bộ trưởng Bộ Xây dựng hướng dẫn một số nội dung xác định và quản lý chi phí đầu tư xây dựng;

Sở Xây dựng tỉnh Vĩnh Long chính thức ban hành:
1. Quyết định số 325/QĐ-SXD công bố Đơn giá nhân công xây dựng năm 2026 trên địa bàn tỉnh Vĩnh Long.
2. Quyết định số 327/QĐ-SXD công bố Bảng giá ca máy và thiết bị thi công xây dựng năm 2026 trên địa bàn tỉnh Vĩnh Long.

Các quyết định này có hiệu lực kể từ ngày ký. Phần mềm dự toán BNSC đã cập nhật đầy đủ cơ sở dữ liệu của các quyết định nêu trên, hỗ trợ quý khách hàng tra cứu và áp dụng tự động cho các công trình nhanh nhất.', NULL, (SELECT "id" FROM "news_categories" WHERE "name" = 'Văn bản QPPL'), '18 Thg 5, 2026', 367, CURRENT_TIMESTAMP);
INSERT INTO "news_articles" ("slug","title","excerpt","contentBody","imageUrl","categoryId","dateText","views","updatedAt") VALUES ('an-giang-quyet-dinh-2116qd-ubnd-cong-bo-don-gia-nc-mtc-nam-2026', 'An Giang: Quyết định 2116/QĐ-UBND Công bố đơn giá NC & MTC năm 2026', 'Ủy ban nhân dân tỉnh An Giang công bố bộ đơn giá nhân công mới nhất và bảng giá ca máy thi công làm cơ sở quản lý chi phí đầu tư xây dựng công trình trên địa bàn tỉnh An Giang chính xác hơn.', 'Ủy ban nhân dân tỉnh An Giang công bố Quyết định số 2116/QĐ-UBND ban hành bảng công bố giá nhân công và máy thi công đầu năm 2026 bám sát biến động thị trường lao động xây dựng thực tế và các quy định của Chính phủ.

Dữ liệu mới đã được chuẩn hóa vào máy chủ gốc của phần mềm BNSC. Người sử dụng chỉ cần mở tính năng "Tải đơn giá" là có thể cập nhật ngay lập tức toàn bộ định mức và hệ số nhân công tương ứng cho khu vực I, II, III.', NULL, (SELECT "id" FROM "news_categories" WHERE "name" = 'Văn bản QPPL'), '6 Thg 5, 2026', 226, CURRENT_TIMESTAMP);
INSERT INTO "news_articles" ("slug","title","excerpt","contentBody","imageUrl","categoryId","dateText","views","updatedAt") VALUES ('can-tho-quyet-dinh-595qd-sxd-cong-bo-don-gia-nc-mtc-nam-2026', 'Cần Thơ: Quyết định 595/QĐ-SXD Công bố đơn giá NC & MTC năm 2026', 'Sở Xây dựng TP. Cần Thơ chính thức ban hành bảng công bố giá nhân công và máy thi công đầu năm 2026 bám sát biến động thị trường lao động xây dựng thực tế và các quy định của Chính phủ.', 'Sở Xây dựng TP. Cần Thơ ban hành Quyết định số 595/QĐ-SXD công bố giá nhân công xây dựng quý mới quốc gia năm 2026. Bảng đơn giá làm cơ sở để các cá nhân, doanh nghiệp lập báo cáo nghiên cứu khả thi, khảo sát xây dựng dự thầu cho tất cả hạng mục trung tâm thành phố và ngoại thành quận huyện.', NULL, (SELECT "id" FROM "news_categories" WHERE "name" = 'Văn bản QPPL'), '5 Thg 5, 2026', 644, CURRENT_TIMESTAMP);
INSERT INTO "news_articles" ("slug","title","excerpt","contentBody","imageUrl","categoryId","dateText","views","updatedAt") VALUES ('le-ky-thoa-thuan-hop-tac-voi-phan-hieu-truong-dai-hoc-gtvt-tai-tphcm', 'Lễ ký thỏa thuận hợp tác với Phân hiệu trường Đại học GTVT tại TP.HCM', 'Bắc Nam Software ký kết biên bản ghi nhớ toàn diện cùng Trường Đại học Giao thông vận tải Phân hiệu tại TP.HCM nhằm tài trợ gói phần mềm bản quyền Dự toán BNSC.', 'Tại buổi lễ ký kết trang trọng, đại diện lãnh đạo Bắc Nam Software và Ban Giám hiệu Phân hiệu Trường Đại học Giao thông vận tải tại TP.HCM đã thống nhất các điều khoản hợp tác dài hạn.

Theo đó, Bắc Nam Software tài trợ bản quyền miễn phí phần mềm Dự toán BNSC phục vụ công tác giảng dạy môn Kinh tế xây dựng và Đo bóc khối lượng, hỗ trợ giáo trình đào tạo, tổ chức kiểm tra và cấp chứng chỉ định mức uy tín cho sinh viên năm cuối.', NULL, (SELECT "id" FROM "news_categories" WHERE "name" = 'Nội bộ'), '10 Thg 5, 2022', 3900, CURRENT_TIMESTAMP);
INSERT INTO "news_articles" ("slug","title","excerpt","contentBody","imageUrl","categoryId","dateText","views","updatedAt") VALUES ('can-tho-quyet-dinh-272026qd-ubnd-ban-hanh-dinh-muc-van-chuyen-dac-thu-duong-thuy', 'Cần Thơ: Quyết định 27/2026/QĐ-UBND ban hành Định mức vận chuyển đặc thù đường thủy', 'Ủy ban nhân dân thành phố Cần Thơ quy định về định mức dự toán vận chuyển hàng hóa đặc thù bằng phương tiện đường thủy phục vụ công tác xây lắp, vận hành đường sông.', 'UBND TP. Cần Thơ vừa ban hành Quyết định 27/2026/QĐ-UBND về định mức vận chuyển vật liệu đặc thù qua cano, sà lan và tàu cứu hộ đường sông nội tỉnh. Đây là cơ sở cốt lõi để các doanh nghiệp thi công cầu đường thủy, nạo vét kênh rạch nội vùng ĐBSCL lập dự toán chi phí chính xác.', NULL, (SELECT "id" FROM "news_categories" WHERE "name" = 'Văn bản QPPL'), '19 Thg 3, 2026', 390, CURRENT_TIMESTAMP);
INSERT INTO "news_articles" ("slug","title","excerpt","contentBody","imageUrl","categoryId","dateText","views","updatedAt") VALUES ('dak-lak-qd-212026qd-ubnd-ban-hanh-bo-don-gia-dich-vu-cong-ich-do-thi-nam-2026', 'Đắk Lắk: QĐ 21/2026/QĐ-UBND ban hành Bộ đơn giá dịch vụ công ích đô thị năm 2026', 'UBND tỉnh Đắk Lắk ban hành Bộ đơn giá làm cơ sở xác định chi phí các dịch vụ rác thải, xử lý cây xanh và chiếu sáng khu đô thị lớn.', 'Quyết định số 21/2026/QĐ-UBND quy định đơn giá dịch vụ công ích đô thị trên địa bàn tỉnh Đắk Lắk bao gồm:
- Thu gom, vận chuyển và xử lý chất thải rắn sinh hoạt.
- Duy trì hệ thống cây xanh, tỉa cành định kỳ phòng bão.
- Duy trì hệ thống chiếu sáng công cộng đô thị thông minh.

Dữ liệu đặc thù này đã được tổng hợp chi tiết và cập nhật đầy đủ vào ứng dụng Dự toán BNSC phục vụ đắc lực cho các Công ty Môi trường Đô thị địa phương.', NULL, (SELECT "id" FROM "news_categories" WHERE "name" = 'Chuyên ngành'), '13 Thg 3, 2026', 580, CURRENT_TIMESTAMP);
INSERT INTO "news_articles" ("slug","title","excerpt","contentBody","imageUrl","categoryId","dateText","views","updatedAt") VALUES ('bo-xay-dung-thong-tu-042026tt-bxd-dinh-muc-bao-duong-ket-cau-ha-tang-duong-sat-quoc-gia', 'BỘ XÂY DỰNG: Thông tư 04/2026/TT-BXD Định mức bảo dưỡng kết cấu hạ tầng đường sắt quốc gia', 'Thông tư số 04/2026/TT-BXD của Bộ Xây dựng quy định về định mức dự toán bảo dưỡng kỹ thuật, sửa chữa định kỳ kết cấu hạ tầng đường sắt quốc gia.', 'Bộ Xây dựng ban hành Thông tư số 04/2026/TT-BXD quy định định mức dự toán bảo dưỡng trực tiếp hệ thống tà vẹt, đường ray, cầu hầm sắt quốc gia. Thông tư là cơ sở để các Ban Quản lý Dự án Đường sắt lập kế hoạch vốn bảo trì hằng năm.', NULL, (SELECT "id" FROM "news_categories" WHERE "name" = 'Văn bản QPPL'), '30 Thg 1, 2026', 727, CURRENT_TIMESTAMP);
INSERT INTO "news_articles" ("slug","title","excerpt","contentBody","imageUrl","categoryId","dateText","views","updatedAt") VALUES ('da-nang-quyet-dinh-152-153qd-sxd-cong-bo-don-gia-nc-mtc-nam-2026', 'Đà Nẵng: Quyết định 152-153/QĐ-SXD Công bố đơn giá NC & MTC năm 2026', 'Sở Xây dựng TP. Đà Nẵng công bố các đơn giá nhân công tương ứng trên địa bàn Hải Châu, Liên Chiểu, Ngũ Hành Sơn giúp đồng bộ kiểm tra xây lắp số.', 'Các Quyết định số 152 và 153/QĐ-SXD điều chỉnh chính thức hệ số lương nhân công các nhóm 1 đến nhóm 4 và chi phí thuê máy rải nhựa, máy xúc cơ giới trên địa bàn Đà Nẵng. Bắc Nam Software đã cập nhật tệp đơn giá lên đám mây, khách hàng có thể cài đặt dễ dàng.', NULL, (SELECT "id" FROM "news_categories" WHERE "name" = 'Văn bản QPPL'), '12 Thg 2, 2026', 3295, CURRENT_TIMESTAMP);
INSERT INTO "news_articles" ("slug","title","excerpt","contentBody","imageUrl","categoryId","dateText","views","updatedAt") VALUES ('tct-tan-cang-sai-gon-bo-quoc-phong-ung-dung-31-bo-phan-mem-du-toan-bnsc', 'TCT Tân Cảng Sài Gòn (Bộ Quốc phòng): Ứng dụng 31 bộ phần mềm Dự toán BNSC', 'Ứng dụng thử nghiệm thành công 31 bộ giấy phép Dự toán BNSC cho hoạt động xây dựng công trình cảng biển Hải đoàn tiền phương quốc phòng.', 'Đáp ứng yêu cầu nghiêm ngặt về tiến độ và độ bảo mật kỹ thuật quốc phòng, Tổng công ty Tân Cảng Sài Gòn đã ký kết sở hữu bản quyền hàng loạt phần mềm BNSC, hướng tới số hóa hoàn toàn sơ đồ tổng mức đầu tư xây dựng quân cảng.', NULL, (SELECT "id" FROM "news_categories" WHERE "name" = 'Nội bộ'), '15 Thg 12, 2017', 3452, CURRENT_TIMESTAMP);
INSERT INTO "news_articles" ("slug","title","excerpt","contentBody","imageUrl","categoryId","dateText","views","updatedAt") VALUES ('chuc-mung-nam-moi-binh-ngo-2026-thong-bao-lich-nghi-tet-va-uu-dai-dac-biet', 'CHÚC MỪNG NĂM MỚI BÍNH NGỌ 2026 – Thông báo lịch nghỉ Tết và ưu đãi đặc biệt', 'Lời tri ân và kính chúc Tết gửi tới hàng nghìn kỹ sư, cơ quan quản lý chuyên môn cùng chương trình giảm giá lên đến 15% khóa cứng BNSC.', 'Bắc Nam Software kính chúc Quý Khách hàng, Quý Đối tác một năm mới Bính Ngọ 2026 an khang thịnh vượng!
Lịch nghỉ tết kéo dài từ ngày 26 âm lịch đến mùng 6 âm lịch. Nhằm tri ân khách hàng, Bắc Nam áp dụng chương trình ưu đãi đặc biệt 15% trực tiếp khi nâng cấp khóa cứng hoặc cập nhật tệp định mức chuyên dụng.', NULL, (SELECT "id" FROM "news_categories" WHERE "name" = 'Khuyến mãi'), '1 Thg 1, 2025', 1523, CURRENT_TIMESTAMP);
INSERT INTO "news_articles" ("slug","title","excerpt","contentBody","imageUrl","categoryId","dateText","views","updatedAt") VALUES ('ban-qldtxd-y-te-tphcm-ung-dung-phan-mem-du-toan-bnsc-de-tham-tra-du-toan', 'Ban QLĐTXD Y tế TP.HCM: Ứng dụng phần mềm Dự toán BNSC để thẩm tra dự toán', 'Triển khai công tác chuẩn hóa dự toán bệnh viện công nghệ cao trên phạm vi thành phố dựa trên giải pháp chuyên sâu của BNSC.', 'Giải pháp phần mềm từ BNSC giúp tối ưu hóa 45% thời gian đo bóc khối lượng, đối soát mã hóa danh mục thiết bị y tế chuyên dụng nhập khẩu cho Ban Quản lý đầu tư xây dựng các công trình Y tế TP.HCM.', NULL, (SELECT "id" FROM "news_categories" WHERE "name" = 'Nội bộ'), '15 Thg 10, 2017', 3545, CURRENT_TIMESTAMP);
INSERT INTO "news_articles" ("slug","title","excerpt","contentBody","imageUrl","categoryId","dateText","views","updatedAt") VALUES ('can-tho-qd-502025qd-ubnd-ban-hanh-dinh-muc-du-toan-cac-cong-tac-xay-dung-dac-thu', 'Cần Thơ: QĐ 50/2025/QĐ-UBND ban hành Định mức dự toán các công tác xây dựng đặc thù', 'Bộ định mức chuyên môn bổ sung cho các công tác phục hồi, bảo tồn di sản sông nước ĐBSCL và trùng tu di tích văn hóa.', 'Công bố chi tiết nhóm công việc đặc trưng tôn tạo di sản kiến trúc trên sông vùng Nam Bộ. Phần mềm BNSC đã số hóa và gắn mã nội bộ giúp việc áp dụng định mức không gặp bất kỳ vướng mắc nào.', NULL, (SELECT "id" FROM "news_categories" WHERE "name" = 'Chuyên ngành'), '15 Thg 12, 2025', 171, CURRENT_TIMESTAMP);
INSERT INTO "news_articles" ("slug","title","excerpt","contentBody","imageUrl","categoryId","dateText","views","updatedAt") VALUES ('le-ky-ket-hop-tac-voi-truong-cao-dang-xay-dung-so-2-bo-xay-dung', 'Lễ ký kết hợp tác với Trường Cao đẳng Xây dựng số 2 (Bộ Xây dựng)', 'Hỗ trợ sinh viên thực tập tiếp cận sớm với các công nghệ thẩm định dự toán hàng đầu phục vụ thiết thực đồ án tốt nghiệp.', 'Lễ ký kết diễn ra thành công tốt đẹp mở ra nhiều cơ hội thực tập, việc làm trực tiếp tại phòng dự án liên kết của Bắc Nam Software dành cho những sinh viên xuất sắc của trường.', NULL, (SELECT "id" FROM "news_categories" WHERE "name" = 'Nội bộ'), '23 Thg 4, 2022', 3791, CURRENT_TIMESTAMP);

-- library_categories
INSERT INTO "library_categories" ("slug","name","sortOrder") VALUES ('download', 'Download', 0);
INSERT INTO "library_categories" ("slug","name","sortOrder") VALUES ('cai-dat', 'Cài đặt', 1);
INSERT INTO "library_categories" ("slug","name","sortOrder") VALUES ('su-dung', 'Sử dụng', 2);
INSERT INTO "library_categories" ("slug","name","sortOrder") VALUES ('tham-dinh', 'Thẩm định', 3);
INSERT INTO "library_categories" ("slug","name","sortOrder") VALUES ('tinh-huong-khac', 'Tình huống khác', 4);
INSERT INTO "library_categories" ("slug","name","sortOrder") VALUES ('lap-du-toan---du-thau', 'Lập Dự toán - Dự thầu', 5);

-- library_articles
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('bo-cai-du-toan-bnsc-cap-nhat-den-ngay-0132022', 'Bộ cài DỰ TOÁN BNSC (cập nhật đến ngày 01/3/2022)', 'Tải bộ cài đặt phần mềm Dự toán BNSC bản mới nhất, tích hợp đầy đủ định mức, đơn giá và các thông tư của Bộ Xây dựng.', 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=400&q=80', 'BNSC Support', (SELECT "id" FROM "library_categories" WHERE "name" = 'Download'), '11/06/2025', 30614, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('tong-hop-don-gia-xdct-va-dvci-don-gia-nhan-cong-gia-ca-may-cac-tinh-thanh', 'Tổng hợp Đơn giá XDCT và DVCI; Đơn giá Nhân công, Giá ca máy các tỉnh thành', 'Kho dữ liệu đơn giá xây dựng công trình, dịch vụ công ích, đơn giá nhân công và giá ca máy tổng hợp theo 63 tỉnh thành.', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80', 'BNSC Tech', (SELECT "id" FROM "library_categories" WHERE "name" = 'Download'), '14/08/2025', 21079, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('120-du-toan-bnsc-cap-nhat-tt-082025tt-bxd-tt-702025tt-btc-va-nd-2142025nd-cp', '1.20 DỰ TOÁN BNSC: Cập nhật TT 08/2025/TT-BXD; TT 70/2025/TT-BTC và NĐ 214/2025/NĐ-CP', 'Hướng dẫn cập nhật phiên bản 1.20 tích hợp Thông tư 08/2025/TT-BXD, Thông tư 70/2025/TT-BTC và Nghị định 214/2025/NĐ-CP.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80', 'Bản Quyền BNSC', (SELECT "id" FROM "library_categories" WHERE "name" = 'Cài đặt'), '13/06/2025', 6301, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('11-cai-dat-phan-mem-du-toan-bnsc', '1.1 Cài đặt phần mềm DỰ TOÁN BNSC', 'Các bước cài đặt phần mềm Dự toán BNSC trên máy tính Windows, kích hoạt Add-in Excel và cấu hình ban đầu.', 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=400&q=80', 'Phòng Kỹ thuật BNSC', (SELECT "id" FROM "library_categories" WHERE "name" = 'Cài đặt'), '10/06/2025', 19750, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('119-du-toan-bnsc-cap-nhat-tt-092024tt-bxd-ngay-3082024', '1.19 DỰ TOÁN BNSC: Cập nhật TT 09/2024/TT-BXD ngày 30/8/2024', 'Nội dung cập nhật phiên bản 1.19 áp dụng Thông tư 09/2024/TT-BXD ngày 30/8/2024 của Bộ Xây dựng.', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80', 'Hội đồng Thẩm định', (SELECT "id" FROM "library_categories" WHERE "name" = 'Cài đặt'), '24/09/2024', 5656, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('117-du-toan-bnsc-cap-nhat-nghi-dinh-242024nd-cp', '1.17 DỰ TOÁN BNSC: Cập nhật Nghị định 24/2024/NĐ-CP', 'Hướng dẫn cập nhật phần mềm theo Nghị định 24/2024/NĐ-CP về quản lý chi phí đầu tư xây dựng.', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80', 'BNSC Pháp chế', (SELECT "id" FROM "library_categories" WHERE "name" = 'Cài đặt'), '02/03/2024', 5945, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('20-gioi-thieu-tinh-nang-chinh-phan-mem', '2.0 Giới thiệu tính năng chính phần mềm', 'Tổng quan các tính năng nổi bật của phần mềm Dự toán BNSC dành cho kỹ sư lập dự toán và thẩm định.', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80', 'Kỹ sư Vũ Hoàng', (SELECT "id" FROM "library_categories" WHERE "name" = 'Sử dụng'), '10/05/2022', 5985, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('21-gioi-thieu-giao-dien-chinh-phan-mem', '2.1 Giới thiệu giao diện chính phần mềm', 'Làm quen với giao diện làm việc chính, thanh công cụ và các vùng thao tác của phần mềm Dự toán BNSC.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80', 'BNSC Admin', (SELECT "id" FROM "library_categories" WHERE "name" = 'Sử dụng'), '29/03/2020', 5555, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('22-tao-mo-luu-cong-trinh', '2.2 Tạo / Mở / Lưu công trình', 'Hướng dẫn thao tác tạo mới, mở và lưu tệp công trình dự toán trong phần mềm BNSC.', 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=400&q=80', 'BNSC Training', (SELECT "id" FROM "library_categories" WHERE "name" = 'Sử dụng'), '28/03/2020', 4995, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('251-lap-du-toan-du-thau-xay-dung-cong-trinh', '2.51 Lập Dự toán - Dự thầu xây dựng công trình', 'Hướng dẫn chi tiết phương thức Lập Dự toán - Dự thầu xây dựng công trình tích hợp định mức và đơn giá theo Thông tư 11, 12, 13/2021/TT-BXD.', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80', 'ThS. Phan Đạt', (SELECT "id" FROM "library_categories" WHERE "name" = 'Sử dụng'), '02/06/2025', 11476, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('276-tinh-chi-phi-van-chuyen-theo-tt-122021tt-bxd', '2.76 Tính chi phí vận chuyển theo TT 12/2021/TT-BXD', 'Phương pháp tính cự ly và chi phí vận chuyển vật liệu theo Thông tư 12/2021/TT-BXD ngay trong phần mềm.', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80', 'Phòng Kỹ thuật', (SELECT "id" FROM "library_categories" WHERE "name" = 'Sử dụng'), '14/01/2020', 13040, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('31-tham-dinh-file-du-toan-bnsc', '3.1 Thẩm định file Dự toán BNSC', 'Quy trình thẩm định, kiểm tra chéo tệp dự toán lập bằng phần mềm BNSC đảm bảo đúng quy định.', 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80', 'Kiểm toán Nhà nước', (SELECT "id" FROM "library_categories" WHERE "name" = 'Thẩm định'), '09/05/2022', 12463, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('32-tham-dinh-file-du-toan-khac', '3.2 Thẩm định file Dự toán khác', 'Cách nhập và thẩm định các tệp dự toán được lập từ phần mềm khác trên nền BNSC.', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=400&q=80', 'Hội thảo Chuyên môn', (SELECT "id" FROM "library_categories" WHERE "name" = 'Thẩm định'), '07/05/2022', 5124, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('41-khong-tao-moi-duoc-cong-trinh-kich-hoat-add-in-dutoan-bnsc', '4.1 Không tạo mới được công trình, Kích hoạt Add-in ''Dutoan BNSC''', 'Khắc phục lỗi không tạo mới được công trình và cách kích hoạt lại Add-in Dutoan BNSC trên Excel.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80', 'Hỗ trợ Từ xa', (SELECT "id" FROM "library_categories" WHERE "name" = 'Tình huống khác'), '31/12/2019', 8535, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('42-khong-tim-thay-khoa-cung', '4.2 Không tìm thấy khóa cứng', 'Xử lý sự cố phần mềm không nhận khóa cứng bản quyền và cách kiểm tra driver USB.', 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=400&q=80', 'BNSC Cấp phép', (SELECT "id" FROM "library_categories" WHERE "name" = 'Tình huống khác'), '30/12/2019', 5350, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('44-loi-khoi-tao-could-not-find-a-part-of-the-path-cthuvien', '4.4 Lỗi khởi tạo ''Could not find a part of the path C:\Thuvien''', 'Cách khắc phục lỗi khởi tạo ''Could not find a part of the path C:\Thuvien'' khi mở phần mềm.', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&q=80', 'BNSC Khắc phục', (SELECT "id" FROM "library_categories" WHERE "name" = 'Tình huống khác'), '29/12/2019', 5890, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('52-lap-du-toan-theo-phuong-phap-bu-tru-chenh-lech-gia-du-thau-tai-dak-lak-nam-2021', '5.2 Lập Dự toán theo phương pháp bù trừ chênh lệch, giá Dự thầu tại Đắk Lắk năm 2021', 'Ví dụ thực tế lập dự toán theo phương pháp bù trừ chênh lệch và xác định giá dự thầu tại Đắk Lắk năm 2021.', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80', 'Sở XD Đắk Lắk', (SELECT "id" FROM "library_categories" WHERE "name" = 'Lập Dự toán - Dự thầu'), '01/04/2021', 3301, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('53-lap-du-toan-gia-du-thau-tai-long-an-nam-2022', '5.3 Lập Dự toán, giá Dự thầu tại Long An năm 2022', 'Hướng dẫn lập dự toán và xác định giá dự thầu công trình tại Long An năm 2022.', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80', 'Hội đồng Long An', (SELECT "id" FROM "library_categories" WHERE "name" = 'Lập Dự toán - Dự thầu'), '22/02/2022', 3083, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('54-lap-du-toan-theo-phuong-phap-bu-tru-chenh-lech-gia-du-thau-tai-tien-giang-nam-2023', '5.4 Lập Dự toán theo phương pháp bù trừ chênh lệch, giá Dự thầu tại Tiền Giang năm 2023', 'Ví dụ lập dự toán theo phương pháp bù trừ chênh lệch và giá dự thầu tại Tiền Giang năm 2023.', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80', 'Sở XD Tiền Giang', (SELECT "id" FROM "library_categories" WHERE "name" = 'Lập Dự toán - Dự thầu'), '01/06/2025', 5009, CURRENT_TIMESTAMP);
INSERT INTO "library_articles" ("slug","title","summary","imageUrl","author","categoryId","dateText","views","updatedAt") VALUES ('55-lap-du-toan-theo-phuong-phap-truc-tiep-gia-goi-thau-xd-tai-ho-chi-minh-nam-2023', '5.5 Lập Dự toán theo phương pháp trực tiếp, giá Gói thầu XD tại Hồ Chí Minh năm 2023', 'Hướng dẫn lập dự toán theo phương pháp trực tiếp và xác định giá gói thầu xây dựng tại TP.HCM năm 2023.', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80', 'VPĐD Hồ Chí Minh', (SELECT "id" FROM "library_categories" WHERE "name" = 'Lập Dự toán - Dự thầu'), '05/05/2025', 4716, CURRENT_TIMESTAMP);

-- customers
INSERT INTO "customers" ("name","subtext","sortOrder") VALUES ('TCT Tân Cảng Sài Gòn', 'Bộ Quốc Phòng', 0);
INSERT INTO "customers" ("name","subtext","sortOrder") VALUES ('Ban QLĐTXD Y tế TP.HCM', 'Nâng Cao Cơ Sở Vật Chất Y Tế', 1);
INSERT INTO "customers" ("name","subtext","sortOrder") VALUES ('Sở Xây Dựng TP. HCM', 'Cơ Quan Quản Lý Nhà Nước', 2);
INSERT INTO "customers" ("name","subtext","sortOrder") VALUES ('Sở Xây Dựng Đắk Lắk', 'Cơ Quan Quản Lý Nhà Nước', 3);
INSERT INTO "customers" ("name","subtext","sortOrder") VALUES ('BIWASE', 'TCT Nước & Môi Trường Bình Dương', 4);
INSERT INTO "customers" ("name","subtext","sortOrder") VALUES ('Sở Xây Dựng Tây Ninh', 'Cơ Quan Quản Lý Nhà Nước', 5);
INSERT INTO "customers" ("name","subtext","sortOrder") VALUES ('Sở Xây Dựng Khánh Hòa', 'Cơ Quan Quản Lý Nhà Nước', 6);
INSERT INTO "customers" ("name","subtext","sortOrder") VALUES ('Sở Xây Dựng Gia Lai', 'Cơ Quan Quản Lý Nhà Nước', 7);
INSERT INTO "customers" ("name","subtext","sortOrder") VALUES ('ĐH Xây dựng Miền Tây', 'Nguồn Nhân Lực Chất Lượng Cao', 8);
INSERT INTO "customers" ("name","subtext","sortOrder") VALUES ('Cục CT Phía Nam', 'Bộ Xây dựng', 9);

-- consulting_services
INSERT INTO "consulting_services" ("title","description","iconName","sortOrder") VALUES ('Tư vấn Đơn giá Xây dựng & Máy thi công', 'Hỗ trợ các Sở Xây dựng khảo sát giá thị trường nhân công, tính toán nguyên lý giá ca máy bám sát Thông tư 11/2021/TT-BXD, số hóa đơn giá đưa lên máy chủ quốc gia.', 'Gavel', 0);
INSERT INTO "consulting_services" ("title","description","iconName","sortOrder") VALUES ('Xây dựng Định mức hạ tầng kỹ thuật đặc thù', 'Thiết lập định mức chi tiết cho các công tác xây lắp đặc thù địa phương (như duy tu hạ tầng kỹ thuật, cấp thoát nước, bảo dưỡng hạ tầng đường sắt) chưa có trong định mức Bộ Xây dựng.', 'FileText', 1);

-- courses
INSERT INTO "courses" ("slug","title","scheduleText","duration","format","price","coupon","slots","trainer","sortOrder","updatedAt") VALUES ('dutoan-thucchien', 'Lập Dự toán & Đo bóc khối lượng công trình', 'Khai giảng ngày 15 hằng tháng', '12 buổi (Tối Thứ 2-4-6)', 'Trực tiếp tại VP & Trực tuyến qua Zoom', '1.800.000 VNĐ', 'Giảm 15% khi thanh toán sớm', 'Chỉ còn 6 chỗ trống', 'Kỹ sư cao cấp Vũ Hoàng Nam (Mạng đấu thầu BNSC)', 0, CURRENT_TIMESTAMP);
INSERT INTO "courses" ("slug","title","scheduleText","duration","format","price","coupon","slots","trainer","sortOrder","updatedAt") VALUES ('dauthau-mang', 'Nghiệp vụ Đấu thầu qua mạng thế hệ mới', 'Khai giảng ngày 20 hằng tháng', '4 buổi (Thứ 7 & Chủ Nhật)', 'Trực tuyến Zoom có quay lưu bài giảng', '1.200.000 VNĐ', 'Tặng kèm giáo trình đấu thầu mới nhất', 'Chỉ còn 3 chỗ trống', 'Thạc sĩ Phan Văn Đạt (Trọng tài viên Kinh tế XD)', 1, CURRENT_TIMESTAMP);

-- faqs
INSERT INTO "faqs" ("scope","question","answer","sortOrder") VALUES ('HOME', 'Phần mềm dự toán BNSC có xuất được bảng tính toán thép chi tiết không?', 'Hoàn toàn được. BNSC tích hợp module đo bóc cốt thép chi tiết, cho phép liệt kê kích thước, đường kính, trọng lượng và tự động tổng hợp bảng thống kê hình dạng thép liên kết động sang Excel.', 0);
INSERT INTO "faqs" ("scope","question","answer","sortOrder") VALUES ('HOME', 'Bộ đơn giá nhân công & ca máy do Bắc Nam tư vấn có tính pháp lý như thế nào?', 'Bộ cơ sở dữ liệu do BNSC xây dựng được thẩm định qua Hội đồng liên ngành Sở Tài chính - Sở Xây dựng và ban hành chính thức dưới Quyết định của UBND tỉnh, có giá trị pháp lý bắt buộc áp dụng trực tiếp.', 1);
INSERT INTO "faqs" ("scope","question","answer","sortOrder") VALUES ('HOME', 'Tôi tự học có sử dụng được phần mềm không? Có tài liệu không?', 'Rất dễ dàng. Bắc Nam cung cấp hệ thống video mẫu có thuyết minh từ cơ bản đến nâng cao, kết hợp tài liệu hướng dẫn file PDF 150 trang chi tiết từng bước. Ngoài ra chúng tôi hỗ trợ cài đặt qua UltraViewer miễn phí.', 2);
INSERT INTO "faqs" ("scope","question","answer","sortOrder") VALUES ('SUPPORT', 'Làm thế nào để kích hoạt bản quyền BNSC khi có khóa cứng?', 'Anh/chị vui lòng cắm khóa cứng USB vào máy tính, mở phần mềm Dự toán BNSC lên, hệ thống sẽ tự động nhận diện Key bản quyền. Nếu hiện thông báo "Chưa có thiết bị", hãy gọi tổng đài kỹ thuật để nhận Driver hỗ trợ.', 0);
INSERT INTO "faqs" ("scope","question","answer","sortOrder") VALUES ('SUPPORT', 'Phần mềm Dự toán BNSC có chạy được trên Excel 64-bit không?', 'Dự toán BNSC chạy ổn định 100% trên cả Excel 32-bit và Excel 64-bit (từ phiên bản Office 2013 đến Office 365 mới nhất hiện nay).', 1);
INSERT INTO "faqs" ("scope","question","answer","sortOrder") VALUES ('SUPPORT', 'Làm sao để cập nhật đơn giá, định mức các Tỉnh thành mới nhất?', 'Mở phần mềm BNSC -> Chọn menu "Tính năng" -> Click "Tải đơn giá" -> Chọn Tỉnh thành cần làm việc và nhấn tải về hoàn toàn miễn phí.', 2);

-- support_staff
INSERT INTO "support_staff" ("name","phone","role","ext","sortOrder") VALUES ('Kỹ sư Hoàng Lâm', '0966966455', 'Trưởng bộ phận kỹ thuật', 'Nhánh 1', 0);
INSERT INTO "support_staff" ("name","phone","role","ext","sortOrder") VALUES ('Kỹ sư Quốc Khánh', '0981757527', 'Support BNSC phía Nam', 'Nhánh 2', 1);
INSERT INTO "support_staff" ("name","phone","role","ext","sortOrder") VALUES ('Kỹ sư Minh Đức', '0903310052', 'Tư vấn Chuyển giao & Đào tạo', 'Nhánh 3', 2);

-- remote_tools
INSERT INTO "remote_tools" ("name","description","version","url","realUrl","badge","sortOrder") VALUES ('UltraViewer (Khuyên dùng)', 'Phần mềm điều khiển máy tính xa cực nhẹ, phổ biến nhất tại Việt Nam. Được đội ngũ BNSC sử dụng để cài đặt trực tiếp cho khách hàng.', 'v6.6 (Bản mới nhất)', 'https://www.ultraviewer.net/vi/download.html', NULL, 'Bao gồm bộ cài sửa lỗi', 0);
INSERT INTO "remote_tools" ("name","description","version","url","realUrl","badge","sortOrder") VALUES ('TeamViewer Toàn cầu', 'Công cụ kết nối từ xa tiêu chuẩn quốc tế ổn định cao. Thích hợp cho doanh nghiệp có chính sách bảo mật mạng nội bộ nghiêm ngặt.', 'Bản Portable không cần cài', 'https://www.teamviewer.com/vi/download/windows/', 'https://www.teamviewer.com/vi/download/windows/', 'Kết nối mã hóa AES-256', 1);

COMMIT;
