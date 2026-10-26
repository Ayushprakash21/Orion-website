import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { FlowLogin } from './FlowLogin';
import { FlowSignup } from './FlowSignup';
import { OrionLogo } from '../OrionLogo';
import { ArrowLeft, ArrowRight, ShieldCheck, Globe2, Lock } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#EAF4F8] text-[#111827] flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Subtle architectural background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, #D5E1E8 1px, transparent 1px), linear-gradient(to bottom, #D5E1E8 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden="true"
      />

      {/* Top Navigation Bar */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="inline-flex items-center"
            aria-label={`${activeConfig.branding.companyName} Home`}
          >
            <OrionLogo companyName={activeConfig.branding.companyName} size="md" tone="dark" />
          </a>

          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-[#566575] hover:text-[#111827] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => launchOrion()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#D5E1E8] text-xs font-semibold text-[#111827] hover:border-[#294D6B] transition-all cursor-pointer shadow-xs"
        >
          <span>Launch Control Tower</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#294D6B]" />
        </button>
      </header>

      {/* Main Centered Stage */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-8">
        {user ? (
          <div className="w-full max-w-md rounded-3xl border border-[#D5E1E8] bg-white/95 p-8 shadow-[0_24px_60px_rgba(16,24,32,0.08)] text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF4F8] border border-[#D5E1E8] text-[#294D6B] mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#294D6B] font-semibold">
                ACTIVE OPERATOR SESSION
              </span>
              <h1 className="text-2xl font-bold text-[#111827]">
                Welcome, {user.displayName || username || user.email?.split('@')[0]}
              </h1>
              {username && (
                <p className="text-xs font-mono text-[#294D6B] font-medium">@{username}</p>
              )}
              <p className="text-xs text-[#566575]">{user.email}</p>
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => launchOrion()}
                className="w-full h-11 rounded-full bg-[#101820] text-white text-xs font-semibold hover:bg-[#294D6B] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Orion-9 Control Tower</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="w-full h-11 rounded-full border border-[#D5E1E8] bg-[#F5F9FB] text-[#111827] text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
              >
                Return to Public Homepage
              </button>
            </div>
          </div>
        ) : mode === 'login' ? (
          <FlowLogin
            title={activeConfig.branding.companyName}
            subtitle="Sign in to your supply chain command workspace."
            defaultExpanded={true}
            showSocial={activeConfig.authSettings.allowGoogleAuth}
            showForgot={activeConfig.authSettings.allowPasswordReset}
            onSubmit={async ({ identifier, email, password, remember }) => {
              const res = await login(identifier || email || '', password, remember);
              if (res.success) {
                onNavigate('/');
              }
              return res;
            }}
            onForgotPassword={(identifier) => resetPassword(identifier)}
            onGoogleSignIn={async () => {
              const res = await loginWithGoogle();
              if (res.success) {
                onNavigate('/');
              }
              return res;
            }}
            onNavigateSignup={() => onNavigate('/signup')}
          />
        ) : (
          <FlowSignup
            title={activeConfig.branding.companyName}
            subtitle="Provision your operator credentials and get started."
            defaultExpanded={true}
            showSocial={activeConfig.authSettings.allowGoogleAuth}
            onSubmit={async ({ name, username, email, password, terms }) => {
              const res = await signup(name, username, email, password, terms);
              if (res.success) {
                onNavigate('/');
              }
              return res;
            }}
            onGoogleSignIn={async () => {
              const res = await loginWithGoogle();
              if (res.success) {
                onNavigate('/');
              }
              return res;
            }}
            onNavigateLogin={() => onNavigate('/login')}
          />
        )}

        {/* Environment & Security Footnote */}
        <div className="mt-4 max-w-md w-full rounded-2xl border border-[#D5E1E8] bg-white/80 backdrop-blur-md px-4 py-3 text-[11px] text-[#566575] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#294D6B]" />
            <span>
              {isFirebaseConfigured
                ? 'Firebase Identity Gateway Connected'
                : 'Environment-Driven Firebase Auth Gateway'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#294D6B]">
            <Globe2 className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{destinationUrl}</span>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-20 py-5 text-center text-xs text-[#566575] border-t border-[#D5E1E8]/70 bg-[#F5F9FB]/80">
        <span>{activeConfig.footer.copyrightText}</span>
      </footer>
    </div>
  );
};
