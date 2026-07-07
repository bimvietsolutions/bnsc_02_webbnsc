/**
 * App.tsx
 * Khai báo bảng định tuyến (React Router). Mỗi trang được nạp theo nhu cầu
 * (React.lazy) để tách bundle, giảm dung lượng tải ban đầu. MainLayout (khung
 * Navbar/Footer) được nạp ngay vì xuất hiện ở mọi trang có bố cục.
 */
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ScrollManager from './components/ScrollManager';
import PageLoader from './components/PageLoader';

const HomePage = lazy(() => import('./pages/HomePage'));
const NewsListPage = lazy(() => import('./pages/NewsListPage'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage'));
const LibraryListPage = lazy(() => import('./pages/LibraryListPage'));
const ArticleDetailPage = lazy(() => import('./components/ArticleDetailPage'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const TechnicalSupportPage = lazy(() => import('./components/TechnicalSupportPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  return (
    <>
      <ScrollManager />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Nhóm trang có khung Navbar/Footer/Modal */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tin-tuc" element={<NewsListPage />} />
            <Route path="/tin-tuc/:slug" element={<NewsDetailPage />} />
            <Route path="/thu-vien" element={<LibraryListPage />} />
            <Route path="/thu-vien/:slug" element={<ArticleDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Trang toàn màn hình */}
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/ho-tro-ky-thuat" element={<TechnicalSupportPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
