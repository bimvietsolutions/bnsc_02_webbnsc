/**
 * components/MainLayout.tsx
 * Bố cục chính (khung có Announcement, Navbar, Footer, Modal, FloatingActions)
 * bao quanh các trang nội dung qua <Outlet/>. Sở hữu state modal và cung cấp
 * UiActions cho toàn bộ cây con.
 */
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import { UiActionsContext, type ModalTab, type UiActions } from '../context/UiActions';

// Nạp trễ các thành phần không cần cho lần hiển thị đầu (modal chỉ mở khi cần,
// FloatingActions kéo theo thư viện animation "motion" khá nặng).
const InteractiveModal = lazy(() => import('./InteractiveModal'));
const FloatingActions = lazy(() => import('./FloatingActions'));

export default function MainLayout() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>('download');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Cho phép mở modal qua query param, ví dụ điều hướng từ trang Đăng nhập:
  // /?modal=register hoặc /?modal=download
  useEffect(() => {
    const modal = searchParams.get('modal');
    if (modal === 'register' || modal === 'download' || modal === 'consult') {
      setModalTab(modal);
      if (modal === 'download') setSelectedProductId('du-toan-bnsc');
      setModalOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('modal');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const actions = useMemo<UiActions>(
    () => ({
      openDownload: (productId = 'du-toan-bnsc') => {
        setSelectedProductId(productId);
        setModalTab('download');
        setModalOpen(true);
      },
      openRegister: () => {
        setModalTab('register');
        setModalOpen(true);
      },
      openConsult: (courseId?: string) => {
        setModalTab('consult');
        if (courseId) setSelectedProductId(courseId);
        setModalOpen(true);
      },
    }),
    [],
  );

  return (
    <UiActionsContext.Provider value={actions}>
      <div className="flex flex-col min-h-screen bg-slate-50 relative selection:bg-[#F5A623]/30 selection:text-[#0B2545]">
        <AnnouncementBar onDownloadClick={() => actions.openDownload()} />

        <Navbar
          onDownloadClick={() => actions.openDownload()}
          onLoginClick={() => navigate('/dang-nhap')}
          onRegisterClick={actions.openRegister}
        />

        <main className="flex-grow">
          <Outlet />
        </main>

        <Footer />

        <Suspense fallback={null}>
          {modalOpen && (
            <InteractiveModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              initialTab={modalTab}
              selectedProductId={selectedProductId}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          <FloatingActions onStartTechnicalSupport={() => navigate('/ho-tro-ky-thuat')} />
        </Suspense>
      </div>
    </UiActionsContext.Provider>
  );
}
