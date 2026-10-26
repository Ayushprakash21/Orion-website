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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [showAuthGuide, setShowAuthGuide] = useState(false);

  const isDev = isLocalDevEnvironment();
  const currentConfig = getActiveFirebaseConfig();

  const handleFillDevCredentials = () => {
    setIdentifier('admin');
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

    const authorized = await refreshAdminStatus();
    setLoading(false);
    if (authorized) {
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
    const authorized = await refreshAdminStatus();
    setLoading(false);
    if (authorized) {
      onNavigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#EAF4F8] text-[#070B19] flex flex-col justify-between p-6 md:p-10 font-sans">
      {/* Top Bar */}
      <header className="max-w-[1280px] w-full mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="inline-flex items-center"
            aria-label="Orion-9 Home"
          >
            <OrionLogo companyName="Orion-9" size="md" tone="dark" />
          </a>

          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-medium text-[#070B19] hover:border-[#070B19] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Return to Public Site</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#475569]">
          <span>RESTRICTED ADMIN GATEWAY</span>
          <span aria-hidden="true">·</span>
          <span className={isFirebaseConfigured ? 'text-emerald-700 font-medium' : 'text-amber-700'}>
            {isFirebaseConfigured ? 'FIREBASE AUTH ONLINE' : 'LOCAL DEV FALLBACK'}
          </span>
          {isDev && (
            <>
              <span aria-hidden="true">·</span>
              <span className="px-2 py-0.5 rounded-md bg-[#294D6B]/15 text-[#294D6B] font-semibold text-[10px]">
                LOCAL DEV MODE
              </span>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg w-full mx-auto my-10">
        <div className="bg-white rounded-3xl border border-[#DCE7F0] shadow-[0_20px_50px_rgba(7,11,25,0.08)] p-8 md:p-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#070B19] text-white flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#0284C7] font-medium">
                  RESTRICTED ADMINISTRATOR CONSOLE
                </div>
                <h1 className="text-2xl font-bold text-[#070B19]">
                  Orion-9 Admin Portal
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAuthGuide((prev) => !prev)}
                aria-label="Administrator Authorization Details"
                className="p-2.5 rounded-xl border border-[#DCE7F0] text-[#475569] hover:text-[#070B19] hover:bg-[#F2F9FD] transition-colors cursor-pointer"
                title="How Administrator Authorization Works"
              >
                <Info className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowConfigDrawer((prev) => !prev)}
                aria-label="Inspect Firebase Project Configuration"
                className="p-2.5 rounded-xl border border-[#DCE7F0] text-[#475569] hover:text-[#070B19] hover:bg-[#F2F9FD] transition-colors cursor-pointer"
                title="Firebase Connection Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Local Dev Credentials Assistance Banner */}
          {isDev && !isAuthenticated && (
            <div className="mb-6 p-4 rounded-2xl bg-[#F5F9FB] border border-[#D5E1E8] text-xs text-[#294D6B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-[#111827]">
                  <Terminal className="w-3.5 h-3.5 text-[#294D6B]" />
                  Local Development Credentials Active
                </span>
                <button
                  type="button"
                  onClick={handleFillDevCredentials}
                  className="px-2.5 py-1 rounded-md bg-[#294D6B] text-white text-[11px] font-semibold hover:bg-[#101820] transition-colors cursor-pointer"
                >
                  Auto-fill (admin / admin)
                </button>
              </div>
              <p className="text-[11.5px] leading-relaxed text-[#566575]">
                Username: <code className="font-mono font-bold text-[#111827]">admin</code> / Password:{' '}
                <code className="font-mono font-bold text-[#111827]">admin</code>. These credentials only work in local development/test and are explicitly rejected in production.
              </p>
            </div>
          )}

          {/* State 1: Signed in AND verified admin */}
          {isAuthenticated && isAdmin && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <div className="flex items-center gap-2.5 font-bold text-sm mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Administrator Session Verified
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Authenticated as <span className="font-mono font-medium">{user?.email}</span> via{' '}
                  <span className="font-mono font-semibold">{adminAuthSource}</span>. Full CMS &amp; security governance controls are unlocked.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/admin')}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#070B19] text-white text-sm font-semibold hover:bg-[#1E293B] transition-colors cursor-pointer"
                >
                  <span>Open Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-[#CBD5E1] text-xs font-medium text-[#475569] hover:text-[#070B19] hover:bg-[#F2F9FD] transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}

          {/* State 2: Signed in, but NOT an admin (403 Access Denied) */}
          {isAuthenticated && !isAdmin && (
            <div className="space-y-6" data-testid="admin-access-denied">
              <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-950">
                <div className="flex items-center gap-2.5 font-bold text-sm mb-2">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                  <span>403 Access Denied — Administrator Privileges Required</span>
                </div>
                <p className="text-xs text-red-800 leading-relaxed mb-3">
                  Your account (<span className="font-mono font-semibold">{user?.email}</span>) is
                  authenticated, but does not have verified Orion-9 administrator privileges.
                </p>
                <div className="p-3.5 rounded-xl bg-white/90 border border-red-200 text-[11px] font-mono text-red-900 space-y-1">
                  <div>UID: {user?.uid}</div>
                  <div>EMAIL VERIFIED: {String(Boolean(user?.emailVerified))}</div>
                  <div>
                    AUTHORIZATION RULE: Firestore /admins/&#123;uid&#125; (role=&quot;admin&quot;,
                    active=true) OR Custom Claim admin=true
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    const ok = await refreshAdminStatus();
                    setLoading(false);
                    if (ok) onNavigate('/admin');
                  }}
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#070B19] text-white text-xs font-semibold hover:bg-[#1E293B] transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Re-Verify Admin Role</span>
                </button>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#CBD5E1] text-xs font-medium text-[#070B19] hover:bg-[#F2F9FD] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch Account</span>
                </button>
              </div>
            </div>
          )}

          {/* State 3: Not signed in — Restricted Admin Login Form */}
          {!isAuthenticated && (
            <>
              <p className="text-sm text-[#475569] leading-relaxed mb-6">
                This portal is strictly restricted to authorized Orion-9 platform administrators. Sign in
                with your administrator username or email address.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-800 leading-relaxed flex items-start gap-2.5"
                >
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="admin-identifier"
                    className="block text-xs font-bold text-[#070B19] mb-1.5"
                  >
                    Administrator Username or Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="admin-identifier"
                      name="identifier"
                      type="text"
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      autoComplete="username"
                      disabled={loading}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="admin or admin@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#070B19] placeholder-[#64748B] focus:outline-none focus:border-[#0284C7] focus:bg-white transition-colors disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-bold text-[#070B19] mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="admin-password"
                      name="password"
                      type={passwordVisible ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#070B19] placeholder-[#64748B] focus:outline-none focus:border-[#0284C7] focus:bg-white transition-colors disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setPasswordVisible((prev) => !prev)}
                      aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#070B19] transition-colors cursor-pointer"
                    >
                      {passwordVisible ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#070B19] text-white text-sm font-semibold hover:bg-[#1E293B] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Verifying Administrator Credentials...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-[#38BDF8]" />
                      <span>Sign in to Admin Console</span>
                    </>
                  )}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#DCE7F0]" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748B]">
                  OR FEDERATED SSO
                </span>
                <div className="h-px flex-1 bg-[#DCE7F0]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-white border border-[#CBD5E1] text-xs font-semibold text-[#070B19] hover:bg-[#F8FAFC] hover:border-[#070B19] transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.29A7.19 7.19 0 0 1 4.9 12c0-.8.14-1.57.38-2.29V6.57H1.29A11.97 11.97 0 0 0 0 12c0 1.92.45 3.74 1.29 5.43l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.57l3.99 3.14C6.23 6.86 8.88 4.75 12 4.75Z"
                  />
                </svg>
                <span>Continue with Google Workspace</span>
              </button>
            </>
          )}

          {/* Collapsible Auth Guide */}
          {showAuthGuide && (
            <div className="mt-6 p-5 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#334155] space-y-3">
              <div className="font-bold text-[#070B19] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
                How Orion-9 Administrator Access Is Authorized
              </div>
              <p className="leading-relaxed">
                Orion-9 never relies on client-side hardcoded credentials in production. To access the
                Administrator Console, an account must satisfy one of three security checks:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed">
                <li>
                  <strong>Bootstrapped Project Owner</strong>: Sign in with{' '}
                  <code className="text-[#0284C7] bg-[#E0F2FE] px-1 py-0.5 rounded">
                    {BOOTSTRAPPED_ADMIN_EMAILS[0]}
                  </code>{' '}
                  (verified email).
                </li>
                <li>
                  <strong>Firestore Administrator ACL</strong>: Have an existing admin create a document
                  in <code className="text-[#0284C7] bg-[#E0F2FE] px-1 py-0.5 rounded">/admins/&#123;uid&#125;</code> with{' '}
                  <code className="text-[#0284C7] bg-[#E0F2FE] px-1 py-0.5 rounded">
                    &#123; role: &quot;admin&quot;, active: true &#125;
                  </code>.
                </li>
                <li>
                  <strong>Firebase Custom Token Claim</strong>: Accounts provisioned via Firebase Admin
                  SDK with claim <code className="text-[#0284C7] bg-[#E0F2FE] px-1 py-0.5 rounded">&#123; admin: true &#125;</code>.
                </li>
                <li>
                  <strong>Local Development Credentials</strong>: Only when running on localhost/test,{' '}
                  <code className="text-[#0284C7] bg-[#E0F2FE] px-1 py-0.5 rounded">admin / admin</code> is permitted for local development speed.
                </li>
              </ol>
            </div>
          )}

          {/* Collapsible Config Drawer */}
          {showConfigDrawer && (
            <div className="mt-6 p-5 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#334155] space-y-2">
              <div className="font-bold text-[#070B19] flex items-center justify-between">
                <span>Active Firebase Client Configuration</span>
                <span className="font-mono text-[10px] text-[#64748B]">Read-Only Runtime Inspector</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] font-mono text-[11px] text-[#1E293B] space-y-1 overflow-x-auto">
                <div>PROJECT ID: {currentConfig.projectId || 'NOT_SET'}</div>
                <div>AUTH DOMAIN: {currentConfig.authDomain || 'NOT_SET'}</div>
                <div>STORAGE BUCKET: {currentConfig.storageBucket || 'NOT_SET'}</div>
                <div>MESSAGING SENDER: {currentConfig.messagingSenderId || 'NOT_SET'}</div>
                <div>APP ID: {currentConfig.appId || 'NOT_SET'}</div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[1280px] w-full mx-auto text-center text-xs text-[#64748B] flex flex-wrap items-center justify-between gap-3">
        <span>Orion-9 Supply Chain Operating System · Administrator Console</span>
        <span className="font-mono text-[11px]">ENCRYPTED TLS 1.3 · STRICT RBAC</span>
      </footer>
    </div>
  );
}

export default AdminLogin;
