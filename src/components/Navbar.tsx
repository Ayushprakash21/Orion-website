import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ArrowRight, UserCircle2, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, openAuthModal, launchOrion, logout, isFirebaseConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0f1626]/85 border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Desktop Left: Clean Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium tracking-wide text-white/70" aria-label="Main Navigation">
          <a
            href="#platform"
            className="hover:text-white transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] rounded-sm whitespace-nowrap shrink-0"
          >
            PLATFORM
          </a>
          <a
            href="#capabilities"
            className="hover:text-white transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] rounded-sm whitespace-nowrap shrink-0"
          >
            CAPABILITIES
          </a>
          <a
            href="#architecture"
            className="hover:text-white transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] rounded-sm whitespace-nowrap shrink-0"
          >
            ARCHITECTURE
          </a>
          <a
            href="#value"
            className="hover:text-white transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] rounded-sm whitespace-nowrap shrink-0"
          >
            ABOUT
          </a>
        </nav>

        {/* Center: ORION-9 Wordmark */}
        <a
          href="#"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] rounded-md px-1"
          aria-label="Orion-9 Operating System Home"
        >
          <div className="w-7 h-7 rounded-md bg-[#1d293d] border border-cyan-400/40 flex items-center justify-center text-[#f5f5f5] font-mono text-xs font-bold tracking-tighter">
            Ω9
          </div>
          <span className="text-xl font-bold tracking-wider text-white font-mono uppercase whitespace-nowrap shrink-0">
            ORION-9
          </span>
        </a>

        {/* Desktop Right: Auth Actions + Launch Orion-9 */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151e30] border border-white/15 text-sm text-white/90 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] transition-all"
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <UserCircle2 className="w-4 h-4 text-[#f5f5f5]" />
                <span className="truncate max-w-[130px] font-medium">
                  {user.displayName || user.email?.split('@')[0] || 'Authenticated'}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#151e30] border border-white/15 shadow-2xl p-2 text-sm z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs text-white/50">Signed in as</p>
                    <p className="text-xs font-medium text-white truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-white">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isFirebaseConfigured ? 'Firebase Verified' : 'Session Active'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-300 hover:bg-white/5 hover:text-red-200 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-2 text-xs font-medium uppercase tracking-wider text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] rounded-md"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="px-3.5 py-2 text-xs font-medium uppercase tracking-wider text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] rounded-md"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Primary CTA: Launch Orion-9 */}
          <button
            type="button"
            onClick={launchOrion}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f5f5f5] text-[#0f1626] font-semibold text-xs uppercase tracking-wider shadow-lg shadow-[#f5f5f5]/20 hover:bg-[#e5e5e5] hover:shadow-[#f5f5f5]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1626] transition-all whitespace-nowrap active:scale-[0.98]"
            aria-label="Launch Orion-9 Control Tower"
          >
            <span>Launch Orion-9</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile: Compact Action + Toggle */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            type="button"
            onClick={launchOrion}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f5f5] text-[#0f1626] font-semibold text-xs uppercase tracking-wider"
          >
            <span>Launch</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white/80 hover:text-white rounded-lg border border-white/10"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 bg-[#0f1626]/98 border-b border-white/10 space-y-3">
          <nav className="flex flex-col space-y-2 py-2 text-sm text-white/80 font-medium">
            <a
              href="#platform"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              PLATFORM
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              CAPABILITIES
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              ARCHITECTURE
            </a>
            <a
              href="#value"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              ABOUT
            </a>
          </nav>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#151e30] text-sm">
                <span className="truncate text-white/80">{user.email}</span>
                <button onClick={logout} className="text-red-300 text-xs font-semibold">
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2.5 rounded-lg border border-white/20 text-center text-xs uppercase font-medium text-white"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signup');
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#1d293d] border border-white/20 text-center text-xs uppercase font-medium text-white"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
