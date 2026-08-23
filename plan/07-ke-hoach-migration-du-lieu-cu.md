# 07 — Kế hoạch chuẩn hóa & tích hợp dữ liệu website cũ (bacnamco_beta)

> Nguồn: `F:\2026\BNSC\0.VPS\2.Projects\2.bacnam.com\bacnamco_beta.json\` (export phpMyAdmin, 5 bảng).
> Đích: `bnsc-software-website` (React 19 + Vite + Express + Prisma/PostgreSQL).
> Ngày lập: 2026-08-22.

---

## 1. Kết quả đọc dữ liệu cũ

### 1.1 Khối lượng

| Bảng | Số dòng | Vai trò |
|---|---:|---|
| `categories` | 22 | Cây danh mục 2 cấp (4 nhánh gốc) |
| `posts` | 555 | Toàn bộ nội dung (tin tức + hướng dẫn + tư vấn + đào tạo) |
| `images` | 2.660 | Sổ đăng ký ảnh đã upload (5 biến thể kích thước / ảnh) |
| `series` | 146 | Mục lục giáo trình "DỰ TOÁN BNSC" (Phần I→V) |
| `tags` | 887 | Gán thẻ cho bài (171 tên thẻ → **157 slug** sau khi gộp trùng hoa/thường) |

- Trải dài **2013-05-18 → 2026-06-15**; tổng **1.768.908 lượt xem**.
- Nội dung là **HTML** (trung bình ~19,6 KB/bài), không phải plain text.
- `status=1`: 552 bài; `status=0`: 3 bài (nháp). `visibility=1` toàn bộ. `lang_id=1` toàn bộ (một ngôn ngữ).
- **Không có slug trùng** → dùng lại `title_slug` an toàn.

### 1.2 Cây danh mục và phân bổ bài

```
[1]  Tin tức (tin-tuc)                                            378 bài
     ├── [9]  Nội bộ (noi-bo)                                      22
     ├── [10] Chuyên ngành (chuyen-nganh)                          94
     ├── [11] Văn bản QPPL (van-ban-qppl)                         260
     └── [5]  Khuyến mãi (khuyen-mai)                               1
[13] Dự toán BNSC (du-toan-bnsc)                                  128 bài
     ├── [24] Download (download)                                   1
     ├── [7]  Cài đặt (cai-dat-du-toan-bnsc)                       23
     ├── [15] Sử dụng (su-dung-du-toan-bnsc)                       63
     ├── [23] Thẩm định (tham-dinh-du-toan-bnsc)                    2
     ├── [17] Tình huống khác (tinh-huong-khac-du-toan-bnsc)       34
     └── [30] Lập Dự toán - Dự thầu (lap-du-toan-du-thau)           5
[4]  Tư vấn (tu-van-ktxd)                                          36 bài   <-- CHƯA CÓ Ở WEB MỚI
     ├── [21] Chỉ số giá XD (chi-so-gia-xd)                         2
     ├── [20] Đơn giá (don-gia)                                    34
     ├── [19] Định mức (dinh-muc)                                   0
     └── [22] Khác (khac)                                           0
[14] Đào Tạo (tuyen-dung)                                           8 bài   <-- CHƯA CÓ Ở WEB MỚI
     ├── [26] Dự toán (nghiep-vu-lap-du-toan)                       4
     ├── [27] Đấu thầu (nghiep-vu-dau-thau)                         1
     ├── [28] Thanh Quyết toán (nghiep-vu-thanh-quyet-toan)         0
     └── [25] Nghiệp vụ khác (nghiep-vu-qlxd)                       3
(không danh mục)                                                    5 bài
```

**Khớp 100%** giữa nhánh `Dự toán BNSC` cũ ↔ `library_categories` mới, và `Tin tức` cũ ↔ `news_categories` mới.
**Lệch**: hai nhánh `Tư vấn` (36 bài) và `Đào tạo` (8 bài) hiện chỉ là *card tĩnh* trên web mới, không có bài viết.

### 1.3 Bảng `series` — mục lục giáo trình (tài sản quan trọng nhất)

Một cây gốc **"DỰ TOÁN BNSC"** gồm 5 phần, 140 mục con có thứ tự:

| Phần | Số mục | Đã trỏ tới bài |
|---|---:|---:|
| Phần I – Cài đặt | 23 | 22 |
| Phần II – Sử dụng | 75 | 60 |
| Phần III – Thẩm định | 2 | 2 |
| Phần IV – Tình huống khác | 33 | 33 |
| Phần V – Lập Dự toán - Dự thầu | 5 | 3 |

Ngoài ra còn 2 node rác tự trỏ vào chính nó ("Menu 1-1", "Năm 2021") — không có bài,
không có mục con; script import tách khỏi cây và tắt hiển thị.

- 120/128 bài thư viện nằm trong series; 8 bài ngoài series; 26 mục series chưa có bài (placeholder).
- Đây là **cấu trúc điều hướng "Trước / Sau / Mục lục"** mà web mới hoàn toàn chưa có (Thư viện mới chỉ có tab phẳng + nút "xem thêm").

### 1.4 Media & liên kết trong nội dung

| Hạng mục | Số lượng |
|---|---:|
| **Tổng ảnh cần mirror (đã đo thực tế)** | **12.104 URL / 2,83 GB** |
| `<img>` trong nội dung | 3.281 thẻ / **2.224 URL khác nhau** |
| Ảnh đại diện bài (5 biến thể) | **1.461 file khác nhau** |
| Bản ghi bảng `images` | 2.660 |
| Bài không có ảnh đại diện | 67 |
| Bài có link YouTube | 314 (51 link `youtube.com` + 252 `youtu.be`) |
| Bài có `<iframe>` nhúng | 57 |
| Bài có link Google Drive | 279 (**525 link** — nơi chứa bộ cài & tài liệu tải về) |
| Link file `.pdf` trực tiếp | 215 |
| Link tới cổng thông tin Sở Xây dựng 63 tỉnh | ~1.100 |

> **Toàn bộ ảnh trỏ về `https://bacnam.com.vn/uploads/images/YYYY/MM/...`. Bản export KHÔNG kèm file ảnh.**

Thẻ HTML dùng trong nội dung: `span` (32k), `strong` (19k), `p` (15k), `em` (8k), `a` (7,3k), `td` (6,7k), `br`, `li`, `img`, `table` (596), `iframe` (57), `h1` (124). Nội dung còn chứa **HTML entity chưa giải mã** (`&ocirc;`, `&agrave;`, `&yacute;`…).

