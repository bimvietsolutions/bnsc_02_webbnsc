/**
 * App.tsx
 * Khai báo bảng định tuyến (React Router). Mỗi trang được nạp theo nhu cầu
 * (React.lazy) để tách bundle, giảm dung lượng tải ban đầu. MainLayout (khung
 * Navbar/Footer) được nạp ngay vì xuất hiện ở mọi trang có bố cục.
 *
 * Bốn mảng nội dung (/tin-tuc, /thu-vien, /tu-van, /dao-tao) dùng chung
 * SectionListPage + ArticlePage; URL gốc cũ bacnam.com.vn/<slug> được máy chủ
 * 301 về đúng nhánh (xem server/routes.seo.ts).
 */
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ScrollManager from './components/ScrollManager';
import PageLoader from './components/PageLoader';

const HomePage = lazy(() => import('./pages/HomePage'));
const SectionListPage = lazy(() => import('./pages/SectionListPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const TagPage = lazy(() => import('./pages/TagPage'));
const GuideIndexPage = lazy(() => import('./pages/GuideIndexPage'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const TechnicalSupportPage = lazy(() => import('./components/TechnicalSupportPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

export default function App() {
  return (
    <>
      <ScrollManager />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Nhóm trang có khung Navbar/Footer/Modal */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />

            <Route
              path="/tin-tuc"
              element={
                <SectionListPage
                  section="NEWS"
                  eyebrow="TIN TỨC & CẬP NHẬT"
                  heading="Tin tức Bắc Nam Software"
                  description="Văn bản pháp luật, thông tin nội bộ, tin chuyên ngành xây dựng và khuyến mãi mới nhất."
                  seoTitle="Tin tức & Cập nhật"
                  seoDescription="Tin tức Bắc Nam Software: văn bản pháp luật ngành xây dựng, thông báo nội bộ, tin chuyên ngành và các chương trình khuyến mãi phần mềm Dự toán BNSC."
                />
              }
            />
            <Route path="/tin-tuc/:slug" element={<ArticlePage section="NEWS" />} />

            <Route
              path="/thu-vien"
              element={
                <SectionListPage
                  section="LIBRARY"
                  eyebrow="THƯ VIỆN HƯỚNG DẪN SỬ DỤNG"
                  heading="Tình huống sử dụng Dự toán BNSC"
                  description="Kho tài liệu chuyên môn: cài đặt, sử dụng, thẩm định và khắc phục sự cố từ đội ngũ kỹ sư BNSC."
                  seoTitle="Thư viện hướng dẫn sử dụng"
                  seoDescription="Kho tài liệu hướng dẫn cài đặt, sử dụng, thẩm định và xử lý tình huống phần mềm Dự toán BNSC từ đội ngũ kỹ sư Bắc Nam Software."
                />
              }
            />
            <Route path="/thu-vien/:slug" element={<ArticlePage section="LIBRARY" />} />

            <Route
              path="/tu-van"
              element={
                <SectionListPage
                  section="CONSULTING"
                  eyebrow="TƯ VẤN KINH TẾ XÂY DỰNG"
                  heading="Tư vấn Đơn giá & Định mức"
                  description="Các bộ Đơn giá XDCT, Đơn giá nhân công, Giá ca máy và Chỉ số giá xây dựng do BNSC tư vấn thực hiện cho các Sở Xây dựng."
                  seoTitle="Tư vấn Đơn giá & Định mức xây dựng"
                  seoDescription="Bắc Nam Software tư vấn xây dựng bộ Đơn giá XDCT, Đơn giá nhân công, Giá ca máy thiết bị thi công và Chỉ số giá xây dựng cho các Sở Xây dựng trên cả nước."
                />
              }
            />
            <Route path="/tu-van/:slug" element={<ArticlePage section="CONSULTING" />} />

            <Route
              path="/dao-tao"
              element={
                <SectionListPage
                  section="TRAINING"
                  eyebrow="ĐÀO TẠO NGHIỆP VỤ"
                  heading="Đào tạo & Bồi dưỡng nghiệp vụ"
                  description="Các khóa đào tạo lập dự toán, đo bóc khối lượng, đấu thầu và thanh quyết toán do BNSC tổ chức."
                  seoTitle="Đào tạo nghiệp vụ xây dựng"
                  seoDescription="Khóa đào tạo nghiệp vụ Lập dự toán, Đo bóc khối lượng, Đấu thầu qua mạng và Thanh quyết toán hợp đồng xây dựng do Bắc Nam Software tổ chức."
                />
              }
            />
            <Route path="/dao-tao/:slug" element={<ArticlePage section="TRAINING" />} />

            <Route path="/huong-dan" element={<GuideIndexPage />} />
            <Route path="/tag/:slug" element={<TagPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Trang toàn màn hình */}
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/ho-tro-ky-thuat" element={<TechnicalSupportPage />} />

          {/* Khu vực quản trị (auth riêng, không dùng layout site) */}
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    </>
  );
}
