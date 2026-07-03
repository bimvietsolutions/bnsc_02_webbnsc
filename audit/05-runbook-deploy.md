# 05. Runbook deploy đề xuất

Tài liệu này là thiết kế vận hành; các tên placeholder phải được thay bằng biến đã xác minh. Không copy credential vào file.

## 1. Artifact và naming

```text
Image:      <registry>/<namespace>/<app>:<git-sha>
Container:  <app>_<git-sha-short> hoặc slot blue/green
Network:    webnet (Caddy + app)
DB network: internal network phù hợp; app + postgres
App port:   3000 nội bộ, không public ra Internet
```

Không dùng `latest` làm nguồn sự thật khi deploy. Có thể push `latest` để tiện quan sát, nhưng runtime phải chỉ rõ SHA.

## 2. Dockerfile yêu cầu

- Multi-stage và pin Node LTS theo digest/version đã kiểm thử.
- Stage build chạy `npm ci`, lint/test/build.
- Stage runtime cài production dependencies cần thiết cho Express.
- `NODE_ENV=production`, `PORT=3000`.
- User non-root.
- `HEALTHCHECK` gọi `/health/ready`.
- Không copy `.env`, `.git`, setup docs, key hoặc dev cache.
- Init signal/graceful shutdown để deploy không làm hỏng request đang chạy.

## 3. Caddy

Nếu Caddy container:

```caddy
<domain> {
    encode zstd gzip
    reverse_proxy <active-app-container>:3000
}
```

Trước reload:

```bash
docker exec caddy caddy validate --config /etc/caddy/Caddyfile
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

Nếu Caddy host, dùng `caddy validate`/`systemctl reload caddy` và app chỉ bind port loopback. Không trộn hai mô hình.

## 4. Pipeline

### CI trên mọi pull request

1. Checkout.
2. Cấu hình Node/pnpm hoặc npm cache.
3. `npm ci`.
4. `npm run lint`.
5. Unit/integration tests.
6. `npm run build`.
7. Build image và scan dependency/image.

### Deploy khi merge main

1. Build một lần, tag bằng commit SHA.
2. Push image SHA vào registry.
3. SSH bằng deploy key riêng và host-key verification.
4. Pull SHA.
5. Backup trước migration có rủi ro.
6. Chạy migration job một lần.
7. Start candidate container với `--env-file`, networks và resource limits.
8. Poll `/health/ready` với timeout.
9. Chuyển Caddy sang candidate và reload sau validate.
10. Smoke test HTTPS từ ngoài.
11. Giữ previous container/image trong cửa sổ rollback.
12. Cleanup theo retention, không prune mù.

## 5. Smoke test bắt buộc

```text
GET  /health/live              -> 200
GET  /health/ready             -> 200, DB reachable
GET  /                         -> 200
GET  /tin-tuc/<known-slug>     -> 200
GET  /api/v1/site-config       -> 200 + đúng schema
POST /api/v1/leads             -> test có kiểm soát hoặc endpoint staging
```

Kiểm tra thêm:

- TLS certificate/domain đúng.
- Ảnh local tải 200.
- Logs không có DB/auth error.
- Caddy thấy upstream qua đúng network.
- Không có port DB/app public.

## 6. Rollback

### App-only

1. Xác định `PREVIOUS_SHA`.
2. Start lại image `PREVIOUS_SHA` với cùng env/network.
3. Chờ health xanh.
4. Chuyển Caddy về container trước.
5. Smoke test.
6. Giữ candidate lỗi để lấy log, sau đó mới xóa.

### Có migration

- Migration additive/backward-compatible: rollback app trước, giữ schema.
- Migration destructive: chỉ rollback DB từ backup sau khi xác định mất dữ liệu chấp nhận được và dừng write.
- Áp dụng expand/contract: thêm schema mới → deploy code tương thích hai phiên bản → backfill → sau một chu kỳ mới xóa schema cũ.

## 7. Backup PostgreSQL

- Backup logical hằng ngày và trước migration quan trọng.
- Lưu ngoài VPS, mã hóa, kiểm tra checksum.
- Retention ví dụ: 7 daily, 4 weekly, 6 monthly (điều chỉnh theo nghiệp vụ).
- Theo dõi job failure và dung lượng.
- Mỗi quý restore sang môi trường tách biệt và ghi nhận RPO/RTO thực tế.

## 8. Checklist go-live

- [ ] Secrets đã rotate, GitHub Environment đã cấu hình.
- [ ] DNS trỏ đúng, TTL đã tính.
- [ ] Docker image SHA vượt CI/scan.
- [ ] DB backup và restore test đạt.
- [ ] Migration staging đạt.
- [ ] Health/smoke test đạt.
- [ ] Caddy validate và TLS đạt.
- [ ] Monitoring/log alert hoạt động.
- [ ] Rollback SHA và người chịu trách nhiệm đã xác định.
- [ ] Form thật lưu dữ liệu; không còn success giả.
- [ ] Privacy/consent cho thông tin cá nhân đã được duyệt.

