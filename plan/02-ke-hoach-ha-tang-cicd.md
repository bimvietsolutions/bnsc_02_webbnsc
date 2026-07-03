# 02. Kế hoạch hạ tầng, Docker và CI/CD

## Phase 0 — Secrets và inventory

### Bước 0.1: Thu hồi credential cũ

- Xóa public key deploy cũ khỏi `authorized_keys`.
- Tạo SSH key deploy mới, scope riêng cho repo.
- Đổi registry password.
- Đổi PostgreSQL password.
- Tạo session/JWT secret mới.
- Thu hồi Google OAuth client secret cũ.
- Kiểm tra Git history, Actions logs và máy local.

**Nghiệm thu:** credential cũ đăng nhập thất bại; credential mới chỉ nằm trong secret store/VPS env.

### Bước 0.2: Xác minh VPS read-only

Thu thập:

- OS, CPU, RAM, disk và timezone;
- phiên bản Docker/Compose;
- container, image, volume và network đang chạy;
- Caddy host hay container, config mount và import glob;
- registry/pgAdmin/domain/TLS;
- UFW và port đang listen;
- deploy user, group và quyền reload;
- dung lượng và vị trí backup hiện có.

**Đầu ra:** một inventory thực tế, không dùng thông tin suy đoán từ `setup/`.

### Bước 0.3: Chuẩn hóa naming và env

Chốt:

```text
APP_SLUG
APP_DOMAIN
IMAGE_NAME
APP_CONTAINER
POSTGRES_CONTAINER
POSTGRES_DB
POSTGRES_USER
DEPLOY_USER
APP_HOME
CADDY_CONFIG
DOCKER_NETWORK
```

Tạo `.env.example` chỉ có placeholder và mô tả:

```text
NODE_ENV
PORT
DATABASE_URL
SESSION_SECRET
GEMINI_API_KEY
APP_URL
TRUST_PROXY
LOG_LEVEL
```

Không thêm Google OAuth nếu chưa triển khai use case đăng nhập Google.

## Phase 1 — Ổn định runtime

1. Sửa server đọc `process.env.PORT`.
2. Import hai ảnh hero qua module hoặc chuyển vào `public/`.
3. Thêm `/health/live` không phụ thuộc DB.
4. Thêm graceful shutdown cho `SIGTERM`/`SIGINT`.
5. Tách app creation khỏi listener để có thể integration test.
6. Thêm request size limit, error handler và request ID.
7. Giới hạn payload/history/rate của `/api/chat`.
8. Thêm scripts test và clean chạy đa nền tảng.

## Phase 2A — Docker

### Dockerfile

- Multi-stage.
- Node LTS được pin.
- `npm ci` từ lockfile.
- Build frontend/server một lần.
- Runtime chỉ có production dependencies.
- Chạy non-root.
- Có init/graceful signal.
- Healthcheck `/health/live` hoặc `/health/ready` theo môi trường.

### `.dockerignore`

Loại:

```text
.git
.github
node_modules
dist
.env*
!.env.example
setup
audit
plan
*.log
*_github_actions*
```

### Test image local

- Build từ clean checkout.
- Start không có Gemini key vẫn chạy.
- Homepage, asset, SPA fallback và chat mock trả đúng.
- Stop container kết thúc sạch.
- Container không chạy root.

## Phase 2B — GitHub Actions

### `ci.yml`

Trigger pull request và push:

1. checkout action phiên bản hợp lệ;
2. setup Node và npm cache;
3. `npm ci`;
4. lint/typecheck;
5. unit/integration test;
6. production build;
7. Docker build;
8. dependency/image scan;
9. lưu test report khi lỗi.

### `deploy.yml`

Trigger push `main` hoặc workflow dispatch:

1. chạy lại hoặc phụ thuộc CI;
2. build image một lần;
3. tag `${GITHUB_SHA}`;
4. push registry;
5. SSH với host-key verification;
6. pull đúng SHA;
7. chạy migration job nếu có;
8. start candidate container;
9. poll readiness;
10. validate và switch Caddy;
11. smoke test domain;
12. ghi nhận deployed SHA;
13. giữ previous SHA để rollback.

### GitHub Secrets/Environment

- `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_HOST_KEY`.
- `REGISTRY_URL`, `REGISTRY_USER`, `REGISTRY_PASS`.
- Production environment có reviewer nếu đội ngũ cho phép.
- Không truyền database/app secret qua command line trong workflow; app đọc env file bảo vệ trên VPS hoặc secret mechanism được chọn.

## Caddy

Chỉ chọn một phương án:

### Nếu Caddy container

- Caddy và app cùng network `webnet`.
- App không publish port ra host.
- Config được mount read-only.
- Validate trong container rồi reload.

### Nếu Caddy host

- App publish `127.0.0.1:<port>:3000`.
- Config ở `/etc/caddy/conf.d`.
- Validate bằng host Caddy rồi `systemctl reload`.

Thêm compression và security headers sau khi kiểm thử CSP với vChat, YouTube, Google Fonts và ảnh ngoài.

## Rollback

- Deploy theo image SHA, không dựa vào `latest`.
- Giữ container/image trước trong ít nhất một cửa sổ quan sát.
- Rollback app bằng start previous SHA, health check rồi switch Caddy.
- Migration dùng expand/contract để app cũ vẫn chạy trên schema mới.
- Không chạy `docker image prune -f` ngay sau deploy.
