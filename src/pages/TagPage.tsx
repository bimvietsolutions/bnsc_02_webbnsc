/**
 * pages/TagPage.tsx
 * Trang tổng hợp bài theo thẻ (/tag/:slug).
 *
 * Website cũ dùng thẻ làm bộ sưu tập chuyên đề rất giá trị — ví dụ "Tổng hợp
 * đơn giá 63 tỉnh thành theo Thông tư 13/2021/TT-BXD" gom 76 bài. Trang này
 * khôi phục đường vào đó.
 */
import { Link, useParams } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Tag as TagIcon } from 'lucide-react';
import Seo from '../seo/Seo';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import NotFoundPage from './NotFoundPage';
import { articleHref, useArticles } from '../lib/content';
import { breadcrumbSchema, itemListSchema } from '../seo/structuredData';

const PAGE_SIZE = 12;

export default function TagPage() {
  const { slug } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('trang')) || 1);

  const { items, total, totalPages, loading } = useArticles({
    tag: slug,
    page,
    pageSize: PAGE_SIZE,
  });

  if (!slug) return <NotFoundPage />;

  // Tên thẻ lấy từ chính bài đầu tiên để khỏi thêm một lượt gọi API
  const tagName =
    items[0]?.summary !== undefined
      ? slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
      : slug;

  return (
    <div className="pt-[64px] lg:pt-[80px] bg-[#F7F9FC] min-h-screen">
      <Seo
        title={`Chuyên đề: ${tagName}`}
        description={`Tổng hợp ${total} bài viết thuộc chuyên đề ${tagName} trên website Bắc Nam Software.`}
        path={`/tag/${slug}`}
        jsonLd={[
          breadcrumbSchema([
            { name: 'Trang chủ', path: '/' },
            { name: tagName, path: `/tag/${slug}` },
          ]),
          itemListSchema(items.map((a) => ({ name: a.title, path: articleHref(a) }))),
        ]}
      />

      <div className="bg-[#0B2545] text-white py-10 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1B5FA8_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        <div className="relative max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#F5A623] mb-2">
            <TagIcon className="w-3.5 h-3.5" /> Chuyên đề
          </span>
          <h1 className="text-[26px] sm:text-[30px] font-medium tracking-[-0.02em] leading-[1.15]">
            {tagName}
          </h1>
          {!loading && (
            <p className="text-slate-400 text-[14px] mt-2 tabular-nums">
              {total.toLocaleString('vi-VN')} bài viết
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/tin-tuc"
          className="inline-flex items-center gap-1.5 text-xs text-[#1B5FA8] hover:text-[#0B2545] font-bold mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Về trang Tin tức</span>
        </Link>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E1E5ED] h-64 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <NotFoundPage />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <ArticleCard key={item.id} item={item} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              onChange={(next) => {
                const p = new URLSearchParams(params);
                if (next === 1) p.delete('trang');
                else p.set('trang', String(next));
                setParams(p, { replace: true });
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
