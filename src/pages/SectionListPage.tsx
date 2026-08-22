/**
 * pages/SectionListPage.tsx
 * Trang danh sách dùng chung cho cả 4 mảng nội dung: Tin tức, Thư viện, Tư vấn,
 * Đào tạo. Lọc theo danh mục, tìm kiếm, sắp xếp và phân trang đều chạy phía máy
 * chủ — điều kiện bắt buộc khi kho bài lên tới 555 mục.
 *
 * Trạng thái lọc lưu trên URL (?danh-muc=&tim=&trang=&sap-xep=) để chia sẻ link
 * và nút Back của trình duyệt hoạt động đúng.
 */
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Search, X } from 'lucide-react';
import Seo from '../seo/Seo';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import { breadcrumbSchema, itemListSchema } from '../seo/structuredData';
import {
  SECTION_LABEL,
  SECTION_PATH,
  articleHref,
  useArticles,
  useCategories,
  type ArticleQuery,
  type ContentSection,
} from '../lib/content';

interface SectionListPageProps {
  section: ContentSection;
  eyebrow: string;
  heading: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

const PAGE_SIZE = 12;

export default function SectionListPage({
  section,
  eyebrow,
  heading,
  description,
  seoTitle,
  seoDescription,
}: SectionListPageProps) {
  const [params, setParams] = useSearchParams();
  const { leaves: categories } = useCategories(section);

  const category = params.get('danh-muc') ?? 'all';
  const q = params.get('tim') ?? '';
  const page = Math.max(1, Number(params.get('trang')) || 1);
  const sort = (params.get('sap-xep') as ArticleQuery['sort']) ?? 'newest';

  // Ô tìm kiếm gõ tới đâu hiển thị tới đó, nhưng chỉ gọi API sau 350ms nghỉ gõ.
  const [searchDraft, setSearchDraft] = useState(q);
  useEffect(() => setSearchDraft(q), [q]);
  useEffect(() => {
    if (searchDraft === q) return;
    const timer = setTimeout(() => {
      update({ tim: searchDraft || null, trang: null });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    setParams(next, { replace: true });
  }

  const { items, total, totalPages, loading, error } = useArticles({
    section,
    category,
    q,
    page,
    pageSize: PAGE_SIZE,
    sort,
  });

  const totalInSection = useMemo(
    () => categories.reduce((sum, c) => sum + c.articleCount, 0),
    [categories],
  );

  const hasFilter = category !== 'all' || q.trim() !== '';

  return (
    <div className="pt-[64px] lg:pt-[80px] bg-[#F7F9FC] min-h-screen">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={SECTION_PATH[section]}
        jsonLd={[
          breadcrumbSchema([
            { name: 'Trang chủ', path: '/' },
            { name: SECTION_LABEL[section], path: SECTION_PATH[section] },
          ]),
          itemListSchema(items.map((a) => ({ name: a.title, path: articleHref(a) }))),
        ]}
      />

      {/* Banner tiêu đề */}
      <div className="bg-[#0B2545] text-white py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1B5FA8_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-5 h-[1.5px] bg-[#F5A623]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#F5A623]">
              {eyebrow}
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-medium tracking-[-0.02em] mt-1 leading-[1.1]">
            {heading}
          </h1>
          <p className="text-slate-400 text-[14px] mt-2 max-w-2xl mx-auto leading-[1.5]">
            {description}
          </p>
        </div>
      </div>

      {/* Thanh lọc dính đầu trang */}
      <div className="border-b border-[#E1E5ED] bg-white sticky top-[64px] lg:top-[80px] z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none pb-1.5 lg:pb-0">
              <button
                onClick={() => update({ 'danh-muc': null, trang: null })}
                className={`px-3.5 py-1.5 rounded-full text-[13px] border transition-all cursor-pointer ${
                  category === 'all'
                    ? 'bg-[#0B2545] text-white font-medium border-transparent'
                    : 'bg-white text-[#73726C] border-[#E2E8F0] hover:border-[#1B5FA8] hover:text-[#0B2545]'
                }`}
              >
                Tất cả
                {totalInSection > 0 && (
                  <span className="ml-1.5 text-[10px] tabular-nums opacity-70">{totalInSection}</span>
                )}
              </button>

              {categories.map((cat) => {
                const active = category === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => update({ 'danh-muc': cat.slug, trang: null })}
                    className={`px-3.5 py-1.5 rounded-full text-[13px] border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#0B2545] text-white font-medium border-transparent'
                        : 'bg-white text-[#73726C] border-[#E2E8F0] hover:border-[#1B5FA8] hover:text-[#0B2545]'
                    }`}
                  >
                    {cat.emoji ? `${cat.emoji} ` : ''}
                    {cat.name}
                    <span className="ml-1.5 text-[10px] tabular-nums opacity-70">
                      {cat.articleCount}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="relative w-full sm:w-56">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="search"
                  placeholder="Tìm trong toàn bộ bài viết…"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-1.5 text-[13px] text-[#1A1A18] placeholder-gray-400 focus:outline-none focus:border-[#185FA5] focus:bg-white transition-colors"
                />
                {searchDraft && (
                  <button
                    onClick={() => setSearchDraft('')}
                    aria-label="Xóa từ khóa"
                    className="absolute inset-y-0 right-2.5 flex items-center text-gray-400 hover:text-[#0B2545]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[13px] text-[#73726C]">
                <span className="text-slate-400">Sắp xếp:</span>
                <select
                  value={sort}
                  onChange={(e) => update({ 'sap-xep': e.target.value, trang: null })}
                  className="bg-white border border-[#E1E5ED] rounded-lg px-2 py-1 font-medium text-[#1A1A18] text-[13px] outline-none cursor-pointer focus:border-[#185FA5] hover:bg-slate-50"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="popular">Xem nhiều</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="title">Theo tên A→Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nội dung */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm mb-6">
            Không tải được danh sách bài viết. Vui lòng thử lại sau.
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-[#E1E5ED] overflow-hidden animate-pulse"
              >
                <div className="h-40 bg-slate-200" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-4/5" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E1E5ED] p-16 text-center shadow-sm max-w-xl mx-auto my-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#0B2545] mb-2">Chưa có bài viết phù hợp</h2>
            <p className="text-sm text-gray-400 mb-4">
              {hasFilter
                ? 'Bộ lọc hoặc từ khóa tìm kiếm hiện chưa có kết quả nào.'
                : 'Mục này chưa có bài viết được xuất bản.'}
            </p>
            {hasFilter && (
              <button
                onClick={() => update({ 'danh-muc': null, tim: null, trang: null })}
                className="text-sm font-bold text-[#1B5FA8] hover:underline"
              >
                Xem tất cả &rarr;
              </button>
            )}
          </div>
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
              onChange={(next) => update({ trang: next === 1 ? null : String(next) })}
            />
          </>
        )}
      </div>
    </div>
  );
}
