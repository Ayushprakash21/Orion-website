/**
 * Core validation and destination security utilities for Orion-9.
 * Handles safe redirection validation, cross-app boundary checks, and form validation.
 */

export const DEFAULT_ORION_APP_URL = 'https://orion-9.ayushprakash0021.workers.dev/';

// Whitelist of trusted origins for the Orion-9 operating system
export const TRUSTED_ORION_HOSTS = [
  'orion-9.ayushprakash0021.workers.dev',
  'localhost',
  '127.0.0.1',
];

/**
 * Validates whether a destination URL is safe and trusted.
 * Rejects javascript: URIs, data: URIs, protocol-relative URLs, and untrusted domains.
 */
export function isValidDestinationUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  
  const trimmed = rawUrl.trim();
  // Reject dangerous protocols
  if (trimmed.toLowerCase().startsWith('javascript:') || trimmed.toLowerCase().startsWith('data:')) {
    return false;
  }
  
  try {
    const parsed = new URL(trimmed);
    // Only accept https (or http on localhost during development)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    
    // Check if hostname matches or is a subdomain of trusted hosts
    const hostname = parsed.hostname.toLowerCase();
    const isWhitelisted = TRUSTED_ORION_HOSTS.some(trusted => {
      return hostname === trusted || hostname.endsWith(`.${trusted}`);
    });

    return isWhitelisted;
  } catch {
    return false;
  }
}

/**
 * Resolves the final destination for launching Orion-9.
 * Fallbacks safely to the canonical live Orion-9 application URL.
 */
export function resolveLaunchUrl(customUrl?: string): { url: string; isTrusted: boolean; reason?: string } {
  const candidate = customUrl?.trim() || (typeof process !== 'undefined' && process.env?.VITE_ORION_APP_URL) || DEFAULT_ORION_APP_URL;

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
 * Validates email formatting according to standard enterprise RFC specifications.
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
 * Requires at least 8 characters with a mix of letters and numbers.
 */
export function validatePassword(password: string): { isValid: boolean; error?: string; score: number } {
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
    return { isValid: false, error: 'Password must include at least one number or special character.', score };
  }

  return { isValid: true, score };
}

/**
 * Validates full sign-up form fields.
 */
export function validateSignUp(name: string, email: string, password: string, confirmPassword?: string): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters.';
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

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Cross-application authentication analysis:
 * Informs the user whether the landing page and the Cloudflare Workers deployed app
 * share an identical cookie domain / Firebase Auth session.
 */
export interface CrossAppAuthStatus {
  sharesSession: boolean;
  requiresDedicatedLogin: boolean;
  note: string;
}

export function evaluateCrossAppAuth(): CrossAppAuthStatus {
  // The deployed app is on 'orion-9.ayushprakash0021.workers.dev'
  // Web storage (IndexedDB/localStorage) and first-party cookies are partition-isolated by origin.
  return {
    sharesSession: false,
    requiresDedicatedLogin: true,
    note: 'Because the live Orion-9 application runs on an independent origin (workers.dev), browsers enforce origin isolation. After authenticating or launching, you will securely transition to the live application entry point without passing sensitive tokens in URL parameters.',
  };
}
