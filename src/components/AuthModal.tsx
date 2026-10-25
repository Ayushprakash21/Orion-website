import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword, validateSignUp } from '../utils/auth-validation';
import { X, Lock, Mail, User, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    login,
    signup,
    resetPassword,
    isFirebaseConfigured,
    launchPending,
    destinationUrl,
    simulateAuthForPreview,
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!authModalOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});
  };

  const handleClose = () => {
    resetForm();
    closeAuthModal();
  };

  const switchMode = (mode: 'login' | 'signup' | 'forgot') => {
    resetForm();
    openAuthModal(mode);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setFieldErrors({ email: emailCheck.error! });
      return;
    }
    if (!password) {
      setFieldErrors({ password: 'Password is required.' });
      return;
    }

    setLoading(true);

    if (isFirebaseConfigured) {
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to sign in.');
      }
    } else {
      // Firebase is not configured in this preview container
      setLoading(false);
      setErrorMsg(
        'Firebase Authentication is pending setup in this AI Studio container. You can preview authenticated features or launch the live Orion-9 deployment directly.'
      );
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const validation = validateSignUp(name, email, password, confirmPassword);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setLoading(true);

    if (isFirebaseConfigured) {
      const res = await signup(name, email, password);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to register account.');
      }
    } else {
      setLoading(false);
      setErrorMsg(
        'Firebase Authentication is pending setup in this AI Studio container. You can preview authenticated features or launch the live Orion-9 deployment directly.'
      );
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setFieldErrors({ email: emailCheck.error! });
      return;
    }

    setLoading(true);
    if (isFirebaseConfigured) {
      const res = await resetPassword(email);
      setLoading(false);
      if (res.success) {
        setSuccessMsg(`Password recovery instructions have been sent to ${email}.`);
      } else {
        setErrorMsg(res.error || 'Could not send recovery email.');
      }
    } else {
      setLoading(false);
      setErrorMsg('Firebase Authentication is not configured for password reset in this sandbox.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md bg-[#151e30] border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] transition-colors"
          aria-label="Close authentication dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#f5f5f5] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>ORION-9 SECURE AUTHENTICATION</span>
          </div>
          <h3 id="auth-modal-title" className="text-2xl font-bold text-white tracking-tight">
            {authModalMode === 'login' && 'Log In to Orion-9'}
            {authModalMode === 'signup' && 'Create Enterprise Account'}
            {authModalMode === 'forgot' && 'Reset Password'}
          </h3>
          <p className="text-xs text-white/60">
            {launchPending
              ? 'Sign in or register to launch the live Orion-9 Control Tower.'
              : 'Enter your credentials to access supply chain operations.'}
          </p>
        </div>

        {/* Firebase Environment Status Indicator */}
        {!isFirebaseConfigured && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#0f1626] border border-amber-400/30 text-xs text-amber-200/90 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-neutral-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Firebase Environment Status:</span>
                <p className="text-amber-200/80 mt-0.5 leading-relaxed">
                  Firebase configuration variables are not set in this preview container. Real authentication is deployed at the live application destination.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-amber-400/20 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => simulateAuthForPreview(name || 'Operations Lead', email || 'operator@orion9.io')}
                className="text-[#f5f5f5] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Preview Authenticated State</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <a
                href={destinationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#f5f5f5] hover:underline flex items-center gap-1"
              >
                <span>Open Live Orion-9</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Global Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Global Success message */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* ===================== LOG IN FORM ===================== */}
        {authModalMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@enterprise.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0f1626] border text-sm text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] transition-colors ${
                    fieldErrors.email ? 'border-red-400' : 'border-white/15'
                  }`}
                />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-400 font-mono">{fieldErrors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-xs font-mono uppercase tracking-wider text-white/70">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs text-[#f5f5f5] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#0f1626] border text-sm text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] transition-colors ${
                    fieldErrors.password ? 'border-red-400' : 'border-white/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/40 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-400 font-mono">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#f5f5f5] text-[#0f1626] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#f5f5f5]/20 hover:bg-[#e5e5e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all disabled:opacity-60 disabled:pointer-events-none mt-2"
            >
              {loading ? 'Authenticating...' : 'Log In to System'}
            </button>

            <div className="text-center pt-2 text-xs text-white/60">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="text-[#f5f5f5] font-medium hover:underline"
              >
                Sign Up for Orion-9
              </button>
            </div>
          </form>
        )}

        {/* ===================== SIGN UP FORM ===================== */}
        {authModalMode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="signup-name" className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Elena Rostova"
                  autoComplete="name"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0f1626] border text-sm text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] transition-colors ${
                    fieldErrors.name ? 'border-red-400' : 'border-white/15'
                  }`}
                />
              </div>
              {fieldErrors.name && <p className="mt-1 text-xs text-red-400 font-mono">{fieldErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@enterprise.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0f1626] border text-sm text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] transition-colors ${
                    fieldErrors.email ? 'border-red-400' : 'border-white/15'
                  }`}
                />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-400 font-mono">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                Password (min 8 chars, numbers & symbols)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#0f1626] border text-sm text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] transition-colors ${
                    fieldErrors.password ? 'border-red-400' : 'border-white/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/40 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-400 font-mono">{fieldErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="signup-confirm-password" className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#0f1626] border text-sm text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] transition-colors ${
                    fieldErrors.confirmPassword ? 'border-red-400' : 'border-white/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-white/40 hover:text-white"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400 font-mono">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#f5f5f5] text-[#0f1626] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#f5f5f5]/20 hover:bg-[#e5e5e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all disabled:opacity-60 disabled:pointer-events-none mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Sign Up'}
            </button>

            <div className="text-center pt-2 text-xs text-white/60">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-[#f5f5f5] font-medium hover:underline"
              >
                Log In
              </button>
            </div>
          </form>
        )}

        {/* ===================== FORGOT PASSWORD FORM ===================== */}
        {authModalMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="forgot-email" className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@enterprise.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0f1626] border text-sm text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5f5f5] transition-colors ${
                    fieldErrors.email ? 'border-red-400' : 'border-white/15'
                  }`}
                />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-400 font-mono">{fieldErrors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#f5f5f5] text-[#0f1626] font-bold text-xs uppercase tracking-wider hover:bg-[#f5f5f5] transition-all disabled:opacity-60 mt-2"
            >
              {loading ? 'Sending Request...' : 'Send Recovery Link'}
            </button>

            <div className="text-center pt-2 text-xs text-white/60">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-[#f5f5f5] font-medium hover:underline"
              >
                Return to Log In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
