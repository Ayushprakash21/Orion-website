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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getActiveFirebaseConfig } from '../../services/firebase';

interface AdminLoginProps {
  onNavigate: (path: string) => void;
}

export function AdminLogin({ onNavigate }: AdminLoginProps) {
  const {
    user,
    isAuthenticated,
    isAdmin,
    adminAuthSource,
    isFirebaseConfigured,
    login,
    loginWithGoogle,
    logout,
    refreshAdminStatus,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  const currentConfig = getActiveFirebaseConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter both your administrator email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password, true);
    if (!res.success) {
      setError(res.error || 'Authentication failed.');
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
      setError(res.error || 'Google authentication failed.');
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
    <div className="min-h-screen bg-[#EAF4F8] text-[#111827] flex flex-col justify-between p-6 md:p-10">
      {/* Top Bar */}
      <header className="max-w-[1280px] w-full mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 border border-[#D5E1E8] text-xs font-medium text-[#111827] hover:border-[#294D6B] transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#294D6B]" />
          Return to Orion-9 Public Site
        </button>

        <div className="flex items-center gap-3 text-xs font-mono text-[#566575]">
          <span>ORION-9 GOVERNANCE GATEWAY</span>
          <span aria-hidden="true">·</span>
          <span className={isFirebaseConfigured ? 'text-emerald-700' : 'text-amber-700'}>
            {isFirebaseConfigured ? 'FIREBASE AUTH ONLINE' : 'FIREBASE ENV UNCONFIGURED'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg w-full mx-auto my-12">
        <div className="bg-white rounded-[28px] border border-[#D5E1E8] shadow-[0_24px_60px_rgba(16,24,32,0.08)] p-8 md:p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#101820] text-white flex items-center justify-center shadow-sm">
                <Lock className="w-5 h-5 text-[#A8C2D2]" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#566575]">
                  RESTRICTED CONSOLE
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-[#111827]">
                  Orion-9 Admin Portal
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowConfigDrawer((prev) => !prev)}
              aria-label="Configure Firebase Runtime Keys"
              className="p-2.5 rounded-xl border border-[#D5E1E8] text-[#566575] hover:text-[#111827] hover:bg-[#F5F9FB] transition-colors"
              title="Firebase Connection Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* State 1: Signed in AND verified admin */}
          {isAuthenticated && isAdmin && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950">
                <div className="flex items-center gap-2.5 font-semibold text-sm mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Administrator Session Verified
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Authenticated as <span className="font-mono font-medium">{user?.email}</span> via{' '}
                  <span className="font-mono">{adminAuthSource}</span>. Full CMS &amp; security
                  governance controls are unlocked.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/admin')}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#101820] text-white text-sm font-medium hover:bg-[#294D6B] transition-colors"
                >
                  Open Admin Console
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-[#D5E1E8] text-xs font-medium text-[#566575] hover:text-[#111827] hover:bg-[#F5F9FB] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* State 2: Signed in, but NOT an admin (403 Access Denied) */}
          {isAuthenticated && !isAdmin && (
            <div className="space-y-6" data-testid="admin-access-denied">
              <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-950">
                <div className="flex items-center gap-2.5 font-semibold text-sm mb-2">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                  403 Access Denied — Administrator Privileges Required
                </div>
                <p className="text-xs text-red-800 leading-relaxed mb-3">
                  Your account (<span className="font-mono font-semibold">{user?.email}</span>) is
                  authenticated, but does not hold administrator authorization for Orion-9 CMS
                  governance.
                </p>
                <div className="p-3 rounded-xl bg-white/80 border border-red-200/80 text-[11px] font-mono text-red-900 space-y-1">
                  <div>UID: {user?.uid}</div>
                  <div>EMAIL VERIFIED: {String(Boolean(user?.emailVerified))}</div>
                  <div>REQUIRED: Custom claim admin=true OR /admins/&#123;uid&#125; role=&quot;admin&quot;</div>
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
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#101820] text-white text-xs font-medium hover:bg-[#294D6B] transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Re-Verify Admin Role
                </button>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#D5E1E8] text-xs font-medium text-[#111827] hover:bg-[#F5F9FB] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Switch Account
                </button>
              </div>
            </div>
          )}

          {/* State 3: Not signed in — Admin Login Form */}
          {!isAuthenticated && (
            <>
              <p className="text-sm text-[#566575] leading-relaxed mb-6">
                Sign in with an authorized Orion-9 administrator account. Administrative writes are
                enforced by Firebase Authentication and Firestore RBAC security rules.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 leading-relaxed"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="admin-email"
                    className="block text-xs font-medium text-[#111827] mb-1.5"
                  >
                    Administrator Email
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@orion9.io"
                    className="w-full px-4 py-3 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm text-[#111827] placeholder-[#8A99A8] focus:outline-none focus:border-[#294D6B] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-medium text-[#111827] mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter administrator password"
                    className="w-full px-4 py-3 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-sm text-[#111827] placeholder-[#8A99A8] focus:outline-none focus:border-[#294D6B] focus:bg-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#101820] text-white text-sm font-medium hover:bg-[#294D6B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-[#A8C2D2]" />
                  {loading ? 'Verifying Credentials...' : 'Authenticate Administrator'}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#D5E1E8]" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#566575]">
                  OR FEDERATED SSO
                </span>
                <div className="h-px flex-1 bg-[#D5E1E8]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-white border border-[#D5E1E8] text-xs font-medium text-[#111827] hover:bg-[#F5F9FB] hover:border-[#294D6B] transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
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
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                Sign in with Google Workspace Admin
              </button>
            </>
          )}

          {/* Firebase Project Connection Telemetry */}
          {showConfigDrawer && (
            <div className="mt-6 pt-6 border-t border-[#D5E1E8]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#294D6B] font-semibold">
                  Firebase Project Connection
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ACTIVE
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F5F9FB] border border-[#D5E1E8] text-[11px] font-mono text-[#111827] space-y-1.5">
                <div className="flex justify-between gap-2">
                  <span className="text-[#566575]">PROJECT ID:</span>
                  <span className="font-semibold">{currentConfig.projectId}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#566575]">AUTH DOMAIN:</span>
                  <span>{currentConfig.authDomain}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#566575]">STORAGE BUCKET:</span>
                  <span>{currentConfig.storageBucket}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#566575]">APP ID:</span>
                  <span className="truncate max-w-[220px]">{currentConfig.appId}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[1280px] w-full mx-auto text-center text-xs text-[#566575]">
        Orion-9 Security Architecture · Role-Based Access Control enforced via Firestore Rules
      </footer>
    </div>
  );
}
