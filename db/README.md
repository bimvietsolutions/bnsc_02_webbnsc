# CSDL BNSC — Kế hoạch chuyển nội dung hardcode sang PostgreSQL

Thư mục này chứa **cấu trúc cơ sở dữ liệu** (PostgreSQL + Prisma) để đưa toàn bộ
nội dung đang hardcode trên website vào DB, làm nền cho **trang admin quản trị**.

| File | Vai trò |
|---|---|
| `schema.prisma` | Định nghĩa toàn bộ bảng/quan hệ (nguồn sự thật). |
| `seed.ts` | Nạp toàn bộ nội dung hiện tại vào DB (idempotent). |
| `docker-compose.yml` | Dịch vụ PostgreSQL 16 cho VPS. |
| `.env.example` | Mẫu biến môi trường `DATABASE_URL`. |
| `migrations/` | (sinh tự động bởi `prisma migrate`) các file SQL. |

---

## 1. Sơ đồ quan hệ (ERD)

```mermaid
erDiagram
  NewsCategory   ||--o{ NewsArticle    : "phân loại"
  LibraryCategory||--o{ LibraryArticle : "phân loại"
  NavLink        ||--o{ NavLink        : "menu con"

  Setting {
    string key PK
    text   value
    string group
  }
  NewsArticle {
    int    id PK
    string slug UK
    string title
    text   excerpt
    text   contentBody
    int    views
    bool   isPublished
  }
  LibraryArticle {
    int    id PK
    string slug UK
    string title
    text   summary
    text   content
    int    views
  }
  Product {
    int    id PK
    string slug UK
    string name
    string[] features
    bool   isFeatured
  }
  Lead {
    int    id PK
    enum   type
    string fullName
    string phone
    enum   status
  }
  AdminUser {
    int    id PK
    string email UK
    string passwordHash
    enum   role
  }
```

**Nhóm bảng:**

- **Nội dung hiển thị** — `settings`, `nav_links`, `hero_slides`, `hero_stats`,
  `products`, `news_categories` / `news_articles`, `library_categories` /
  `library_articles`, `customers`, `consulting_services`, `courses`, `faqs`,
  `support_staff`, `remote_tools`.
- **Dữ liệu vận hành** — `leads` (form đăng ký/tải/tư vấn), `chat_messages`
  (log AI), `media` (tài nguyên upload).
- **Quản trị** — `admin_users` (đăng nhập trang admin).

## 2. Bản đồ: nội dung hiện tại → bảng

| Nguồn hardcode | Bảng |
|---|---|
| `Footer`, `AnnouncementBar`, `server.ts` (prompt AI) | `settings` |
| `src/data.ts` → `navLinks` + `Navbar` dropdown | `nav_links` |
| `Hero.tsx` slides / `src/data.ts` → `heroStats` | `hero_slides` / `hero_stats` |
| `src/data.ts` → `products` | `products` |
| `src/data/news.ts` | `news_categories` + `news_articles` |
| `src/data/library.ts` | `library_categories` + `library_articles` |
| `src/data.ts` → `customersList` | `customers` |
| `ConsultingAndTraining.tsx` → services / courses / faqs | `consulting_services` / `courses` / `faqs (HOME)` |
| `TechnicalSupportPage.tsx` → staff / tools / faqItems | `support_staff` / `remote_tools` / `faqs (SUPPORT)` |
| `InteractiveModal.tsx` (form) | `leads` |

## 3. Triển khai (local & VPS)

> Prisma đã cài sẵn ở **v6** (ổn định, dùng `datasource.url = env(...)`, tương
> thích tốt AdminJS/React-Admin). Các script `db:*` và `prisma.seed` đã có trong
> `package.json`.

```bash
# 1. Bật PostgreSQL
docker compose -f db/docker-compose.yml up -d

# 2. Cấu hình kết nối
cp db/.env.example .env        # sửa DATABASE_URL cho đúng

# 3. Tạo bảng từ schema (sinh migration đầu tiên) + generate client
npm run db:migrate             # prisma migrate dev

# 4. Nạp toàn bộ nội dung hiện tại vào DB
npm run db:seed

# 5. Xem/sửa dữ liệu nhanh bằng GUI có sẵn của Prisma
npm run db:studio
```

