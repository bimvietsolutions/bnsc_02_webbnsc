# 03. Kiến trúc web động đề xuất

## 1. Quyết định kiến trúc

Giữ **React/Vite + Express + PostgreSQL** để giảm phạm vi thay đổi. Chưa cần chuyển framework ở phase đầu. Bổ sung:

- React Router cho URL thật.
- REST API versioned `/api/v1`.
- PostgreSQL + ORM/migration (đề xuất Prisma hoặc Drizzle; chọn một).
- Admin CMS trong cùng repo, route `/admin`.
- Zod (hoặc tương đương) để validate request/response.
- Object storage S3-compatible cho media; giai đoạn đầu có thể dùng volume riêng nhưng phải có backup.
- Session cookie cho admin; phân quyền RBAC.

Luồng:

```text
Browser -> Caddy HTTPS -> Express :3000
                         |- /api/v1/* -> service -> PostgreSQL
                         |- /uploads hoặc object storage
                         `- static React dist + SPA fallback
GitHub Actions -> Registry -> VPS deploy immutable image
```

## 2. Ranh giới nội dung động

### Phase nội dung công khai

- Site settings: tên công ty, hotline, email, social, SEO.
- Menu và announcement.
- Hero slides và statistics.
- Products/services.
- Courses/training.
- News/articles/categories/tags.
- Knowledge library/documents.
- Customers/partners.
- Support staff, FAQ, download tools.

### Phase giao dịch

- Lead đăng ký/tư vấn.
- Download request và download asset.
- Support ticket.
- Article feedback/view.
- User/admin authentication.

Chat AI để riêng: cấu hình system prompt/model qua server settings, không cho public admin sửa tự do nếu chưa có version/audit.

## 3. Mô hình dữ liệu tối thiểu

| Bảng | Trường chính |
|---|---|
| `users` | id, email, password_hash, status, last_login_at |
| `roles`, `user_roles` | role và liên kết phân quyền |
| `site_settings` | key, value_json, is_public |
| `menus`, `menu_items` | label, url, parent_id, sort_order, status |
| `announcements` | title, cta_label, cta_url, starts_at, ends_at, status |
| `media_assets` | key/url, mime_type, size, alt_text, width, height |
| `hero_slides` | title, caption, media_id, link_type, link_value, sort_order |
| `statistics` | value, label, sort_order |
| `products` | slug, name, summary, version, badge, status, seo fields |
| `product_features` | product_id, content, sort_order |
| `courses` | slug, title, schedule, duration, format, price, capacity, status |
| `categories` | id, type, name, slug, parent_id |
| `articles` | slug, title, excerpt, content, cover_media_id, author_id, status, published_at, view_count |
| `article_categories`, `article_tags` | many-to-many |
| `documents` | slug, title, file_media_id, category_id, status |
| `customers` | name, subtext, logo_media_id, sort_order, status |
| `faqs` | scope, question, answer, sort_order, status |
| `support_staff` | name, phone, role, extension, active |
| `leads` | type, full_name, phone, email, company, province, payload_json, status |
| `support_tickets` | requester fields, subject, message, status, assignee_id |
| `downloads` | asset_id, requester/lead_id, ip_hash, user_agent, created_at |
| `audit_logs` | actor_id, action, entity_type, entity_id, before_json, after_json |

Nguyên tắc:

- ID dùng UUID/ULID; URL dùng unique slug.
- Thời gian lưu UTC, hiển thị Asia/Bangkok.
- Bản ghi public có `status`, `published_at`; không xóa cứng nội dung quan trọng.
- Rich text phải sanitize server-side. Ưu tiên Markdown hoặc editor JSON có whitelist.
- Settings có schema; không biến `site_settings` thành nơi nhét mọi dữ liệu tùy ý.

## 4. API tối thiểu

### Public read

```text
GET /api/v1/home
GET /api/v1/products
GET /api/v1/courses
GET /api/v1/articles?category=&q=&page=&limit=
GET /api/v1/articles/:slug
GET /api/v1/library?category=&q=&page=
GET /api/v1/site-config
```

`/home` nên trả payload tổng hợp để tránh nhiều request khi tải trang đầu. Dùng cache header/ETag phù hợp.

### Public write

```text
POST /api/v1/leads
POST /api/v1/support-tickets
POST /api/v1/download-requests
POST /api/chat
```

Tất cả endpoint write có validation, rate limit, honeypot/CAPTCHA khi cần, log và idempotency phù hợp.

### Admin

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
CRUD /api/v1/admin/articles
CRUD /api/v1/admin/products
CRUD /api/v1/admin/courses
CRUD /api/v1/admin/media
GET/PATCH /api/v1/admin/leads/:id
GET/PATCH /api/v1/admin/support-tickets/:id
```

## 5. Chiến lược chuyển đổi không gián đoạn

1. Tách mọi mảng hardcode thành repository/service interface.
2. Tạo seed từ dữ liệu hiện tại để giao diện không đổi.
3. API trả DTO giống props đang dùng.
4. Frontend dùng data hook có loading/error/empty state.
5. Chuyển lần lượt: site config → home → products/courses → articles/library → support → forms/auth.
6. Giữ fallback hardcode có thời hạn trong development; production phải fail rõ thay vì âm thầm hiển thị dữ liệu cũ.
7. Sau khi đối chiếu số lượng và nội dung, xóa dữ liệu trùng trong component.

## 6. Routing và SEO

- `/` trang chủ.
- `/tin-tuc`, `/tin-tuc/:slug`.
- `/thu-vien`, `/thu-vien/:slug`.
- `/san-pham/:slug`, `/dao-tao/:slug`.
- `/ho-tro-ky-thuat`, `/dang-nhap`, `/admin`.
- Server trả metadata phù hợp từng bài. Nếu SEO là mục tiêu quan trọng, cân nhắc SSR/prerender ở phase sau; trước mắt tạo sitemap, canonical, OpenGraph và JSON-LD.

