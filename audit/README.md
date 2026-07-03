# Hồ sơ audit và kế hoạch chuyển đổi website BNSC

Ngày rà soát: 03/07/2026  
Phạm vi: mã nguồn hiện tại, toàn bộ tài liệu trong `setup/`, cấu hình build và hiện trạng Git.

## Kết luận nhanh

Ứng dụng hiện là prototype React/Vite chạy được trên Express. TypeScript và production build đều thành công, nhưng website **chưa phải web động**: nội dung, bài viết, sản phẩm, khóa học, khách hàng, liên hệ và phần lớn hành vi form đang hardcode hoặc giả lập ở trình duyệt. Backend chỉ có API chat Gemini.

Ứng dụng **chưa thể deploy theo quy trình mô tả trong `setup/`** vì chưa có Dockerfile, workflow không nằm ở `.github/workflows/`, chưa có lớp truy cập PostgreSQL/migration, health check, API nghiệp vụ, xác thực thật và quy trình backup/rollback.

Ưu tiên ngay:

1. Thu hồi và đổi toàn bộ secret đã xuất hiện dạng rõ trong tài liệu setup/lịch sử chia sẻ.
2. Sửa tài liệu hạ tầng và xác minh hiện trạng VPS trước khi chạy thêm lệnh.
3. Chuẩn hóa Docker + CI/CD tối thiểu, deploy bản tĩnh hiện tại trước.
4. Thiết kế database/API/admin và chuyển dữ liệu theo từng module, không “đập đi làm lại” toàn bộ giao diện.

## Các tài liệu

- [01-hien-trang-va-danh-gia.md](01-hien-trang-va-danh-gia.md): kiến trúc hiện tại, bản đồ hardcode, điểm tốt, khoảng trống và mức độ sẵn sàng.
- [02-audit-setup-va-bao-mat.md](02-audit-setup-va-bao-mat.md): rà soát hai tài liệu setup, lỗi/rủi ro và phương án sửa.
- [03-kien-truc-web-dong.md](03-kien-truc-web-dong.md): kiến trúc đích, mô hình dữ liệu, API, admin và chiến lược chuyển đổi.
- [04-ke-hoach-trien-khai.md](04-ke-hoach-trien-khai.md): kế hoạch thực thi theo phase, tiêu chí hoàn thành và thứ tự phụ thuộc.
- [05-runbook-deploy.md](05-runbook-deploy.md): runbook Docker/Caddy/GitHub Actions, kiểm tra, rollback và backup.

## Phạm vi chưa thực hiện

Đây là đợt audit và lập kế hoạch. Chưa thay đổi code ứng dụng, chưa tạo Dockerfile/workflow/migration, chưa kết nối hoặc thay đổi VPS, DNS, registry, PostgreSQL hay GitHub Secrets.

