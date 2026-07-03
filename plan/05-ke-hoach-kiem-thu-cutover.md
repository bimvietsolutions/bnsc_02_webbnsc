# 05. Kế hoạch kiểm thử, cutover và vận hành

## 1. Ma trận kiểm thử

| Lớp | Phạm vi |
|---|---|
| Static | TypeScript, lint, format |
| Unit | service, validation, mapper, permissions |
| Integration | API + PostgreSQL, migration, session |
| Component | loading/error/empty/form states |
| E2E | public browse, article, lead, admin publish |
| Security | auth, RBAC, CSRF, rate limit, upload, headers |
| Performance | homepage, article list, search, chat/write endpoints |
| Operations | health, backup, restore, deploy, rollback |

## 2. E2E bắt buộc

1. Mở homepage và tải đủ nội dung động.
2. Lọc/tìm tin, mở slug và refresh trang detail.
3. Admin tạo draft, preview, publish; public thấy bài.
4. Editor không truy cập quản lý user.
5. Gửi lead một lần; DB lưu đúng; UI báo thành công.
6. Request lỗi validation/rate limit hiển thị đúng.
7. Upload file hợp lệ; file cấm bị từ chối.
8. Deploy candidate lỗi health không được switch traffic.
9. Rollback về SHA trước thành công.
10. Restore backup vào môi trường tách biệt và đọc được dữ liệu.

## 3. Môi trường

- **Local:** DB/container riêng, seed fixture.
- **Staging:** gần production, domain riêng, dữ liệu không phải PII thật.
- **Production:** deploy từ image đã được staging kiểm chứng.

Không dùng chung database giữa staging và production.

## 4. Diễn tập migration dữ liệu

1. Freeze bản snapshot code hardcode.
2. Chạy seed vào DB staging sạch.
3. So count theo từng entity.
4. Kiểm tra slug trùng, media hỏng, HTML không hợp lệ.
5. Chụp screenshot các khu vực chính trước/sau.
6. Editor nghiệp vụ duyệt nội dung.
7. Chạy lại seed để chứng minh idempotent.
8. Backup DB staging rồi restore thử.

## 5. Kế hoạch cutover

### Trước ngày chuyển

- Giảm DNS TTL nếu cần thay IP.
- Chốt image SHA và migration version.
- Backup production.
- Xác nhận registry, disk, certificate và network.
- Ghi previous SHA/config.
- Chỉ định người ra quyết định go/no-go.

### Trong cửa sổ chuyển

1. Tạm dừng thay đổi nội dung nếu đang nhập liệu.
2. Backup cuối.
3. Pull image SHA.
4. Chạy migration.
5. Start candidate.
6. Readiness và smoke test nội bộ.
7. Switch Caddy.
8. Smoke test HTTPS từ ngoài.
9. Kiểm tra log/error/latency.
10. Mở lại thao tác nội dung.

### Điều kiện no-go/rollback

- Migration lỗi hoặc schema không tương thích.
- Readiness không xanh trong timeout.
- Homepage/article/form/admin lỗi luồng chính.
- Error rate tăng rõ hoặc DB connection cạn.
- Caddy validate/TLS lỗi.
- Không xác minh được backup.

## 6. Rollback

### Không có lỗi dữ liệu

- Start previous SHA.
- Health check.
- Switch Caddy.
- Smoke test.
- Giữ log candidate để phân tích.

### Có lỗi migration/data

- Dừng write.
- Đánh giá app cũ có tương thích schema mới không.
- Nếu không, restore backup theo runbook đã thử.
- Ghi lại RPO, bản ghi có thể mất và quyết định của người phụ trách.

## 7. Theo dõi sau go-live

Theo dõi tối thiểu:

- uptime và readiness;
- HTTP 5xx/4xx bất thường;
- p95 latency;
- CPU/RAM/disk;
- PostgreSQL connections, storage và backup status;
- login failure/rate limit;
- lead/ticket submit failure;
- Gemini error và chi phí nếu có.

Mốc hậu kiểm:

- ngay sau deploy;
- sau 30–60 phút;
- ngày làm việc tiếp theo;
- sau một chu kỳ backup;
- sau một tuần để quyết định xóa image/container cũ.

## 8. Biên bản nghiệm thu

Mỗi release production lưu:

```text
Commit SHA:
Image digest:
Migration version:
Thời điểm deploy:
Người duyệt:
Kết quả health/smoke:
Previous SHA:
Backup ID:
Rollback tested:
Issue phát sinh:
```

