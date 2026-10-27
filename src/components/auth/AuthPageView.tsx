import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useTheme } from '../../context/ThemeContext';
import { FlowLogin } from './FlowLogin';
import { FlowSignup } from './FlowSignup';
import { OrionLogo } from '../OrionLogo';
import { ArrowLeft, ArrowRight, ShieldCheck, Globe2, Lock, Sun, Moon } from 'lucide-react';

interface AuthPageViewProps {
  mode: 'login' | 'signup';
  onNavigate: (path: string) => void;
}

export const AuthPageView: React.FC<AuthPageViewProps> = ({ mode, onNavigate }) => {
  const {
    login,
    signup,
    resetPassword,
    loginWithGoogle,
    user,
    username,
    launchOrion,
    destinationUrl,
    isFirebaseConfigured,
  } = useAuth();
  const { activeConfig } = useSiteConfig();
  const { theme, toggleTheme } = useTheme();

  // Check URL parameters for redirect and platform
  const searchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const redirectTarget = searchParams?.get('redirect') || null;
  const platformTarget = searchParams?.get('platform') || null;

  const handlePostAuthNavigate = () => {
    if (redirectTarget === '/download' || redirectTarget?.startsWith('/download')) {
      const target = platformTarget ? `/download?platform=${platformTarget}` : '/download';
      onNavigate(target);
      return;
    }
    if (redirectTarget) {
      onNavigate(redirectTarget);
      return;
    }
    onNavigate('/dashboard');
  };

  const companyName = activeConfig.branding.companyName || 'Orion-9';

  return (
    <div className="min-h-screen bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] flex flex-col justify-between relative overflow-hidden font-sans transition-colors duration-300">
      {/* Ambient background light orbs for refraction */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] bg-sky-400/15 dark:bg-sky-500/10 blur-[140px] rounded-full"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-500/15 dark:bg-sky-400/10 blur-[140px] rounded-full"
        aria-hidden="true"
      />

      {/* Floating macOS Liquid Glass Header */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="inline-flex items-center"
            aria-label={`${companyName} Home`}
          >
            <OrionLogo
              companyName={companyName}
              size="md"
              tone={theme === 'dark' ? 'light' : 'dark'}
              placement="auth"
            />
          </a>

          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl liquid-glass-button text-xs font-medium text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl liquid-glass-button text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {user && (
            <button
              type="button"
              onClick={() => launchOrion()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white text-xs font-semibold transition-all shadow-[0_4px_16px_rgba(2,132,199,0.35)] cursor-pointer"
            >
              <span className="hidden sm:inline">Launch Orion-9 OS</span>
              <span className="sm:hidden">Orion-9 OS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Centered Stage */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
        {user ? (
          <div className="w-full max-w-md rounded-2xl sm:rounded-3xl liquid-glass-elevated p-5 sm:p-10 border border-[var(--glass-border)] shadow-2xl text-center space-y-5 sm:space-y-6">
            <div className="w-14 h-14 rounded-2xl liquid-glass-subtle border border-[var(--glass-border)] text-[var(--orion-accent)] mx-auto flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-7 h-7 text-[var(--orion-accent)]" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--orion-accent)] font-semibold block">
                ACTIVE OPERATOR SESSION
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--orion-text-primary)]">
                Welcome, {user.displayName || username || user.email?.split('@')[0]}
              </h1>
              {username && (
                <p className="text-xs font-mono text-[var(--orion-accent)] font-medium">@{username}</p>
              )}
              <p className="text-xs text-[var(--orion-text-muted)] font-mono">{user.email}</p>
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              {redirectTarget?.startsWith('/download') && (
                <button
                  type="button"
                  onClick={() => handlePostAuthNavigate()}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white text-xs font-semibold hover:from-[#0369A1] hover:to-[#075985] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-600/25"
                >
                  <span>Proceed to Desktop Downloads</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => launchOrion()}
                className="w-full h-11 rounded-xl bg-[var(--orion-text-primary)] text-[var(--orion-surface)] text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span className="hidden sm:inline">Launch Orion-9 OS</span>
              <span className="sm:hidden">Orion-9 OS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/dashboard')}
                className="w-full h-11 rounded-xl bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border border-sky-500/30"
              >
                <span>Open User Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="w-full h-11 rounded-xl liquid-glass-button text-[var(--orion-text-primary)] text-xs font-semibold transition-all cursor-pointer"
              >
                Return to Public Homepage
              </button>
            </div>
          </div>
        ) : mode === 'login' ? (
          <div className="w-full max-w-md">
            <FlowLogin
              title={companyName}
              subtitle={
                redirectTarget?.startsWith('/download')
                  ? 'Sign in to authenticate and download Orion-9 workstation binaries.'
                  : 'Sign in to your supply chain command workspace.'
              }
              defaultExpanded={true}
              showSocial={activeConfig.authSettings.allowGoogleAuth}
              showForgot={activeConfig.authSettings.allowPasswordReset}
              onSubmit={async ({ identifier, email, password, remember }) => {
                const res = await login(identifier || email || '', password, remember);
                if (res.success) {
                  handlePostAuthNavigate();
                }
                return res;
              }}
              onForgotPassword={(identifier) => resetPassword(identifier)}
              onGoogleSignIn={async () => {
                const res = await loginWithGoogle();
                if (res.success) {
                  handlePostAuthNavigate();
                }
                return res;
              }}
              onNavigateSignup={() => {
                const q = redirectTarget
                  ? `?redirect=${encodeURIComponent(redirectTarget)}${
                      platformTarget ? `&platform=${encodeURIComponent(platformTarget)}` : ''
                    }`
                  : '';
                onNavigate(`/signup${q}`);
              }}
            />
          </div>
        ) : (
          <div className="w-full max-w-md">
            <FlowSignup
              title={companyName}
              subtitle={
                redirectTarget?.startsWith('/download')
                  ? 'Register an operator profile to access verified desktop releases.'
                  : 'Provision your operator credentials and get started.'
              }
              defaultExpanded={true}
              showSocial={activeConfig.authSettings.allowGoogleAuth}
              onSubmit={async ({ name, username, email, password, terms }) => {
                const res = await signup(name, username, email, password, terms);
                if (res.success) {
                  handlePostAuthNavigate();
                }
                return res;
              }}
              onGoogleSignIn={async () => {
                const res = await loginWithGoogle();
                if (res.success) {
                  handlePostAuthNavigate();
                }
                return res;
              }}
              onNavigateLogin={() => {
                const q = redirectTarget
                  ? `?redirect=${encodeURIComponent(redirectTarget)}${
                      platformTarget ? `&platform=${encodeURIComponent(platformTarget)}` : ''
                    }`
                  : '';
                onNavigate(`/login${q}`);
              }}
            />
          </div>
        )}

        {/* Environment & Security Footnote in Liquid Glass */}
        <div className="mt-5 max-w-md w-full rounded-2xl liquid-glass-subtle px-4 py-3 text-[11px] text-[var(--orion-text-secondary)] flex flex-wrap items-center justify-between gap-2 shadow-xs border border-[var(--glass-border-subtle)]">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
            <span className="font-medium">
              {isFirebaseConfigured
                ? 'Firebase Identity Gateway Connected'
                : 'Environment-Driven Auth Gateway'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--orion-text-muted)]">
            <Globe2 className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
            <span className="truncate max-w-[180px]">{destinationUrl}</span>
          </div>
        </div>
      </main>

      {/* Minimal Liquid Glass Footer */}
      <footer className="relative z-20 py-4 text-center text-xs text-[var(--orion-text-muted)] border-t border-[var(--glass-border-subtle)] bg-white/20 dark:bg-black/20 backdrop-blur-md">
        <span>{activeConfig.footer.copyrightText}</span>
      </footer>
    </div>
  );
};
