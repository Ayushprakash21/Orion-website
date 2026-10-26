import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import {
  Menu,
  X,
  ArrowRight,
  UserCircle2,
  LogOut,
  ShieldCheck,
  Sliders,
  Eye,
} from 'lucide-react';

interface NavbarProps {
  onNavigate?: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { user, isAdmin, launchOrion, logout, isFirebaseConfigured } = useAuth();
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

  const visibleNavItems = activeConfig.navigation.items.filter((item) => item.visible);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#EAF4F8]/88 border-b border-[#D5E1E8] transition-colors">
      {/* Draft Preview Banner when Admin is previewing unpublished CMS edits */}
      {isPreviewMode && (
        <div className="bg-[#101820] text-white px-4 py-2 text-xs font-mono flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-[#A8C2D2]" />
            <span>CMS DRAFT PREVIEW MODE ACTIVE — Viewing unpublished changes</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPreviewMode(false)}
              className="underline text-[#A8C2D2] hover:text-white cursor-pointer"
            >
              Switch to Published Live
            </button>
            <button
              type="button"
              onClick={() => handleRoute('/admin')}
              className="px-3 py-1 rounded-full bg-[#294D6B] text-white font-sans font-semibold text-[11px] cursor-pointer"
            >
              Return to Admin Console
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Brand Identity */}
        <a
          href="#"
          onClick={(e) => {
            if (window.location.pathname !== '/') {
              e.preventDefault();
              handleRoute('/');
            }
          }}
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294D6B] rounded-xl pr-2"
          aria-label={`${activeConfig.branding.companyName} Home`}
        >
          <div className="w-9 h-9 rounded-xl bg-[#101820] text-white flex items-center justify-center font-mono text-xs font-bold tracking-tighter shadow-sm">
            {activeConfig.branding.shortMark}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#111827] leading-none">
              {activeConfig.branding.companyName}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#566575] mt-0.5 hidden sm:inline">
              SUPPLY CHAIN OS
            </span>
          </div>
        </a>

        {/* Center Navigation Links */}
        <nav
          className="hidden lg:flex items-center gap-1 rounded-full border border-[#D5E1E8] bg-white/80 px-2 py-1.5 shadow-[0_2px_10px_rgba(16,24,32,0.03)]"
          aria-label="Main Navigation"
        >
          {visibleNavItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#566575] hover:text-[#111827] hover:bg-[#EAF4F8]/70 transition-colors whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Right: Auth Links & Pill CTA */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#D5E1E8] text-xs font-semibold text-[#111827] hover:border-[#294D6B] transition-all cursor-pointer shadow-2xs"
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <UserCircle2 className="w-4 h-4 text-[#294D6B]" />
                <span className="truncate max-w-[130px]">
                  {user.displayName || user.email?.split('@')[0] || 'Operator'}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-[#D5E1E8] shadow-xl p-2 text-xs z-50">
                  <div className="px-3 py-2.5 border-b border-[#D5E1E8] mb-1">
                    <p className="text-[10px] font-mono uppercase text-[#566575]">OPERATOR ACCOUNT</p>
                    <p className="font-semibold text-[#111827] truncate mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#294D6B] font-mono">
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
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#111827] hover:bg-[#EAF4F8] transition-colors text-left font-medium cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#294D6B]" />
                      <span>Admin Console</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-left font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {activeConfig.navigation.showSignIn && (
                <button
                  type="button"
                  onClick={() => handleRoute('/login')}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#111827] hover:bg-white/80 transition-colors cursor-pointer"
                >
                  Log in
                </button>
              )}
              {activeConfig.navigation.showSignUp && (
                <button
                  type="button"
                  onClick={() => handleRoute('/signup')}
                  className="px-4 py-2 rounded-full border border-[#D5E1E8] bg-white text-xs font-semibold text-[#111827] hover:border-[#294D6B] transition-all cursor-pointer"
                >
                  Sign up
                </button>
              )}
            </div>
          )}

          {/* Pill-shaped Launch CTA */}
          <button
            type="button"
            onClick={() => launchOrion(activeConfig.navigation.launchControlTowerUrl)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#101820] text-white font-semibold text-xs hover:bg-[#294D6B] transition-all shadow-[0_8px_20px_rgba(16,24,32,0.14)] whitespace-nowrap active:scale-[0.98] cursor-pointer"
            aria-label={activeConfig.navigation.launchControlTowerLabel}
          >
            <span>{activeConfig.navigation.launchControlTowerLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-2.5">
          <button
            type="button"
            onClick={() => launchOrion(activeConfig.navigation.launchControlTowerUrl)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#101820] text-white font-semibold text-xs"
          >
            <span>Launch</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#111827] rounded-full border border-[#D5E1E8] bg-white"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 bg-[#F5F9FB] border-b border-[#D5E1E8] space-y-3 text-xs">
          <nav className="flex flex-col space-y-1 py-2">
            {visibleNavItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl font-semibold text-[#111827] hover:bg-[#EAF4F8] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#D5E1E8] flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-[#D5E1E8]">
                <span className="truncate font-medium text-[#111827]">{user.email}</span>
                <button onClick={logout} className="text-red-600 font-semibold">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleRoute('/login')}
                  className="w-full py-2.5 rounded-full border border-[#D5E1E8] bg-white text-center font-semibold text-[#111827]"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => handleRoute('/signup')}
                  className="w-full py-2.5 rounded-full bg-[#294D6B] text-center font-semibold text-white"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
