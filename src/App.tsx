/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SiteConfigProvider, useSiteConfig } from './context/SiteConfigContext';
import { Navbar } from './components/Navbar';
import { OrionWorldExperience } from './components/OrionWorldExperience';
import { EditorialCapabilities } from './components/EditorialCapabilities';
import { ControlTowerAndFaq } from './components/ControlTowerAndFaq';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { TransitionModal } from './components/TransitionModal';
import { DesktopDownloadModal } from './components/DesktopDownloadModal';
import { AuthPageView } from './components/auth/AuthPageView';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminConsole } from './components/admin/AdminConsole';

const AppContent: React.FC = () => {
  const { activeConfig } = useSiteConfig();

  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname || '/'
  );
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(() => {
    return window.location.pathname === '/download';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path === '/download') {
      setDownloadModalOpen(true);
      return;
    }
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeConfig.seo.metaTitle) {
      document.title = activeConfig.seo.metaTitle;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && activeConfig.seo.metaDescription) {
      metaDesc.setAttribute('content', activeConfig.seo.metaDescription);
    }
  }, [activeConfig.seo.metaTitle, activeConfig.seo.metaDescription]);

  if (currentPath === '/login') {
    return <AuthPageView mode="login" onNavigate={navigate} />;
  }

  if (currentPath === '/signup') {
    return <AuthPageView mode="signup" onNavigate={navigate} />;
  }

  if (currentPath === '/admin/login') {
    return <AdminLogin onNavigate={navigate} />;
  }

  if (currentPath.startsWith('/admin')) {
    return <AdminConsole onNavigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-[#F2F9FD] text-[#070B19] selection:bg-[#070B19] selection:text-white flex flex-col font-sans">
      <Navbar onNavigate={navigate} onOpenDownload={() => setDownloadModalOpen(true)} />

      <main className="flex-1">
        {/* 1. Full-Viewport Scroll-Choreographed 3D Miniature World (Hero + 01-04 Process Narrative) */}
        <OrionWorldExperience />

        {/* 2. White Editorial Headline + 4-Column Isometric Capabilities Grid */}
        <EditorialCapabilities />

        {/* 3. Live Control Tower Telemetry Inspection & Split FAQ Accordion */}
        <ControlTowerAndFaq />
      </main>

      {/* 4. Deep Midnight Navy Footer with 3-Column Hover-Invert Bar & Monumental Wordmark */}
      <Footer onNavigate={navigate} onOpenDownload={() => setDownloadModalOpen(true)} />

      {/* Modals for Quick Auth, Launch & Desktop Download */}
      <AuthModal />
      <TransitionModal />
      <DesktopDownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SiteConfigProvider>
        <AppContent />
      </SiteConfigProvider>
    </AuthProvider>
  );
}

export default App;
