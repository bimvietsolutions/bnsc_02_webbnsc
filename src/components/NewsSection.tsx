/**
 * components/NewsSection.tsx — Khối "Tin tức" trên trang chủ.
 *
 * Đây là khối XEM TRƯỚC, không phải trang danh sách. Trang danh sách thật là
 * /tin-tuc, có lọc theo danh mục, tìm kiếm và phân trang phía máy chủ.
 *
 * Bản trước đây dựng lại toàn bộ giao diện danh sách ngay tại trang chủ: tab
 * theo danh mục, ô tìm kiếm, dropdown sắp xếp, phân trang — nhưng chỉ tải 60
 * bài rồi lọc phía trình duyệt, trong khi nhãn tab lấy số thật từ CSDL. Kết quả
 * là tab ghi "Văn bản QPPL (260)" mà bấm vào chỉ ra vài chục bài, và gõ tìm một
 * bài cũ thì báo không có dù bài vẫn nằm trong kho 381 bài.
 *
 * Nay chỉ lấy đúng 6 bài mới nhất qua cùng API mà /tin-tuc dùng, và số bài hiển
 * thị trên nút "Xem tất cả" là `total` thật do máy chủ trả về.
 */
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useArticles } from '../lib/content';
import ArticleCard from './ArticleCard';

const SO_BAI_XEM_TRUOC = 6;

export default function NewsSection() {
  const { items, total, loading } = useArticles({ section: 'NEWS', pageSize: SO_BAI_XEM_TRUOC });

  return (
    <section id="tin-tuc" className="bg-[#F7F9FC] py-14 border-t border-[#E1E5ED] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-[1.5px] bg-[#F5A623]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#185FA5]">
                Tin tức &amp; cập nhật
              </span>
            </div>
            <h2 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.02em] text-[#0B2545] leading-[1.15]">
              Tin tức Bắc Nam Software
            </h2>
            <p className="text-[#73726C] text-[14px] mt-1.5 max-w-2xl leading-[1.5]">
              Văn bản pháp luật, thông tin nội bộ, chuyên ngành xây dựng và khuyến mãi mới nhất.
            </p>
          </div>

          <Link
            to="/tin-tuc"
            className="shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-[#E1E5ED] bg-white text-[13px] font-semibold text-[#185FA5] hover:border-[#1B5FA8] hover:bg-[#185FA5] hover:text-white transition-colors"
          >
            Xem tất cả
            {total > 0 && <span className="tabular-nums">{total.toLocaleString('vi-VN')} bài</span>}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: SO_BAI_XEM_TRUOC }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E1E5ED] overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-200" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-4 w-full bg-slate-200 rounded" />
                  <div className="h-4 w-4/5 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-[#73726C] text-sm py-10">
            Chưa có tin tức nào được đăng.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <ArticleCard key={item.id} item={item} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
