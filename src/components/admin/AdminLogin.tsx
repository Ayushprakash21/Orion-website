import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Settings,
  RefreshCw,
  LogOut,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  Info,
  Terminal,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getActiveFirebaseConfig, BOOTSTRAPPED_ADMIN_EMAILS } from '../../services/firebase';
import {
  validateLoginIdentifier,
  isLocalDevEnvironment,
  validateAdminLogin,
} from '../../utils/auth-validation';
import { OrionLogo } from '../OrionLogo';

interface AdminLoginProps {
  onNavigate: (path: string) => void;
}

export function AdminLogin({ onNavigate }: AdminLoginProps) {
  const {
    user,
    isAuthenticated,
    isAdmin,
    adminAuthSource,
    isLocalDevAdmin,
    isFirebaseConfigured,
    login,
    loginWithGoogle,
    logout,
    refreshAdminStatus,
  } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [showAuthGuide, setShowAuthGuide] = useState(false);

  const isDev = isLocalDevEnvironment();
  const currentConfig = getActiveFirebaseConfig();

  React.useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) {
      onNavigate('/admin');
    }
  }, [loading, isAuthenticated, isAdmin, onNavigate]);

  const handleFillDevCredentials = () => {
    setIdentifier('admin@orion');
    setPassword('admin');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier || !password) {
      setError('Please enter both your administrator username/email and password.');
      return;
    }

    // Check admin credentials environment compliance
    const adminEnvCheck = validateAdminLogin(trimmedIdentifier, password);
    if (adminEnvCheck.isLocalDevAttempt && !adminEnvCheck.allowedInCurrentEnv) {
      setError(
        adminEnvCheck.error ||
          'Local development credentials (admin/admin) are strictly prohibited in production. Please sign in using your verified Firebase Administrator credentials.'
      );
      return;
    }

    const idCheck = validateLoginIdentifier(trimmedIdentifier);
    if (!idCheck.isValid) {
      setError(idCheck.error || 'Please enter a valid administrator username or work email.');
      return;
    }

    setLoading(true);
    const res = await login(trimmedIdentifier, password, true);
    if (!res.success) {
      setError(res.error || 'Administrator authentication failed. Please verify your credentials.');
      setLoading(false);
      return;
    }

    const authorized = await refreshAdminStatus(res.user);
    setLoading(false);
    if (authorized || res.success) {
      onNavigate('/admin');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    const res = await loginWithGoogle();
    if (!res.success) {
      setError(res.error || 'Google Workspace authentication failed.');
      setLoading(false);
      return;
    }
    const authorized = await refreshAdminStatus(res.user);
    setLoading(false);
    if (authorized) {
      onNavigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Ambient background light spot */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-sky-400/15 dark:bg-sky-500/10 blur-[130px] rounded-full"
        aria-hidden="true"
      />

      {/* Top Bar in Liquid Glass */}
      <header className="max-w-[1280px] w-full mx-auto flex flex-wrap items-center justify-between gap-3 sm:gap-4 relative z-10">
        <div className="flex items-center gap-3 sm:gap-5">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="inline-flex items-center"
            aria-label="Orion-9 Home"
          >
            <OrionLogo
              companyName="Orion-9"
              size="md"
              tone={theme === 'dark' ? 'light' : 'dark'}
              placement="auth"
            />
          </a>

          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl liquid-glass-button text-xs font-medium text-[var(--orion-text-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
            <span className="hidden min-[360px]:inline">Return to Site</span>
            <span className="min-[360px]:hidden">Site</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-[var(--orion-text-secondary)]">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl liquid-glass-button text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] cursor-pointer mr-1"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <span className="hidden sm:inline">RESTRICTED ADMIN GATEWAY</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span className={isFirebaseConfigured ? 'text-emerald-500 font-medium' : 'text-amber-500'}>
            {isFirebaseConfigured ? 'ONLINE' : 'DEV'}
          </span>
          {isDev && (
            <>
              <span aria-hidden="true">·</span>
              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-sky-500/15 text-[var(--orion-accent)] font-semibold text-[10px]">
                LOCAL DEV
              </span>
            </>
          )}
        </div>
      </header>

      {/* Main Liquid Glass macOS Admin Window */}
      <main className="max-w-lg w-full mx-auto my-4 sm:my-10 relative z-10">
        <div className="macos-window rounded-2xl sm:rounded-3xl border border-[var(--glass-border)] shadow-2xl overflow-hidden p-5 sm:p-8 md:p-10 backdrop-blur-2xl">
          {/* macOS Titlebar & Traffic Lights */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-[var(--glass-border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="macos-traffic-lights" aria-hidden="true">
                <span className="macos-traffic-light close" />
                <span className="macos-traffic-light minimize" />
                <span className="macos-traffic-light zoom" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--orion-accent)] font-semibold">
                ADMIN CONSOLE GATEWAY
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAuthGuide((prev) => !prev)}
                className="p-2 rounded-xl liquid-glass-button text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] cursor-pointer"
                title="Authorization Guide"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowConfigDrawer((prev) => !prev)}
                className="p-2 rounded-xl liquid-glass-button text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] cursor-pointer"
                title="Firebase Connection Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--orion-text-primary)]">
              Orion-9 Admin Portal
            </h1>
            <p className="text-xs text-[var(--orion-text-secondary)]">
              Sign in with administrative credentials to manage CMS, releases, and platform configuration.
            </p>
          </div>

          {/* Dev Auto-Fill Assistance */}
          {!isAuthenticated && (
            <div className="mb-6 p-4 rounded-2xl liquid-glass-subtle border border-[var(--glass-border)] text-xs text-[var(--orion-text-secondary)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-[var(--orion-text-primary)]">
                  <Terminal className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
                  Dev Admin Credentials
                </span>
                <button
                  type="button"
                  onClick={handleFillDevCredentials}
                  className="px-2.5 py-1 rounded-lg bg-[var(--orion-accent)] text-white text-[10px] font-semibold hover:opacity-90 transition cursor-pointer shadow-xs"
                >
                  Auto-fill (admin@orion)
                </button>
              </div>
              <p className="text-[11px] leading-relaxed font-mono">
                ID: <span className="text-[var(--orion-text-primary)] font-bold">admin@orion</span> · Pass:{' '}
                <span className="text-[var(--orion-text-primary)] font-bold">admin</span>
              </p>
            </div>
          )}

          {/* Authenticated Admin State */}
          {isAuthenticated && isAdmin ? (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <div className="flex items-center gap-2.5 font-bold text-sm mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Administrator Session Verified
                </div>
                <p className="text-xs leading-relaxed">
                  Authenticated as <span className="font-mono font-medium">{user?.email}</span> via{' '}
                  <span className="font-mono font-semibold">{adminAuthSource}</span>. All CMS &amp; governance controls unlocked.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/admin')}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white text-xs font-semibold shadow-lg transition-all cursor-pointer"
                >
                  <span>Open Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl liquid-glass-button text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-identifier"
                  className="block text-[11px] font-mono uppercase tracking-wider text-[var(--orion-text-muted)] mb-1.5"
                >
                  Admin Username or Work Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--orion-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. admin@orion or admin@enterprise.com"
                    autoComplete="username"
                    disabled={loading}
                    className="w-full h-11 pl-10 pr-4 rounded-xl liquid-glass-input text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] font-mono uppercase tracking-wider text-[var(--orion-text-muted)] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--orion-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-password"
                    type={passwordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter administrator password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full h-11 pl-10 pr-10 rounded-xl liquid-glass-input text-xs font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)] cursor-pointer"
                    aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                  >
                    {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white text-xs font-semibold shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-sky-200" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-sky-200" />
                    <span>Authenticate &amp; Enter Console</span>
                  </>
                )}
              </button>

              <div className="relative my-4 text-center">
                <span className="px-3 bg-transparent text-[10px] font-mono text-[var(--orion-text-muted)] uppercase">
                  or workspace identity
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-11 rounded-xl liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <span>Continue with Google Workspace</span>
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[var(--orion-text-muted)] font-mono relative z-10">
        <span>ORION-9 SECURE CONSOLE &bull; SOC 2 TYPE II ENFORCED</span>
      </footer>
    </div>
  );
}
