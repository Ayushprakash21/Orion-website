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

  // Curated VectrFL-style navigation links
  const defaultNavLinks = [
    { label: 'Platform', href: '#problem' },
    { label: 'Global Network', href: '#network' },
    { label: 'Decision Intelligence', href: '#intelligence' },
    { label: 'Control Tower', href: '#control-tower' },
    { label: 'Architecture', href: '#architecture' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#EAF4F8]/85 border-b border-[#D5E1E8]/80 transition-colors">
      {/* Draft Preview Banner when Admin is previewing unpublished CMS edits */}
      {isPreviewMode && (
        <div className="bg-[#101820] text-white px-4 py-2 text-xs font-mono flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-[#A8C2D2]" />
            <span>CMS DRAFT PREVIEW MODE — Viewing unpublished changes</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-6">
        {/* Brand Identity */}
        <a
          href="#"
          onClick={(e) => {
            if (window.location.pathname !== '/') {
              e.preventDefault();
              handleRoute('/');
            }
          }}
          className="flex items-center gap-3 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#294D6B] rounded-xl group"
          aria-label={`${activeConfig.branding.companyName} Home`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#101820] text-white flex items-center justify-center font-mono text-xs font-bold tracking-tighter shadow-xs group-hover:bg-[#294D6B] transition-colors">
            {activeConfig.branding.shortMark || 'Ω9'}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#111827] leading-none">
              {activeConfig.branding.companyName || 'Orion-9'}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#566575] uppercase mt-0.5 hidden sm:inline">
              SUPPLY CHAIN OS
            </span>
          </div>
        </a>

        {/* Center Navigation Links in a unified pill */}
        <nav
          className="hidden lg:flex items-center gap-1 rounded-full border border-[#D5E1E8] bg-white/90 backdrop-blur-xs px-2 py-1.5 shadow-[0_2px_8px_rgba(20,40,65,0.03)]"
          aria-label="Main Navigation"
        >
          {defaultNavLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#4A5568] hover:text-[#111827] hover:bg-[#EAF4F8]/70 transition-colors whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Right: Log in, Sign up, and Primary CTA */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5E1E8] text-xs font-semibold text-[#111827] hover:border-[#294D6B] transition-all cursor-pointer shadow-2xs"
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <UserCircle2 className="w-4 h-4 text-[#294D6B]" />
                <span className="truncate max-w-[120px]">
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
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleRoute('/login')}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#4A5568] hover:text-[#111827] hover:bg-white/60 transition-colors cursor-pointer"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => handleRoute('/signup')}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#111827] bg-white border border-[#D5E1E8] hover:border-[#294D6B]/50 transition-colors cursor-pointer shadow-2xs"
              >
                Sign up
              </button>
            </div>
          )}

          {/* One Clear Primary CTA */}
          <button
            type="button"
            onClick={() => launchOrion(destinationUrl)}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#101820] text-white text-xs font-semibold hover:bg-[#294D6B] transition-all shadow-[0_4px_12px_rgba(16,24,32,0.12)] active:scale-[0.98] cursor-pointer"
          >
            <span>Launch Control Tower</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#A8C2D2] transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => launchOrion(destinationUrl)}
            className="px-3 py-1.5 rounded-full bg-[#101820] text-white text-xs font-semibold cursor-pointer"
          >
            Launch
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#111827] hover:bg-white/80 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D5E1E8] bg-white/98 backdrop-blur-xl px-4 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-2">
            {defaultNavLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-[#4A5568] hover:text-[#111827] hover:bg-[#EAF4F8]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pt-4 border-t border-[#D5E1E8] space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 bg-[#F5F9FB] rounded-xl text-xs">
                  <span className="text-[#566575] block text-[10px] font-mono">SIGNED IN AS</span>
                  <span className="font-semibold text-[#111827] truncate block">{user.email}</span>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleRoute('/admin')}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#D5E1E8] text-xs font-semibold text-[#111827] text-center block"
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
                  className="w-full py-2.5 px-4 rounded-xl bg-red-50 text-red-600 text-xs font-semibold text-center block cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoute('/login')}
                  className="w-full py-2.5 rounded-full border border-[#D5E1E8] text-xs font-semibold text-[#111827] text-center"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => handleRoute('/signup')}
                  className="w-full py-2.5 rounded-full bg-[#101820] text-white text-xs font-semibold text-center"
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
