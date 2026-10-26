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

  useEffect(() => {
    if (activeConfig.seo.metaTitle) {
      document.title = activeConfig.seo.metaTitle;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && activeConfig.seo.metaDescription) {
      metaDesc.setAttribute('content', activeConfig.seo.metaDescription);
    }
  }, [activeConfig.seo.metaTitle, activeConfig.seo.metaDescription]);

  // Smooth section reveals without clipping
  useEffect(() => {
    if (currentPath !== '/') return;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion || !mainRef.current) return;

    const ctx = gsap.context(() => {
      const stages = gsap.utils.toArray<HTMLElement>('.cinematic-stage');
      stages.forEach((stage) => {
        gsap.from(stage, {
          y: 20,
          opacity: 0.9,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stage,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        });
      });
    }, mainRef);

    return () => ctx.revert();
  }, [currentPath]);

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
      <Navbar onNavigate={navigate} />

      <main ref={mainRef} className="flex-1">
        {/* 1. Hero */}
        <Hero />

        {/* 2. Disruption Propagation Cascade */}
        {vis.operationalProblem !== false && (
          <div className="cinematic-stage">
            <OperationalProblem />
          </div>
        )}

        {/* 3. Expansive Topology & Continuous Route */}
        {vis.supplyChainNetwork !== false && (
          <div className="cinematic-stage">
            <OneConnectedNetwork />
          </div>
        )}

        {/* 4. Decision Intelligence Narrative Story */}
        {vis.operationalIntelligence !== false && (
          <div className="cinematic-stage">
            <DecisionIntelligenceFlow />
          </div>
        )}

        {/* 5. Composed Control Tower Product Demonstration */}
        {vis.controlTowerPreview !== false && (
          <div className="cinematic-stage">
            <ControlTowerPreview />
          </div>
        )}

        {/* 6. Dimensional 4-Tier Architecture */}
        {vis.integrationsAndReadiness !== false && (
          <div className="cinematic-stage">
            <ArchitectureConnectivity />
          </div>
        )}

        {/* 7. Closing Invitation */}
        {vis.finalCta !== false && (
          <div className="cinematic-stage">
            <FinalCTA
              onLaunchApp={() => launchOrion()}
              onOpenAuth={(mode) => openAuthModal(mode || 'signup')}
              onNavigate={navigate}
              isAuthenticated={isAuthenticated}
            />
          </div>
        )}
      </main>

      {/* 8. Refined Enterprise Footer */}
      <Footer onNavigate={navigate} />

      {/* Modals for Quick Auth & Launch */}
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
