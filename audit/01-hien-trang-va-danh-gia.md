# 01. Hiện trạng và đánh giá mã nguồn

## 1. Tổng quan

| Hạng mục | Hiện trạng | Đánh giá |
|---|---|---|
| Frontend | React 19, Vite 6, TypeScript, Tailwind CSS 4 | Giao diện phong phú, có thể giữ lại |
| Backend | Express 4 trong `server.ts` | Chỉ có `POST /api/chat` |
| Dữ liệu | Mảng trong `src/data.ts` và trực tiếp trong component | Hardcode gần như toàn bộ |
| Điều hướng | State `currentView` + anchor | Không có URL/route thật cho bài viết |
| Database | Chưa có driver, ORM, schema hoặc migration | Chưa kết nối PostgreSQL |
| Authentication | Form giả lập | Không có user/session/authorization |
| Upload/media | URL ngoài và đường dẫn source | Không có kho file |
| Docker | Không có Dockerfile/Compose | Chưa container hóa |
| CI/CD | Không có workflow hợp lệ trong source tree | Chưa tự động deploy |
| Observability | `console.log/error` | Chưa có health/readiness/metrics |
| Test | Chưa có test | Rủi ro regression cao |

## 2. Kết quả kiểm tra thực tế

- `npm run lint`: đạt (`tsc --noEmit`).
- `npm run build`: đạt.
- Bundle frontend minified khoảng **527 KB**, gzip khoảng **152 KB**; Vite cảnh báo chunk vượt 500 KB.
- Repo chỉ có một commit ban đầu.
- `package-lock.json` đang có thay đổi cục bộ từ trước; `setup/` đang untracked. Audit không sửa các thay đổi đó.
- Có file `.git/workflows/deploy.yml`, nhưng `.git/` là metadata nội bộ và file này không được commit. GitHub chỉ nhận `.github/workflows/*.yml`.

## 3. Bản đồ hardcode

### Dữ liệu dùng chung

`src/data.ts` chứa:

- menu điều hướng;
- chỉ số hero;
- sản phẩm/dịch vụ;
- dữ liệu tin mẫu;
- danh sách khách hàng.

`newsData` trong file này hiện không được `NewsSection` sử dụng; component lại có bộ `LOCAL_NEWS_DATA` riêng. Đây là dữ liệu trùng và có nguy cơ lệch nhau.

### Dữ liệu nằm trực tiếp trong component

- `Hero.tsx`: slide, ảnh, phiên bản, tác giả, lượt xem.
- `Navbar.tsx`: menu con phần mềm.
- `ConsultingAndTraining.tsx`: dịch vụ tư vấn, FAQ, khóa học, học phí, lịch học.
- `NewsSection.tsx`: danh sách tin, nội dung chi tiết, category, view.
- `EstimationLibrary.tsx`: thư viện tình huống và ảnh.
- `ArticleDetailPage.tsx`: nội dung bài cố định, sidebar, tin nóng, bài liên quan, video, file mẫu.
- `TechnicalSupportPage.tsx`: nhân viên hỗ trợ, công cụ tải, FAQ.
- `Footer.tsx`, `FloatingActions.tsx`, `server.ts`: hotline, email, social links và nội dung chatbot.

### Hành vi đang giả lập

- Đăng nhập chỉ kiểm tra form và dùng `setTimeout`, không gọi server.
- Đăng ký/tư vấn/tải phần mềm chỉ chạy progress giả.
- Yêu cầu hỗ trợ kỹ thuật chỉ hiện `alert` rồi reset form.
- Nhiều hành động tải tài liệu/mở bài chỉ hiện `alert`.
- Article detail không nhận `slug/id`; mọi card dẫn tới cùng một trang mẫu.
- Không có lưu lead, download log, ticket, feedback hay view count.

## 4. Lỗi và nợ kỹ thuật đáng chú ý

### Mức P0/P1

- Secrets thật đã được ghi rõ trong tài liệu setup; xem tài liệu bảo mật.
- Không có xác thực/authorization thật nhưng UI tạo cảm giác đã có hệ thống tài khoản.
- Không có validation server-side, rate limit hoặc giới hạn payload cho `/api/chat`.
- History chat do client gửi nguyên trạng, có thể làm tăng chi phí/token và bị prompt injection.
- Model Gemini đang hardcode tên; cần xác minh model thực tế được tài khoản hỗ trợ trước khi production.

### Mức P1/P2

- Hai ảnh hero dùng chuỗi `/src/assets/...`. Build giữ nguyên chuỗi này; production Express phục vụ `dist`, nên request `/src/assets/...` sẽ 404. Cần import asset bằng TypeScript hoặc đặt trong `public/`.
- SPA không có router: refresh/deep-link, SEO, canonical URL, sitemap và chia sẻ bài viết đều yếu.
- Dùng nhiều ảnh Unsplash/logo website ngoài; availability, quyền sử dụng, hiệu năng và privacy phụ thuộc bên thứ ba.
- Script vChat được inject từ domain ngoài, chưa có CSP/consent/integrity policy.
- `PORT` bị hardcode `3000`, không đọc `process.env.PORT`.
- Không có graceful shutdown, health check, request ID, structured log hay error middleware.
- Type dùng `any` trong server/chat và có type nội dung bị định nghĩa lặp.
- Component rất lớn (`ArticleDetailPage`, `NewsSection`), khó test và khó nối API.
- Không có loading skeleton/error/empty state chuẩn hóa.
- Không có accessibility/SEO audit, sitemap, robots, OpenGraph hay schema.org.
- Script `clean` dùng `rm -rf`, không chạy native trên Windows PowerShell.

## 5. Điểm có thể tái sử dụng

- Thiết kế và phần lớn JSX/CSS có thể giữ nguyên.
- Component đã chia theo khu vực nghiệp vụ tương đối rõ.
- TypeScript compile sạch.
- Express đã cùng origin với frontend, thuận lợi để thêm `/api/v1`.
- `.env*` đã được ignore, trừ `.env.example`.
- Production server có fallback SPA.

## 6. Đánh giá mức sẵn sàng

| Năng lực | Điểm / 5 | Ghi chú |
|---|---:|---|
| UI/UX prototype | 4 | Nhiều màn hình và trạng thái |
| Production build | 3 | Build được, còn lỗi asset/chunk |
| Backend nghiệp vụ | 1 | Chỉ có chat |
| Data persistence | 0 | Chưa có |
| Security | 1 | Secrets lộ, thiếu hardening |
| Deploy automation | 1 | Có bản nháp trong tài liệu, chưa dùng được |
| Operations | 1 | Chưa backup, health, rollback |
| Tổng thể production | 1.5 | Cần phase nền tảng trước khi public |

