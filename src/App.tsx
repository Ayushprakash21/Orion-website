import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { InteractiveControlTower } from './components/InteractiveControlTower';
import { ScrollStorytelling } from './components/ScrollStorytelling';
import { PlatformCapabilities } from './components/PlatformCapabilities';
import { OperatingJourney } from './components/OperatingJourney';
import { SystemArchitecture } from './components/SystemArchitecture';
import { OperationalValue } from './components/OperationalValue';
import { IntegrationInspector } from './components/IntegrationInspector';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { TransitionModal } from './components/TransitionModal';

function MainApp() {
  const { openAuthModal } = useAuth();

  useEffect(() => {
    // Check initial URL parameters or path hash for direct routing support
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || params.get('auth');
    const hash = window.location.hash;

    if (view === 'login' || hash === '#login') {
      openAuthModal('login');
    } else if (view === 'signup' || hash === '#signup') {
      openAuthModal('signup');
    }
  }, [openAuthModal]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#f4f6fa] flex flex-col font-sans selection:bg-[#f5f5f5] selection:text-[#0f1626]">
      {/* Top Bar Navigation */}
      <Navbar />

      {/* Main Content Flow */}
      <main className="flex-1">
        {/* Cinematic Hero */}
        <Hero />

        {/* 3D Multimodal Global Logistics Simulation & Interactive Control Tower */}
        <InteractiveControlTower />

        {/* Scroll-Driven 5-Scene Storytelling */}
        <ScrollStorytelling />

        {/* Core Platform Capabilities */}
        <PlatformCapabilities />

        {/* 4-Stage Operating Journey */}
        <OperatingJourney />

        {/* Multi-Layer System Architecture */}
        <SystemArchitecture />

        {/* Operational Value & Proof */}
        <OperationalValue />
      </main>

      {/* Integration Inspector & Specs Drawer */}
      <IntegrationInspector />

      {/* Enterprise Footer */}
      <Footer />

      {/* Authentication Dialog (Log In / Sign Up / Recovery) */}
      <AuthModal />

      {/* Verified Launch Redirect Modal */}
      <TransitionModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
