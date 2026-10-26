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
          1. CLOSING ENTERPRISE CALLOUT IN TRANSLUCENT LIQUID GLASS
         ========================================================================== */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-12 pb-6">
        <div className="liquid-glass-elevated rounded-3xl p-8 sm:p-14 border border-[var(--glass-border)] shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative overflow-hidden">
          {/* Ambient glass reflection */}
          <div
            className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 dark:bg-sky-400/5 blur-3xl rounded-full"
            aria-hidden="true"
          />

          <div className="max-w-2xl space-y-4 relative z-10">
            <OrionLogo
              companyName={companyName}
              size="sm"
              tone={theme === 'dark' ? 'light' : 'dark'}
              placement="footer"
            />
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--orion-text-primary)] leading-tight">
              Command your global supply chain with fast response and governed execution.
            </h2>
            <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed">
              Unify maritime, air, and ground logistics telemetry into one live operational operating system.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
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
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)] hover:border-[var(--orion-accent)] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[var(--orion-accent)]" />
              <span>Download Desktop App</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoute('/signup')}
              className="px-5 py-3 rounded-xl liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)] transition-all cursor-pointer"
            >
              Sign up
            </button>
            {user ? (
              <button
                type="button"
                onClick={() => launchOrion(destinationUrl)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white hover:from-[#0369A1] hover:to-[#075985] text-xs font-semibold transition-all shadow-[0_4px_16px_rgba(2,132,199,0.35)] cursor-pointer"
              >
                <span>Launch Orion-9 OS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleRoute('/login')}
                className="px-5 py-3 rounded-xl liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)] transition-all cursor-pointer"
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
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 pt-10 pb-12">
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
                size="md"
                tone={theme === 'dark' ? 'light' : 'dark'}
                placement="footer"
              />
            </a>

            <p className="text-sm text-[var(--orion-text-secondary)] leading-relaxed max-w-xs">
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

            {/* Column 4: ACCOUNT */}
            <div>
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--orion-text-muted)] mb-4">
                Account
              </h3>
              <ul className="space-y-2.5 text-xs font-medium text-[var(--orion-text-primary)]">
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/login')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Sign in
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/signup')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left"
                  >
                    Sign up
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => launchOrion(destinationUrl)}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left font-semibold text-[var(--orion-accent)]"
                  >
                    Launch Cockpit
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/admin/login')}
                    className="hover:text-[var(--orion-accent)] transition-colors cursor-pointer text-left text-[var(--orion-text-secondary)]"
                  >
                    Admin Portal
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
