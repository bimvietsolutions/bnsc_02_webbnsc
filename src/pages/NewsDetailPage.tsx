/**
 * pages/NewsDetailPage.tsx
 * Trang chi tiết một tin tức (/tin-tuc/:slug).
 */
import { Link, useParams } from 'react-router-dom';
import { Calendar, Eye, User, ChevronRight, ArrowLeft } from 'lucide-react';
import { getNewsBySlug, newsArticles } from '../data/news';
import Seo from '../seo/Seo';
import NotFoundPage from './NotFoundPage';
import PageLoader from '../components/PageLoader';
import { useApi } from '../lib/api';
import { mapNewsOne, type ApiNews } from '../lib/publicData';
import { breadcrumbSchema, articleSchema } from '../seo/structuredData';

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const staticArticle = (slug ? getNewsBySlug(slug) : undefined) as ApiNews | undefined;
  const { data: article, loading } = useApi<ApiNews | null>(
    slug ? `/api/public/news/${slug}` : null,
    staticArticle ?? null,
    mapNewsOne,
  );

  if (loading && !article) return <PageLoader />;
  if (!article) return <NotFoundPage />;

  const related = newsArticles
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 4);

  return (
    <div className="pt-[64px] lg:pt-[80px] bg-[#F7F9FC] min-h-screen">
      <Seo
        title={article.title}
        description={article.excerpt}
        path={`/tin-tuc/${article.slug}`}
        image={article.imageUrl ?? undefined}
        type="article"
        jsonLd={[
          breadcrumbSchema([
            { name: 'Trang chủ', path: '/' },
            { name: 'Tin tức', path: '/tin-tuc' },
            { name: article.title, path: `/tin-tuc/${article.slug}` },
          ]),
          articleSchema({
            title: article.title,
            description: article.excerpt,
            path: `/tin-tuc/${article.slug}`,
            image: article.imageUrl ?? undefined,
          }),
        ]}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium flex-wrap">
            <Link to="/" className="hover:text-[#1B5FA8] transition-colors">Trang chủ</Link>
            <span className="text-[#CBD5E1]">›</span>
            <Link to="/tin-tuc" className="hover:text-[#1B5FA8] transition-colors">Tin tức</Link>
            <span className="text-[#CBD5E1]">›</span>
            <span className="text-[#0B2545] font-semibold truncate max-w-[180px] sm:max-w-none">
              {article.title}
            </span>
          </nav>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/tin-tuc"
          className="inline-flex items-center gap-1.5 text-xs text-[#1B5FA8] hover:text-[#0B2545] font-bold mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Quay lại Tin tức</span>
        </Link>

        <span className="inline-block bg-[#1B5FA8]/10 text-[#1B5FA8] px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-4">
          {article.category}
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] leading-tight tracking-tight mb-4">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-5 border-b border-slate-200 mb-6">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#1B5FA8]" /> Ban Biên Tập BNSC
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#1B5FA8]" /> {article.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#1B5FA8]" /> {article.views.toLocaleString()} lượt xem
          </span>
        </div>

        {article.imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 mb-6">
            <img
              src={article.imageUrl}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[380px] object-cover"
            />
          </div>
        )}

        <div className="bg-[#F7F9FC] border-l-4 border-[#F5A623] p-4 rounded-r-xl italic text-sm text-slate-600 leading-relaxed mb-8">
          {article.excerpt}
        </div>

        <div className="prose max-w-none text-[#1A2332] text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
          {article.contentBody}
        </div>

        {/* Related news */}
        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-sm font-extrabold uppercase text-[#0B2545] tracking-widest mb-5">
              Tin cùng chuyên mục
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/tin-tuc/${rel.slug}`}
                  className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-[#1B5FA8]/40 transition-all flex items-start justify-between gap-3"
                >
                  <div>
                    <h3 className="text-[13.5px] font-bold text-[#0B2545] leading-snug line-clamp-2 group-hover:text-[#1B5FA8] transition-colors">
                      {rel.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 mt-1.5 block">{rel.date}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-1 group-hover:text-[#1B5FA8]" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
