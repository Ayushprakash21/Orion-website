/**
 * ORION-9 USER PROFILE SERVICE
 *
 * Provides authoritative management for authenticated personal user profiles.
 * Synchronizes Firebase Authentication (displayName, photoURL, email, password)
 * with protected Firestore records (/users/{uid} and /usernames/{normalized}).
 */

import {
  initializeFirebase,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  verifyBeforeUpdateEmail,
  sendEmailVerification,
  sendPasswordResetEmail,
  type User,
} from './firebase.ts';
import {
  validateUsername,
  normalizeUsername,
  validateEmail,
} from '../utils/auth-validation.ts';
import {
  checkUsernameAvailability,
  getUsernameForUid,
} from './username-service.ts';

export const LOCAL_DEV_ADMIN_UID = 'local-dev-admin-uid-01';

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  normalizedUsername: string;
  phoneNumber?: string;
  photoURL?: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
  role: string;
  isAdmin: boolean;
  emailVerified: boolean;
  creationTime?: string;
  lastSignInTime?: string;
  providerId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const LOCAL_ADMIN_STORAGE_KEY = 'orion_dev_admin_profile';

/**
 * Loads the user profile for the current authenticated user.
 * Merges authoritative Firebase Auth state with Firestore /users/{uid}.
 */
export async function loadUserProfile(user: User, isAdmin: boolean): Promise<UserProfileData> {
  const providerId = user.providerData?.[0]?.providerId || 'password';

  // Handle local dev synthetic admin session
  if (user.uid === LOCAL_DEV_ADMIN_UID) {
    let customSaved: Partial<UserProfileData> = {};
    if (typeof window !== 'undefined') {
      try {
        const raw = window.sessionStorage.getItem(LOCAL_ADMIN_STORAGE_KEY);
        if (raw) customSaved = JSON.parse(raw);
      } catch {}
    }

    return {
      uid: LOCAL_DEV_ADMIN_UID,
      email: customSaved.email || user.email || 'admin@orion9.local',
      displayName: customSaved.displayName || user.displayName || 'Master Administrator',
      username: customSaved.username || 'admin',
      normalizedUsername: 'admin',
      phoneNumber: customSaved.phoneNumber || '+1 (555) 019-9000',
      photoURL: customSaved.photoURL || '',
      bio: customSaved.bio || 'Principal Systems Administrator for Orion-9 Enterprise WebOS.',
      jobTitle: customSaved.jobTitle || 'Lead Systems Architect',
      department: customSaved.department || 'Infrastructure & Core Kernel',
      role: 'admin',
      isAdmin: true,
      emailVerified: true,
      creationTime: user.metadata?.creationTime || new Date().toISOString(),
      lastSignInTime: user.metadata?.lastSignInTime || new Date().toISOString(),
      providerId: 'local_dev',
    };
  }

  const { db, isConfigured } = initializeFirebase();

  let firestoreData: Record<string, any> = {};
  if (isConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        firestoreData = snap.data() || {};
      }
    } catch (err) {
      console.warn('[UserProfileService] Could not fetch /users/' + user.uid + ':', err);
    }
  }

  // Derive resolved username
  let resolvedUsername = firestoreData.username || '';
  if (!resolvedUsername && isConfigured) {
    const uname = await getUsernameForUid(user.uid);
    if (uname) resolvedUsername = uname;
  }
  if (!resolvedUsername) {
    resolvedUsername = user.email ? user.email.split('@')[0] : 'user';
  }

  const fallbackDisplayName = user.displayName || firestoreData.displayName || resolvedUsername || 'Enterprise User';
  const normalizedUname = normalizeUsername(resolvedUsername);

  return {
    uid: user.uid,
    email: user.email || firestoreData.email || '',
    displayName: firestoreData.displayName || fallbackDisplayName,
    username: resolvedUsername,
    normalizedUsername: normalizedUname,
    phoneNumber: firestoreData.phoneNumber || user.phoneNumber || '',
    photoURL: firestoreData.photoURL || user.photoURL || '',
    bio: firestoreData.bio || '',
    jobTitle: firestoreData.jobTitle || '',
    department: firestoreData.department || '',
    role: isAdmin ? 'admin' : (firestoreData.role || 'operator'),
    isAdmin,
    emailVerified: user.emailVerified,
    creationTime: user.metadata?.creationTime,
    lastSignInTime: user.metadata?.lastSignInTime,
    providerId,
    createdAt: firestoreData.createdAt,
    updatedAt: firestoreData.updatedAt,
  };
}

