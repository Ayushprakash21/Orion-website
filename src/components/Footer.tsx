import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useTheme } from '../context/ThemeContext';
import { OrionLogo } from './OrionLogo';
import { ArrowRight, Download, ShieldCheck, Cpu, Globe2 } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onOpenDownload?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDownload }) => {
  const { user, launchOrion, destinationUrl } = useAuth();
  const { activeConfig } = useSiteConfig();
  const { branding, footer } = activeConfig;
  const { theme } = useTheme();

  const handleRoute = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    if (path.includes('#')) {
      const hash = path.split('#')[1];
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (window.location.pathname !== '/') {
      handleRoute('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const companyName = branding.companyName || 'Orion-9';

  return (
    <footer
      id="orion-footer"
      className="w-full bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] border-t border-[var(--glass-border-subtle)] relative overflow-hidden transition-colors duration-300"
    >
      {/* ==========================================================================
          1. CLOSING ENTERPRISE BRAND BANNER
         ========================================================================== */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-14 pb-8 sm:pb-12">
        <div className="min-h-[340px] lg:min-h-[380px] rounded-3xl lg:rounded-[32px] p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-white via-[#F8FBFE] to-[#F0F7FF] dark:bg-gradient-to-br dark:from-[#151515] dark:via-[#111111] dark:to-[#0A0A0A] border border-sky-200/70 dark:border-[#38301D] shadow-[0_20px_50px_rgba(2,132,199,0.06),0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(212,175,55,0.12)] flex flex-col lg:flex-row lg:items-center justify-between gap-10 lg:gap-14 relative overflow-hidden transition-all duration-300">
          {/* Ambient Lighting Glow */}
          <div
            className="pointer-events-none absolute -top-32 -right-32 w-[450px] h-[450px] bg-sky-400/10 dark:bg-[#D4AF37]/5 blur-[100px] rounded-full"
            aria-hidden="true"
          />

          {/* Left Column: Brand Identity, Headline & Supporting Text */}
          <div className="max-w-2xl lg:max-w-3xl space-y-6 sm:space-y-7 relative z-10">
            {/* Prominent Orion-9 Brand Identity */}
            <div className="flex items-center">
              <OrionLogo
                companyName={companyName}
                size="brand"
                tone={theme === 'dark' ? 'light' : 'dark'}
                placement="footer"
              />
            </div>

            <h2 className="font-editorial text-2xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 dark:text-[#F5F5F5] leading-[1.15]">
              Command your global supply chain with fast response and governed execution.
            </h2>

            <p className="text-base sm:text-lg text-slate-600 dark:text-[#A3A3A3] leading-relaxed max-w-2xl font-sans">
              Unify maritime, air, and ground logistics telemetry into one live operational operating system.
            </p>
          </div>

          {/* Right Column: Premium Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 shrink-0 relative z-10 lg:ml-auto">
            {/* Primary Action: Download Desktop App */}
            <button
              type="button"
              onClick={() => {
                if (user) {
                  if (onOpenDownload) onOpenDownload();
                  else handleRoute('/download');
                } else {
                  handleRoute('/login?redirect=/download&platform=windows');
                }
              }}
              className="h-12 px-6 sm:px-7 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#F5D76E] dark:hover:brightness-105 dark:text-[#080808] text-sm font-semibold dark:font-bold shadow-md shadow-[#0284C7]/25 hover:shadow-lg hover:shadow-[#0284C7]/35 dark:shadow-[0_4px_16px_rgba(212,175,55,0.25)] dark:hover:shadow-[0_6px_20px_rgba(212,175,55,0.35)] transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4 text-white dark:text-[#080808] shrink-0" />
              <span className="whitespace-nowrap">Download Desktop App</span>
            </button>

            {/* Secondary Action: Sign up */}
            <button
              type="button"
              onClick={() => handleRoute('/signup')}
              className="h-12 px-6 sm:px-7 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm dark:bg-[#1B1B1B] dark:hover:bg-[#222222] dark:text-[#F5F5F5] dark:border-[#38301D] dark:hover:border-[#D4AF37]/50 text-sm font-semibold transition-all duration-200 cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
            >
              Sign up
            </button>

            {/* Authenticated Launch or Secondary Action: Sign in */}
            {user ? (
              <button
                type="button"
                onClick={() => launchOrion(destinationUrl)}
                className="h-12 px-6 sm:px-7 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#262626] dark:hover:bg-[#2F2F2F] dark:text-[#F5F5F5] dark:border dark:border-[#38301D] text-sm font-semibold transition-all duration-200 shadow-xs cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Launch Orion-9 OS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleRoute('/login')}
                className="h-12 px-6 sm:px-7 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm dark:bg-[#1B1B1B] dark:hover:bg-[#222222] dark:text-[#F5F5F5] dark:border-[#38301D] dark:hover:border-[#D4AF37]/50 text-sm font-semibold transition-all duration-200 cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================================================
          2. MULTI-COLUMN ENTERPRISE NAVIGATION
         ========================================================================== */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Left Column: Brand Lockup & Description */}
          <div className="lg:col-span-4 space-y-4 pr-0 lg:pr-8">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center focus:outline-hidden"
              aria-label={`${companyName} Home`}
            >
              <OrionLogo
                companyName={companyName}
                size="xl"
                tone={theme === 'dark' ? 'light' : 'dark'}
                placement="footer"
              />
            </a>

            <p className="text-sm text-[var(--orion-text-secondary)] leading-relaxed max-w-xs sm:max-w-sm pt-1">
              An intelligent operating system for global supply chains. Real-time multi-modal telemetry, canonical graph resolution, and Zero-Trust autonomous execution.
            </p>
          </div>

          {/* Right Columns: 4 Organized Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
            {/* Column 1: PLATFORM */}
            <div>
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--orion-text-muted)] mb-4">
                Platform
              </h3>
              <ul className="space-y-2.5 text-xs font-medium text-[var(--orion-text-primary)]">
                <li>
                  <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Overview
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('capabilities')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Capabilities
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('process')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Global Network
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('control-tower')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Decision Intelligence
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (user) {
                        if (onOpenDownload) onOpenDownload();
                        else handleRoute('/download');
                      } else {
                        handleRoute('/login?redirect=/download&platform=windows');
                      }
                    }}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left flex items-center gap-1.5 font-semibold text-[var(--orion-accent)]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Desktop App</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: PRODUCT */}
            <div>
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--orion-text-muted)] mb-4">
                Product
              </h3>
              <ul className="space-y-2.5 text-xs font-medium text-[var(--orion-text-primary)]">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('control-tower')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Orion-9 OS
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('process')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Supply Chain Visibility
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('capabilities')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Operational Analytics
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('faq')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Integrations
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: RESOURCES */}
            <div>
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--orion-text-muted)] mb-4">
                Resources
              </h3>
              <ul className="space-y-2.5 text-xs font-medium text-[var(--orion-text-primary)]">
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/docs')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left text-[var(--orion-accent)] font-semibold"
                  >
                    Documentation Manual
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('capabilities')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Architecture
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('faq')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Readiness &amp; FAQ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/admin/login')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Security &amp; Governance
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: ABOUT ORION-9 */}
            <div>
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--orion-text-muted)] mb-4">
                About Orion-9
              </h3>
              <ul className="space-y-2.5 text-xs font-medium text-[var(--orion-text-primary)]">
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/about')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    About Orion-9
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/about#why-orion-9')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Why Orion-9
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/about#system-architecture')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    System Architecture
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/about#core-principles')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Core Principles
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/about#whats-new')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    What's New
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/docs')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left text-[var(--orion-accent)] font-semibold"
                  >
                    Help &amp; Documentation
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Certifications Row */}
        <div className="mt-12 pt-6 border-t border-[var(--glass-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--orion-text-muted)] font-mono">
          <p>
            {footer.copyrightText ||
              `© ${new Date().getFullYear()} Orion-9 Technologies Inc. All rights reserved.`}
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              SOC 2 Type II
            </span>
            <span aria-hidden="true" className="text-[var(--glass-border)]">·</span>
            <span>ISO 27001</span>
            <span aria-hidden="true" className="text-[var(--glass-border)]">·</span>
            <span>Zero-Trust Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