> Trên VPS/production dùng `npm run db:deploy` (`prisma migrate deploy` – áp dụng
> migration đã commit, không tạo mới).

### Cách 2 — Chạy thẳng `db.sql` trong pgAdmin (không cần Prisma/Node)

`db/db.sql` = **DDL tạo bảng + toàn bộ dữ liệu** trong một file:

1. pgAdmin → chọn/ tạo database đích → **Query Tool**.
2. Mở file `db/db.sql` (biểu tượng folder) → **Execute/Run (F5)**.

> File có sẵn `SET client_encoding = 'UTF8'` nên tiếng Việt hiển thị đúng. Khối
> **RESET** ở đầu sẽ xóa các bảng cùng tên nếu đã tồn tại (cho phép chạy lại) —
> bỏ khối đó nếu không muốn xóa.

Sinh lại `db.sql` khi dữ liệu/schema thay đổi:

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel db/schema.prisma --script > db/_ddl.sql
npx tsx db/generate-sql.mts   # ghép DDL + INSERT -> db/db.sql
```

## 4. Vận hành (ĐÃ TRIỂN KHAI)

Website đã đọc dữ liệu từ DB qua API, và có sẵn trang admin.

### API (Express + Prisma)
- `GET /api/public/*` — dữ liệu công khai cho site (settings, nav, hero, products,
  news, library, consulting, faqs, customers, support). Frontend gọi qua
  `src/lib/api.ts` với **fallback dữ liệu tĩnh** (mất DB vẫn không trắng trang).
- `POST /api/public/leads` — nhận form Tải/Đăng ký/Tư vấn từ modal.
- `POST /api/admin/auth/login|logout` + `GET /me` — đăng nhập admin (JWT trong
  cookie httpOnly + bcrypt).
- `/api/admin/resources/:resource` (+ `/:id`) — CRUD generic, yêu cầu đăng nhập.

### Trang admin
- Truy cập **`/admin`** (đăng nhập tại `/admin/login`). Giao diện quản trị toàn
  bộ: tin tức, thư viện, sản phẩm, hero, khách hàng, tư vấn/khóa học, FAQ, hỗ
  trợ, menu, danh mục, cấu hình site, **lead**, tài khoản admin.
- Tạo admin đầu tiên:
  ```bash
  npm run db:create-admin -- admin@bacnam.com.vn "MatKhauManh123" "Quản trị viên"
  ```
- Đặt biến môi trường **`JWT_SECRET`** (chuỗi ngẫu nhiên dài) trong `.env`.

### Trình tự triển khai đầy đủ trên VPS
```bash
npm ci
docker compose -f db/docker-compose.yml up -d      # PostgreSQL
cp db/.env.example .env                             # sửa DATABASE_URL + JWT_SECRET
npm run db:deploy                                    # tạo bảng (prisma migrate deploy)
npm run db:seed                                      # nạp nội dung ban đầu (tùy chọn)
npm run db:create-admin -- admin@bacnam.com.vn "MatKhau" "Admin"
npm run build                                        # prisma generate + vite + server
NODE_ENV=production npm start
```
> `npm run build` cần Prisma Client đã generate. Nếu chưa, chạy `npm run db:generate`.

## 5. Ghi chú thiết kế

- `dateText` giữ nguyên chuỗi ngày đang hiển thị; `publishedAt` (DateTime) để
  sắp xếp/lọc chuẩn — nên điền dần và chuyển UI sang dùng `publishedAt`.
- `library_articles.content` hiện trống (nội dung chi tiết chưa số hóa); admin
  bổ sung sau, frontend fallback về mẫu như hiện tại.
- Ảnh Hero đang là asset bundle; seed dùng đường dẫn `/uploads/hero/...` —
  cần upload lại 2 ảnh này vào thư mục tĩnh của server.
- `isActive` / `isPublished` cho phép ẩn/hiện mà không xóa dữ liệu.
- `sortOrder` quyết định thứ tự hiển thị (menu, slide, sản phẩm, khách hàng...).
