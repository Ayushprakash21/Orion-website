import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { validateSignUp, validateUsername } from '../../utils/auth-validation';
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

export interface FlowSignupSubmitPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export interface FlowSignupProps {
  title?: string;
  subtitle?: string;
  trigger?: 'click' | 'hover';
  defaultExpanded?: boolean;
  showSocial?: boolean;
  showTerms?: boolean;
  compactText?: string;
  primaryText?: string;
  onSubmit?: (
    payload: FlowSignupSubmitPayload
  ) => Promise<{ success: boolean; error?: string; verificationSent?: boolean } | void>;
  onGoogleSignIn?: () => Promise<{ success: boolean; error?: string }>;
  onNavigateLogin?: () => void;
}

export const FlowSignup: React.FC<FlowSignupProps> = ({
  title = 'Orion-9',
  subtitle = 'Create your account credentials and get started.',
  trigger = 'click',
  defaultExpanded = true,
  showSocial = true,
  showTerms = true,
  compactText = 'Create account',
  primaryText = 'Create Orion-9 Account',
  onSubmit,
  onGoogleSignIn,
  onNavigateLogin,
}) => {
  const { checkUsernameAvailability } = useAuth();
  const siteConfig = useOptionalSiteConfig();

  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const [terms, setTerms] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [usernameChecking, setUsernameChecking] = useState<boolean>(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    tested: boolean;
    valid: boolean;
    message?: string;
  }>({ tested: false, valid: false });

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggle = () => {
    if (!loading) setExpanded((value) => !value);
  };

  const handleCardClick = () => {
    if (trigger === 'click' && !expanded) toggle();
  };

  const handleUsernameBlur = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameStatus({ tested: false, valid: false });
      return;
    }

    const val = validateUsername(trimmed);
    if (!val.isValid) {
      setUsernameStatus({ tested: true, valid: false, message: val.error });
      return;
    }

    setUsernameChecking(true);
    try {
      const res = await checkUsernameAvailability(trimmed);
      if (res.available) {
        setUsernameStatus({
          tested: true,
          valid: true,
          message: 'Username is available.',
        });
      } else {
        setUsernameStatus({
          tested: true,
          valid: false,
          message: res.error || 'Username is unavailable.',
        });
      }
    } catch {
      setUsernameStatus({ tested: true, valid: true });
    } finally {
      setUsernameChecking(false);
    }
  };

  const passwordStrength =
    password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const validation = validateSignUp(
      name,
      username,
      email,
      password,
      confirmPassword,
      terms
    );

    if (!validation.isValid) {
      const firstErr = Object.values(validation.errors)[0];
      setErrorMessage(firstErr || 'Please verify all registration fields.');
      return;
    }

    if (showTerms && !terms) {
      setErrorMessage('Please accept the Orion-9 Enterprise Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      if (onSubmit) {
        const res = await onSubmit({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          confirmPassword,
          terms,
        });
        if (res && !res.success) {
          setErrorMessage(res.error || 'Could not create account.');
        } else if (res && res.success) {
          setSuccessMessage(
            res.verificationSent
              ? 'Account created! A verification email has been dispatched to your inbox.'
              : 'Account created and authenticated.'
          );
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Signup failed.');
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
        setErrorMessage(res.error || 'Google registration could not be completed.');
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
      {/* Background Glow */}
      <motion.div
        animate={{
          opacity: expanded ? 0.9 : 0.65,
          scale: expanded ? 1.05 : 1,
        }}
        transition={{ duration: 0.8, ease }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A8C2D2]/30 blur-[110px]"
      />

      <div className="relative flex w-full max-w-[440px] flex-col items-center">
        {/* Floating Brand Sphere */}
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

        {/* Frosted Card */}
        <motion.div
          initial={false}
          animate={{
            borderRadius: expanded ? 28 : 22,
          }}
          transition={{ duration: 0.65, ease }}
          className="relative w-full overflow-hidden border border-[#D5E1E8] bg-white/95 shadow-[0_28px_80px_rgba(16,24,32,0.12),0_2px_12px_rgba(41,77,107,0.06)] backdrop-blur-2xl"
        >
          <motion.div
            animate={{
              opacity: expanded ? 1 : 0.7,
              height: expanded ? 140 : 95,
            }}
            transition={{ duration: 0.7, ease }}
            className="pointer-events-none absolute inset-x-0 top-0 bg-[radial-gradient(ellipse_at_center_top,rgba(168,194,210,0.38),transparent_70%)]"
          />

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
            <motion.div
              animate={{ y: expanded ? 0 : 2 }}
              transition={{ duration: 0.5, ease }}
              className="text-center"
            >
              <div className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#D5E1E8] bg-[#F5F9FB] px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest text-[#294D6B]">
                <ShieldCheck size={12} />
                <span>{(siteConfig?.activeConfig?.branding?.companyName || 'ORION-9').toUpperCase()} REGISTRATION</span>
              </div>
              <h2 className="text-[26px] font-bold tracking-[-0.03em] text-[#111827]">
                {title === 'Orion-9' ? (siteConfig?.activeConfig?.branding?.companyName || title) : title}
              </h2>
              <p className="mt-1 text-[13px] font-medium text-[#566575]">
                {subtitle}
              </p>
            </motion.div>

            {!expanded && (
              <div className="mt-6 flex justify-center pb-2">
                <button
                  type="button"
                  onClick={handleCardClick}
                  className="flex h-[42px] items-center gap-2 rounded-full bg-[#101820] px-6 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(16,24,32,0.18)] transition hover:bg-[#294D6B] cursor-pointer"
                >
                  <span>{compactText}</span>
                  <ChevronDown size={14} strokeWidth={2.2} />
                </button>
              </div>
            )}

            {expanded && (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, ease }}
                className="mt-6 space-y-3"
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

                {/* Full Name */}
                <motion.div variants={fieldVariant} initial="hidden" animate="show">
                  <label
                    htmlFor="flow-signup-name"
                    className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#566575]"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#566575]"
                    />
                    <input
                      id="flow-signup-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Elena Rostova"
                      autoComplete="name"
                      disabled={loading}
                      className="h-[44px] w-full rounded-[13px] border border-[#D5E1E8] bg-[#F5F9FB] pl-10 pr-3.5 text-[13px] font-medium text-[#111827] outline-none transition placeholder:text-[#566575]/60 focus:border-[#294D6B] focus:bg-white focus:ring-2 focus:ring-[#294D6B]/12 disabled:opacity-60"
                    />
                  </div>
                </motion.div>

                {/* Unique Username */}
                <motion.div
                  variants={fieldVariant}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.04 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="flow-signup-username"
                      className="block text-[11px] font-semibold uppercase tracking-wider text-[#566575]"
                    >
                      Username
                    </label>
                    <span className="text-[10px] text-[#566575]">a-z, 0-9, _ (3-30 chars)</span>
                  </div>
                  <div className="relative">
                    <AtSign
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#566575]"
                    />
                    <input
                      id="flow-signup-username"
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setUsernameStatus({ tested: false, valid: false });
                      }}
                      onBlur={handleUsernameBlur}
                      placeholder="elena_rostova"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      autoComplete="username"
                      disabled={loading}
                      className={`h-[44px] w-full rounded-[13px] border bg-[#F5F9FB] pl-10 pr-9 text-[13px] font-medium text-[#111827] outline-none transition placeholder:text-[#566575]/60 focus:bg-white focus:ring-2 disabled:opacity-60 ${
                        usernameStatus.tested
                          ? usernameStatus.valid
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/12'
                            : 'border-red-300 focus:border-red-500 focus:ring-red-500/12'
                          : 'border-[#D5E1E8] focus:border-[#294D6B] focus:ring-[#294D6B]/12'
                      }`}
                    />

                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameChecking ? (
                        <Loader2 size={14} className="animate-spin text-[#566575]" />
                      ) : usernameStatus.tested && usernameStatus.valid ? (
                        <CheckCircle2 size={14} className="text-emerald-600" />
                      ) : usernameStatus.tested && !usernameStatus.valid ? (
                        <AlertCircle size={14} className="text-red-500" />
                      ) : null}
                    </div>
                  </div>
                  {usernameStatus.tested && usernameStatus.message && (
                    <p
                      className={`mt-1 text-[11px] font-medium ${
                        usernameStatus.valid ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {usernameStatus.message}
                    </p>
                  )}
                </motion.div>

                {/* Work Email */}
                <motion.div
                  variants={fieldVariant}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.08 }}
                >
                  <label
                    htmlFor="flow-signup-email"
                    className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#566575]"
                  >
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#566575]"
                    />
                    <input
                      id="flow-signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="elena@enterprise.com"
                      autoComplete="email"
                      disabled={loading}
                      className="h-[44px] w-full rounded-[13px] border border-[#D5E1E8] bg-[#F5F9FB] pl-10 pr-3.5 text-[13px] font-medium text-[#111827] outline-none transition placeholder:text-[#566575]/60 focus:border-[#294D6B] focus:bg-white focus:ring-2 focus:ring-[#294D6B]/12 disabled:opacity-60"
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  variants={fieldVariant}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.12 }}
                >
                  <label
                    htmlFor="flow-signup-password"
                    className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#566575]"
                  >
                    Password (min 8 chars with numbers/symbols)
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#566575]"
                    />
                    <input
                      id="flow-signup-password"
                      type={passwordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      disabled={loading}
                      className="h-[44px] w-full rounded-[13px] border border-[#D5E1E8] bg-[#F5F9FB] pl-10 pr-10 text-[13px] font-medium text-[#111827] outline-none transition placeholder:text-[#566575]/60 focus:border-[#294D6B] focus:bg-white focus:ring-2 focus:ring-[#294D6B]/12 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setPasswordVisible((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#566575] hover:text-[#111827] disabled:opacity-40 cursor-pointer"
                      aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                    >
                      {passwordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1.5 px-0.5">
                      <div className="flex flex-1 gap-1">
                        <span
                          className={`h-1 flex-1 rounded-full transition ${
                            passwordStrength >= 1 ? 'bg-amber-400' : 'bg-[#D5E1E8]'
                          }`}
                        />
                        <span
                          className={`h-1 flex-1 rounded-full transition ${
                            passwordStrength >= 2 ? 'bg-emerald-400' : 'bg-[#D5E1E8]'
                          }`}
                        />
                        <span
                          className={`h-1 flex-1 rounded-full transition ${
                            passwordStrength >= 3 ? 'bg-emerald-600' : 'bg-[#D5E1E8]'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-[#566575]">
                        {passwordStrength === 1 && 'Weak'}
                        {passwordStrength === 2 && 'Good'}
                        {passwordStrength === 3 && 'Strong'}
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Confirm Password */}
                <motion.div
                  variants={fieldVariant}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.16 }}
                >
                  <label
                    htmlFor="flow-signup-confirm"
                    className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#566575]"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#566575]"
                    />
                    <input
                      id="flow-signup-confirm"
                      type={confirmVisible ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="h-[44px] w-full rounded-[13px] border border-[#D5E1E8] bg-[#F5F9FB] pl-10 pr-10 text-[13px] font-medium text-[#111827] outline-none transition placeholder:text-[#566575]/60 focus:border-[#294D6B] focus:bg-white focus:ring-2 focus:ring-[#294D6B]/12 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setConfirmVisible((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#566575] hover:text-[#111827] disabled:opacity-40 cursor-pointer"
                      aria-label={confirmVisible ? 'Hide password' : 'Show password'}
                    >
                      {confirmVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </motion.div>

                {/* Terms Acceptance */}
                {showTerms && (
                  <motion.div
                    variants={fieldVariant}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.2 }}
                    className="pt-0.5"
                  >
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setTerms((v) => !v)}
                      className="flex items-start gap-2.5 text-left text-[11.5px] leading-tight text-[#566575] hover:text-[#111827] disabled:opacity-40 cursor-pointer"
                    >
                      <span
                        className={`mt-0.5 flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[5px] border transition ${
                          terms
                            ? 'border-[#294D6B] bg-[#294D6B] text-white'
                            : 'border-[#D5E1E8] bg-[#F5F9FB]'
                        }`}
                      >
                        {terms && <Check size={10} strokeWidth={2.8} />}
                      </span>
                      <span>
                        I agree to the Orion-9 Enterprise Terms of Service and Privacy Policy.
                      </span>
                    </button>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  variants={fadeVariant}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.22 }}
                  type="submit"
                  disabled={loading}
                  className="flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#101820] text-[13px] font-semibold text-white shadow-[0_10px_25px_rgba(16,24,32,0.18)] transition duration-200 hover:bg-[#294D6B] disabled:cursor-wait disabled:opacity-70 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    primaryText
                  )}
                </motion.button>

                {/* Social Sign-In */}
                {showSocial && (
                  <>
                    <div className="flex items-center gap-3 py-1">
                      <span className="h-px flex-1 bg-[#D5E1E8]" />
                      <span className="text-[11px] font-medium text-[#566575]">
                        or register with
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

                <p className="pt-2 text-center text-[12px] font-medium text-[#566575]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={onNavigateLogin}
                    className="font-semibold text-[#294D6B] transition hover:underline disabled:opacity-40 cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              </motion.form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FlowSignup;