/**
 * Synchronous client-side validation for profile updates.
 */
export function validateUserProfileUpdates(
  currentProfile: UserProfileData,
  updates: {
    displayName?: string;
    username?: string;
    phoneNumber?: string;
    photoURL?: string;
    bio?: string;
    jobTitle?: string;
    department?: string;
    role?: string;
    isAdmin?: boolean;
  }
): { valid: boolean; error?: string } {
  // 1. Validate display name
  const trimmedName = updates.displayName !== undefined ? updates.displayName.trim() : currentProfile.displayName;
  if (!trimmedName || trimmedName.length < 2) {
    return { valid: false, error: 'Display Name must contain at least 2 characters.' };
  }
  if (trimmedName.length > 80) {
    return { valid: false, error: 'Display Name cannot exceed 80 characters.' };
  }

  // 2. Validate bio and text fields
  const trimmedBio = updates.bio !== undefined ? updates.bio.trim() : (currentProfile.bio || '');
  if (trimmedBio.length > 500) {
    return { valid: false, error: 'Bio cannot exceed 500 characters.' };
  }

  const trimmedJobTitle = updates.jobTitle !== undefined ? updates.jobTitle.trim() : (currentProfile.jobTitle || '');
  if (trimmedJobTitle.length > 80) {
    return { valid: false, error: 'Job title cannot exceed 80 characters.' };
  }

  const trimmedDept = updates.department !== undefined ? updates.department.trim() : (currentProfile.department || '');
  if (trimmedDept.length > 80) {
    return { valid: false, error: 'Department cannot exceed 80 characters.' };
  }

  const trimmedPhone = updates.phoneNumber !== undefined ? updates.phoneNumber.trim() : (currentProfile.phoneNumber || '');
  if (trimmedPhone && trimmedPhone.length > 30) {
    return { valid: false, error: 'Phone number cannot exceed 30 characters.' };
  }

  const trimmedPhotoUrl = updates.photoURL !== undefined ? updates.photoURL.trim() : (currentProfile.photoURL || '');
  if (trimmedPhotoUrl && trimmedPhotoUrl.length > 2048) {
    return { valid: false, error: 'Photo URL is too long.' };
  }
  if (
    trimmedPhotoUrl &&
    !trimmedPhotoUrl.startsWith('https://') &&
    !trimmedPhotoUrl.startsWith('http://') &&
    !trimmedPhotoUrl.startsWith('data:image/')
  ) {
    return { valid: false, error: 'Photo URL must begin with https:// or http://' };
  }

  // 3. Username format & reservation check
  if (updates.username !== undefined && updates.username.trim()) {
    const rawNewUsername = updates.username.trim();
    const newNormalized = normalizeUsername(rawNewUsername);

    if (newNormalized !== currentProfile.normalizedUsername) {
      const validation = validateUsername(rawNewUsername);
      if (!validation.isValid) {
        return { valid: false, error: validation.error || 'Invalid username format.' };
      }
    }
  }

  return { valid: true };
}

/**
 * Saves updates to the personal profile.
 * Ensures security: does not allow self-granting admin privileges or changing role.
 */
