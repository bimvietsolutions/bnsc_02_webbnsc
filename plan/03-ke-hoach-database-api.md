# 03. Kế hoạch database và API

## 1. Chọn công nghệ

Trước khi code, tạo ADR ngắn để chọn Prisma hoặc Drizzle theo tiêu chí:

- migration production;
- type safety;
- hỗ trợ PostgreSQL;
- seed và transaction;
- kích thước runtime;
- mức quen thuộc của đội.

Mặc định đề xuất PostgreSQL + một ORM duy nhất + Zod cho validation API.

## 2. Cấu trúc backend mục tiêu

```text
server/
  app.ts
  index.ts
  config/
  db/
    client.ts
    migrations/
    seed/
  middleware/
  modules/
    site-config/
    articles/
    products/
    courses/
    library/
    leads/
    support/
    auth/
    media/
  shared/
```

Mỗi module có route, schema validation, service, repository và test. Route không truy vấn DB trực tiếp.

## 3. Các đợt migration

### Migration A — Nền tảng

- users, roles, user_roles;
- site_settings;
- media_assets;
- audit_logs;
- index/constraint/timestamps chuẩn.

### Migration B — Nội dung trang chủ

- menus, menu_items;
- announcements;
- hero_slides;
- statistics;
- products, product_features;
- customers;
- faqs.

### Migration C — Nội dung dài

- categories, tags;
- articles, article_categories, article_tags;
- courses;
- documents/library;
- support_staff.

### Migration D — Nghiệp vụ

- leads;
- support_tickets;
- downloads;
- sessions nếu dùng DB session;
- notification_jobs/outbox nếu cần.

Mỗi migration phải additive, có index cho slug/status/published_at/foreign key và có kế hoạch rollback logic.

## 4. Seed dữ liệu hardcode

### Nguồn cần trích xuất

- `src/data.ts`;
- `NewsSection.tsx`;
- `Hero.tsx`;
- `Navbar.tsx`;
- `ConsultingAndTraining.tsx`;
- `EstimationLibrary.tsx`;
- `ArticleDetailPage.tsx`;
- `TechnicalSupportPage.tsx`;
- `Footer.tsx`, `FloatingActions.tsx`, `server.ts`.

### Quy trình

1. Chuẩn hóa dữ liệu về JSON/fixture có type.
2. Khử trùng lặp `newsData` và `LOCAL_NEWS_DATA`.
3. Sinh slug ổn định và kiểm tra unique.
4. Tách URL ngoài/media local.
5. Seed idempotent bằng stable key.
6. Xuất báo cáo count theo bảng.
7. So sánh giao diện trước/sau bằng screenshot và checklist nội dung.

Không seed mật khẩu, API key hoặc OAuth secret.

## 5. API theo lát dọc

### Slice 1 — Site config

```text
GET /api/v1/site-config
GET /api/v1/home
```

Payload gồm menu, announcement, hero, statistics, products nổi bật và customers. Có DTO rõ, ETag/cache và fallback lỗi được xác định.

### Slice 2 — Products/courses

```text
GET /api/v1/products
GET /api/v1/products/:slug
GET /api/v1/courses
GET /api/v1/courses/:slug
```

### Slice 3 — Articles

```text
GET /api/v1/articles
GET /api/v1/articles/:slug
GET /api/v1/categories
```

Yêu cầu:

- pagination có giới hạn tối đa;
- search được normalize;
- chỉ trả bài published cho public;
- view count không increment tùy tiện trên mỗi bot request;
- nội dung rich text đã sanitize.

### Slice 4 — Library/support

```text
GET /api/v1/library
GET /api/v1/library/:slug
GET /api/v1/support-config
```

### Slice 5 — Public writes

```text
POST /api/v1/leads
POST /api/v1/support-tickets
POST /api/v1/download-requests
POST /api/v1/articles/:id/feedback
```

Yêu cầu:

- Zod validation;
- body limit;
- rate limit theo IP/action;
- honeypot và CAPTCHA khi ngưỡng spam cao;
- consent/privacy fields;
- idempotency/deduplicate theo use case;
- không log toàn bộ PII.

## 6. Auth và admin API

- Password hash Argon2id.
- Session cookie `HttpOnly`, `Secure`, `SameSite`.
- CSRF protection cho mutation dùng cookie.
- RBAC: `admin`, `editor`, `support`.
- Login rate limit và audit failed attempts.
- Không trả password hash/session secret.
- Admin CRUD có optimistic concurrency hoặc `updated_at` check.
- Publish/unpublish và delete được audit.

## 7. Backup và migration production

1. Backup trước migration rủi ro.
2. Chạy migration bằng job riêng, không trong startup của mọi replica.
3. Có advisory lock.
4. Log migration version.
5. Readiness chỉ xanh khi schema version tương thích.
6. Restore rehearsal trên DB tách biệt.
7. Dùng expand/contract cho thay đổi phá vỡ.

## 8. Definition of Done cho mỗi endpoint

- Có OpenAPI hoặc contract được ghi rõ.
- Validation request/response.
- Unit test service và integration test DB.
- Authorization test nếu là admin.
- Error code/message nhất quán.
- Log không rò PII/secret.
- Index/query plan được xem xét cho list/search.
- Frontend đã xử lý loading/error/empty.

