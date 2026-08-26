-- Bỏ bốn bảng của mô hình nội dung cũ.
--
-- Chúng có từ trước lần di trú, được gieo từ hai tệp dữ liệu cứng
-- src/data/news.ts và src/data/library.ts (đã xoá khỏi repo). Toàn bộ nội dung
-- thật của website nay nằm ở bảng `articles` hợp nhất, nạp từ bản export
-- bacnamco_beta của website cũ.
--
-- Đã kiểm trên máy chủ trước khi bỏ:
--   news_articles      13 dòng      library_articles     20 dòng
--   news_categories     4 dòng      library_categories    6 dòng
-- Cả 33 dòng bài viết có createdAt = updatedAt = 2026-07-06 07:41:10.711,
-- tức cùng một giao dịch gieo dữ liệu, không dòng nào từng được sửa.
--
-- Trang công khai đã không còn đọc chúng: /api/public/news và /library nay là
-- alias đọc từ bảng `articles`. Bốn resource tương ứng cũng đã gỡ khỏi trang
-- quản trị trong cùng lần thay đổi này.
--
-- Bản sao lưu pg_dump của cả bốn bảng đặt tại /root trên VPS trước khi chạy.

-- Bảng bài viết tham chiếu bảng danh mục nên phải bỏ trước.
DROP TABLE IF EXISTS "news_articles";
DROP TABLE IF EXISTS "library_articles";
DROP TABLE IF EXISTS "news_categories";
DROP TABLE IF EXISTS "library_categories";