export async function updateUserProfile(
  user: User,
  updates: {
    displayName?: string;
    username?: string;
    phoneNumber?: string;
    photoURL?: string;
    bio?: string;
    jobTitle?: string;
    department?: string;
  },
  currentProfile: UserProfileData
): Promise<{ success: boolean; error?: string; updatedProfile?: UserProfileData }> {
  // 0. Pre-validate inputs
  const validation = validateUserProfileUpdates(currentProfile, updates);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // 1. Validate display name
  const trimmedName = updates.displayName !== undefined ? updates.displayName.trim() : currentProfile.displayName;
  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: 'Display Name must contain at least 2 characters.' };
  }
  if (trimmedName.length > 80) {
    return { success: false, error: 'Display Name cannot exceed 80 characters.' };
  }

  // 2. Validate bio and text fields
  const trimmedBio = updates.bio !== undefined ? updates.bio.trim() : (currentProfile.bio || '');
  if (trimmedBio.length > 500) {
    return { success: false, error: 'Bio cannot exceed 500 characters.' };
  }

  const trimmedJobTitle = updates.jobTitle !== undefined ? updates.jobTitle.trim() : (currentProfile.jobTitle || '');
  if (trimmedJobTitle.length > 80) {
    return { success: false, error: 'Job title cannot exceed 80 characters.' };
  }

  const trimmedDept = updates.department !== undefined ? updates.department.trim() : (currentProfile.department || '');
  if (trimmedDept.length > 80) {
    return { success: false, error: 'Department cannot exceed 80 characters.' };
  }

  const trimmedPhone = updates.phoneNumber !== undefined ? updates.phoneNumber.trim() : (currentProfile.phoneNumber || '');
  if (trimmedPhone && trimmedPhone.length > 30) {
    return { success: false, error: 'Phone number cannot exceed 30 characters.' };
  }

  const trimmedPhotoUrl = updates.photoURL !== undefined ? updates.photoURL.trim() : (currentProfile.photoURL || '');
  if (trimmedPhotoUrl && trimmedPhotoUrl.length > 2048) {
    return { success: false, error: 'Photo URL is too long.' };
  }
  if (trimmedPhotoUrl && !trimmedPhotoUrl.startsWith('https://') && !trimmedPhotoUrl.startsWith('http://') && !trimmedPhotoUrl.startsWith('data:image/')) {
    return { success: false, error: 'Photo URL must begin with https:// or http://' };
  }

  // 3. Username handling & collision guard
  let targetUsername = currentProfile.username;
  let targetNormalized = currentProfile.normalizedUsername;

  if (updates.username !== undefined && updates.username.trim()) {
    const rawNewUsername = updates.username.trim();
    const newNormalized = normalizeUsername(rawNewUsername);

    if (newNormalized !== currentProfile.normalizedUsername) {
      // Validate username requirements
      const validation = validateUsername(rawNewUsername);
      if (!validation.isValid) {
        return { success: false, error: validation.error || 'Invalid username format.' };
      }

      // Check availability against Firestore
      const avail = await checkUsernameAvailability(rawNewUsername);
      if (!avail.available) {
        return { success: false, error: avail.error || 'The requested username is already taken.' };
      }

      targetUsername = rawNewUsername;
      targetNormalized = newNormalized;
    }
  }

  // Handle local dev synthetic admin session
  if (user.uid === LOCAL_DEV_ADMIN_UID) {
    const newProfile: UserProfileData = {
      ...currentProfile,
      displayName: trimmedName,
      username: targetUsername,
      normalizedUsername: targetNormalized,
      phoneNumber: trimmedPhone,
      photoURL: trimmedPhotoUrl,
      bio: trimmedBio,
      jobTitle: trimmedJobTitle,
      department: trimmedDept,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(newProfile));
      } catch {}
    }

    return { success: true, updatedProfile: newProfile };
  }

  // 4. Update Firebase Auth user profile (displayName, photoURL)
  try {
    const authProfileUpdates: { displayName?: string; photoURL?: string } = {};
    if (trimmedName !== user.displayName) authProfileUpdates.displayName = trimmedName;
    if (trimmedPhotoUrl !== user.photoURL) authProfileUpdates.photoURL = trimmedPhotoUrl || null as any;

    if (Object.keys(authProfileUpdates).length > 0) {
      await updateProfile(user, authProfileUpdates);
    }
  } catch (authErr) {
    console.warn('[UserProfileService] Auth profile update notice:', authErr);
  }

  // 5. Update Firestore /users/{uid} and /usernames/{normalized}
  const { db, isConfigured } = initializeFirebase();
  if (isConfigured && db) {
    try {
      // If username changed, update /usernames registry
      if (targetNormalized !== currentProfile.normalizedUsername && targetNormalized) {
        // Reserve new username doc
        await setDoc(
          doc(db, 'usernames', targetNormalized),
          {
            uid: user.uid,
            username: targetUsername,
            normalizedUsername: targetNormalized,
            email: (user.email || '').trim().toLowerCase(),
            createdAt: serverTimestamp(),
          },
          { merge: false }
        );

        // Delete previous username doc if held by current user
        if (currentProfile.normalizedUsername) {
          try {
            await deleteDoc(doc(db, 'usernames', currentProfile.normalizedUsername));
          } catch (delErr) {
            console.warn('[UserProfileService] Old username release notice:', delErr);
          }
        }
      }

      // Update /users/{uid} strictly without modifying role or adding isAdmin
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          displayName: trimmedName,
          username: targetUsername,
          normalizedUsername: targetNormalized,
          phoneNumber: trimmedPhone,
          photoURL: trimmedPhotoUrl,
          bio: trimmedBio,
          jobTitle: trimmedJobTitle,
          department: trimmedDept,
          email: user.email?.trim().toLowerCase() || currentProfile.email,
          role: currentProfile.role || 'operator',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database update failed.';
      return { success: false, error: 'Could not save profile to database: ' + msg };
    }
  }

  const updatedProfile: UserProfileData = {
    ...currentProfile,
    displayName: trimmedName,
    username: targetUsername,
    normalizedUsername: targetNormalized,
    phoneNumber: trimmedPhone,
    photoURL: trimmedPhotoUrl,
    bio: trimmedBio,
    jobTitle: trimmedJobTitle,
    department: trimmedDept,
    updatedAt: new Date().toISOString(),
  };

  return { success: true, updatedProfile };
}

