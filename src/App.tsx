/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteConfigProvider, useSiteConfig } from './context/SiteConfigContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { OperationalProblem } from './components/OperationalProblem';
import { OneConnectedNetwork } from './components/OneConnectedNetwork';
import { DecisionIntelligenceFlow } from './components/DecisionIntelligenceFlow';
import { ControlTowerPreview } from './components/ControlTowerPreview';
import { ArchitectureConnectivity } from './components/ArchitectureConnectivity';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { TransitionModal } from './components/TransitionModal';
import { AuthPageView } from './components/auth/AuthPageView';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminConsole } from './components/admin/AdminConsole';

gsap.registerPlugin(ScrollTrigger);

const AppContent: React.FC = () => {
  const { openAuthModal, launchOrion, isAuthenticated } = useAuth();
  const { activeConfig } = useSiteConfig();
  const mainRef = useRef<HTMLElement | null>(null);

  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname || '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync dynamic SEO meta title & description from CMS config
  useEffect(() => {
    if (activeConfig.seo.metaTitle) {
      document.title = activeConfig.seo.metaTitle;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && activeConfig.seo.metaDescription) {
      metaDesc.setAttribute('content', activeConfig.seo.metaDescription);
    }
  }, [activeConfig.seo.metaTitle, activeConfig.seo.metaDescription]);

  // Synchronized section entrance reveals
  useEffect(() => {
    if (currentPath !== '/') return;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion || !mainRef.current) return;

    const ctx = gsap.context(() => {
      const headings = gsap.utils.toArray<HTMLElement>('.cinematic-stage h2');
      headings.forEach((h2) => {
        gsap.fromTo(
          h2,
          {
            clipPath: 'inset(0% 0% 100% 0%)',
            y: 28,
            opacity: 0,
          },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: h2,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, mainRef);

    return () => ctx.revert();
  }, [currentPath]);

  // Dedicated Route Handling: /login, /signup, /admin/login, /admin
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

  const vis = activeConfig.homepage.sectionVisibility;

  return (
    <div className="min-h-screen bg-[#EAF4F8] text-[#111827] selection:bg-[#294D6B] selection:text-white flex flex-col font-sans">
      {/* Persistent Refined Navigation Bar */}
      <Navbar onNavigate={navigate} />

      {/* Main Coherent Story Sequence */}
      <main ref={mainRef} className="flex-1">
        {/* Section 1 — Hero */}
        <Hero />

        {/* Section 2 — The Problem */}
        {vis.operationalProblem !== false && (
          <div className="cinematic-stage">
            <OperationalProblem />
          </div>
        )}

        {/* Section 3 — One Connected Network */}
        {vis.supplyChainNetwork !== false && (
          <div className="cinematic-stage">
            <OneConnectedNetwork />
          </div>
        )}

        {/* Section 4 — From Signal to Decision */}
        {vis.operationalIntelligence !== false && (
          <div className="cinematic-stage">
            <DecisionIntelligenceFlow />
          </div>
        )}

        {/* Section 5 — Interactive Product Preview */}
        {vis.controlTowerPreview !== false && (
          <div className="cinematic-stage">
            <ControlTowerPreview />
          </div>
        )}

        {/* Section 6 — Architecture */}
        {vis.integrationsAndReadiness !== false && (
          <div className="cinematic-stage">
            <ArchitectureConnectivity />
          </div>
        )}

        {/* Section 7 — Closing Call to Action */}
        {vis.finalCta !== false && (
          <div className="cinematic-stage">
            <FinalCTA
              onLaunchApp={() => launchOrion()}
              onOpenAuth={(mode) => openAuthModal(mode || 'login')}
              onNavigate={navigate}
              isAuthenticated={isAuthenticated}
            />
          </div>
        )}
      </main>

      {/* Section 8 — Enterprise Footer */}
      <Footer onNavigate={navigate} />

      {/* Modals for Quick Auth & Secure Control Tower Launch Handoff */}
      <AuthModal />
      <TransitionModal />
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
