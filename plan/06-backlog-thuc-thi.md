# 06. Backlog thực thi

Trạng thái dùng: `TODO`, `DOING`, `BLOCKED`, `DONE`. Ban đầu mọi task là `TODO`; chỉ chuyển `DONE` khi đạt tiêu chí nghiệm thu.

## P0 — Bắt buộc trước mọi deploy

| ID | Trạng thái | Task | Dependency | Nghiệm thu |
|---|---|---|---|---|
| SEC-01 | TODO | Thu hồi SSH deploy key cũ, tạo key mới | Không | Key cũ bị từ chối |
| SEC-02 | TODO | Rotate registry, DB, session/JWT, OAuth secrets | Không | Secret cũ vô hiệu |
| SEC-03 | TODO | Dọn secret khỏi setup và thêm ignore/secret scan | SEC-01, SEC-02 | Scan repo không thấy secret |
| INFRA-01 | TODO | Inventory VPS read-only | Không | Có output OS/Docker/Caddy/network/port/disk |
| INFRA-02 | TODO | Chốt Caddy host hoặc container | INFRA-01 | Có ADR và đường dẫn config thật |
| ENV-01 | TODO | Chốt naming/domain/image/env inventory | INFRA-01 | Một bảng biến chuẩn duy nhất |

## P1 — Runtime và deploy

| ID | Trạng thái | Task | Dependency | Nghiệm thu |
|---|---|---|---|---|
| APP-01 | TODO | Sửa hai asset `/src/assets` production | Không | Asset trả 200 trong build |
| APP-02 | TODO | Đọc `PORT` từ env, graceful shutdown | Không | Start/stop sạch trên port tùy chọn |
| APP-03 | TODO | Thêm live/ready health endpoint | APP-02 | Endpoint đúng trạng thái |
| APP-04 | TODO | Hardening `/api/chat` | Không | Validate, limit, rate limit, test |
| TEST-01 | TODO | Thiết lập test runner và smoke test server | APP-02 | CI chạy test được |
| DOCKER-01 | TODO | Tạo Dockerfile multi-stage non-root | APP-01, APP-02 | Image build và chạy healthy |
| DOCKER-02 | TODO | Tạo `.dockerignore` | Không | Secret/source rác không nằm trong context/image |
| CICD-01 | TODO | Tạo `.github/workflows/ci.yml` | TEST-01, DOCKER-01 | PR chạy lint/test/build/image |
| CICD-02 | TODO | Tạo deploy workflow theo SHA | CICD-01, INFRA-02, ENV-01 | Deploy staging thành công |
| OPS-01 | TODO | Caddy config và switch candidate | INFRA-02, CICD-02 | Validate/reload/smoke đạt |
| OPS-02 | TODO | Workflow/manual rollback SHA | OPS-01 | Diễn tập rollback đạt |

## P1 — Database và public API

| ID | Trạng thái | Task | Dependency | Nghiệm thu |
|---|---|---|---|---|
| DB-01 | TODO | ADR chọn ORM | CICD-02 | Quyết định được ghi |
| DB-02 | TODO | Tạo DB client/config/migration base | DB-01 | Migration DB rỗng đạt |
| DB-03 | TODO | Schema nội dung nền tảng | DB-02 | Constraint/index/test đạt |
| DB-04 | TODO | Trích xuất và seed hardcode | DB-03 | Seed idempotent, count đúng |
| DB-05 | TODO | Backup/restore automation | DB-02 | Restore rehearsal đạt |
| API-01 | TODO | API site-config/home | DB-03, DB-04 | Contract/integration test đạt |
| API-02 | TODO | API products/courses/FAQ | API-01 | List/detail test đạt |
| API-03 | TODO | API articles/categories/tags | API-01 | Slug/search/page/publish test đạt |
| API-04 | TODO | API library/support | API-01 | List/detail/download metadata đạt |

## P1 — Frontend động

| ID | Trạng thái | Task | Dependency | Nghiệm thu |
|---|---|---|---|---|
| FE-01 | TODO | API client và state components | API-01 | Timeout/error mapping test |
| FE-02 | TODO | React Router và route thật | Không | Deep link/refresh/back đạt |
| FE-03 | TODO | Chuyển site shell/home | FE-01, API-01 | Không còn hardcode module |
| FE-04 | TODO | Chuyển products/courses | FE-01, API-02 | Nội dung lấy DB |
| FE-05 | TODO | Chuyển news/article | FE-01, FE-02, API-03 | Slug/SEO/list/detail đạt |
| FE-06 | TODO | Chuyển library/support | FE-01, API-04 | Search/detail/media đạt |
| PERF-01 | TODO | Route lazy-load và chia bundle | FE-02 | Không còn warning/chunk mục tiêu đã chốt |

## P2 — CMS, form và vận hành

| ID | Trạng thái | Task | Dependency | Nghiệm thu |
|---|---|---|---|---|
| AUTH-01 | TODO | Session auth + CSRF + Argon2id | DB-02 | Security integration test đạt |
| AUTH-02 | TODO | RBAC admin/editor/support | AUTH-01 | API permission matrix đạt |
| CMS-01 | TODO | CMS articles/categories | AUTH-02, API-03 | Draft/preview/publish đạt |
| CMS-02 | TODO | CMS home/products/courses | AUTH-02, API-01, API-02 | CRUD và audit đạt |
| MEDIA-01 | TODO | Media upload/storage | AUTH-02 | MIME/size/permission test đạt |
| CMS-03 | TODO | CMS library/settings/media | CMS-01, MEDIA-01 | Editor quản trị đầy đủ |
| FORM-01 | TODO | Leads API và frontend forms | DB-02, FE-01 | Lưu thật, không success giả |
| FORM-02 | TODO | Support ticket API/UI | DB-02, FE-01 | Ticket workflow đạt |
| FORM-03 | TODO | Download request/token/log | MEDIA-01, FORM-01 | Download có kiểm soát |
| NOTIFY-01 | TODO | Notification/outbox/retry | FORM-01, FORM-02 | Retry và failure visible |
| OBS-01 | TODO | Structured log/monitoring/alert | CICD-02 | Alert thử nghiệm nhận được |
| SEO-01 | TODO | Sitemap/canonical/OG/JSON-LD | FE-05 | Validator và crawl test đạt |
| QA-01 | TODO | Full E2E/security/performance | Các module liên quan | Báo cáo không còn blocker |
| CUTOVER-01 | TODO | Migration rehearsal và go-live | DB-05, OPS-02, QA-01 | Gate E đạt |

## Nhật ký quyết định/blocker

Thêm bản ghi theo mẫu, không ghi secret:

```text
Ngày:
Task ID:
Quyết định hoặc blocker:
Người phụ trách:
Tác động:
Hành động tiếp theo:
```

