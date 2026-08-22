/**
 * pages/ArticlePage.tsx
 * Trang chi tiết bài viết dùng chung cho cả 4 mảng nội dung.
 *
 * Nội dung bài là HTML chuyển từ website cũ (đã sanitize ở tầng import/API) nên
 * render qua ArticleBody thay vì đổ text thuần như bản trước.
 */
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Calendar, ChevronRight, Download, Eye, Paperclip, Tag as TagIcon, User,
} from 'lucide-react';
import Seo from '../seo/Seo';
import NotFoundPage from './NotFoundPage';
import PageLoader from '../components/PageLoader';
import ArticleBody from '../components/ArticleBody';
import ArticleCard from '../components/ArticleCard';
import { articleSchema, breadcrumbSchema } from '../seo/structuredData';
import {
  SECTION_LABEL, SECTION_PATH, displayDate, useArticle, type ContentSection,
} from '../lib/content';

interface ArticlePageProps {
  /** Mảng mong đợi — dùng cho breadcrumb khi API chưa trả về. */
  section: ContentSection;
}

export default function ArticlePage({ section }: ArticlePageProps) {
  const { slug } = useParams<{ slug: string }>();
  const { article, loading, notFound } = useArticle(slug);

  if (loading) return <PageLoader />;
  if (notFound || !article) return <NotFoundPage />;

  const actual = article.section ?? section;
  const listPath = SECTION_PATH[actual];
  const listLabel = SECTION_LABEL[actual];
  const path = `${listPath}/${article.slug}`;
  const date = displayDate(article);
  const description = article.metaDescription ?? article.summary ?? '';

  return (
    <div className="pt-[64px] lg:pt-[80px] bg-[#F7F9FC] min-h-screen">
      <Seo
        title={article.metaTitle ?? article.title}
        description={description}
        path={path}
        image={article.ogImage ?? article.coverUrl ?? undefined}
        type="article"
        jsonLd={[
          breadcrumbSchema([
            { name: 'Trang chủ', path: '/' },
            { name: listLabel, path: listPath },
            { name: article.title, path },
          ]),
          articleSchema({
            title: article.title,
            description,
            path,
            image: article.ogImage ?? article.coverUrl ?? undefined,
          }),
        ]}
      />

      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium flex-wrap">
            <Link to="/" className="hover:text-[#1B5FA8] transition-colors">Trang chủ</Link>
            <span className="text-[#CBD5E1]">›</span>
            <Link to={listPath} className="hover:text-[#1B5FA8] transition-colors">{listLabel}</Link>
            {article.category && (
              <>
                <span className="text-[#CBD5E1]">›</span>
                <Link
                  to={`${listPath}?danh-muc=${article.category.slug}`}
                  className="hover:text-[#1B5FA8] transition-colors"
                >
                  {article.category.name}
                </Link>
              </>
            )}
            <span className="text-[#CBD5E1]">›</span>
            <span className="text-[#0B2545] font-semibold truncate max-w-[180px] sm:max-w-none">
              {article.title}
            </span>
          </nav>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={listPath}
          className="inline-flex items-center gap-1.5 text-xs text-[#1B5FA8] hover:text-[#0B2545] font-bold mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Quay lại {listLabel}</span>
        </Link>

        {article.category && (
          <Link
            to={`${listPath}?danh-muc=${article.category.slug}`}
            className="inline-block bg-[#1B5FA8]/10 text-[#1B5FA8] px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-4 hover:bg-[#1B5FA8]/20 transition-colors"
          >
            {article.category.emoji ? `${article.category.emoji} ` : ''}
            {article.category.name}
          </Link>
        )}

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] leading-tight tracking-tight mb-4">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-5 border-b border-slate-200 mb-6">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#1B5FA8]" /> {article.author ?? 'Ban Biên Tập BNSC'}
          </span>
          {date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#1B5FA8]" /> {date}
            </span>
          )}
          <span className="flex items-center gap-1.5 tabular-nums">
            <Eye className="w-3.5 h-3.5 text-[#1B5FA8]" />
            {article.views.toLocaleString('vi-VN')} lượt xem
          </span>
        </div>

        {article.coverUrl && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 mb-6 bg-slate-100">
            <img
              src={article.coverUrl}
              alt={article.coverAlt ?? article.title}
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[420px] object-cover"
            />
          </div>
        )}

        {article.summary && (
          <div className="bg-white border-l-4 border-[#F5A623] p-4 rounded-r-xl italic text-sm text-slate-600 leading-relaxed mb-8 shadow-sm">
            {article.summary}
          </div>
        )}

        {article.attachmentUrl && (
          <a
            href={article.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white border border-[#E1E5ED] rounded-xl p-4 mb-8 hover:border-[#1B5FA8] hover:shadow-md transition-all group"
          >
            <span className="w-10 h-10 rounded-lg bg-[#1B5FA8]/10 flex items-center justify-center shrink-0">
              <Paperclip className="w-5 h-5 text-[#1B5FA8]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-bold text-[#0B2545] truncate group-hover:text-[#1B5FA8]">
                {article.attachmentName ?? 'Tệp đính kèm'}
              </span>
              {article.attachmentSize && (
                <span className="block text-[11px] text-slate-400">{article.attachmentSize}</span>
              )}
            </span>
            <Download className="w-4 h-4 text-[#1B5FA8] shrink-0" />
          </a>
        )}

        <ArticleBody html={article.contentHtml} />

        {article.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-200 flex items-start gap-2.5 flex-wrap">
            <TagIcon className="w-4 h-4 text-slate-400 mt-1.5 shrink-0" />
            {article.tags.map((tag) => (
              <Link
                key={tag.slug}
                to={`/tag/${tag.slug}`}
                className="px-3 py-1.5 rounded-full bg-white border border-[#E1E5ED] text-[12px] text-[#73726C] hover:border-[#1B5FA8] hover:text-[#1B5FA8] transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Điều hướng trong mục lục giáo trình */}
        {(article.prev || article.next) && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {article.prev ? (
              <Link
                to={article.prev.href}
                className="group bg-white rounded-xl border border-[#E1E5ED] p-4 hover:border-[#1B5FA8]/50 hover:shadow-md transition-all flex items-center gap-3"
              >
                <ArrowLeft className="w-4 h-4 text-[#1B5FA8] shrink-0 transition-transform group-hover:-translate-x-1" />
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Bài trước
                  </span>
                  <span className="block text-[13px] font-semibold text-[#0B2545] line-clamp-1 group-hover:text-[#1B5FA8]">
                    {article.prev.title}
                  </span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {article.next && (
              <Link
                to={article.next.href}
                className="group bg-white rounded-xl border border-[#E1E5ED] p-4 hover:border-[#1B5FA8]/50 hover:shadow-md transition-all flex items-center gap-3 sm:justify-end sm:text-right"
              >
                <span className="min-w-0 order-1 sm:order-none">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Bài tiếp theo
                  </span>
                  <span className="block text-[13px] font-semibold text-[#0B2545] line-clamp-1 group-hover:text-[#1B5FA8]">
                    {article.next.title}
                  </span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#1B5FA8] shrink-0 order-2 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        )}

        {article.related.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-sm font-extrabold uppercase text-[#0B2545] tracking-widest mb-5 flex items-center gap-2">
              Bài viết liên quan
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {article.related.slice(0, 4).map((rel) => (
                <ArticleCard key={rel.id} item={rel} variant="row" />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