/**
 * Updates the user's password for password-authenticated accounts.
 * Requires re-authenticating with the current password.
 */
export async function changeUserPassword(
  user: User,
  currentPass: string,
  newPass: string
): Promise<{ success: boolean; error?: string }> {
  if (!currentPass) {
    return { success: false, error: 'Please enter your current password.' };
  }
  if (!newPass || newPass.length < 8) {
    return { success: false, error: 'New password must contain at least 8 characters.' };
  }
  if (!/[A-Za-z]/.test(newPass) || !/[0-9]/.test(newPass)) {
    return { success: false, error: 'New password must contain both letters and numbers.' };
  }

  if (user.uid === LOCAL_DEV_ADMIN_UID) {
    return { success: true };
  }

  if (!user.email) {
    return { success: false, error: 'No email associated with this account.' };
  }

  try {
    const cred = EmailAuthProvider.credential(user.email, currentPass);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPass);
    return { success: true };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return { success: false, error: 'Current password is incorrect. Please try again.' };
    }
    if (code === 'auth/weak-password') {
      return { success: false, error: 'New password is too weak. Please choose a stronger password.' };
    }
    if (code === 'auth/requires-recent-login') {
      return { success: false, error: 'For security, please sign out and sign back in before changing your password.' };
    }
    return { success: false, error: (err as Error).message || 'Failed to update password.' };
  }
}

/**
 * Dispatches a password reset email to the user's registered email address.
 */
export async function sendUserPasswordReset(user: User): Promise<{ success: boolean; error?: string }> {
  if (!user.email) {
    return { success: false, error: 'No email associated with this account.' };
  }
  if (user.uid === LOCAL_DEV_ADMIN_UID) {
    return { success: true };
  }

  const { auth, isConfigured } = initializeFirebase();
  if (!isConfigured || !auth) {
    return { success: false, error: 'Authentication service is not configured.' };
  }

  try {
    await sendPasswordResetEmail(auth, user.email);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || 'Failed to send password reset email.' };
  }
}

/**
 * Dispatches an email verification message.
 */
export async function sendUserEmailVerification(user: User): Promise<{ success: boolean; error?: string }> {
  if (user.uid === LOCAL_DEV_ADMIN_UID) {
    return { success: true };
  }
  try {
    await sendEmailVerification(user);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || 'Failed to send verification email.' };
  }
}

/**
 * Initiates an email change flow.
 * In modern Firebase Auth, verifyBeforeUpdateEmail sends a confirmation link to the new address.
 */
export async function requestUserEmailChange(
  user: User,
  newEmail: string,
  currentPassword: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  const cleanEmail = newEmail.trim().toLowerCase();
  const emailValidation = validateEmail(cleanEmail);
  if (!emailValidation.isValid) {
    return { success: false, error: emailValidation.error || 'Please enter a valid email address.' };
  }
  if (cleanEmail === (user.email || '').toLowerCase()) {
    return { success: false, error: 'New email is identical to current email.' };
  }
  if (!currentPassword) {
    return { success: false, error: 'Please provide your current password to authorize this security change.' };
  }

  if (user.uid === LOCAL_DEV_ADMIN_UID) {
    return {
      success: true,
      message: `A verification link has been sent to ${cleanEmail}. Verify the link to complete your email change.`,
    };
  }

  if (!user.email) {
    return { success: false, error: 'Current account has no email.' };
  }

  try {
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    await verifyBeforeUpdateEmail(user, cleanEmail);
    return {
      success: true,
      message: `A verification link has been sent to ${cleanEmail}. Please check your inbox and confirm the link to finalize your new email.`,
    };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return { success: false, error: 'Current password is incorrect. Please verify and try again.' };
    }
    if (code === 'auth/email-already-in-use') {
      return { success: false, error: 'This email address is already associated with another account.' };
    }
    if (code === 'auth/requires-recent-login') {
      return { success: false, error: 'For security, please sign in again before updating your email address.' };
    }
    return { success: false, error: (err as Error).message || 'Failed to initiate email change.' };
  }
}
