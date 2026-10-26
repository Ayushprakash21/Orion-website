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
import { PlatformOverview } from './components/PlatformOverview';
import { ConnectedOperatingSystem } from './components/ConnectedOperatingSystem';
import { ScrollStorytelling } from './components/ScrollStorytelling';
import { InteractiveControlTower } from './components/InteractiveControlTower';
import { DecisionIntelligenceFlow } from './components/DecisionIntelligenceFlow';
import { ArchitectureConnectivity } from './components/ArchitectureConnectivity';
import { ControlTowerPreview } from './components/ControlTowerPreview';
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

  // Synchronized Masked Section Headline Choreography (No generic card fade-in slop)
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
    <div className="min-h-screen bg-[#EAF4F8] text-[#111827] selection:bg-[#294D6B] selection:text-white flex flex-col">
      {/* Persistent Navigation Bar */}
      <Navbar onNavigate={navigate} />

      {/* Main Coordinated 3D & Editorial Experience */}
      <main ref={mainRef} className="flex-1">
        {/* 1. Opening 3D Logistics Digital Twin Hero */}
        <Hero />

        {/* 2. Pinned 6-Chapter Scroll-Synchronized 3D Narrative Journey */}
        {vis.scrollStorytelling && <ScrollStorytelling />}

        {/* 3. Interactive 3D Control Tower Sandbox & Scenario Solver */}
        {vis.supplyChainNetwork && (
          <div className="cinematic-stage">
            <InteractiveControlTower />
          </div>
        )}

        {/* 4. Platform Architecture Overview */}
        {vis.platformOverview && (
          <div className="cinematic-stage">
            <PlatformOverview />
          </div>
        )}

        {/* 5. 8-Module Connected Operating System Matrix */}
        {vis.connectedOsModules && (
          <div className="cinematic-stage">
            <ConnectedOperatingSystem />
          </div>
        )}

        {/* 6. 7-Stage Decision Intelligence Pipeline */}
        {vis.operationalIntelligence && (
          <div className="cinematic-stage">
            <DecisionIntelligenceFlow />
          </div>
        )}

        {/* 7. 7-Layer Stack & Enterprise Ingestion Ecosystem */}
        {vis.integrationsAndReadiness && (
          <div className="cinematic-stage">
            <ArchitectureConnectivity />
          </div>
        )}

        {/* 8. Live Control Tower Cockpit Preview */}
        {vis.controlTowerPreview && (
          <div className="cinematic-stage">
            <ControlTowerPreview />
          </div>
        )}

        {/* 9. Final Call to Action */}
        {vis.finalCta && (
          <div className="cinematic-stage">
            <FinalCTA
              onLaunchApp={() => launchOrion()}
              onOpenAuth={() => openAuthModal('signin')}
              onNavigate={navigate}
              isAuthenticated={isAuthenticated}
            />
          </div>
        )}
      </main>

      {/* Enterprise Footer */}
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
