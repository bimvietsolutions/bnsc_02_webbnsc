# 04. Kế hoạch thực thi theo giai đoạn

## Nguyên tắc

- Deploy được bản hiện tại trước, rồi chuyển dữ liệu từng lát nhỏ.
- Mỗi phase có rollback và tiêu chí nghiệm thu.
- Không triển khai production bằng credential đã xuất hiện trong setup.
- Không chạy migration phá hủy tự động trong cùng bước start app.

## Phase 0 — Đóng lỗ hổng và xác minh hạ tầng

**Công việc**

- Rotate toàn bộ secrets/key đã lộ.
- Kiểm kê VPS: OS, Docker, Caddy host/container, networks, registry, disk/RAM.
- Kiểm tra DNS/TLS và quyền deploy user.
- Chuẩn hóa `.env.example`; tạo inventory biến môi trường.
- Chọn tên project/container/image/domain duy nhất.

**Hoàn thành khi**

- Credential cũ không còn sử dụng.
- Có sơ đồ hạ tầng thực tế và kết quả kiểm tra read-only.
- Không có secret thật trong repo/tài liệu.

## Phase 1 — Container hóa bản hiện tại

**Công việc**

- Tạo multi-stage Dockerfile: build bằng Node, runtime chỉ production dependencies.
- Thêm `.dockerignore`.
- Sửa `PORT`, asset hero và endpoint `/health/live`, `/health/ready`.
- Chạy container non-root.
- Test image local: start, health, homepage, `/api/chat` mock mode.

**Hoàn thành khi**

- Image build reproducible từ clean checkout.
- Container healthy, restart được, không cần source code mount.
- Hai ảnh local và SPA fallback hoạt động ở production.

## Phase 2 — CI/CD và deploy bản hardcode

**Công việc**

- Tạo `.github/workflows/ci.yml`: install bằng `npm ci`, lint, build, test.
- Tạo `deploy.yml`: build/push tag SHA, SSH deploy SHA đó.
- Chọn mô hình Caddy đúng với VPS; validate trước reload.
- Start container mới, health check, chuyển traffic; giữ image/container trước để rollback.
- Thêm GitHub Environment `production` và approval nếu phù hợp.

**Hoàn thành khi**

- Push main tạo image SHA và deploy tự động.
- URL HTTPS trả 200; health endpoint xanh.
- Có thể rollback về SHA trước bằng một lệnh/run workflow.

## Phase 3 — Database foundation

**Công việc**

- Chọn ORM; tạo schema/migration/seed.
- Tạo PostgreSQL với volume và user quyền tối thiểu.
- Tạo migration job có lock và backup trước migration rủi ro.
- Seed dữ liệu từ `src/data.ts` và các mảng component.
- Thiết lập backup + retention + restore test.

**Hoàn thành khi**

- DB mới có thể dựng từ migration + seed.
- Restore sang database test thành công.
- Không public port DB.

## Phase 4 — Public content API

**Thứ tự module**

1. `site-config`, menu, announcement, contact/social.
2. Hero/statistics/customers.
3. Products/courses/FAQ.
4. Articles/categories/tags.
5. Library/documents/support staff.

**Công việc chung mỗi module**

- Schema + migration + seed.
- Service/repository + API + validation.
- Test API.
- Hook frontend + loading/error/empty.
- Đối chiếu dữ liệu và xóa hardcode trùng.

**Hoàn thành khi**

- Sửa DB làm nội dung production đổi mà không build lại image.
- URL bài viết theo slug và refresh trực tiếp hoạt động.

## Phase 5 — Admin CMS và media

**Công việc**

- Login/session, RBAC admin/editor.
- CRUD nội dung, draft/publish/schedule.
- Upload media, alt text, giới hạn MIME/size.
- Audit log và preview.

**Hoàn thành khi**

- Editor quản trị nội dung không cần sửa code.
- User không đủ quyền bị chặn cả UI và API.
- Upload không thể thực thi file tùy ý.

## Phase 6 — Forms và nghiệp vụ

- Leads: download/register/consult.
- Support tickets.
- Email/notification queue; retry và dead-letter policy.
- Download token có hạn nếu file cần kiểm soát.
- CAPTCHA/rate limit/consent/privacy.
- Auth khách hàng chỉ làm nếu có use case rõ; không giữ màn login “trang trí”.

## Phase 7 — Production hardening

- Unit/integration/E2E cho luồng chính.
- CSP/security headers, dependency/image scan.
- Structured logs, alert health/disk/error rate.
- Performance: lazy route, image optimization, cache, bundle split.
- SEO/accessibility.
- Load test endpoint public/write/chat.
- Runbook sự cố và diễn tập rollback/restore.

## Backlog ưu tiên

| ID | Việc | Ưu tiên | Phụ thuộc |
|---|---|---|---|
| SEC-01 | Rotate secrets đã lộ | P0 | Không |
| OPS-01 | Xác minh Caddy host/container | P0 | Không |
| APP-01 | Sửa asset `/src/assets` production | P1 | Không |
| DEV-01 | Dockerfile + `.dockerignore` | P1 | APP-01 |
| OPS-02 | Health endpoints | P1 | DEV-01 |
| CICD-01 | CI lint/build/test | P1 | DEV-01 |
| CICD-02 | Deploy SHA + rollback | P1 | OPS-01, OPS-02 |
| DB-01 | Schema/migration/seed | P1 | Phase 2 ổn định |
| API-01 | Public content API | P1 | DB-01 |
| FE-01 | Router + dynamic hooks | P1 | API-01 |
| CMS-01 | Admin/RBAC/media | P2 | API-01 |
| FORM-01 | Leads/tickets/download | P2 | DB-01 |
| QA-01 | E2E + performance/security | P2 | Các luồng tương ứng |

