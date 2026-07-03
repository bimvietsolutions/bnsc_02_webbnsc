# 01. Roadmap tổng thể

## 1. Phạm vi thành công

Hệ thống được xem là chuyển đổi thành công khi:

- nội dung production có thể thay đổi từ CMS mà không build lại image;
- bài viết có URL slug thật và mở trực tiếp được;
- form public lưu dữ liệu vào database và có cơ chế chống spam;
- admin đăng nhập bằng session an toàn và chỉ thao tác đúng quyền;
- mỗi commit production tạo image theo SHA, deploy tự động và rollback được;
- PostgreSQL có backup offsite và đã thử restore;
- không còn secret đã lộ hoặc credential thật trong repo/tài liệu;
- health check, log và cảnh báo đủ để phát hiện lỗi.

## 2. Các phase

| Phase | Mục tiêu | Đầu ra chính | Điều kiện bắt đầu |
|---|---|---|---|
| 0 | Khóa rủi ro và xác minh VPS | Secret mới, inventory hạ tầng, quyết định Caddy | Ngay |
| 1 | Ổn định ứng dụng hiện tại | Asset đúng, health endpoint, server production ổn định | Phase 0 phần secrets hoàn tất |
| 2 | Docker + CI/CD | Image reproducible, workflow CI/deploy, rollback | Phase 1 |
| 3 | Nền tảng database | Schema, migration, seed, backup/restore | Phase 2 deploy ổn định |
| 4 | Public API và frontend động | Nội dung public lấy từ server | Phase 3 |
| 5 | CMS, auth và media | Admin/editor quản trị nội dung | Phase 4 lõi |
| 6 | Form nghiệp vụ | Lead, ticket, download và notification thật | Phase 3; có thể song song cuối Phase 5 |
| 7 | Hardening và go-live | Test, security, monitoring, cutover | Phase 4–6 |

## 3. Cổng nghiệm thu

### Gate A — Cho phép deploy bản hiện tại

- Secrets cũ đã bị thu hồi.
- `npm ci`, lint và build chạy từ clean checkout.
- Docker image chạy non-root.
- `/health/live` trả 200.
- Hai ảnh hero local không còn 404.
- SPA fallback và `/api/chat` hoạt động.

### Gate B — Cho phép kết nối database production

- Migration chạy được trên database rỗng.
- Seed tạo đúng dữ liệu hiện tại.
- Backup và restore thử thành công.
- DB không public port.
- App dùng account DB đúng quyền.
- `/health/ready` phản ánh kết nối DB.

### Gate C — Cho phép bỏ hardcode production

- API có contract test.
- Frontend có loading/error/empty state.
- Số lượng và nội dung seed đã đối chiếu.
- Không còn fallback hardcode âm thầm trên production.
- Deep link bài viết hoạt động sau refresh.

### Gate D — Cho phép mở CMS

- Session cookie và CSRF policy đạt.
- RBAC được test cả API và UI.
- Rich text được sanitize.
- Upload giới hạn loại/kích thước và không thể thực thi.
- Audit log ghi create/update/publish/delete.

### Gate E — Go-live đầy đủ

- Smoke/E2E/security/performance đạt.
- Migration rehearsal trên bản sao dữ liệu đạt.
- Alert, backup, rollback đã thử.
- Có người phụ trách và cửa sổ cutover.
- Không còn form success giả.

## 4. Dependency chính

```text
SEC-01 ─┬─> INFRA-01 ─> DOCKER-01 ─> CICD-02 ─> DB-01 ─> API-01 ─> FE-01
        └─> ENV-01  ───────────────────────────────┘

API-01 ─> CMS-01 ─> MEDIA-01
DB-01  ─> FORM-01 ─> NOTIFY-01
FE-01 + CMS-01 + FORM-01 ─> QA-01 ─> CUTOVER-01
```

## 5. Thứ tự chuyển module

| Thứ tự | Module | Lý do |
|---:|---|---|
| 1 | Site config, menu, announcement | Nhỏ, ít quan hệ, kiểm chứng luồng end-to-end |
| 2 | Hero, statistics, customers | Read-only, rủi ro thấp |
| 3 | Products, courses, FAQ | Có cấu trúc lặp nhưng chưa cần rich text phức tạp |
| 4 | Articles, category, tags | Cần slug, pagination, rich content và SEO |
| 5 | Library, documents, support staff | Có file/media và tải xuống |
| 6 | Leads, tickets, downloads | Ghi dữ liệu, privacy và chống spam |
| 7 | Customer auth nếu thực sự cần | Tránh xây auth không có use case |

## 6. Ngoài phạm vi đợt đầu

- Viết lại toàn bộ sang framework khác.
- Microservices hoặc Kubernetes.
- Mobile app.
- Hệ thống thanh toán.
- CRM hoàn chỉnh.
- SSR toàn bộ; chỉ đánh giá sau khi routing/SEO cơ bản có dữ liệu thực.

