# 02. Audit tài liệu setup và bảo mật

## 1. Tài liệu đã đọc

- `setup/0.first_install.md`: bootstrap VPS, Docker, Caddy, registry, pgAdmin và firewall.
- `setup/2.setup_bnsc_mauduan_v2.md`: DNS, PostgreSQL, deploy user, SSH, env, Caddy, GitHub Actions và kiểm tra deploy.

Hai tài liệu thể hiện đúng hướng tổng thể: SSH key, firewall, container, private registry, user deploy riêng, network chung, reverse proxy HTTPS và CI/CD. Tuy nhiên chúng mô tả **hai kiến trúc Caddy khác nhau** và có lỗi lệnh/cấu hình đủ để làm deploy thất bại.

## 2. P0: xử lý secrets ngay

Tài liệu setup chứa private SSH key, mật khẩu registry, mật khẩu PostgreSQL, JWT secret và Google OAuth client secret dạng rõ. Dù file chưa được track, các giá trị này phải xem là đã bị lộ.

Thực hiện theo thứ tự:

1. Thu hồi key GitHub Actions cũ khỏi `authorized_keys`; tạo key mới.
2. Đổi mật khẩu private registry.
3. Đổi mật khẩu PostgreSQL và cập nhật `DATABASE_URL`.
4. Tạo JWT/session secret mới bằng nguồn ngẫu nhiên mạnh.
5. Thu hồi Google OAuth client secret cũ và tạo secret mới.
6. Kiểm tra GitHub commit/history, Actions logs, chat/email và máy local để tìm bản sao.
7. Thêm pattern private key và file key dự án vào `.gitignore`; dùng secret scanning trong CI.
8. Tài liệu mẫu chỉ dùng placeholder, tuyệt đối không chứa credential có thể đăng nhập.

Không đưa giá trị secret mới vào bất kỳ file Markdown nào.

## 3. Lỗi cụ thể trong setup

| Mức | Vấn đề | Hậu quả / Cách sửa |
|---|---|---|
| P0 | Biến PostgreSQL trong `docker run` viết sai tên: đặt biến theo slug thay vì `POSTGRES_PASSWORD` | Container Postgres không khởi tạo đúng. Dùng `POSTGRES_PASSWORD=...` |
| P0 | File `.env` đặt tên biến JWT bằng chính giá trị mẫu thay vì `JWT_SECRET=...` | App không đọc được secret. Chuẩn hóa tên biến |
| P0 | Secrets/private key nằm trong tài liệu | Rotate toàn bộ như mục 2 |
| P1 | `actions/checkout@v7` không phải lựa chọn đã được kiểm chứng trong tài liệu hiện tại | Pin major/commit SHA hợp lệ sau khi kiểm tra marketplace chính thức |
| P1 | Workflow nằm trong hướng dẫn nhưng repo không có `.github/workflows/deploy.yml` | Tạo đúng đường dẫn trong source |
| P1 | Repo chưa có Dockerfile | `docker build .` chắc chắn thất bại |
| P1 | Caddy lúc thì systemd host (`/etc/caddy`), lúc thì container (`docker exec caddy`, `/opt/caddy`) | Chọn đúng một mô hình dựa trên VPS thật |
| P1 | Sudoers cấp lệnh `sudo docker exec...`, nhưng workflow gọi thẳng `docker exec...` | Hoặc không cần sudo do user thuộc group docker, hoặc gọi đúng command đã whitelist |
| P1 | Deploy luôn dùng tag `latest` | Khó rollback và có race. Deploy immutable tag `${GITHUB_SHA}` |
| P1 | Dừng/xóa container trước khi start container mới | Downtime và có thể mất service khi image/config lỗi |
| P1 | Không có health check sau deploy | Workflow có thể báo xanh dù app lỗi |
| P1 | Không validate Caddy trước reload trong workflow | Config sai có thể ảnh hưởng site khác |
| P1 | Không có migration step/lock | Schema và app dễ lệch phiên bản |
| P1 | PostgreSQL dùng `restart always`, image chỉ pin major | Cần policy thống nhất và pin phiên bản phù hợp |
| P2 | Dùng user trong group `docker` | Quyền gần tương đương root; cần chấp nhận rủi ro hoặc dùng deploy mechanism hạn chế hơn |
| P2 | Registry/pgAdmin reverse proxy không mô tả rate limit/IP allowlist/MFA | Tăng bề mặt tấn công |
| P2 | pgAdmin dùng image `latest` | Update không kiểm soát |
| P2 | Không có backup/restore test PostgreSQL | Không đạt production |
| P2 | Docker login để credential lưu lâu dài trên VPS | Dùng credential scope hẹp, file config bảo vệ, cân nhắc logout |
| P2 | `docker image prune -f` sau mỗi deploy | Có thể làm mất image rollback cục bộ |
| P2 | Caddy config extension `.caddy` ở file 0, `.conf` ở file 2 | Import glob phải khớp |
| P2 | Tài liệu first-install có block Markdown/lệnh Caddy bị hỏng | Dễ copy sai |
| P2 | IP/domain/project mẫu không đồng nhất giữa hai tài liệu | Dùng một file biến môi trường/mẫu duy nhất |

## 4. Kiến trúc Caddy cần quyết định

Trước khi triển khai, chạy kiểm kê read-only trên VPS:

```bash
systemctl status caddy --no-pager
docker ps --format '{{.Names}}\t{{.Image}}\t{{.Ports}}'
docker inspect caddy --format '{{json .Mounts}}' 2>/dev/null
docker network inspect pgnet 2>/dev/null
```

Chọn một trong hai:

- **Caddy chạy trên host**: reverse proxy tới port app chỉ bind `127.0.0.1`; config ở `/etc/caddy/conf.d`; reload bằng systemd.
- **Caddy chạy container**: Caddy và app cùng external Docker network; app không publish port ra host; config được mount từ `/opt/caddy/conf.d`.

Theo tài liệu dự án mới hơn, phương án container có vẻ là ý định hiện tại, nhưng phải xác minh VPS thay vì suy đoán.

## 5. Baseline bảo mật đề xuất

- Chỉ mở 22/80/443; SSH có IP allowlist nếu khả thi.
- Không public port PostgreSQL, app, registry backend hoặc pgAdmin backend.
- Registry và pgAdmin dùng domain HTTPS riêng; thêm IP allowlist/VPN, rate limit và mật khẩu mạnh.
- Container chạy non-root, read-only filesystem nếu tương thích, drop capabilities, giới hạn CPU/RAM/PID.
- Caddy thêm security headers hợp lý; CSP cần thử nghiệm vì có Google Fonts, Unsplash, YouTube, vChat.
- API có validation schema, request-size limit, rate limit, CSRF/session policy và audit log.
- Password hash bằng Argon2id; cookie `HttpOnly`, `Secure`, `SameSite`; không lưu token dài hạn trong localStorage.
- Upload kiểm tra MIME/size, tên file ngẫu nhiên và không thực thi.
- Backup DB hàng ngày, mã hóa, lưu offsite, retention và diễn tập restore.

