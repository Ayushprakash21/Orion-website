/**
 * Core validation, username security, and destination utilities for Orion-9.
 * Handles safe redirection validation, username rules, credentials validation,
 * cross-app boundary checks, and device persistence.
 */

export const DEFAULT_ORION_APP_URL = 'https://orion-9.ayushprakash0021.workers.dev/';

// Whitelist of trusted origins for the Orion-9 operating system
export const TRUSTED_ORION_HOSTS = [
  'orion-9.ayushprakash0021.workers.dev',
  'localhost',
  '127.0.0.1',
];

export const REMEMBERED_USERNAME_STORAGE_KEY = 'orion_remembered_username';

/**
 * Enterprise reserved usernames that regular operators can never claim or register.
 * Prevents system impersonation, administrative spoofing, and routing collisions.
 */
export const RESERVED_USERNAMES = [
  'admin',
  'administrator',
  'root',
  'system',
  'sysadmin',
  'orion',
  'orion9',
  'support',
  'security',
  'operator',
  'superadmin',
  'moderator',
  'mod',
  'dev',
  'developer',
  'demo',
  'guest',
  'test',
  'api',
  'help',
  'billing',
  'null',
  'undefined',
  'void',
  'owner',
  'master',
] as const;

/**
 * Normalizes usernames consistently: trims whitespace and converts to lowercase.
 */
export function normalizeUsername(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw.trim().toLowerCase();
}

/**
 * Validates username syntax, length, character set, and reserved word collision.
 * Requirements:
 * - 3 to 30 characters
 * - Letters (a-z, A-Z), numbers (0-9), and underscores (_) only
 * - Case-insensitive reserved username protection
 */
export function validateUsername(username: string): {
  isValid: boolean;
  error?: string;
  normalized: string;
} {
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Username is required.', normalized: '' };
  }

  const trimmed = username.trim();
  const normalized = normalizeUsername(trimmed);

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: 'Username must be at least 3 characters long.',
      normalized,
    };
  }

  if (trimmed.length > 30) {
    return {
      isValid: false,
      error: 'Username cannot exceed 30 characters.',
      normalized,
    };
  }

  // Only letters, digits, and underscores allowed
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, and underscores.',
      normalized,
    };
  }

  // Check reserved usernames (case-insensitive)
  if ((RESERVED_USERNAMES as readonly string[]).includes(normalized)) {
    return {
      isValid: false,
      error: `The username "${trimmed}" is reserved and unavailable. Please choose another username.`,
      normalized,
    };
  }

  return { isValid: true, normalized };
}

export const HARDCODED_ADMIN_IDENTIFIERS = [
  'admin@orion',
  'admin@orion',
  'admin@orion.com',
  'admin@orion.com',
] as const;

export function isHardcodedAdminIdentifier(raw: string): boolean {
  if (!raw) return false;
  const norm = raw.trim().toLowerCase();
  return (HARDCODED_ADMIN_IDENTIFIERS as readonly string[]).includes(norm);
}

/**
 * Validates whether a login identifier is an email or a valid username format.
 */
export function validateLoginIdentifier(identifier: string): {
  isValid: boolean;
  isEmail: boolean;
  normalized: string;
  error?: string;
} {
  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    return {
      isValid: false,
      isEmail: false,
      normalized: '',
      error: 'Please enter your username or email address.',
    };
  }

  const trimmed = identifier.trim();
  const lower = trimmed.toLowerCase();

  // Accept hard-fixed administrator ID (e.g., admin@orion)
  if (isHardcodedAdminIdentifier(lower)) {
    return {
      isValid: true,
      isEmail: true,
      normalized: lower,
    };
  }

  if (trimmed.includes('@')) {
    const emailCheck = validateEmail(trimmed);
    return {
      isValid: emailCheck.isValid,
      isEmail: true,
      normalized: trimmed.toLowerCase(),
      error: emailCheck.error,
    };
  }

  const usernameCheck = validateUsername(trimmed);
  // For login, even reserved usernames (like admin) are syntactically valid inputs,
  // but invalid characters or length are still rejected.
  const normalized = normalizeUsername(trimmed);
  const syntaxValid = /^[a-zA-Z0-9_]{3,30}$/.test(trimmed);

  if (!syntaxValid) {
    return {
      isValid: false,
      isEmail: false,
      normalized,
      error: usernameCheck.error || 'Username must be 3-30 characters using letters, numbers, or underscores.',
    };
  }

  return {
    isValid: true,
    isEmail: false,
    normalized,
  };
}

/**
 * Validates destination URLs against Orion-9 origin whitelist.
 */
export function isValidDestinationUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;

  const trimmed = rawUrl.trim();
  if (trimmed.toLowerCase().startsWith('javascript:') || trimmed.toLowerCase().startsWith('data:')) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    const isWhitelisted = TRUSTED_ORION_HOSTS.some((trusted) => {
      return hostname === trusted || hostname.endsWith(`.${trusted}`);
    });

    return isWhitelisted;
  } catch {
    return false;
  }
}

/**
 * Resolves safe launch URL with fallback.
 */
export function resolveLaunchUrl(customUrl?: string): {
  url: string;
  isTrusted: boolean;
  reason?: string;
} {
  const candidate =
    customUrl?.trim() ||
    (typeof process !== 'undefined' && process.env?.VITE_ORION_APP_URL) ||
    DEFAULT_ORION_APP_URL;

  if (isValidDestinationUrl(candidate)) {
    return {
      url: candidate,
      isTrusted: true,
    };
  }

  return {
    url: DEFAULT_ORION_APP_URL,
    isTrusted: false,
    reason: `Provided URL "${customUrl}" is not on the trusted Orion-9 domain whitelist. Falling back to official live deployment.`,
  };
}

