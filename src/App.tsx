import React, { useState } from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Products from './components/Products';
import ConsultingAndTraining from './components/ConsultingAndTraining';
import NewsSection from './components/NewsSection';
import EstimationLibrary from './components/EstimationLibrary';
import Customers from './components/Customers';
import Footer from './components/Footer';
import InteractiveModal from './components/InteractiveModal';
import LoginPage from './components/LoginPage';
import ArticleDetailPage from './components/ArticleDetailPage';
import TechnicalSupportPage from './components/TechnicalSupportPage';
import FloatingActions from './components/FloatingActions';

export default function App() {
  // Navigation View selector state
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'article' | 'technical-support'>('home');

  // Modal Orchestrator States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'download' | 'login' | 'register' | 'consult'>('download');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Flow triggers
  const triggerDownloadFlow = () => {
    setModalTab('download');
    setSelectedProductId('du-toan-bnsc');
    setModalOpen(true);
  };

  const triggerLoginFlow = () => {
    setModalOpen(false); // Close any active popups
    setCurrentView('login');
  };

  const triggerRegisterFlow = () => {
    setModalTab('register');
    setModalOpen(true);
  };

  const triggerConsultFlow = (courseId?: string) => {
    setModalTab('consult');
    if (courseId) {
      setSelectedProductId(courseId);
    }
    setModalOpen(true);
  };

  const handleProductCta = (productId: string) => {
    setSelectedProductId(productId);
    if (productId === 'du-toan-bnsc') {
      setModalTab('download');
    } else {
      setModalTab('consult');
    }
    setModalOpen(true);
  };

  const handleVideoTrigger = () => {
    // Open standard tutorial clip or smooth scroll user to the guide FAQ within page
    const guideSection = document.getElementById('tu-van');
    if (guideSection) {
      const offset = 80;
      const elementPosition = guideSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Scroll to top on view changes
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  if (currentView === 'login') {
    return (
      <LoginPage 
        onBackToHome={() => setCurrentView('home')} 
        onRegisterClick={() => {
          setCurrentView('home');
          setTimeout(() => {
            triggerRegisterFlow();
          }, 300);
        }}
      />
    );
  }

  if (currentView === 'technical-support') {
    return (
      <TechnicalSupportPage 
        onBackToHome={() => setCurrentView('home')} 
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative selection:bg-[#F5A623]/30 selection:text-[#0B2545]">
      
      {/* 1. Announcement Bar */}
      <AnnouncementBar onDownloadClick={triggerDownloadFlow} />

      {/* 2. Sticky Translucent Navbar */}
      <Navbar 
        onDownloadClick={triggerDownloadFlow} 
        onLoginClick={triggerLoginFlow} 
        onRegisterClick={triggerRegisterFlow} 
      />

      {/* Main Structural Flow */}
      <main className="flex-grow">
        {currentView === 'article' ? (
          <ArticleDetailPage 
            onBackToHome={() => setCurrentView('home')} 
            onDownloadCtaClick={triggerDownloadFlow}
          />
        ) : (
          <>
            {/* 3. Hero Section with responsive grid background and estimate mockup */}
            <Hero 
              onDownloadClick={triggerDownloadFlow} 
              onVideoClick={handleVideoTrigger} 
              onArticleClick={() => setCurrentView('article')}
            />

            {/* 4. Products Section - Bento structured offering */}
            <Products onProductCtaClick={handleProductCta} />

            {/* 5. Consulting and Training Sections (#tu-van and #dao-tao) */}
            <ConsultingAndTraining onRegisterClick={triggerConsultFlow} />

            {/* 6. News Section - Tab filter for legal circulars and activities */}
            <NewsSection />

            {/* 6.5. Technical Scenario Library & Knowledge Base Section */}
            <EstimationLibrary onSelectArticle={() => setCurrentView('article')} />

            {/* 7. Customers Section - Public work portfolios and bureaus */}
            <Customers />
          </>
        )}
      </main>

      {/* 8. Corporate footer index listings */}
      <Footer />

      {/* 9. Central Modal Gateway for transactions */}
      <InteractiveModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialTab={modalTab}
        selectedProductId={selectedProductId}
      />

      {/* 10. Premium Floating Actions (Social channels & AI assistant Q&A chatbot) */}
      <FloatingActions onStartTechnicalSupport={() => setCurrentView('technical-support')} />

    </div>
  );
}
