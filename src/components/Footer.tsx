import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { OrionLogo } from './OrionLogo';
import { ArrowRight, Download } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onOpenDownload?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDownload }) => {
  const { user, launchOrion, destinationUrl } = useAuth();
  const { activeConfig } = useSiteConfig();
  const { branding, footer } = activeConfig;

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
      className="w-full bg-[#F8FAFC] text-[#070B19] border-t border-[#DCE7F0]"
    >
      {/* ==========================================================================
          1. CLOSING ENTERPRISE CALLOUT SECTION (Retains Orion-9 Branding & CTA)
         ========================================================================== */}
      <div className="w-full bg-[#EAF4FB] border-b border-[#DCE7F0]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-16 sm:py-20 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-2xl space-y-4">
            <OrionLogo companyName={companyName} size="sm" tone="dark" />
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#070B19] leading-tight">
              Command your global supply chain with fast response and governed execution.
            </h2>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              Unify maritime, air, and ground logistics telemetry into one live operating system.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
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
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white border border-[#CBD5E1] text-sm font-semibold text-[#070B19] hover:border-[#070B19] transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#0284C7]" />
              <span>Download Desktop App</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoute('/signup')}
              className="px-5 py-3 rounded-lg bg-white border border-[#CBD5E1] text-sm font-semibold text-[#070B19] hover:border-[#070B19] transition-colors cursor-pointer"
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => launchOrion(destinationUrl)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#070B19] text-white hover:bg-[#1E293B] text-sm font-semibold transition-colors cursor-pointer"
            >
              <span>Launch Control Tower</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================================================
          2. SPACIOUS LIGHT MULTI-COLUMN ENTERPRISE FOOTER (Matches Reference Layout)
         ========================================================================== */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 pt-16 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Left Column: Orion-9 Logo, Brand Description, and Primary Status */}
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
              <OrionLogo companyName={companyName} size="md" tone="dark" />
            </a>

            <p className="text-sm text-[#475569] leading-relaxed max-w-xs">
              An intelligent operating system for global supply chains.
            </p>
          </div>

          {/* Right Columns: 4 Organized Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
            {/* Column 1: PLATFORM */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-4">
                Platform
              </h3>
              <ul className="space-y-3 text-sm font-medium text-[#070B19]">
                <li>
                  <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left"
                  >
                    Overview
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('capabilities')}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left"
                  >
                    Capabilities
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('process')}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left"
                  >
                    Global Network
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('control-tower')}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left"
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
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left flex items-center gap-1.5 font-semibold text-[#0284C7]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Desktop App (.exe / .dmg)</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: PRODUCT */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-4">
                Product
              </h3>
              <ul className="space-y-3 text-sm font-medium text-[#070B19]">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('control-tower')}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left"
                  >
                    Control Tower
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('process')}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left"
                  >
                    Supply Chain Visibility
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('capabilities')}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left"
                  >
                    Operational Analytics
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('faq')}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left"
                  >
                    Integrations
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: RESOURCES */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-4">
                Resources
              </h3>
              <ul className="space-y-3 text-sm font-medium text-[#070B19]">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('capabilities')}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left"
                  >
                    Architecture
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('faq')}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left"
                  >
                    Readiness &amp; FAQ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/admin/login')}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left"
                  >
                    Security &amp; Governance
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: ACCOUNT */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-4">
                Account
              </h3>
              <ul className="space-y-3 text-sm font-medium text-[#070B19]">
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/login')}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left"
                  >
                    Sign in
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/signup')}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left"
                  >
                    Sign up
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => launchOrion(destinationUrl)}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left font-semibold"
                  >
                    Launch Control Tower
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleRoute('/admin/login')}
                    className="hover:text-[#0284C7] transition-colors cursor-pointer text-left text-[#475569]"
                  >
                    Admin Portal
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Divider Row */}
        <div className="mt-14 pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>
            {footer.copyrightText ||
              `© ${new Date().getFullYear()} Orion-9 Technologies Inc. All rights reserved.`}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <span>SOC 2 Type II Certified</span>
            <span aria-hidden="true">·</span>
            <span>ISO 27001 Aligned</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Trust Execution</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
