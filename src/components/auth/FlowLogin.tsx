import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Check,
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  X,
} from 'lucide-react';
import { validateLoginIdentifier } from '../../utils/auth-validation';
import { useAuth } from '../../context/AuthContext';
import { useOptionalSiteConfig } from '../../context/SiteConfigContext';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const GoogleIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z"
    />
    <path
      fill="#34A853"
      d="M12 21.75c2.63 0 4.84-.87 6.46-2.36l-3.14-2.45c-.87.58-1.98.93-3.32.93-2.55 0-4.7-1.72-5.47-4.03H3.28v2.53A9.75 9.75 0 0 0 12 21.75Z"
    />
    <path
      fill="#FBBC05"
      d="M6.53 13.84A5.86 5.86 0 0 1 6.22 12c0-.64.11-1.26.31-1.84V7.63H3.28A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.03 4.37l3.25-2.53Z"
    />
    <path
      fill="#EA4335"
      d="M12 6.13c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.2 14.62 2.25 12 2.25a9.75 9.75 0 0 0-8.72 5.38l3.25 2.53C7.3 7.85 9.45 6.13 12 6.13Z"
    />
  </svg>
);

export interface FlowLoginSubmitPayload {
  identifier: string;
  email?: string;
  password: string;
  remember: boolean;
}

