/**
 * pages/NewsListPage.tsx
 * Trang danh sách Tin tức (/tin-tuc) – tái sử dụng NewsSection, bổ sung SEO.
 */
import NewsSection from '../components/NewsSection';
import Seo from '../seo/Seo';
import { newsArticles } from '../data/news';
import { breadcrumbSchema, itemListSchema } from '../seo/structuredData';

export default function NewsListPage() {
  return (
    <div className="pt-[64px] lg:pt-[80px]">
      <Seo
        title="Tin tức & Cập nhật"
        description="Tin tức Bắc Nam Software: văn bản pháp luật ngành xây dựng, thông báo nội bộ, tin chuyên ngành và các chương trình khuyến mãi phần mềm Dự toán BNSC."
        path="/tin-tuc"
        jsonLd={[
          breadcrumbSchema([
            { name: 'Trang chủ', path: '/' },
            { name: 'Tin tức', path: '/tin-tuc' },
          ]),
          itemListSchema(
            newsArticles.map((a) => ({ name: a.title, path: `/tin-tuc/${a.slug}` })),
          ),
        ]}
      />
      <NewsSection />
    </div>
  );
}
