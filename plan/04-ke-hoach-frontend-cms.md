# 04. Kế hoạch frontend và CMS

## 1. Tái cấu trúc frontend tối thiểu

Giữ giao diện hiện có, bổ sung:

```text
src/
  api/
    client.ts
    contracts.ts
  hooks/
  routes/
  features/
    home/
    articles/
    products/
    courses/
    library/
    support/
    auth/
    admin/
  components/
    states/
```

- Một API client xử lý JSON, timeout, error mapping và request ID.
- Type DTO dùng chung hoặc generate từ OpenAPI.
- Không gọi `fetch` rải rác trong component.
- Loading/error/empty components dùng chung.

## 2. Routing

Thêm React Router:

```text
/
/tin-tuc
/tin-tuc/:slug
/thu-vien
/thu-vien/:slug
/san-pham/:slug
/dao-tao/:slug
/ho-tro-ky-thuat
/dang-nhap
/admin/*
```

Thay `currentView` trong `App.tsx` bằng route. Kiểm tra:

- back/forward browser;
- refresh trực tiếp;
- URL 404;
- anchor trên trang chủ;
- title/canonical/OpenGraph theo route.

## 3. Chuyển hardcode theo module

### Module 1 — Site shell

- `AnnouncementBar`, `Navbar`, `Footer`, social/contact.
- Dùng `site-config`.
- Giữ default development fixture, production không fallback im lặng.

### Module 2 — Home

- Hero slides/statistics.
- Products.
- Customers.
- FAQ/tư vấn/khóa học.

### Module 3 — News

- Xóa dữ liệu trùng giữa `src/data.ts` và `NewsSection`.
- List dùng query/pagination server.
- Detail nhận slug.
- Related/hot news từ API.
- Share URL dùng route thật.

### Module 4 — Library/support

- Library search/filter từ API.
- Document download qua asset/download endpoint.
- Support staff, tools và FAQ từ server.

### Module 5 — Forms

- Thay `setTimeout`, progress và `alert` giả bằng mutation thật.
- Có trạng thái submitting/success/error và retry.
- Chỉ reset form sau response thành công.
- Hiển thị privacy consent.
- Không nói “đã tiếp nhận” nếu server không lưu được.

## 4. Xử lý media

- Hai ảnh hero local phải import đúng hoặc chuyển qua media storage.
- Download/rehash ảnh ngoài cần kiểm tra quyền sử dụng.
- Lưu alt text, width/height và variant.
- Lazy load ảnh dưới fold.
- Không dùng URL source `/src/assets/...` trong production.
- Có placeholder khi media lỗi.

## 5. CMS

### Route và layout

```text
/admin/login
/admin/dashboard
/admin/articles
/admin/products
/admin/courses
/admin/library
/admin/media
/admin/leads
/admin/support-tickets
/admin/settings
```

### Chức năng theo đợt

1. Login/logout/me và guard route.
2. Article list/create/edit/draft/publish.
3. Category/tag.
4. Products/courses/home blocks.
5. Media upload/select/alt text.
6. Leads/tickets workflow.
7. Settings/menu/announcement.
8. Audit log.

### Phân quyền

| Vai trò | Quyền chính |
|---|---|
| Admin | Tất cả, user/role/settings |
| Editor | Nội dung và media, không quản lý user/secret |
| Support | Xem/cập nhật lead và ticket |

API là lớp quyết định quyền; ẩn nút ở UI không thay thế authorization.

## 6. Editor nội dung

- Chọn Markdown hoặc structured editor JSON.
- Sanitize khi lưu/hiển thị.
- Preview draft.
- Autosave có version hoặc cảnh báo conflict.
- Slug có preview và kiểm tra unique.
- Publish/schedule/unpublish.
- Không cho nhúng script/iframe tùy ý; YouTube dùng block whitelist.

## 7. SEO và hiệu năng

- Route-level lazy loading cho admin/article/support.
- Tách bundle lớn; đo lại sau mỗi phase.
- Sitemap, robots, canonical, OpenGraph, JSON-LD.
- Cache API public và invalidate khi publish.
- Cân nhắc prerender/SSR sau khi dữ liệu thật ổn định.
- Accessibility: keyboard, label, focus, contrast, reduced motion.

## 8. Definition of Done cho mỗi module

- Không còn mảng hardcode tương ứng trong component.
- API failure không làm blank page.
- Loading/empty/error được test.
- URL và refresh hoạt động.
- Responsive không regress.
- Nội dung trước/sau được đối chiếu.
- Unit/component test và ít nhất một E2E happy path.

