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

  const navLinks = [
    { label: 'Platform', href: '#problem' },
    { label: 'Network', href: '#network' },
    { label: 'Intelligence', href: '#decision-story' },
    { label: 'Control Tower', href: '#control-tower' },
    { label: 'Architecture', href: '#architecture' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#EAF4F8]/80 border-b border-[#D5E1E8]/70 transition-all duration-300">
      {/* Draft Preview Mode Banner (Admin) */}
      {isPreviewMode && (
        <div className="bg-[#0B131F] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-[#7DD3FC]" />
            <span>Viewing Unpublished CMS Draft</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPreviewMode(false)}
              className="text-[#A8C2D2] hover:text-white underline cursor-pointer"
            >
              Exit Preview
            </button>
            <button
              type="button"
              onClick={() => handleRoute('/admin')}
              className="px-3 py-1 rounded-full bg-[#294D6B] text-white font-medium text-[11px] cursor-pointer"
            >
              Admin Console
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
          className="flex items-center gap-3 group focus:outline-hidden"
          aria-label={`${activeConfig.branding.companyName} Home`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#111827] text-white flex items-center justify-center font-mono text-xs font-bold tracking-tight shadow-xs group-hover:bg-[#294D6B] transition-colors">
            {activeConfig.branding.shortMark || 'Ω9'}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#111827] leading-none">
              {activeConfig.branding.companyName || 'Orion-9'}
            </span>
            <span className="text-[10px] tracking-wider text-[#566575] uppercase mt-0.5 hidden sm:inline font-medium">
              Supply Chain Operating System
            </span>
          </div>
        </a>

        {/* Floating Center Navigation Pill */}
        <nav
          className="hidden lg:flex items-center gap-1 rounded-full border border-[#D5E1E8] bg-white/90 backdrop-blur-md px-2.5 py-1.5 shadow-[0_2px_8px_rgba(20,40,65,0.04)]"
          aria-label="Main Navigation"
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#4A5568] hover:text-[#111827] hover:bg-[#EAF4F8]/80 transition-colors whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Action Cluster */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D5E1E8] text-xs font-medium text-[#111827] hover:border-[#294D6B] transition-all cursor-pointer shadow-2xs"
              >
                <UserCircle2 className="w-4 h-4 text-[#294D6B]" />
                <span className="truncate max-w-[120px]">
                  {user.displayName || user.email?.split('@')[0] || 'Operator'}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-[#D5E1E8] shadow-xl p-2 text-xs z-50">
                  <div className="px-3 py-2.5 border-b border-[#D5E1E8] mb-1">
                    <p className="text-[10px] uppercase text-[#566575] font-semibold">Active Operator</p>
                    <p className="font-medium text-[#111827] truncate mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#294D6B]">
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
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleRoute('/login')}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#4A5568] hover:text-[#111827] transition-colors cursor-pointer"
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

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => launchOrion(destinationUrl)}
            className="group inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-[#111827] text-white text-xs font-semibold hover:bg-[#294D6B] transition-all shadow-[0_4px_14px_rgba(17,24,39,0.12)] active:scale-[0.98] cursor-pointer"
          >
            <span>Launch Control Tower</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#A8C2D2] transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => launchOrion(destinationUrl)}
            className="px-3 py-1.5 rounded-full bg-[#111827] text-white text-xs font-semibold"
          >
            Launch
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#111827] hover:bg-white/80 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D5E1E8] bg-white/98 backdrop-blur-xl px-5 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((item) => (
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
                  <span className="text-[#566575] block text-[10px] uppercase font-medium">Signed In</span>
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
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold text-center block cursor-pointer"
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
                  className="w-full py-2.5 rounded-full bg-[#111827] text-white text-xs font-semibold text-center"
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
