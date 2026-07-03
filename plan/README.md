# Kế hoạch xử lý và chuyển đổi website BNSC

Ngày lập: 03/07/2026  
Nguồn đầu vào: toàn bộ tài liệu trong `audit/` và hiện trạng mã nguồn tại thời điểm rà soát.

## Mục tiêu

Chuyển website React/Vite + Express đang hardcode thành hệ thống web động:

- dữ liệu nội dung được lưu trong PostgreSQL và tải từ API;
- có trang quản trị nội dung, phân quyền và lưu vết;
- form đăng ký, tư vấn, tải phần mềm và hỗ trợ lưu dữ liệu thật;
- ứng dụng được đóng gói Docker;
- Caddy cung cấp HTTPS và reverse proxy;
- GitHub Actions kiểm tra, build, push image và deploy có health check/rollback;
- dữ liệu, secrets và hạ tầng có backup, giám sát và quy trình vận hành.

## Chiến lược

Không viết lại toàn bộ giao diện. Giữ UI hiện có, dựng nền tảng deploy trước, sau đó thay từng cụm hardcode bằng database/API. Mỗi chặng phải chạy được và có đường quay lại.

```text
An toàn secrets
    -> Docker hóa bản hiện tại
    -> CI/CD + deploy bản hardcode
    -> PostgreSQL + migration + seed
    -> Public API + chuyển frontend
    -> Admin CMS + media
    -> Form nghiệp vụ + auth
    -> Hardening + cutover
```

## Bộ tài liệu

- [01-roadmap-tong-the.md](01-roadmap-tong-the.md): roadmap, phase, dependency và cổng nghiệm thu.
- [02-ke-hoach-ha-tang-cicd.md](02-ke-hoach-ha-tang-cicd.md): secrets, VPS, Docker, Caddy, GitHub Actions và rollback.
- [03-ke-hoach-database-api.md](03-ke-hoach-database-api.md): schema, migration, seed, API và thứ tự triển khai backend.
- [04-ke-hoach-frontend-cms.md](04-ke-hoach-frontend-cms.md): routing, chuyển dữ liệu hardcode, admin CMS và media.
- [05-ke-hoach-kiem-thu-cutover.md](05-ke-hoach-kiem-thu-cutover.md): test, migration rehearsal, go-live, rollback và hậu kiểm.
- [06-backlog-thuc-thi.md](06-backlog-thuc-thi.md): backlog có ID, dependency, tiêu chí hoàn thành và trạng thái.

## Quy tắc sử dụng kế hoạch

- Chỉ bắt đầu task khi dependency đã hoàn thành.
- Mỗi task phải có bằng chứng nghiệm thu: test, log, ảnh chụp hoặc output command.
- Không ghi secret thật vào Git, Markdown, issue hoặc Actions log.
- Không đánh dấu phase hoàn thành nếu rollback chưa được thử.
- Các lựa chọn phụ thuộc VPS thực tế phải được xác minh ở Phase 0, không suy đoán từ tài liệu cũ.

## Các quyết định cần chốt trước Phase 3

1. Caddy đang chạy trên host hay container.
2. Domain production và đường dẫn image registry chính thức.
3. Chọn ORM: Prisma hoặc Drizzle.
4. Media dùng S3-compatible hay volume local có backup.
5. Có cần tài khoản khách hàng hay chỉ cần tài khoản quản trị.
6. Người có quyền duyệt nội dung và duyệt deploy production.

