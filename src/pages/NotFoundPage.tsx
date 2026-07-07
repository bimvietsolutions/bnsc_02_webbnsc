/**
 * pages/NotFoundPage.tsx
 * Trang 404 – không lập chỉ mục.
 */
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import Seo from '../seo/Seo';

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Không tìm thấy trang" path="/404" noindex />
      <section className="min-h-[60vh] flex items-center justify-center bg-slate-50 px-4 py-20">
        <div className="text-center max-w-md">
          <p className="text-[80px] font-black text-[#1B5FA8] leading-none">404</p>
          <h1 className="text-xl font-bold text-[#0B2545] mt-2 mb-3">
            Rất tiếc, không tìm thấy trang bạn yêu cầu
          </h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Nội dung có thể đã được di chuyển hoặc không còn tồn tại. Vui lòng quay lại trang chủ
            hoặc tra cứu trong thư viện hướng dẫn của Bắc Nam Software.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#F5A623] hover:bg-[#E09413] text-[#0B2545] font-bold text-sm px-5 py-3 rounded-xl transition-colors"
            >
              <Home className="w-4 h-4" /> Về trang chủ
            </Link>
            <Link
              to="/thu-vien"
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-[#1B5FA8] text-[#0B2545] font-bold text-sm px-5 py-3 rounded-xl transition-colors"
            >
              <Search className="w-4 h-4" /> Thư viện hướng dẫn
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