### 1.5 Cờ biên tập & metadata

| Trường | Giá trị | Web mới |
|---|---|---|
| `is_slider` = 1 | **29 bài** (băng chuyền trang chủ) | có bảng `hero_slides` riêng, nhập tay |
| `is_featured` = 1 | 3 bài | ✗ |
| `is_recommended` = 1 | 8 bài | ✗ |
| `is_breaking` = 1 | 2 bài | ✗ |
| `pageviews` | tổng 1,77 triệu | có `views` nhưng **không có API tăng view** |
| `keywords` | 79 bài có | ✗ (có `metaTitle/metaDescription`, thiếu keywords) |
| `summary` | 161/555 bài có | `excerpt` **bắt buộc** ở schema mới → 394 bài sẽ rỗng |
| `post_type` | article 532 / video 18 / article_slider 4 / article_service 1 | ✗ |
| `optional_url` | 5 bài (URL thay thế) | ✗ |
| `created_at` / `updated_at` | timestamp thật | mới chỉ có `dateText` chuỗi hiển thị |

---

## 2. Rà soát hiện trạng website mới

### 2.1 Những gì đã có và dùng lại được

- Prisma schema đầy đủ 19 model, seed SQL, admin CRUD generic (`server/resources.ts` + `src/admin/resources.tsx`).
- API công khai `/api/public/*` + cơ chế **fallback tĩnh** (`src/lib/publicData.ts`) — site không trắng khi DB lỗi.
- Router đã tách trang: `/tin-tuc`, `/tin-tuc/:slug`, `/thu-vien`, `/thu-vien/:slug`, `/ho-tro-ky-thuat`, `/admin/*`.
- SEO: `src/seo/Seo.tsx`, `structuredData.ts`, `sitemap.xml`, `robots.txt`.
- Upload ảnh admin (`server/routes.upload.ts` → `public/uploads/`) — dùng lại được cho bước mirror ảnh.
- Danh mục Thư viện & Tin tức **đã trùng khớp** danh mục cũ → không cần ánh xạ thủ công.

### 2.2 Khoảng cách phải xử lý (gap)

