/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteConfigProvider, useSiteConfig } from './context/SiteConfigContext';
import { ThemeProvider } from './context/ThemeContext';
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
import { DocsLayout } from './components/docs/DocsLayout';
import { AboutPage } from './components/about/AboutPage';
import { initLiquidGlassEngine } from './utils/liquidGlass';
import { UserDashboardLayout } from './components/dashboard/UserDashboardLayout';
import { UserDashboardHome } from './components/dashboard/UserDashboardHome';
import { LearningCenterHome } from './components/dashboard/LearningCenterHome';
import { LessonReaderView } from './components/dashboard/LessonReaderView';
import { LearningProgressView } from './components/dashboard/LearningProgressView';
import { OsUserManualView } from './components/dashboard/OsUserManualView';
import { DocumentationLibraryView } from './components/dashboard/DocumentationLibraryView';

const AppContent: React.FC = () => {
  const { activeConfig } = useSiteConfig();
  const { user, loading: authLoading } = useAuth();

  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname || '/'
  );
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(() => {
    return window.location.pathname.startsWith('/download');
  });

  // Initialize runtime Liquid Glass Material Engine (pointer tracking, reduced capabilities)
  useEffect(() => {
    return initLiquidGlassEngine();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname || '/';
      setCurrentPath(pathname.split(/[?#]/)[0]);
      if (pathname.startsWith('/download')) {
        setDownloadModalOpen(true);
      }
      if (window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            const navHeight = 92;
            const targetTop = el.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
          }
        }, 150);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path.startsWith('/download')) {
      window.history.pushState({}, '', path);
      setDownloadModalOpen(true);
      return;
    }
    window.history.pushState({}, '', path);
    setCurrentPath(path.split(/[?#]/)[0]);
    if (path.includes('#')) {
      const hash = path.split('#')[1];
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          const navHeight = 92;
          const targetTop = el.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
        }
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  if (currentPath === '/dashboard' || currentPath.startsWith('/dashboard')) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[var(--orion-canvas)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-[var(--orion-text-muted)]">Verifying Operator Session...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
      window.history.replaceState({}, '', redirectUrl);
      return <AuthPageView mode="login" onNavigate={navigate} />;
    }

    if (currentPath === '/dashboard') {
      return (
        <UserDashboardLayout currentPath={currentPath} onNavigate={navigate}>
          <UserDashboardHome
            onNavigate={navigate}
            onOpenDownload={() => setDownloadModalOpen(true)}
          />
        </UserDashboardLayout>
      );
    }

    if (currentPath === '/dashboard/learn') {
      return (
        <UserDashboardLayout
          currentPath={currentPath}
          onNavigate={navigate}
          breadcrumbs={[{ label: 'Learning Center' }]}
        >
          <LearningCenterHome onNavigate={navigate} />
        </UserDashboardLayout>
      );
    }

    if (currentPath.startsWith('/dashboard/learn/lessons/')) {
      const lessonId = currentPath.replace('/dashboard/learn/lessons/', '').split(/[?#]/)[0];
      return (
        <UserDashboardLayout
          currentPath={currentPath}
          onNavigate={navigate}
          breadcrumbs={[
            { label: 'Learning Center', href: '/dashboard/learn' },
            { label: `Lesson: ${lessonId}` },
          ]}
        >
          <LessonReaderView lessonId={lessonId} onNavigate={navigate} />
        </UserDashboardLayout>
      );
    }

    if (currentPath === '/dashboard/manual' || currentPath.startsWith('/dashboard/manual')) {
      return (
        <UserDashboardLayout
          currentPath={currentPath}
          onNavigate={navigate}
          breadcrumbs={[{ label: 'OS User Manual' }]}
        >
          <OsUserManualView onNavigate={navigate} />
        </UserDashboardLayout>
      );
    }

    if (currentPath === '/dashboard/documentation' || currentPath.startsWith('/dashboard/documentation')) {
      return (
        <UserDashboardLayout
          currentPath={currentPath}
          onNavigate={navigate}
          breadcrumbs={[{ label: 'Documentation Library' }]}
        >
          <DocumentationLibraryView onNavigate={navigate} />
        </UserDashboardLayout>
      );
    }

    if (currentPath === '/dashboard/progress' || currentPath.startsWith('/dashboard/progress')) {
      return (
        <UserDashboardLayout
          currentPath={currentPath}
          onNavigate={navigate}
          breadcrumbs={[{ label: 'Learning Progress' }]}
        >
          <LearningProgressView onNavigate={navigate} />
        </UserDashboardLayout>
      );
    }

    return (
      <UserDashboardLayout currentPath="/dashboard" onNavigate={navigate}>
        <UserDashboardHome
          onNavigate={navigate}
          onOpenDownload={() => setDownloadModalOpen(true)}
        />
      </UserDashboardLayout>
    );
  }

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

  if (currentPath.startsWith('/docs')) {
    return <DocsLayout currentPath={currentPath} onNavigate={navigate} />;
  }

  if (currentPath === '/about' || currentPath.startsWith('/about')) {
    return (
      <>
        <AboutPage
          onNavigate={navigate}
          onOpenDownload={() => setDownloadModalOpen(true)}
        />
        <DesktopDownloadModal
          isOpen={downloadModalOpen}
          onClose={() => {
            setDownloadModalOpen(false);
            if (window.location.pathname.startsWith('/download')) {
              window.history.replaceState({}, '', '/about');
            }
          }}
          onNavigate={navigate}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] selection:bg-[#0284C7] selection:text-white flex flex-col font-sans transition-colors duration-300">
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
        onClose={() => {
          setDownloadModalOpen(false);
          if (window.location.pathname.startsWith('/download')) {
            window.history.replaceState({}, '', '/');
            setCurrentPath('/');
          }
        }}
        onNavigate={navigate}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SiteConfigProvider>
          <AppContent />
        </SiteConfigProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
