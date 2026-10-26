import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { OrionLogo } from './OrionLogo';
import {
  Menu,
  X,
  UserCircle2,
  LogOut,
  ShieldCheck,
  Sliders,
  Eye,
  Download,
} from 'lucide-react';

interface NavbarProps {
  onNavigate?: (path: string) => void;
  onOpenDownload?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onOpenDownload }) => {
  const { user, isAdmin, launchOrion, logout, isFirebaseConfigured, destinationUrl } =
    useAuth();
  const { activeConfig, isPreviewMode, setIsPreviewMode } = useSiteConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleRoute = (path: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const navLinks = [
    { label: 'Process', href: '#process' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Control Tower', href: '#control-tower' },
    { label: 'Readiness', href: '#faq' },
  ];

  const companyName = activeConfig.branding.companyName || 'Orion-9';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full pointer-events-none">
      {/* Draft Preview Mode Banner (Admin) */}
      {isPreviewMode && (
        <div className="pointer-events-auto bg-[#070B19] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Viewing Unpublished CMS Draft</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPreviewMode(false)}
              className="text-[#94B8D0] hover:text-white underline cursor-pointer"
            >
              Exit Preview
            </button>
            <button
              type="button"
              onClick={() => handleRoute('/admin')}
              className="px-3 py-1 rounded-lg bg-white text-[#070B19] font-semibold text-xs cursor-pointer"
            >
              Admin Console
            </button>
          </div>
        </div>
      )}

      <div className="pointer-events-auto bg-white border-b border-[#DCE7F0]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Left Orion-9 Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (window.location.pathname !== '/') {
                handleRoute('/');
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center shrink-0 focus:outline-hidden"
            aria-label={`${companyName} Home`}
          >
            <OrionLogo companyName={companyName} size="md" tone="dark" />
          </a>

          {/* Zone 2: Center Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-8"
            aria-label="Primary Navigation"
          >
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-[#334155] hover:text-[#070B19] transition-colors whitespace-nowrap shrink-0"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Right Authentication & Launch Actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm font-medium text-[#070B19] hover:border-[#070B19] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <UserCircle2 className="w-4 h-4 text-[#0284C7]" />
                  <span className="truncate max-w-[130px]">
                    {user.displayName || user.email?.split('@')[0] || 'Operator'}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white border border-[#DCE7F0] shadow-lg p-2 text-xs z-50">
                    <div className="px-3 py-2.5 border-b border-[#E2E8F0] mb-1">
                      <p className="text-[11px] font-semibold text-[#64748B]">
                        Active Operator
                      </p>
                      <p className="font-medium text-[#070B19] truncate mt-0.5">{user.email}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#0284C7]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isFirebaseConfigured ? 'Firebase Verified' : 'Authenticated'}</span>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleRoute('/admin');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#070B19] hover:bg-[#F2F9FD] transition-colors text-left font-medium cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleRoute('/login')}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[#070B19] hover:bg-[#EAF4FB] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => handleRoute('/signup')}
                  className="px-4 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm font-medium text-[#070B19] hover:border-[#070B19] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Sign up
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => onOpenDownload ? onOpenDownload() : handleRoute('/admin')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] text-xs font-semibold text-[#070B19] hover:bg-[#E2E8F0] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Download Orion-9 Windows 64-bit Desktop App (.exe)"
            >
              <Download className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Download .exe</span>
            </button>

            <button
              type="button"
              onClick={() => launchOrion(destinationUrl)}
              className="px-4 py-2 rounded-lg bg-[#070B19] text-white text-sm font-semibold hover:bg-[#1E293B] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Launch Control Tower
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {!user && (
              <button
                type="button"
                onClick={() => handleRoute('/login')}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs font-medium text-[#070B19] whitespace-nowrap"
              >
                Sign in
              </button>
            )}
            <button
              type="button"
              onClick={() => launchOrion(destinationUrl)}
              className="px-3 py-1.5 rounded-lg bg-[#070B19] text-white text-xs font-semibold whitespace-nowrap"
            >
              <span className="sm:hidden">Control Tower</span>
              <span className="hidden sm:inline">Launch Control Tower</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white border border-[#CBD5E1] text-[#070B19] shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden pointer-events-auto border-b border-[#DCE7F0] bg-white px-6 py-5 space-y-4 shadow-lg">
          <nav className="flex flex-col space-y-1.5" aria-label="Mobile Navigation">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-[#070B19] hover:bg-[#F2F9FD]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2.5">
            {user ? (
              <div className="grid grid-cols-2 gap-2.5">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleRoute('/admin')}
                    className="py-2.5 px-4 rounded-lg border border-[#CBD5E1] text-sm font-medium text-[#070B19]"
                  >
                    Admin Console
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="py-2.5 px-4 rounded-lg bg-rose-50 text-rose-600 text-sm font-medium"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleRoute('/login')}
                  className="py-2.5 px-4 rounded-lg border border-[#CBD5E1] bg-white text-sm font-medium text-[#070B19]"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => handleRoute('/signup')}
                  className="py-2.5 px-4 rounded-lg border border-[#070B19] bg-[#F2F9FD] text-sm font-semibold text-[#070B19]"
                >
                  Sign up
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenDownload) onOpenDownload();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-sm font-semibold text-[#070B19] cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#0284C7]" />
              <span>Download Windows App (.exe)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                launchOrion(destinationUrl);
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-[#070B19] text-white text-sm font-semibold cursor-pointer"
            >
              Launch Control Tower
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