/**
 * Validates email formatting.
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid work email address.' };
  }
  return { isValid: true };
}

/**
 * Validates password strength for Orion-9 enterprise accounts.
 */
export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
  score: number;
} {
  if (!password) {
    return { isValid: false, error: 'Password is required.', score: 0 };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.', score: 1 };
  }

  let score = 1;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  if (!hasNumber && !hasSpecial) {
    return {
      isValid: false,
      error: 'Password must include at least one number or special character.',
      score,
    };
  }

  return { isValid: true, score };
}

/**
 * Validates complete sign-up form fields including full name, unique username,
 * email, password, password confirmation, and terms acceptance.
 */
export function validateSignUp(
  name: string,
  username: string,
  email: string,
  password: string,
  confirmPassword?: string,
  termsAccepted = true
): {
  isValid: boolean;
  errors: Record<string, string>;
  normalizedUsername: string;
} {
  const errors: Record<string, string> = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters.';
  }

  const usernameCheck = validateUsername(username);
  if (!usernameCheck.isValid) {
    errors.username = usernameCheck.error!;
  }

  const emailCheck = validateEmail(email);
  if (!emailCheck.isValid) {
    errors.email = emailCheck.error!;
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.isValid) {
    errors.password = passwordCheck.error!;
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!termsAccepted) {
    errors.terms = 'You must accept the terms of service to continue.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedUsername: usernameCheck.normalized,
  };
}

/**
 * Device-remembered username helpers.
 * Never stores or persists passwords or auth tokens.
 */
export function getRememberedUsername(storage?: Storage): string | null {
  try {
    const s = storage || (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!s) return null;
    const value = s.getItem(REMEMBERED_USERNAME_STORAGE_KEY);
    return value ? value.trim() : null;
  } catch {
    return null;
  }
}

export function saveRememberedUsername(identifier: string, storage?: Storage): void {
  try {
    const s = storage || (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!s) return;
    if (identifier && identifier.trim()) {
      s.setItem(REMEMBERED_USERNAME_STORAGE_KEY, identifier.trim());
    } else {
      s.removeItem(REMEMBERED_USERNAME_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota or access issues
  }
}

export function clearRememberedUsername(storage?: Storage): void {
  try {
    const s = storage || (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!s) return;
    s.removeItem(REMEMBERED_USERNAME_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Checks whether the current runtime environment is local development / test.
 */
export function isLocalDevEnvironment(customEnv?: {
  isDev?: boolean;
  hostname?: string;
}): boolean {
  if (customEnv) {
    if (customEnv.isDev !== undefined) return customEnv.isDev;
    if (customEnv.hostname) {
      const h = customEnv.hostname.toLowerCase();
      return h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' || h === '::1';
    }
  }

  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return true;
  }

  try {
    const env = (import.meta as unknown as { env: Record<string, string | boolean | undefined> })?.env;
    if (env?.DEV === true || env?.MODE === 'development') {
      return true;
    }
  } catch {
    // import.meta not available in non-ESM
  }

  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname.toLowerCase();
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1'
    );
  }

  return false;
}

/**
 * Validates Administrator login credentials.
 * Enforces strict environment separation for local dev credentials (admin/admin):
 * - In local development / test: Allows admin/admin to grant local development administrator access.
 * - In production: Strictly rejects admin/admin with a clear security rejection error.
 */
export function validateAdminLogin(
  identifier: string,
  pass: string,
  envOverride?: { isDev?: boolean; hostname?: string }
): {
  isHardcodedAdmin: boolean;
  isLocalDevAttempt: boolean;
  allowedInCurrentEnv: boolean;
  error?: string;
} {
  const normIdentifier = normalizeUsername(identifier);

  // 1. Hard-fixed Master Administrator Login (admin@orion / admin)
  if (isHardcodedAdminIdentifier(normIdentifier) && pass === 'admin') {
    return {
      isHardcodedAdmin: true,
      isLocalDevAttempt: true,
      allowedInCurrentEnv: true,
    };
  }

  // 2. Short local development admin credentials (admin / admin)
  const isPlainAdminDev = normIdentifier === 'admin' && pass === 'admin';
  if (isPlainAdminDev) {
    const isDev = isLocalDevEnvironment(envOverride);
    if (isDev) {
      return {
        isHardcodedAdmin: true,
        isLocalDevAttempt: true,
        allowedInCurrentEnv: true,
      };
    }

    return {
      isHardcodedAdmin: false,
      isLocalDevAttempt: true,
      allowedInCurrentEnv: false,
      error:
        'Local development credentials (admin / admin) are strictly prohibited in production. Please sign in using your verified Firebase Administrator credentials or master admin ID.',
    };
  }

  return {
    isHardcodedAdmin: false,
    isLocalDevAttempt: false,
    allowedInCurrentEnv: true, // proceed to real Firebase authentication
  };
}

export interface CrossAppAuthStatus {
  sharesSession: boolean;
  requiresDedicatedLogin: boolean;
  note: string;
}

export function evaluateCrossAppAuth(): CrossAppAuthStatus {
  return {
    sharesSession: false,
    requiresDedicatedLogin: true,
    note: 'Because the live Orion-9 application runs on an independent origin (workers.dev), browsers enforce origin isolation. After authenticating or launching, you will securely transition to the live application entry point without passing sensitive tokens in URL parameters.',
  };
}
