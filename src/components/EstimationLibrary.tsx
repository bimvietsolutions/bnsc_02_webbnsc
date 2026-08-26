/**
 * components/EstimationLibrary.tsx — Khối "Thư viện" trên trang chủ.
 *
 * Khối XEM TRƯỚC, giống NewsSection. Trang danh sách thật là /thu-vien.
 *
 * Bản trước tải 60 bài rồi lọc/tìm phía trình duyệt trong khi kho có 127 bài,
 * nên tab và ô tìm kiếm ở đây cho kết quả không khớp với trang thật. Nay chỉ
 * lấy 6 bài mới nhất qua cùng API mà /thu-vien dùng.
 */
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useArticles } from '../lib/content';
import ArticleCard from './ArticleCard';

const SO_BAI_XEM_TRUOC = 6;

export default function EstimationLibrary() {
  const { items, total, loading } = useArticles({ section: 'LIBRARY', pageSize: SO_BAI_XEM_TRUOC });

  return (
    <section id="thuvien-tinhhuong" className="py-14 bg-white border-t border-[#E1E5ED] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-[1.5px] bg-[#F5A623]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#185FA5]">
                Thư viện tình huống
              </span>
            </div>
            <h2 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.02em] text-[#0B2545] leading-[1.15]">
              Hướng dẫn &amp; xử lý tình huống
            </h2>
            <p className="text-[#73726C] text-[14px] mt-1.5 max-w-2xl leading-[1.5]">
              Cài đặt, sử dụng, thẩm định và các tình huống thường gặp khi làm việc với phần mềm Dự toán BNSC.
            </p>
          </div>

          <Link
            to="/thu-vien"
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
            Chưa có bài thư viện nào được đăng.
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