| # | Vấn đề | Vị trí | Mức độ |
|---|---|---|---|
| G1 | **Nội dung render dạng plain text** — `whitespace-pre-line` + `{article.contentBody}`. Đổ 555 bài HTML vào sẽ hiện ra thẻ thô. | [NewsDetailPage.tsx:113-114](../src/pages/NewsDetailPage.tsx#L113-L114) | 🔴 Chặn |
| G2 | **`/api/public/news` trả TOÀN BỘ bài kèm `contentBody`**, không phân trang, không projection. 378 bài × ~19KB ≈ **7 MB/request**. | [routes.public.ts:101-110](../server/routes.public.ts#L101-L110) | 🔴 Chặn |
| G3 | Tương tự cho `/api/public/library` (128 bài). | [routes.public.ts:124-134](../server/routes.public.ts#L124-L134) | 🔴 Chặn |
| G4 | **Thiếu chỗ chứa 2 nhánh Tư vấn (36 bài) & Đào tạo (8 bài)** — schema chỉ có News/Library. | [schema.prisma](../db/schema.prisma) | 🔴 Chặn |
| G5 | **Không có model Tag** (171 thẻ, trong đó bộ sưu tập giá trị cao: "Tổng hợp đơn giá 63 tỉnh thành theo TT 13/2021" — 76 bài). | [schema.prisma](../db/schema.prisma) | 🟠 Cao |
| G6 | **Không có model Series** — mất toàn bộ mục lục giáo trình 5 phần / 140 mục. | [schema.prisma](../db/schema.prisma) | 🟠 Cao |
| G7 | **Tab danh mục hardcode** trong code thay vì lấy từ DB. | [NewsSection.tsx:19](../src/components/NewsSection.tsx#L19), [EstimationLibrary.tsx:16-24](../src/components/EstimationLibrary.tsx#L16-L24) | 🟠 Cao |
| G8 | `CategoryType` là union 4 giá trị cứng → thêm danh mục là lỗi biên dịch. | [types.ts:7](../src/types.ts#L7) | 🟠 Cao |
| G9 | **Không phân trang / tìm kiếm phía server**; lọc & search chạy client trên toàn mảng, `visibleCount` mặc định 8. | [NewsSection.tsx](../src/components/NewsSection.tsx), [EstimationLibrary.tsx](../src/components/EstimationLibrary.tsx) | 🟠 Cao |
| G10 | **Không có 301 redirect** cho URL cũ dạng `bacnam.com.vn/<slug>` (gốc, không tiền tố) → mất toàn bộ SEO của 555 URL đang có index. | [server.ts](../server.ts) | 🟠 Cao |
| G11 | `sitemap.xml` **tĩnh** trong `public/`, không sinh từ DB. | [public/sitemap.xml](../public/sitemap.xml) | 🟡 TB |
| G12 | **Không có endpoint tăng lượt xem** — `views` sẽ đóng băng ở số import. | [routes.public.ts](../server/routes.public.ts) | 🟡 TB |
| G13 | Admin sửa nội dung bằng **`<textarea>` thuần**, không có rich-text editor / chèn ảnh. | [admin/resources.tsx](../src/admin/resources.tsx), [ResourceForm.tsx](../src/admin/ResourceForm.tsx) | 🟠 Cao |
| G14 | `ResourceList` **nạp toàn bộ bản ghi**, không phân trang → admin sẽ treo với 555 bài. | [ResourceList.tsx](../src/admin/ResourceList.tsx) | 🟠 Cao |
| G15 | `ArticleDetailPage` (943 dòng) chứa **rất nhiều markup tĩnh** (khối video, CTA YouTube, hộp download, "bộ quà tặng") không lấy từ dữ liệu. | [ArticleDetailPage.tsx](../src/components/ArticleDetailPage.tsx) | 🟠 Cao |
| G16 | `excerpt` là **NOT NULL** nhưng 394/555 bài cũ không có `summary`. | [schema.prisma](../db/schema.prisma) | 🟡 TB |
| G17 | Chỉ có `dateText` (chuỗi) làm nguồn ngày hiển thị; dữ liệu cũ có timestamp thật cần dùng để sắp xếp. | [schema.prisma](../db/schema.prisma) | 🟡 TB |
| G18 | Không có trang tag, trang mục lục giáo trình, "bài liên quan", "bài trước/sau". | [src/pages/](../src/pages/) | 🟡 TB |
| G19 | Ảnh cũ (2.224 URL) **hotlink về bacnam.com.vn** — mất hết nếu site cũ tắt. | — | 🔴 Chặn |
| G20 | Chưa có sanitize HTML → nhận nội dung HTML từ import/admin là **rủi ro XSS**. | — | 🔴 Chặn |

---

## 3. Mô hình dữ liệu chuẩn hóa (đề xuất)

### 3.1 Nguyên tắc

1. **Hợp nhất `NewsArticle` + `LibraryArticle` thành một model `Article`** phân biệt bằng `section`. Lý do: hai bảng hiện đã ~90% trùng cột; thêm Tư vấn/Đào tạo sẽ thành 4 bảng gần y hệt nhau. Một bảng → một API, một form admin, một cơ chế tag/search/sitemap.
2. **`Category` thành cây** (`parentId`) + `section`, thay cho 2 bảng danh mục phẳng.
3. **Giữ nguyên tầng adapter** `src/lib/publicData.ts` (`mapNews`, `mapLibrary`) → component hiện tại gần như không phải sửa shape.
4. **Lưu HTML đã làm sạch** (`contentHtml`) + **bản text thuần** (`contentText`) để phục vụ tìm kiếm và sinh `summary`.
5. **Bảo toàn ID & đường dẫn cũ** (`legacyId`, `legacyPath`) để dựng redirect và đối soát.

### 3.2 Schema đề xuất

```prisma
enum ContentSection { NEWS LIBRARY CONSULTING TRAINING }

model Category {
  id             Int      @id @default(autoincrement())
  slug           String   @unique
  name           String
  title          String?              // tiêu đề SEO của danh mục
  section        ContentSection
  parentId       Int?
  parent         Category?  @relation("CatTree", fields: [parentId], references: [id])
  children       Category[] @relation("CatTree")
  description    String?  @db.Text
  keywords       String?
  color          String?              // từ categories.color
  emoji          String?              // giữ emoji tab của EstimationLibrary
  sortOrder      Int      @default(0)
  showOnMenu     Boolean  @default(true)
  showAtHomepage Boolean  @default(false)
  isActive       Boolean  @default(true)
  articles       Article[]
  legacyId       Int?     @unique
  @@index([section, sortOrder])
  @@map("categories")
}

model Article {
  id              Int      @id @default(autoincrement())
  slug            String   @unique          // = posts.title_slug (đã kiểm tra không trùng)
  title           String
  summary         String?  @db.Text         // KHÔNG bắt buộc; tự sinh nếu rỗng
  contentHtml     String?  @db.Text         // HTML đã sanitize + rewrite URL
  contentText     String?  @db.Text         // text thuần, phục vụ search/excerpt
  section         ContentSection
  categoryId      Int?
  category        Category? @relation(fields: [categoryId], references: [id])

  coverUrl        String?                    // image_default (750x)
  thumbUrl        String?                    // image_mid (380x226)
  coverAlt        String?                    // image_description
  videoUrl        String?
  embedHtml       String?  @db.Text          // video_embed_code
  attachmentUrl   String?
  attachmentName  String?
  attachmentSize  String?

  author          String?
  publishedAt     DateTime?                  // = posts.created_at
  sourceUpdatedAt DateTime?                  // = posts.updated_at
  dateText        String?                    // ghi đè hiển thị (tùy chọn)
  views           Int      @default(0)

  isPublished     Boolean  @default(true)
  isFeatured      Boolean  @default(false)
  isRecommended   Boolean  @default(false)
  isBreaking      Boolean  @default(false)
  isSlider        Boolean  @default(false)
  sliderOrder     Int      @default(0)

  metaTitle       String?
  metaDescription String?  @db.Text
  metaKeywords    String?
  ogImage         String?
  canonicalUrl    String?                    // = posts.optional_url

  tags            Tag[]        @relation("ArticleTags")
  seriesNodes     SeriesNode[]

  legacyId        Int?     @unique           // posts.id
  legacyPath      String?                    // "/<title_slug>" URL gốc cũ
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([section, isPublished, publishedAt])
  @@index([categoryId])
  @@index([isSlider, sliderOrder])
  @@map("articles")
}

model Tag {
  id       Int       @id @default(autoincrement())
  slug     String    @unique
  name     String
  articles Article[] @relation("ArticleTags")
  @@map("tags")
}

model SeriesNode {                            // mục lục giáo trình
  id        Int          @id @default(autoincrement())
  title     String
  slug      String
  parentId  Int?
  parent    SeriesNode?  @relation("SeriesTree", fields: [parentId], references: [id])
  children  SeriesNode[] @relation("SeriesTree")
  articleId Int?
  article   Article?     @relation(fields: [articleId], references: [id])
  sortOrder Int          @default(0)
  isActive  Boolean      @default(true)
  legacyId  Int?         @unique
  @@index([parentId, sortOrder])
  @@map("series_nodes")
}

model Redirect {                              // 301 từ URL cũ
  id     Int     @id @default(autoincrement())
  from   String  @unique                      // "/vinh-long-quyet-dinh-325..."
  to     String
  status Int     @default(301)
  hits   Int     @default(0)
  @@map("redirects")
}
```

Bảng cũ `news_articles`, `library_articles`, `news_categories`, `library_categories` **giữ nguyên tới khi cutover xong** rồi mới drop (xem §6, P7).

### 3.3 Bảng ánh xạ trường (posts → Article)

| Cũ | Mới | Quy tắc |
|---|---|---|
| `id` | `legacyId` | giữ nguyên để đối soát |
| `title_slug` | `slug` + `legacyPath = "/" + slug` | đã kiểm tra không trùng |
| `title` | `title` | decode entity |
| `summary` | `summary` | rỗng → cắt 220 ký tự đầu của `contentText` |
| `content` | `contentHtml` | decode entity → sanitize → rewrite URL ảnh/link |
| — | `contentText` | strip tag từ `contentHtml` |
| `category_id` | `categoryId`, `section` | `section` = danh mục gốc của cây; 5 bài null → gán `Tin tức / Chuyên ngành` |
| `image_default` | `coverUrl` | prefix mirror `/uploads/legacy/...` |
| `image_mid` | `thumbUrl` | 〃 |
| `image_description` | `coverAlt` | |
| `video_embed_code` | `embedHtml` | 6 bài |
| `video_url` | `videoUrl` | |
| `pageviews` | `views` | |
| `created_at` | `publishedAt` | |
| `updated_at` | `sourceUpdatedAt` | |
| `status`, `visibility` | `isPublished` | `status=1 && visibility=1` |
| `is_featured` / `is_recommended` / `is_breaking` / `is_slider` | cùng tên | |
| `slider_order` | `sliderOrder` | |
| `keywords` | `metaKeywords` | |
| `optional_url` | `canonicalUrl` | 5 bài |
| `post_type` | — | bỏ; "video" suy ra từ `videoUrl` / `embedHtml` |
| `lang_id`, `need_auth`, `feed_id`, `show_*`, `title_hash`, `user_id`, `is_service`, `is_faq`, `is_scheduled` | — | bỏ (một ngôn ngữ, giá trị hằng) |

**Danh mục → section**: `Tin tức` → `NEWS`, `Dự toán BNSC` → `LIBRARY`, `Tư vấn` → `CONSULTING`, `Đào Tạo` → `TRAINING`.
Danh mục gốc giữ lại làm node cha (`parentId = null`); 18 danh mục con giữ `slug` cũ để URL không đổi.

---

## 4. Xử lý media (quyết định chặn tiến độ)

**Hiện trạng**: 2.224 URL ảnh trong nội dung + 1.461 file ảnh đại diện, tất cả trỏ `https://bacnam.com.vn/uploads/images/YYYY/MM/`. Export **không kèm file**.

**Phương án đề xuất — mirror về VPS**:

1. Script `scripts/mirror-legacy-media.mts`: gom toàn bộ URL duy nhất (từ `posts.image_*` + regex `<img src>` + bảng `images`), tải song song 6–8 luồng, có retry/backoff, lưu `public/uploads/legacy/<YYYY>/<MM>/<tên gốc>`.
2. Ghi `media-manifest.json` (url cũ → đường dẫn mới, trạng thái, kích thước) để bước ETL rewrite chính xác và để rà file hỏng.
3. Ảnh tải thất bại → giữ URL tuyệt đối cũ + đánh dấu trong báo cáo để xử lý tay.
4. **Số đo thực tế sau khi chạy**: 12.104 URL, tải thành công 12.092 (99,9%), **2,83 GB**.
   12 ảnh lỗi đều là HTTP 404 — đã mất sẵn trên site cũ, không phải do quá trình mirror.
   Phân bổ: ảnh nội dung 2.646 tệp/1,67 GB · `image_750x` 546 MB · `600x460` 393 MB ·
   `380x226` 158 MB · `140x98` 30 MB. Hai biến thể `600x460` và `140x98` (423 MB)
   giao diện mới không dùng tới — có thể xoá trước khi đẩy lên VPS nếu cần tiết kiệm.
5. Sau khi mirror: cân nhắc convert sang WebP + `loading="lazy"` để giảm tải.

**Điều kiện tiên quyết**: `bacnam.com.vn` phải **còn online** khi chạy mirror. Nếu đã tắt → phải xin bản backup thư mục `uploads/` từ hosting cũ. **Cần xác nhận trước khi bắt đầu P3.**

Link Google Drive (525) và link Sở Xây dựng (~1.100) **giữ nguyên tuyệt đối** — đó là nguồn ngoài, không mirror.

---

## 5. Kế hoạch API & Frontend

### 5.1 API công khai mới

```
GET  /api/public/articles
       ?section=NEWS|LIBRARY|CONSULTING|TRAINING
       &category=<slug>&tag=<slug>&q=<từ khóa>
       &page=1&pageSize=12&sort=newest|popular
     -> { items: [ {id,slug,title,summary,coverUrl,thumbUrl,category,
                    publishedAt,dateText,views,isFeatured} ], total, page, pageSize }
     ! KHÔNG trả contentHtml trong danh sách (đây là gốc của G2/G3)

GET  /api/public/articles/:slug        -> chi tiết + prev/next trong series + bài liên quan theo tag
POST /api/public/articles/:slug/view   -> tăng views (chống lặp bằng cookie / IP throttle)
GET  /api/public/categories?section=   -> cây danh mục (thay tab hardcode)
GET  /api/public/tags?section=         -> danh sách thẻ + số bài
GET  /api/public/series                -> cây mục lục giáo trình
GET  /sitemap.xml                      -> sinh động từ DB
```

Giữ `/api/public/news` và `/api/public/library` làm **alias tương thích ngược** (map sang `articles?section=`) cho tới khi frontend chuyển hết.

**Tìm kiếm tiếng Việt**: bật `pg_trgm` + cột `search_vector tsvector` (generated) trên `title || summary || contentText`, index GIN. Giai đoạn đầu có thể dùng `ILIKE` trên `title` để không chặn tiến độ.

### 5.2 Frontend

| Việc | File |
|---|---|
| Render HTML an toàn (`dangerouslySetInnerHTML` + CSS `prose`, table cuộn ngang, `img` responsive, `iframe` 16:9) | tạo `src/components/ArticleBody.tsx`; dùng ở [NewsDetailPage.tsx](../src/pages/NewsDetailPage.tsx), [ArticleDetailPage.tsx](../src/components/ArticleDetailPage.tsx) |
| Tab danh mục lấy từ API | [NewsSection.tsx:19](../src/components/NewsSection.tsx#L19), [EstimationLibrary.tsx:16](../src/components/EstimationLibrary.tsx#L16) |
| Bỏ union type cứng, dùng `string` | [types.ts:7](../src/types.ts#L7), [data/news.ts](../src/data/news.ts), [data/library.ts](../src/data/library.ts) |
| Phân trang + search server-side | [NewsListPage.tsx](../src/pages/NewsListPage.tsx), [LibraryListPage.tsx](../src/pages/LibraryListPage.tsx) |
| Trang mới `/tu-van`, `/tu-van/:slug`, `/dao-tao`, `/dao-tao/:slug` | [App.tsx](../src/App.tsx) + `src/pages/` |
| Trang `/tag/:slug` và `/huong-dan` (mục lục giáo trình + điều hướng Trước/Sau) | `src/pages/` |
| Hero slider lấy 29 bài `isSlider` từ DB (thay `hero_slides` nhập tay) | [Hero.tsx](../src/components/Hero.tsx) |
| Gỡ markup tĩnh, đưa về dữ liệu | [ArticleDetailPage.tsx](../src/components/ArticleDetailPage.tsx) |
| Thu gọn `publicData.ts`: fallback tĩnh chỉ giữ 6–8 bài mới nhất (không nhúng 555 bài vào bundle) | [publicData.ts](../src/lib/publicData.ts), [data/news.ts](../src/data/news.ts), [data/library.ts](../src/data/library.ts) |

### 5.3 Admin

| Việc | File |
|---|---|
| Rich-text editor (TipTap) cho `contentHtml`, có nút chèn ảnh từ thư viện | [ResourceForm.tsx](../src/admin/ResourceForm.tsx) |
| Phân trang + tìm kiếm + lọc theo section/danh mục ở danh sách | [ResourceList.tsx](../src/admin/ResourceList.tsx), [routes.admin.ts](../server/routes.admin.ts) |
| Resource mới: `articles`, `categories` (cây), `tags`, `series`, `redirects` | [admin/resources.tsx](../src/admin/resources.tsx), [server/resources.ts](../server/resources.ts) |
| Field type mới: `richtext`, `tags` (multi-select), `tree-select` | [ResourceForm.tsx](../src/admin/ResourceForm.tsx) |
| Thư viện media (duyệt `public/uploads`, chọn lại ảnh đã có) | mở rộng [routes.upload.ts](../server/routes.upload.ts) |

---

## 6. Lộ trình thực thi

| Giai đoạn | Nội dung | Đầu ra | Ước lượng |
|---|---|---|---|
| **P0 – Chốt & chuẩn bị** | Chốt 4 quyết định ở §8; kiểm tra `bacnam.com.vn` còn online; backup DB hiện tại; kiểm tra dung lượng VPS | biên bản chốt | 0,5 ngày |
| **P1 – Schema** | Thêm `Category / Article / Tag / SeriesNode / Redirect`; `prisma migrate`; giữ bảng cũ | migration chạy được | 1–1,5 ngày |
| **P2 – ETL import** | `scripts/import-legacy.mts`: decode entity → sanitize (`sanitize-html`) → rewrite URL → sinh `contentText` / `summary` → ghi DB; idempotent theo `legacyId`; xuất báo cáo đối soát | 555 bài + 22 danh mục + 171 tag + 146 node series trong DB | 2–3 ngày |
| **P3 – Mirror media** | `scripts/mirror-legacy-media.mts` + manifest + rewrite lại URL trong `contentHtml` | ~2.700 file trong `public/uploads/legacy/` | 1–2 ngày |
| **P4 – API** | Endpoint `articles / categories / tags / series` có phân trang; alias tương thích; view counter; sitemap động; middleware 301 từ bảng `Redirect` | API xanh, payload danh sách < 100 KB | 1–2 ngày |
| **P5 – Frontend** | `ArticleBody`, tab động, phân trang, 4 trang mới, tag & mục lục, hero từ `isSlider` | site chạy 555 bài thật | 3–4 ngày |
| **P6 – Admin** | Rich-text, phân trang, resource mới, media picker | biên tập viên tự vận hành được | 2–3 ngày |
| **P7 – QA & cutover** | Đối soát 555 URL cũ → 301; kiểm tra 100 bài ngẫu nhiên (ảnh, bảng, iframe); Lighthouse; submit sitemap; drop bảng cũ | checklist ký duyệt | 1 ngày |

**Tổng: ~12–17 ngày công.** P2 và P3 chạy song song được sau khi P1 xong.

### Checklist đối soát bắt buộc sau P2/P3

- [ ] `SELECT count(*) FROM articles` = 555 (hoặc 552 nếu bỏ nháp)
- [ ] Không bài nào chứa entity mã hoá hai lần (`&ocirc;`, `&agrave;`…).
      **Lưu ý:** `&amp;` `&lt;` `&gt;` là HTML hợp lệ do sanitize sinh ra — đừng tính là lỗi.
- [ ] Không bài nào còn `src="https://bacnam.com.vn/uploads` (ảnh chưa mirror)
- [ ] Tổng `views` = 1.768.908
- [ ] 157 tag, 146 series node, 120 node có `articleId`, đúng **1** node gốc đang hiển thị
- [ ] 555 dòng trong `redirects`, mọi `from` trả 301 tới trang 200
- [ ] Không `slug` trùng; mọi bài có `section` và `categoryId`

---

## 7. Rủi ro

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| Site cũ tắt trước khi mirror xong | Mất 2.700 ảnh, không phục hồi được | **Chạy P3 sớm nhất có thể**, ngay sau P1 |
| XSS từ HTML cũ / editor admin | Chiếm quyền phiên admin | `sanitize-html` allowlist ở **cả** ETL và API ghi; thêm CSP header |
| Payload API phình (G2) | Trang chủ tải 7 MB, Lighthouse sập | Bắt buộc projection + phân trang ở P4 **trước** khi import lên production |
| Mất SEO khi đổi URL | Tụt hạng 555 trang đang index | Bảng `Redirect` + 301, giữ nguyên slug, sitemap động, submit lại Google Search Console |
| Bảng HTML cũ vỡ layout mobile | 596 bảng trong nội dung | `.prose table { display:block; overflow-x:auto }` |
| 394 bài thiếu `summary` | Meta description rỗng, thẻ bài xấu | Tự sinh từ `contentText`, đánh dấu để biên tập rà lại |
| Dữ liệu tĩnh cũ trong `src/data/*.ts` chồng lấn dữ liệu thật | Hiển thị sai / nhân đôi | Thu gọn fallback còn 6–8 bài (§5.2) |

---

## 8. Bốn quyết định cần chốt trước khi code

1. **Hợp nhất `Article`** (khuyến nghị) hay giữ 2 bảng News/Library và thêm 2 bảng nữa cho Tư vấn/Đào tạo?
2. **Mirror ảnh về VPS** (khuyến nghị, ~400 MB) hay tiếp tục hotlink `bacnam.com.vn`?
3. **URL mới**: giữ tiền tố (`/tin-tuc/:slug`, `/thu-vien/:slug`) + 301 từ URL gốc cũ (khuyến nghị), hay bê nguyên URL gốc `/<slug>` để khỏi redirect?
4. **Phạm vi import**: cả 555 bài, hay 552 bài `status=1`, hay lọc thêm theo mốc thời gian?

---

## 9. Trạng thái thực hiện (cập nhật 2026-08-22)

Bốn quyết định ở §8 đã được chốt: **(1)** hợp nhất một bảng `Article`, **(2)** mirror ảnh
về VPS mới, **(3)** giữ tiền tố URL + 301 từ URL gốc cũ, **(4)** import cả 555 bài.

| Giai đoạn | Trạng thái | Ghi chú |
|---|---|---|
| P1 – Schema | ✅ Xong | Migration `20260822020049_unified_content_from_legacy` |
| P2 – ETL import | ✅ Xong | `scripts/legacy/` — idempotent, có báo cáo đối soát |
| P3 – Mirror media | ✅ Xong | 12.092/12.104 tệp, 2,83 GB, 12 lỗi đều là 404 sẵn có |
| P4 – API | ✅ Xong | `articles/categories/tags/series` + 301 + sitemap động |
| P5 – Frontend | ✅ Xong | 4 trang mảng + chi tiết + tag + mục lục giáo trình |
| P6 – Admin | ✅ Xong | Rich-text TipTap, phân trang, 5 resource mới |
| P7 – QA & cutover | ⏳ Còn lại | Đẩy ảnh lên VPS, deploy, submit sitemap, drop bảng cũ |

### Kết quả đối soát thực tế

| Chỉ tiêu | Kỳ vọng | Thực tế |
|---|---|---|
| Bài viết | 555 | ✅ 555 (NEWS 383 · LIBRARY 128 · CONSULTING 36 · TRAINING 8) |
| Tổng lượt xem | 1.768.908 | ✅ 1.768.908 |
| Danh mục / thẻ / mục lục / redirect | 22 / 157 / 146 / 555 | ✅ khớp cả 4 |
| Slug trùng, thiếu danh mục, thiếu ngày | 0 | ✅ 0 |
| Entity mã hoá hai lần | 0 | ✅ 0 |
| `<script>` / `onerror=` / `javascript:` còn sót | 0 | ✅ 0 |
| Cờ biên tập | slider 29 · nổi bật 3 · đề xuất 8 · tin nóng 2 · nháp 3 | ✅ khớp |
| Ảnh bìa đã mirror | — | 488 bài (67 bài vốn không có ảnh) |
| Bài còn hotlink về site cũ | — | 21 bài, đều trỏ 12 ảnh **đã 404 sẵn** trên bacnam.com.vn |
| Payload `/api/public/articles` | < 100 KB | ✅ ~2,2 KB / 3 mục (trước đây ~7 MB) |

### Ba lỗi phát hiện trong lúc kiểm thử và đã sửa

1. **Mục lục có 3 gốc thay vì 1** — DB cũ có 2 node tự trỏ vào chính nó
   (`parent_id = id`). ETL nay tách khỏi cây, tắt hiển thị và ghi cảnh báo.
2. **257/555 bài bị gắn nhãn video** — do bắt mọi link YouTube trong thân bài,
   trong khi phần lớn chỉ là dòng "đăng ký kênh" ở cuối. Nay chỉ nhận video nhúng
   bằng `<iframe>` (hoặc bài `post_type = video`) → còn đúng **62 bài**.
3. **iframe thiếu giao thức** (`//www.youtube.com/...`) — ép về `https://` khi import.

Ngoài ra: dự án chưa từng cài `@types/react`, nên toàn bộ mã React đang được
TypeScript suy kiểu `any`. Đã bổ sung `@types/react` + `@types/react-dom`; sau khi
cài, `tsc --noEmit` vẫn sạch 0 lỗi.

---

## 10. Runbook — chạy lại toàn bộ pipeline

### 10.1 Trên máy phát triển

```bash
# 1. CSDL cục bộ
docker compose -f db/docker-compose.yml up -d

# 2. Cấu hình .env
#    DATABASE_URL="postgresql://bnsc:bnsc_secret@localhost:5432/bnsc?schema=public"
#    APP_URL="http://localhost:3000"      # phải là URL http(s) thật, không để chuỗi giữ chỗ
#    JWT_SECRET="..."

# 3. Tạo bảng
npm run db:migrate

# 4. Nạp cấu hình site (settings, hero, sản phẩm, khóa học, FAQ, hỗ trợ...)
npm run db:seed

# 5. Mirror ảnh từ website cũ  (~2,8 GB, chạy lại được, bỏ qua tệp đã có)
npm run legacy:mirror
#    tuỳ chọn: --limit=50 để thử, --force để tải lại, --export=<thư mục> nếu đổi vị trí

# 6. Nạp 555 bài + danh mục + thẻ + mục lục + redirect
npm run legacy:import
#    tuỳ chọn: --dry-run xem trước, --only-published bỏ 3 bài nháp

# 7. Chạy
npm run dev        # http://localhost:3000
```

Chạy lại bước 5 và 6 bao nhiêu lần cũng được — cả hai đều idempotent
(mirror bỏ qua tệp đã tải, import upsert theo `legacyId`).

### 10.2 Đưa lên VPS

**Bối cảnh VPS (khảo sát 2026-08-22):** đăng nhập bằng `root`, **không cài node/npm**,
Docker 29.5, còn ~15 GB trống. Vì vậy mọi lệnh vận hành chạy **bên trong container**
dựng từ chính image vừa deploy — image đã chứa `db/`, `scripts/`, `prisma` CLI và `tsx`.
Không cần cài node lên host.

Đặt biến cho tiện gõ:

```bash
IMAGE=registry.bacnam.com.vn/bimvietsolutions/bnsc_02_webbnsc:latest
ENVF=/home/deploy_demobnsc/app/.env
UPL=/home/deploy_demobnsc/app/uploads
EXPORT=/home/deploy_demobnsc/app/legacy-export   # thư mục JSON export, chép lên bằng scp

# Chạy container bằng đúng uid/gid đang sở hữu thư mục uploads. Không ép về uid
# 1000 (user `node` trong image): user deploy trên VPS mang uid khác và không có
# quyền chown, nên ép là hỏng ngay ở bước tạo thư mục.
RUN_USER="$(stat -c %u:%g $UPL)"
```

**BẮT BUỘC làm trước khi merge PR** (khảo sát VPS 2026-08-22 phát hiện):

1. **`.env` thiếu `JWT_SECRET` và `APP_URL`.** Dòng thứ 4 của `.env` hiện là
   `demobnsc_secure_jwt_secret_key_2026_vps=...` — chuỗi đó nằm ở vị trí *tên biến*
   chứ không phải giá trị, nên `process.env.JWT_SECRET` rỗng và
   `server/auth.ts` rơi về chuỗi dự phòng `bnsc-dev-secret-CHANGE-ME` vốn nằm công
   khai trong mã nguồn: ai đọc repo cũng ký được cookie phiên admin hợp lệ. Bản này
   đã chuyển sang **ném lỗi** thay vì cảnh báo, nên container sẽ không khởi động
   được cho tới khi sửa:
   ```bash
   # sao lưu trước
   cp $ENVF $ENVF.bak
   sed -i 's/^demobnsc_secure_jwt_secret_key_2026_vps=/JWT_SECRET=/' $ENVF
   grep -q '^APP_URL=' $ENVF || echo 'APP_URL=https://bacnam.com.vn' >> $ENVF
   docker restart bnsc_demobnsc_app
   ```
   Nếu chuỗi đó vốn là *giá trị* chứ không phải tên biến thì thay bằng
   `echo 'JWT_SECRET=<chuỗi-ngẫu-nhiên-dài>' >> $ENVF` và xoá dòng cũ.

2. **Tên miền và lập chỉ mục.** Caddy đang phục vụ bản này ở
   `demobnsc.bacnam.com.vn`, còn `bacnam.com.vn` vẫn chạy trên VPS cũ. Vì vậy:
   - `APP_URL` phải là **tên miền đang thật sự phục vụ**, nếu không sitemap và thẻ
     canonical trỏ sang site khác.
   - `SITE_INDEXABLE` để **false** (mặc định) chừng nào chưa cắt tên miền. Bật lên
     là Google đánh chỉ mục 555 trang trùng nội dung với site thật.
   ```bash
   sed -i 's#^APP_URL=.*#APP_URL=https://demobnsc.bacnam.com.vn#' $ENVF
   grep -q '^SITE_INDEXABLE=' $ENVF || echo 'SITE_INDEXABLE=false' >> $ENVF
   ```
   Lúc cắt sang tên miền chính thức: đổi `APP_URL=https://bacnam.com.vn`, đặt
   `SITE_INDEXABLE=true`, thêm block Caddy cho `bacnam.com.vn`, rồi
   `docker restart bnsc_demobnsc_app`.

3. **Baseline CSDL — chạy MỘT LẦN.** CSDL `demobnsc_db` được dựng bằng `db.sql`
   qua pgAdmin nên không có bảng `_prisma_migrations`; `prisma migrate deploy`
   sẽ dừng với **P3005 "The database schema is not empty"**. Đánh dấu migration
   nền là đã áp (chỉ ghi nhận, không chạy SQL nào):
   ```bash
   docker run --rm --network pgnet --env-file $ENVF \
     registry.bacnam.com.vn/bimvietsolutions/bnsc_02_webbnsc:latest \
     npx prisma migrate resolve --applied 0_baseline --schema db/schema.prisma
   ```
   Sau bước này, `migrate deploy` chỉ áp migration thứ hai — thuần tạo 6 bảng mới
   (`articles`, `categories`, `tags`, `series_nodes`, `redirects`, `_ArticleTags`),
   không ALTER và không DROP bảng nào đang có. Đã kiểm chứng trên một CSDL mô phỏng
   đúng 19 bảng của VPS.

1. **Chép thư mục export lên VPS** (14 MB, từ máy dev):
   ```bash
   scp -r bacnamco_beta.json root@<vps>:/home/deploy_demobnsc/app/legacy-export
   ```

2. **Deploy** — merge vào `main`, GitHub Actions tự chạy. Pipeline đã lo:
   tạo `$UPL`, áp `prisma migrate deploy`, mount volume và chạy container bằng
   đúng uid sở hữu thư mục đó, rồi chặn ở `/health/ready` (truy vấn bảng `articles`).

3. **KHÔNG chạy `db:seed` trên VPS này.** CSDL `demobnsc_db` đã có sẵn dữ liệu cấu
   hình từ đợt dựng bằng `db.sql`, và `db:seed` gọi `deleteMany()` trên 8 bảng
   (`nav_links`, `hero_slides`, `hero_stats`, `customers`, `consulting_services`,
   `faqs`, `support_staff`, `remote_tools`) rồi ghi lại dữ liệu mặc định — mọi
   chỉnh sửa qua trang admin sẽ mất. Chỉ chạy trên CSDL trống:
   ```bash
   docker run --rm --network pgnet --env-file $ENVF $IMAGE npm run db:seed
   ```

4. **Tải ảnh** — chạy ngay trên VPS, nhanh hơn rsync 2,83 GB từ máy dev rất nhiều:
   ```bash
   docker run --rm --network pgnet --env-file $ENVF \
     -v $UPL:/app/public/uploads \
     -v $EXPORT:/export:ro \
     -e LEGACY_EXPORT_DIR=/export \
     --user "$RUN_USER" -e HOME=/tmp \
     $IMAGE npm run legacy:mirror
   ```
   Chạy lại được nhiều lần: tệp đã tải sẽ bỏ qua. Muốn tiết kiệm 423 MB thì xoá 2
   biến thể giao diện mới không dùng:
   ```bash
   find $UPL/legacy -name 'image_600x460_*' -o -name 'image_140x98_*' | xargs -r rm -f
   ```

5. **Nạp 555 bài viết**:
   ```bash
   docker run --rm --network pgnet --env-file $ENVF \
     -v $UPL:/app/public/uploads \
     -v $EXPORT:/export:ro \
     -e LEGACY_EXPORT_DIR=/export \
     --user "$RUN_USER" -e HOME=/tmp \
     $IMAGE npm run legacy:import
   ```
   Upsert theo `legacyId` nên chạy lại nhiều lần vẫn ra cùng kết quả.

6. **Biến môi trường**: `.env` phải có `JWT_SECRET` (đăng nhập admin) và
   `APP_URL=https://bacnam.com.vn` (sitemap + thẻ canonical). Thiếu `APP_URL` thì
   sitemap lùi về host của request; thiếu `JWT_SECRET` thì không đăng nhập admin được.
   Sửa `.env` xong phải `docker restart bnsc_demobnsc_app` — env-file chỉ đọc lúc tạo container.

7. **Kiểm tra sau deploy**:
   ```bash
   curl -s https://bacnam.com.vn/health/ready                       # {"status":"ready"}
   curl -sI https://bacnam.com.vn/<slug-cũ-bất-kỳ> | head -2        # 301
   curl -s https://bacnam.com.vn/sitemap.xml | grep -c "<loc>"      # ~734
   curl -sI https://bacnam.com.vn/uploads/legacy/images/... | head -2  # 200 + cache immutable
   ```
   Rồi nộp lại sitemap trong Google Search Console.

### 10.3 Lưu ý cấu hình đã thay đổi

- Tài nguyên tĩnh của trang chuyển từ `public/` sang **`static/`**
  (`vite.config.ts` → `publicDir: 'static'`). `public/uploads` nay **chỉ** chứa dữ liệu
  lúc chạy; nếu để trong publicDir thì mỗi lần build Vite copy cả 2,8 GB vào `dist/`
  (build từng mất 1m37s / 2,8 GB, nay còn 5s / 754 KB).
- `.dockerignore` đã loại `public/uploads` khỏi build context.
- `sitemap.xml` **chỉ** do `GET /sitemap.xml` sinh động từ CSDL. Bản tĩnh trong
  `static/` đã bị xóa vì chứa slug hardcode đã chết và không bao giờ được phục vụ
  (route động đăng ký trước `express.static`).

## 11. Dọn dẹp mã nguồn cũ (2026-08-22)

Chốt: **`db/schema.prisma` là nguồn sự thật duy nhất của cấu trúc CSDL.** pgAdmin
chỉ dùng để xem/truy vấn dữ liệu, không dùng để tạo hay sửa bảng.

| Xóa | Lý do |
|---|---|
| `db/db.sql` | DDL viết tay, không biết 5 bảng nội dung mới; mở đầu bằng `DROP TABLE ... CASCADE`; 105 câu `INSERT` trùng với `db/seed.ts` |
| `db/generate-sql.mts` | Bộ sinh của `db.sql`, đã hỏng (đọc `db/_ddl.sql` không tồn tại) |
| `scripts/generate-sitemap.mts` + `static/sitemap.xml` | Sitemap tĩnh chứa slug hardcode đã chết; route động `GET /sitemap.xml` (734 URL) đăng ký trước `express.static` nên bản tĩnh không bao giờ được phục vụ |
| `src/data/news.ts`, `src/data/library.ts` | 13 tin + 20 bài thư viện giả; nội dung thật nằm ở bảng `articles` |
| `src/utils/slug.ts` | Chỉ hai file trên dùng; thành mã chết |

| Thêm / sửa | Nội dung |
|---|---|
| `db/schema.sql` (mới) | DDL thuần sinh từ Prisma (25 bảng, 5 enum). Có cảnh báo: không ghi `_prisma_migrations`, chỉ dùng khi máy không có Node |
| `db/seed.ts` | Bỏ `seedNews`/`seedLibrary` — không còn nạp dữ liệu giả vào hai bảng cũ; nay chỉ seed cấu hình site |
| `src/lib/publicData.ts` | `newsFallback`/`libraryFallback` → mảng rỗng; thêm kiểu `ApiHeroSlide` có `linkUrl` |
| `src/components/Hero.tsx` | **Sửa lỗi**: bấm vào slide trước đây điều hướng tới một slug tĩnh đã chết (404). Nay dùng `slide.linkUrl` do API trả về; slide không có link thì không bấm được |
| `src/data.ts` | Bỏ `newsData` (7 bài giả, 65 dòng) — không component nào dùng nữa |
| `package.json` | Bỏ script `sitemap` và bước `npm run sitemap` khỏi `build` |
| `db/README.md` | Viết lại mục "Cách 2 — pgAdmin", cập nhật bản đồ bảng và trình tự triển khai VPS |

Sinh lại `db/schema.sql` mỗi khi đổi schema:

```bash
npx prisma migrate diff \
  --from-empty --to-schema-datamodel db/schema.prisma \
  --script > db/schema.sql
```

Kiểm chứng sau dọn dẹp: `tsc --noEmit` 0 lỗi · `npm run build` 20s · `npm run db:seed`
chạy sạch · smoke-test bản production (cổng 3100): sitemap 734 URL, `/12-cap-nhat-phien-ban-moi`
→ 301, trang chủ render đủ section với dữ liệu thật (bài mới nhất "Nghị định 206/2026/NĐ-CP").

### 10.4 Sự cố đã gặp khi triển khai (2026-08-23)

**`DATABASE_URL` sai mật khẩu suốt 6 tuần mà không ai biết.** `demobnsc.bacnam.com.vn`
chưa bao giờ đọc được CSDL: mọi truy vấn trả 500, frontend lặng lẽ dùng dữ liệu tĩnh
dự phòng nên trang web trông vẫn bình thường (13 tin tức hiển thị là dữ liệu giả
trong bundle, không phải từ CSDL). Healthcheck `/health/live` không đụng CSDL nên
Docker vẫn báo `healthy`.

Đây chính là lý do đợt này thêm `/health/ready` (có `count()` trên bảng `articles`)
và dùng nó làm cổng kiểm tra khi deploy, thay cho `/health/live`.

Vài điểm khiến việc chẩn đoán dễ đi sai đường:

- Image Postgres chính thức đặt `trust` cho **cả** socket lẫn `127.0.0.1`. Thử mật
  khẩu bằng `docker exec postgres_x psql -h 127.0.0.1` luôn thành công kể cả khi
  mật khẩu sai. Muốn kiểm thật phải nối từ container khác qua mạng Docker:
  ```bash
  docker run --rm --network pgnet -e PGPASSWORD="$P" postgres:15 \
    psql -h postgres_demobnsc -U demobnsc_user -d demobnsc_db -Atc 'select 1'
  ```
- `POSTGRES_PASSWORD` chỉ có tác dụng lúc khởi tạo CSDL lần đầu; sửa biến này về
  sau không đổi mật khẩu thật. Ở đây nó lại đúng, còn `.env` mới là chỗ sai.
- Sửa `.env` bằng `mv` sẽ đổi chủ sở hữu tệp sang `root` và deploy (chạy bằng user
  `deploy_demobnsc`) không đọc được nữa. Ghi đè bằng `cat file > $ENVF` để giữ
  nguyên inode, quyền `600` và chủ sở hữu.
- `docker restart` **không** đọc lại `--env-file`. Sửa `.env` xong phải tạo lại
  container (deploy) thì thay đổi mới có hiệu lực.

**Chưa có tài khoản quản trị** (`admin_users` rỗng). Tạo sau khi deploy xong:
```bash
docker run --rm --network pgnet --env-file $ENVF $IMAGE \
  npm run db:create-admin -- admin@bacnam.com.vn "MatKhauManh" "Quản trị viên"
```
