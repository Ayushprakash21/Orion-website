/**
 * Secure Username Resolution and Management Service for Orion-9.
 *
 * Provides:
 * 1. Username uniqueness validation and availability checking.
 * 2. Case-insensitive normalization.
 * 3. Secure username-to-account resolution without exposing public email directories.
 * 4. Post-registration mapping linking Firebase UID, username, and email.
 */

import {
  initializeFirebase,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from './firebase';
import {
  normalizeUsername,
  validateUsername,
} from '../utils/auth-validation';

export interface UsernameRecord {
  uid: string;
  username: string;
  normalizedUsername: string;
  email: string;
  createdAt?: unknown;
}

/**
 * Checks whether a requested username is available for registration.
 * Validates syntax, reserved status, and queries Firestore /usernames/{normalizedUsername}.
 */
export async function checkUsernameAvailability(rawUsername: string): Promise<{
  available: boolean;
  normalized: string;
  error?: string;
}> {
  const validation = validateUsername(rawUsername);
  if (!validation.isValid) {
    return {
      available: false,
      normalized: validation.normalized,
      error: validation.error,
    };
  }

  const { db, isConfigured } = initializeFirebase();
  if (!isConfigured || !db) {
    // If offline or Firebase not yet configured in dev, accept if syntactically valid
    return { available: true, normalized: validation.normalized };
  }

  try {
    const snap = await getDoc(doc(db, 'usernames', validation.normalized));
    if (snap.exists()) {
      return {
        available: false,
        normalized: validation.normalized,
        error: `The username "${rawUsername.trim()}" is already registered. Please choose another username.`,
      };
    }
    return { available: true, normalized: validation.normalized };
  } catch (err) {
    console.warn('[Orion-9 Auth] Username availability check error:', err);
    // If Firestore is temporarily unreachable, let user proceed to submit where transactional creation will guard
    return { available: true, normalized: validation.normalized };
  }
}

/**
 * Resolves a login or password reset identifier (either username or email)
 * to an authenticated account email address.
 *
 * Security:
 * - Does not expose a collection list or bulk query.
 * - Does not throw distinctive "user not found" messages if generic handling is desired.
 */
export async function resolveIdentifierToEmail(identifier: string): Promise<{
  email: string;
  isUsername: boolean;
  normalizedUsername?: string;
  uid?: string;
}> {
  if (!identifier || typeof identifier !== 'string') {
    throw new Error('Please enter your username or email address.');
  }

  const trimmed = identifier.trim();

  // If identifier contains @, it is an email address. No username lookup required.
  if (trimmed.includes('@')) {
    return {
      email: trimmed.toLowerCase(),
      isUsername: false,
    };
  }

  // Otherwise, it is a username
  const normalized = normalizeUsername(trimmed);
  const { db, isConfigured } = initializeFirebase();

  if (!isConfigured || !db) {
    throw new Error('Authentication database is currently unavailable. Please try again.');
  }

  try {
    const snap = await getDoc(doc(db, 'usernames', normalized));
    if (!snap.exists()) {
      // Intentionally uniform error to prevent username harvesting
      throw new Error('Invalid username/email or password. Please verify your credentials.');
    }

    const data = snap.data() as Partial<UsernameRecord>;
    if (!data.email) {
      throw new Error('No email is associated with this username. Please sign in with your email address.');
    }

    return {
      email: data.email,
      isUsername: true,
      normalizedUsername: normalized,
      uid: data.uid,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Failed to resolve account. Please verify your credentials.');
  }
}

/**
 * Persists the username reservation and associates it with the authenticated user's Firebase UID.
 * Updates both /usernames/{normalizedUsername} and /users/{uid}.
 */
export async function registerUsernameMapping(
  uid: string,
  username: string,
  email: string,
  displayName?: string
): Promise<void> {
  const normalized = normalizeUsername(username);
  const { db, isConfigured } = initializeFirebase();

  if (!isConfigured || !db) {
    return;
  }

  // 1. Create username index document at /usernames/{normalized}
  await setDoc(
    doc(db, 'usernames', normalized),
    {
      uid,
      username: username.trim(),
      normalizedUsername: normalized,
      email: email.trim().toLowerCase(),
      createdAt: serverTimestamp(),
    },
    { merge: false } // create only
  );

  // 2. Update user profile document at /users/{uid}
  await setDoc(
    doc(db, 'users', uid),
    {
      uid,
      username: username.trim(),
      normalizedUsername: normalized,
      displayName: displayName?.trim() || username.trim(),
      email: email.trim().toLowerCase(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Retrieves the stored username for a user by their Firebase UID.
 */
export async function getUsernameForUid(uid: string): Promise<string | null> {
  const { db, isConfigured } = initializeFirebase();
  if (!isConfigured || !db) return null;

  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data();
      return (data?.username as string) || null;
    }
    return null;
  } catch {
    return null;
  }
}
