/**
 * pages/GuideIndexPage.tsx
 * Mục lục giáo trình "DỰ TOÁN BNSC" (/huong-dan).
 *
 * Khôi phục cấu trúc bảng `series` của website cũ: 1 giáo trình gốc, 5 phần
 * (Cài đặt / Sử dụng / Thẩm định / Tình huống khác / Lập Dự toán - Dự thầu) và
 * 140 bài học có thứ tự. Mục chưa có bài hiển thị mờ, không phải liên kết.
 */
import { Link } from 'react-router-dom';
import { BookOpen, Eye, FileText } from 'lucide-react';
import Seo from '../seo/Seo';
import PageLoader from '../components/PageLoader';
import { useSeries, type SeriesNode } from '../lib/content';
import { breadcrumbSchema } from '../seo/structuredData';

function LessonRow({ node }: { node: SeriesNode }) {
  const content = (
    <>
      <FileText className="w-3.5 h-3.5 shrink-0 text-[#1B5FA8]" />
      <span className="flex-1 min-w-0 text-[13.5px] leading-snug">{node.title}</span>
      {node.views !== null && (
        <span className="flex items-center gap-1 text-[11px] text-slate-400 tabular-nums shrink-0">
          <Eye className="w-3 h-3" />
          {node.views.toLocaleString('vi-VN')}
        </span>
      )}
    </>
  );

  if (!node.href) {
    return (
      <li
        className="flex items-center gap-2.5 px-3.5 py-2.5 text-slate-400 cursor-default"
        title="Nội dung đang được biên soạn"
      >
        {content}
      </li>
    );
  }

  return (
    <li>
      <Link
        to={node.href}
        className="flex items-center gap-2.5 px-3.5 py-2.5 text-[#1A1A18] hover:bg-[#1B5FA8]/5 hover:text-[#1B5FA8] transition-colors rounded-lg"
      >
        {content}
      </Link>
    </li>
  );
}

function PartBlock({ node }: { node: SeriesNode }) {
  const total = node.children.length;
  const ready = node.children.filter((c) => c.href).length;

  return (
    <section className="bg-white rounded-2xl border border-[#E1E5ED] shadow-sm overflow-hidden">
      <header className="bg-[#0B2545] text-white px-5 py-3.5 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight">{node.title}</h2>
        <span className="text-[11px] text-slate-300 tabular-nums shrink-0">
          {ready}/{total} bài
        </span>
      </header>
      <ul className="p-2 divide-y divide-slate-100">
        {node.children.map((child) => (
          <LessonRow key={child.id} node={child} />
        ))}
      </ul>
    </section>
  );
}

export default function GuideIndexPage() {
  const { tree, loading } = useSeries();

  if (loading) return <PageLoader />;

  // Cây có 1 gốc "DỰ TOÁN BNSC"; nếu vì lý do nào đó không có, dùng luôn cấp 1.
  const root = tree.length === 1 ? tree[0] : null;
  const parts = root ? root.children : tree;
  const lessons = parts.reduce((sum, p) => sum + p.children.length, 0);

  return (
    <div className="pt-[64px] lg:pt-[80px] bg-[#F7F9FC] min-h-screen">
      <Seo
        title="Mục lục giáo trình Dự toán BNSC"
        description="Toàn bộ giáo trình sử dụng phần mềm Dự toán BNSC theo trình tự: cài đặt, sử dụng, thẩm định, xử lý tình huống và lập dự toán - dự thầu."
        path="/huong-dan"
        jsonLd={[
          breadcrumbSchema([
            { name: 'Trang chủ', path: '/' },
            { name: 'Mục lục hướng dẫn', path: '/huong-dan' },
          ]),
        ]}
      />

      <div className="bg-[#0B2545] text-white py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1B5FA8_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        <div className="relative max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#F5A623] mb-2">
            <BookOpen className="w-3.5 h-3.5" /> Giáo trình chính thức
          </span>
          <h1 className="text-[28px] sm:text-[32px] font-medium tracking-[-0.02em] leading-[1.1]">
            {root?.title ?? 'DỰ TOÁN BNSC'}
          </h1>
          <p className="text-slate-400 text-[14px] mt-2 max-w-2xl mx-auto leading-[1.5]">
            {parts.length} phần · {lessons} bài học — học tuần tự từ cài đặt tới lập dự toán, dự thầu
            thực tế.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {parts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E1E5ED] p-16 text-center shadow-sm">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-400">Mục lục hướng dẫn chưa được thiết lập.</p>
            <Link to="/thu-vien" className="text-sm font-bold text-[#1B5FA8] hover:underline mt-3 inline-block">
              Xem Thư viện &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {parts.map((part) => (
              <PartBlock key={part.id} node={part} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
