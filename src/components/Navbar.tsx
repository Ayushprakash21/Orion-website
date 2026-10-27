import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useTheme } from '../context/ThemeContext';
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
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onNavigate?: (path: string) => void;
  onOpenDownload?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onOpenDownload }) => {
  const { user, isAdmin, launchOrion, logout, isFirebaseConfigured, destinationUrl } =
    useAuth();
  const { activeConfig, isPreviewMode, setIsPreviewMode } = useSiteConfig();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleRoute = (path: string) => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleNavLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      const sectionId = href.replace('#', '');
      if (window.location.pathname !== '/') {
        handleRoute(`/${href}`);
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } else {
      handleRoute(href);
    }
  };

  const navLinks = [
    { label: 'Process', href: '#process' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Orion-9 OS', href: '#control-tower' },
    { label: 'About', href: '/about' },
    { label: 'Readiness', href: '#faq' },
    { label: 'Documentation', href: '/docs' },
  ];

  const companyName = activeConfig.branding.companyName || 'Orion-9';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full pointer-events-none transition-all duration-300">
      {/* Draft Preview Mode Banner (Admin) */}
      {isPreviewMode && (
        <div className="pointer-events-auto bg-[#070B19]/90 backdrop-blur-md text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-white/10 shadow-sm">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="font-medium">Viewing Unpublished CMS Draft</span>
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
              className="px-3 py-1 rounded-lg bg-white/90 hover:bg-white text-[#070B19] font-semibold text-xs cursor-pointer shadow-xs transition"
            >
              Admin Console
            </button>
          </div>
        </div>
      )}

      {/* Floating macOS Liquid Glass Navigation Bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
        <div className="pointer-events-auto liquid-glass-nav rounded-2xl px-4 sm:px-6 h-16 sm:h-17 flex items-center justify-between gap-6 transition-all duration-300">
          {/* Zone 1: Left Brand Lockup */}
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
            className="inline-flex items-center shrink-0 focus:outline-hidden group"
            aria-label={`${companyName} Home`}
          >
            <OrionLogo
              companyName={companyName}
              size="md"
              tone={theme === 'dark' ? 'light' : 'dark'}
              placement="header"
            />
          </a>

          {/* Zone 2: Center macOS Translucent Nav Pill */}
          <nav
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-subtle"
            aria-label="Primary Navigation"
          >
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavLinkClick(e, item.href)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-200 whitespace-nowrap cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Right Actions & System Controls */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {/* Theme Toggle (macOS Sun/Moon pill) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl liquid-glass-button text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] cursor-pointer"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Public Navigation for Logged-Out Visitors: Sign in, Sign up, Download Desktop */}
            {!user ? (
              <>
                <button
                  type="button"
                  onClick={() => handleRoute('/login')}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--orion-text-primary)] hover:bg-white/40 dark:hover:bg-white/10 transition cursor-pointer whitespace-nowrap"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => handleRoute('/signup')}
                  className="px-3.5 py-2 rounded-xl liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)] cursor-pointer whitespace-nowrap"
                >
                  Sign up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRoute('/login?redirect=/download&platform=windows');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)] cursor-pointer whitespace-nowrap"
                  title="Download Orion-9 Desktop Workstation"
                >
                  <Download className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
                  <span>Download Desktop</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenDownload) onOpenDownload();
                    else handleRoute('/download');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl liquid-glass-button text-xs font-medium text-[var(--orion-text-primary)] cursor-pointer whitespace-nowrap"
                  title="Download Orion-9 Desktop Workstation"
                >
                  <Download className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
                  <span>Download Desktop</span>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)] cursor-pointer whitespace-nowrap"
                  >
                    <UserCircle2 className="w-4 h-4 text-[var(--orion-accent)]" />
                    <span className="truncate max-w-[120px]">
                      {user.displayName || user.email?.split('@')[0] || 'Operator'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[var(--orion-text-muted)]" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl liquid-glass-elevated p-2 text-xs z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2.5 border-b border-[var(--glass-border-subtle)] mb-1">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--orion-text-muted)]">
                          Active Operator
                        </p>
                        <p className="font-semibold text-[var(--orion-text-primary)] truncate mt-0.5">
                          {user.email}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--orion-accent)]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{isFirebaseConfigured ? 'Verified Operator' : 'Authenticated'}</span>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleRoute('/admin');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--orion-text-primary)] hover:bg-white/50 dark:hover:bg-white/10 transition-colors text-left font-medium cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
                          <span>Admin Console</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors text-left font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Launch Orion-9 OS Primary Action (Authenticated Only) */}
                <button
                  type="button"
                  onClick={() => launchOrion(destinationUrl)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white text-xs font-semibold transition-all shadow-[0_4px_16px_rgba(2,132,199,0.35)] hover:shadow-[0_6px_20px_rgba(2,132,199,0.45)] cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  Launch Orion-9 OS
                </button>
              </>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg liquid-glass-button text-[var(--orion-text-secondary)]"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-700" />
              )}
            </button>

            {user && (
              <button
                type="button"
                onClick={() => launchOrion(destinationUrl)}
                className="px-3 py-1.5 rounded-lg bg-[var(--orion-accent)] text-white text-xs font-semibold whitespace-nowrap shadow-xs"
              >
                Orion-9 OS
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg liquid-glass-button text-[var(--orion-text-primary)]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Liquid Glass Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden pointer-events-auto max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
          <div className="liquid-glass-elevated rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavLinkClick(e, item.href)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-[var(--orion-text-primary)] hover:bg-white/40 dark:hover:bg-white/10 transition cursor-pointer"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-[var(--glass-border-subtle)] flex flex-col gap-2">
              {user ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleRoute('/admin')}
                        className="py-2 px-3 rounded-xl liquid-glass-button text-xs font-medium text-[var(--orion-text-primary)] text-center"
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
                      className="py-2 px-3 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-medium text-center"
                    >
                      Sign out
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenDownload) onOpenDownload();
                      else handleRoute('/download');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)]"
                  >
                    <Download className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
                    <span>Download Desktop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      launchOrion(destinationUrl);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white text-xs font-semibold text-center shadow-md shadow-sky-600/20"
                  >
                    Launch Orion-9 OS
                  </button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRoute('/login')}
                      className="py-2 px-3 rounded-xl liquid-glass-button text-xs font-medium text-[var(--orion-text-primary)] text-center"
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoute('/signup')}
                      className="py-2 px-3 rounded-xl bg-[var(--orion-accent)] text-white text-xs font-semibold text-center"
                    >
                      Sign up
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleRoute('/login?redirect=/download&platform=windows');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)]"
                  >
                    <Download className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
                    <span>Download Desktop</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