export interface FlowLoginProps {
  title?: string;
  subtitle?: string;
  trigger?: 'click' | 'hover';
  defaultExpanded?: boolean;
  showSocial?: boolean;
  showRemember?: boolean;
  showForgot?: boolean;
  compactText?: string;
  primaryText?: string;
  onSubmit?: (payload: FlowLoginSubmitPayload) => Promise<{ success: boolean; error?: string } | void>;
  onForgotPassword?: (identifier: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  onGoogleSignIn?: () => Promise<{ success: boolean; error?: string }>;
  onNavigateSignup?: () => void;
}

export const FlowLogin: React.FC<FlowLoginProps> = ({
  title = 'Orion-9',
  subtitle = 'Sign in to your supply chain command workspace.',
  trigger = 'click',
  defaultExpanded = true,
  showSocial = true,
  showRemember = true,
  showForgot = true,
  compactText = 'Log in to Orion-9',
  primaryText = 'Sign in to Orion-9',
  onSubmit,
  onForgotPassword,
  onGoogleSignIn,
  onNavigateSignup,
}) => {
  const { rememberedUsername, clearRememberedUsername } = useAuth();
  const siteConfig = useOptionalSiteConfig();

  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
  const [forgotMode, setForgotMode] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(true);
  const [identifier, setIdentifier] = useState<string>(() => rememberedUsername || '');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync with remembered username if it updates
  useEffect(() => {
    if (rememberedUsername && !identifier) {
      setIdentifier(rememberedUsername);
    }
  }, [rememberedUsername, identifier]);

  const toggle = () => {
    if (!loading) setExpanded((value) => !value);
  };

  const handleCardClick = () => {
    if (trigger === 'click' && !expanded) toggle();
  };

  const handleClearRemembered = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRememberedUsername();
    setIdentifier('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const check = validateLoginIdentifier(identifier);
    if (!check.isValid) {
      setErrorMessage(check.error || 'Please enter a valid username or email address.');
      return;
    }

    if (forgotMode) {
      if (!onForgotPassword) {
        setErrorMessage('Password recovery is currently disabled.');
        return;
      }
      setLoading(true);
      try {
        const res = await onForgotPassword(identifier.trim());
        if (res.success) {
          setSuccessMessage(
            res.message ||
              'If an account matches that username or email address, password recovery instructions have been sent.'
          );
        } else {
          setErrorMessage(res.error || 'Could not dispatch password reset instructions.');
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Password reset failed.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      if (onSubmit) {
        const res = await onSubmit({
          identifier: identifier.trim(),
          email: identifier.trim(),
          password,
          remember,
        });
        if (res && !res.success) {
          setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
        } else if (res && res.success) {
          setSuccessMessage('Authenticated. Connecting to Orion-9 workspace...');
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    if (loading || !onGoogleSignIn) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const res = await onGoogleSignIn();
      if (!res.success) {
        setErrorMessage(res.error || 'Google sign-in could not be completed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldVariant = {
    hidden: { opacity: 0, y: 12, filter: 'blur(5px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.42, ease },
    },
  };

  const fadeVariant = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease },
    },
  };

  return (
    <div
      className="relative flex w-full items-center justify-center px-4 py-8 font-sans"
      onMouseEnter={() => trigger === 'hover' && !loading && setExpanded(true)}
      onMouseLeave={() => trigger === 'hover' && !loading && setExpanded(false)}
    >
      {/* Subtle Ice-Blue Ambient Aura */}
      <motion.div
        animate={{
          opacity: expanded ? 0.9 : 0.65,
          scale: expanded ? 1.05 : 1,
        }}
        transition={{ duration: 0.8, ease }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A8C2D2]/30 blur-[110px]"
      />

      <div className="relative flex w-full max-w-[430px] flex-col items-center">
        {/* Floating Brand Orb */}
        {siteConfig?.activeConfig?.branding?.showOrb !== false && (
          <motion.div
            animate={{
              y: expanded ? -16 : 0,
              scale: expanded ? 1.04 : 1,
            }}
            transition={{ duration: 0.75, ease }}
            className="absolute -top-[48px] z-30"
          >
            <div className="relative h-[46px] w-[46px]">
              {(siteConfig?.activeConfig?.branding?.customOrbUrl || siteConfig?.activeConfig?.branding?.logoUrl) ? (
                <div className="absolute inset-[2px] rounded-full bg-white p-1 border border-[#D5E1E8] shadow-[0_10px_28px_rgba(41,77,107,0.38),0_0_40px_rgba(168,194,210,0.35)] flex items-center justify-center overflow-hidden">
                  <img
                    src={siteConfig.activeConfig.branding.customOrbUrl || siteConfig.activeConfig.branding.logoUrl}
                    alt={siteConfig.activeConfig.branding.companyName || 'Brand'}
                    className="w-full h-full object-contain rounded-full"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <>
                  <div className="absolute inset-[2px] rounded-full bg-[radial-gradient(circle_at_30%_24%,#FFFFFF_0%,#D5E8F2_22%,#5682A3_56%,#294D6B_82%,#101820_100%)] shadow-[0_10px_28px_rgba(41,77,107,0.38),0_0_40px_rgba(168,194,210,0.35)]" />
                  <div className="absolute left-[10px] top-[7px] h-[9px] w-[13px] rotate-[-20deg] rounded-full bg-white/85 blur-[1.5px]" />
                </>
              )}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-[3px] rounded-full border border-[#294D6B]/25"
              />
            </div>
          </motion.div>
        )}

        {/* Minimalist Card */}
        <motion.div
          initial={false}
          animate={{
            borderRadius: expanded ? 28 : 22,
          }}
          transition={{ duration: 0.65, ease }}
          className="relative w-full overflow-hidden border border-[#D5E1E8] bg-white/95 shadow-[0_28px_80px_rgba(16,24,32,0.12),0_2px_12px_rgba(41,77,107,0.06)] backdrop-blur-2xl"
        >
          {/* Top Atmospheric Highlight */}
          <motion.div
            animate={{
              opacity: expanded ? 1 : 0.7,
              height: expanded ? 140 : 95,
            }}
            transition={{ duration: 0.7, ease }}
            className="pointer-events-none absolute inset-x-0 top-0 bg-[radial-gradient(ellipse_at_center_top,rgba(168,194,210,0.38),transparent_70%)]"
          />

          {/* Minimize button */}
          {expanded && (
            <button
              type="button"
              onClick={toggle}
              className="absolute right-4 top-4 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-[#D5E1E8] bg-[#F5F9FB] text-[#566575] transition hover:border-[#294D6B]/40 hover:text-[#111827] cursor-pointer"
              title="Minimize card"
              aria-label="Minimize authentication card"
            >
              <ChevronUp size={14} />
            </button>
          )}

          <div className="relative z-10 px-7 pt-8 pb-7">
            {/* Header */}
            <motion.div
              animate={{ y: expanded ? 0 : 2 }}
              transition={{ duration: 0.5, ease }}
              className="text-center"
            >
              <div className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#D5E1E8] bg-[#F5F9FB] px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest text-[#294D6B]">
                <ShieldCheck size={12} />
                <span>{(siteConfig?.activeConfig?.branding?.companyName || 'ORION-9').toUpperCase()} IDENTITY GATEWAY</span>
              </div>
              <h2 className="text-[26px] font-bold tracking-[-0.03em] text-[#111827]">
                {forgotMode ? 'Recover Account' : (title === 'Orion-9' ? (siteConfig?.activeConfig?.branding?.companyName || title) : title)}
              </h2>
              <p className="mt-1 text-[13px] font-medium text-[#566575]">
                {forgotMode
                  ? 'Enter your username or email address to receive password reset instructions.'
                  : subtitle}
              </p>
            </motion.div>

            {/* Compact Trigger Button */}
            {!expanded && (
              <div className="mt-6 flex justify-center pb-2">
                <button
                  type="button"
                  onClick={handleCardClick}
                  className="flex h-[42px] items-center gap-2 rounded-full bg-[#101820] px-6 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(16,24,32,0.18)] transition hover:bg-[#294D6B] cursor-pointer"
                >
                  <span>{compactText === 'Log in to Orion-9' ? `Log in to ${siteConfig?.activeConfig?.branding?.companyName || 'Orion-9'}` : compactText}</span>
                  <ChevronDown size={14} strokeWidth={2.2} />
                </button>
              </div>
            )}

            {/* Expanded Form */}
            {expanded && (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, ease }}
                className="mt-6 space-y-4"
                noValidate
              >
                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50/90 p-3.5 text-[12px] font-medium text-red-800"
                  >
                    <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div
                    role="status"
                    className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-[12px] font-medium text-emerald-900"
                  >
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                    <span className="leading-relaxed">{successMessage}</span>
                  </div>
                )}

                {/* Username or Email Field */}
                <motion.div variants={fieldVariant} initial="hidden" animate="show">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="flow-login-identifier"
                      className="block text-[11px] font-semibold uppercase tracking-wider text-[#566575]"
                    >
                      Username or Work Email
                    </label>

                    {rememberedUsername && identifier === rememberedUsername && (
                      <button
                        type="button"
                        onClick={handleClearRemembered}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#294D6B] hover:text-[#111827] transition-colors cursor-pointer"
                        title="Forget this username on this device"
                      >
                        <X size={11} />
                        <span>Forget username</span>
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#566575]"
                    />
                    <input
                      id="flow-login-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. alex_hunter or alex@company.com"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      autoComplete="username"
                      disabled={loading}
                      className="h-[46px] w-full rounded-[13px] border border-[#D5E1E8] bg-[#F5F9FB] pl-10 pr-3.5 text-[13px] font-medium text-[#111827] outline-none transition placeholder:text-[#566575]/60 focus:border-[#294D6B] focus:bg-white focus:ring-2 focus:ring-[#294D6B]/12 disabled:opacity-60"
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                {!forgotMode && (
                  <motion.div
                    variants={fieldVariant}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.05 }}
                  >
                    <label
                      htmlFor="flow-login-password"
                      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#566575]"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#566575]"
                      />
                      <input
                        id="flow-login-password"
                        type={passwordVisible ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={loading}
                        className="h-[46px] w-full rounded-[13px] border border-[#D5E1E8] bg-[#F5F9FB] pl-10 pr-10 text-[13px] font-medium text-[#111827] outline-none transition placeholder:text-[#566575]/60 focus:border-[#294D6B] focus:bg-white focus:ring-2 focus:ring-[#294D6B]/12 disabled:opacity-60"
                      />

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setPasswordVisible((value) => !value)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#566575] transition hover:text-[#111827] disabled:opacity-40 cursor-pointer"
                        aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                      >
                        {passwordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Remember & Forgot Row */}
                {!forgotMode && (showRemember || showForgot) && (
                  <motion.div
                    variants={fieldVariant}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between px-0.5 pt-0.5"
                  >
                    {showRemember ? (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setRemember((value) => !value)}
                        className="flex items-center gap-2 text-[12px] font-medium text-[#566575] transition hover:text-[#111827] disabled:opacity-40 cursor-pointer"
                      >
                        <span
                          className={`flex h-[16px] w-[16px] items-center justify-center rounded-[5px] border transition ${
                            remember
                              ? 'border-[#294D6B] bg-[#294D6B] text-white'
                              : 'border-[#D5E1E8] bg-[#F5F9FB]'
                          }`}
                        >
                          {remember && <Check size={10} strokeWidth={2.8} />}
                        </span>
                        Remember username on this device
                      </button>
                    ) : (
                      <span />
                    )}

                    {showForgot && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setErrorMessage(null);
                          setSuccessMessage(null);
                          setForgotMode(true);
                        }}
                        className="text-[12px] font-semibold text-[#294D6B] transition hover:underline disabled:opacity-40 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  variants={fadeVariant}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.15 }}
                  type="submit"
                  disabled={loading}
                  className="flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#101820] text-[13px] font-semibold text-white shadow-[0_10px_25px_rgba(16,24,32,0.18)] transition duration-200 hover:bg-[#294D6B] disabled:cursor-wait disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>{forgotMode ? 'Checking account...' : 'Signing in...'}</span>
                    </>
                  ) : forgotMode ? (
                    'Send Password Reset Instructions'
                  ) : (
                    primaryText
                  )}
                </motion.button>

                {forgotMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(false);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="flex w-full items-center justify-center gap-1.5 pt-1 text-[12px] font-semibold text-[#566575] hover:text-[#111827] cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to Sign In</span>
                  </button>
                )}

                {/* Social Sign-In */}
                {!forgotMode && showSocial && (
                  <>
                    <div className="flex items-center gap-3 py-1">
                      <span className="h-px flex-1 bg-[#D5E1E8]" />
                      <span className="text-[11px] font-medium text-[#566575]">
                        or continue with
                      </span>
                      <span className="h-px flex-1 bg-[#D5E1E8]" />
                    </div>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleGoogleClick}
                      className="flex h-[42px] w-full items-center justify-center gap-2.5 rounded-full border border-[#D5E1E8] bg-[#F5F9FB] text-[12px] font-semibold text-[#111827] transition hover:border-[#294D6B]/40 hover:bg-white disabled:opacity-50 cursor-pointer"
                    >
                      <GoogleIcon size={15} />
                      <span>Continue with Google Workspace</span>
                    </button>
                  </>
                )}

                {/* Footer Switch to Signup */}
                {!forgotMode && (
                  <p className="pt-2 text-center text-[12px] font-medium text-[#566575]">
                    New to Orion-9?{' '}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={onNavigateSignup}
                      className="font-semibold text-[#294D6B] transition hover:underline disabled:opacity-40 cursor-pointer"
                    >
                      Create account
                    </button>
                  </p>
                )}
              </motion.form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FlowLogin;
