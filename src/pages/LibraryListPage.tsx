/**
 * pages/LibraryListPage.tsx
 * Trang Thư viện hướng dẫn / tình huống sử dụng (/thu-vien).
 */
import EstimationLibrary from '../components/EstimationLibrary';
import Seo from '../seo/Seo';
import { libraryArticles } from '../data/library';
import { breadcrumbSchema, itemListSchema } from '../seo/structuredData';

export default function LibraryListPage() {
  return (
    <div className="pt-[64px] lg:pt-[80px]">
      <Seo
        title="Thư viện hướng dẫn sử dụng"
        description="Kho tài liệu hướng dẫn cài đặt, sử dụng, thẩm định và xử lý tình huống phần mềm Dự toán BNSC từ đội ngũ kỹ sư Bắc Nam Software."
        path="/thu-vien"
        jsonLd={[
          breadcrumbSchema([
            { name: 'Trang chủ', path: '/' },
            { name: 'Thư viện', path: '/thu-vien' },
          ]),
          itemListSchema(
            libraryArticles.map((a) => ({ name: a.title, path: `/thu-vien/${a.slug}` })),
          ),
        ]}
      />
      <EstimationLibrary />
    </div>
  );
}
