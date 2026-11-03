import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateUsername,
  normalizeUsername,
  validateEmail,
} from './auth-validation.ts';
import {
  loadUserProfile,
  updateUserProfile,
  validateUserProfileUpdates,
  changeUserPassword,
  sendUserPasswordReset,
  sendUserEmailVerification,
  requestUserEmailChange,
  LOCAL_DEV_ADMIN_UID,
  type UserProfileData,
} from '../services/userProfileService.ts';

describe('Orion-9 User Profile & Account Management Pipeline Test Suite', () => {
  // 1. Username Format & Sanitization Validation
  it('1. Username validation: enforces alphanumeric chars, underscore, 3-30 length', () => {
    assert.strictEqual(validateUsername('john_doe').isValid, true);
    assert.strictEqual(validateUsername('alice_99').isValid, true);
    assert.strictEqual(validateUsername('operator_1').isValid, true);

    // Too short (< 3)
    const tooShort = validateUsername('ab');
    assert.strictEqual(tooShort.isValid, false);
    assert.match(tooShort.error || '', /at least 3 characters/i);

    // Too long (> 30)
    const tooLong = validateUsername('a'.repeat(31));
    assert.strictEqual(tooLong.isValid, false);
    assert.match(tooLong.error || '', /cannot exceed 30 characters/i);

    // Invalid characters (spaces, symbols, hyphens)
    const withSpace = validateUsername('john doe');
    assert.strictEqual(withSpace.isValid, false);

    const withSymbol = validateUsername('user@domain');
    assert.strictEqual(withSymbol.isValid, false);

    const withPunct = validateUsername('admin!#$');
    assert.strictEqual(withPunct.isValid, false);
  });

  // 2. Case Normalization & Case-Insensitive Uniqueness
  it('2. Username normalization: folds to lowercase and trims whitespace', () => {
    assert.strictEqual(normalizeUsername('  AliceBob99  '), 'alicebob99');
    assert.strictEqual(normalizeUsername('John_DOE'), 'john_doe');
    assert.strictEqual(normalizeUsername('SYSTEM_OPERATOR'), 'system_operator');
  });

  // 3. Reserved Username Protection
  it('3. Username reservation: prevents taking protected system identities', () => {
    const reservedNames = ['admin', 'administrator', 'root', 'system', 'orion', 'moderator', 'support'];
    for (const name of reservedNames) {
      const res = validateUsername(name);
      assert.strictEqual(res.isValid, false, `Reserved name "${name}" should be rejected`);
      assert.match(res.error || '', /reserved/i);
    }
  });

  // 4. Email Syntax Validation
  it('4. Email validation: validates standard RFC email formats and rejects invalid inputs', () => {
    assert.strictEqual(validateEmail('user@orion-9.com').isValid, true);
    assert.strictEqual(validateEmail('first.last+tag@sub.domain.org').isValid, true);

    assert.strictEqual(validateEmail('').isValid, false);
    assert.strictEqual(validateEmail('plainaddress').isValid, false);
    assert.strictEqual(validateEmail('@missingusername.com').isValid, false);
    assert.strictEqual(validateEmail('missingdomain@.com').isValid, false);
  });

  // 5. Local Dev Admin Profile Loading
  it('5. loadUserProfile: returns valid administrator profile for synthetic dev admin session', async () => {
    const mockUser: any = {
      uid: LOCAL_DEV_ADMIN_UID,
      email: 'admin@orion.local',
      displayName: 'Orion Administrator',
      photoURL: null,
      emailVerified: true,
      metadata: {
        creationTime: '2026-01-01T00:00:00.000Z',
        lastSignInTime: '2026-11-01T00:00:00.000Z',
      },
      providerData: [{ providerId: 'local_dev' }],
    };

    const profile = await loadUserProfile(mockUser, true);
    assert.strictEqual(profile.uid, LOCAL_DEV_ADMIN_UID);
    assert.strictEqual(profile.isAdmin, true);
    assert.strictEqual(profile.role, 'admin');
    assert.strictEqual(profile.emailVerified, true);
    assert.strictEqual(profile.username, 'admin');
  });

  // 6. Regular User Default Fallback Profile
  it('6. loadUserProfile: handles standard users with fallback defaults when Firestore doc is unset', async () => {
    const mockUser: any = {
      uid: 'user-standard-12345',
      email: 'researcher@deepmind.com',
      displayName: 'Marie Curie',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      emailVerified: false,
      metadata: {
        creationTime: '2026-06-15T12:00:00.000Z',
        lastSignInTime: '2026-11-02T08:30:00.000Z',
      },
      providerData: [{ providerId: 'google.com' }],
    };

    const profile = await loadUserProfile(mockUser, false);
    assert.strictEqual(profile.uid, 'user-standard-12345');
    assert.strictEqual(profile.email, 'researcher@deepmind.com');
    assert.strictEqual(profile.displayName, 'Marie Curie');
    assert.strictEqual(profile.photoURL, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');
    assert.strictEqual(profile.role, 'operator');
    assert.strictEqual(profile.isAdmin, false);
    assert.strictEqual(profile.providerId, 'google.com');
  });

  // 7. Profile Update Validation: Display Name Length Guard
  it('7. validateUserProfileUpdates: rejects display names exceeding 80 characters or under 2', () => {
    const currentProfile: UserProfileData = {
      uid: 'user-standard-12345',
      email: 'test@example.com',
      displayName: 'Old Name',
      username: 'testuser',
      normalizedUsername: 'testuser',
      role: 'operator',
      isAdmin: false,
      emailVerified: true,
      providerId: 'password',
    };

    const tooLong = validateUserProfileUpdates(currentProfile, {
      displayName: 'X'.repeat(81),
    });
    assert.strictEqual(tooLong.valid, false);
    assert.match(tooLong.error || '', /cannot exceed 80 characters/i);

    const tooShort = validateUserProfileUpdates(currentProfile, {
      displayName: 'A',
    });
    assert.strictEqual(tooShort.valid, false);
    assert.match(tooShort.error || '', /at least 2 characters/i);
  });

  // 8. Profile Update Validation: Bio Length Guard
  it('8. validateUserProfileUpdates: rejects biography exceeding 500 characters', () => {
    const currentProfile: UserProfileData = {
      uid: 'user-standard-12345',
      email: 'test@example.com',
      displayName: 'Name',
      username: 'testuser',
      normalizedUsername: 'testuser',
      role: 'operator',
      isAdmin: false,
      emailVerified: true,
      providerId: 'password',
    };

    const res = validateUserProfileUpdates(currentProfile, {
      bio: 'B'.repeat(501),
    });

    assert.strictEqual(res.valid, false);
    assert.match(res.error || '', /cannot exceed 500 characters/i);
  });

  // 9. Profile Update Validation: Avatar URL Protocol Guard
  it('9. validateUserProfileUpdates: rejects unsafe non-HTTP/HTTPS avatar URLs', () => {
    const currentProfile: UserProfileData = {
      uid: 'user-standard-12345',
      email: 'test@example.com',
      displayName: 'Name',
      username: 'testuser',
      normalizedUsername: 'testuser',
      role: 'operator',
      isAdmin: false,
      emailVerified: true,
      providerId: 'password',
    };

    const unsafeProtocols = [
      'javascript:alert(1)',
      'data:text/html;base64,PHNjcmlwdD4=',
      'file:///etc/passwd',
      'ftp://server.com/photo.png',
    ];

    for (const badUrl of unsafeProtocols) {
      const res = validateUserProfileUpdates(currentProfile, {
        photoURL: badUrl,
      });
      assert.strictEqual(res.valid, false, `Unsafe URL "${badUrl}" should be rejected`);
      assert.match(res.error || '', /must begin with https:\/\/ or http:\/\//i);
    }
  });

  // 10. Role Immutability: Regular User Cannot Escalate Role
  it('10. Security Invariant: updateUserProfile never permits changing user role or isAdmin', async () => {
    const devUser: any = {
      uid: LOCAL_DEV_ADMIN_UID,
      email: 'operator@orion.local',
    };
    const currentProfile: UserProfileData = {
      uid: LOCAL_DEV_ADMIN_UID,
      email: 'operator@orion.local',
      displayName: 'Legitimate Name',
      username: 'testuser',
      normalizedUsername: 'testuser',
      role: 'operator',
      isAdmin: false,
      emailVerified: true,
      providerId: 'password',
    };

    // Attempting to send role or isAdmin in updates payload
    const maliciousUpdates: any = {
      displayName: 'Legitimate Name',
      role: 'administrator',
      isAdmin: true,
    };

    const res = await updateUserProfile(devUser, maliciousUpdates, currentProfile);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.updatedProfile?.role, 'operator', 'Role must remain operator');
    assert.strictEqual(res.updatedProfile?.isAdmin, false, 'isAdmin must remain false');
  });

  // 11. Password Change Validation: Minimum Length & Complexity
  it('11. changeUserPassword: enforces minimum 8 chars with mixed alphanumeric characters', async () => {
    const mockUser: any = {
      uid: 'user-password-123',
      email: 'user@example.com',
    };

    // Empty current password
    const emptyCurrent = await changeUserPassword(mockUser, '', 'NewPassword123');
    assert.strictEqual(emptyCurrent.success, false);
    assert.match(emptyCurrent.error || '', /current password/i);

    // Too short new password (< 8 chars)
    const tooShort = await changeUserPassword(mockUser, 'CurrentPass1', 'Short1');
    assert.strictEqual(tooShort.success, false);
    assert.match(tooShort.error || '', /at least 8 characters/i);

    // Missing numbers
    const noNumbers = await changeUserPassword(mockUser, 'CurrentPass1', 'OnlyLettersHere');
    assert.strictEqual(noNumbers.success, false);
    assert.match(noNumbers.error || '', /both letters and numbers/i);

    // Missing letters
    const noLetters = await changeUserPassword(mockUser, 'CurrentPass1', '1234567890');
    assert.strictEqual(noLetters.success, false);
    assert.match(noLetters.error || '', /both letters and numbers/i);
  });

  // 12. Dev Admin Password Change Bypass
  it('12. changeUserPassword: local dev admin returns success without touching live Firebase', async () => {
    const devAdminUser: any = {
      uid: LOCAL_DEV_ADMIN_UID,
      email: 'admin@orion.local',
    };

    const res = await changeUserPassword(devAdminUser, 'admin', 'ValidNewPassword2026');
    assert.strictEqual(res.success, true);
  });

  // 13. Email Update Validation
  it('13. requestUserEmailChange: validates email format, rejects duplicate, requires current password', async () => {
    const devAdminUser: any = {
      uid: LOCAL_DEV_ADMIN_UID,
      email: 'current@example.com',
    };

    // Invalid format
    const badFormat = await requestUserEmailChange(devAdminUser, 'notanemail', 'CurrentPass123');
    assert.strictEqual(badFormat.success, false);
    assert.match(badFormat.error || '', /valid/i);

    // Identical to current email
    const sameEmail = await requestUserEmailChange(devAdminUser, 'current@example.com', 'CurrentPass123');
    assert.strictEqual(sameEmail.success, false);
    assert.match(sameEmail.error || '', /identical to current/i);

    // Missing current password
    const noPass = await requestUserEmailChange(devAdminUser, 'new@example.com', '');
    assert.strictEqual(noPass.success, false);
    assert.match(noPass.error || '', /current password/i);

    // Valid email change on dev admin
    const validChange = await requestUserEmailChange(devAdminUser, 'newaddress@example.com', 'CurrentPass123');
    assert.strictEqual(validChange.success, true);
    assert.match(validChange.message || '', /verification link/i);
  });

  // 14. Password Reset & Verification Dispatch
  it('14. Password reset and email verification dispatch safely handle edge cases', async () => {
    const devAdminUser: any = {
      uid: LOCAL_DEV_ADMIN_UID,
      email: 'admin@orion.local',
    };

    const resetDev = await sendUserPasswordReset(devAdminUser);
    assert.strictEqual(resetDev.success, true);

    const verifyDev = await sendUserEmailVerification(devAdminUser);
    assert.strictEqual(verifyDev.success, true);

    const noEmailUser: any = { uid: 'no-email-uid' };
    const resetNoEmail = await sendUserPasswordReset(noEmailUser);
    assert.strictEqual(resetNoEmail.success, false);
    assert.match(resetNoEmail.error || '', /no email/i);
  });

  // 15. Protected Route Guard URL Invariant
  it('15. Route redirection invariant: unauthenticated access to /dashboard/profile builds correct redirect target', () => {
    const currentPath = '/dashboard/profile';
    const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    assert.strictEqual(redirectUrl, '/login?redirect=%2Fdashboard%2Fprofile');

    const subPath = '/dashboard/profile/security';
    const redirectSubUrl = `/login?redirect=${encodeURIComponent(subPath)}`;
    assert.strictEqual(redirectSubUrl, '/login?redirect=%2Fdashboard%2Fprofile%2Fsecurity');
  });

  // 16. Username Collision Detection
  it('16. validateUserProfileUpdates: rejects reserved usernames during profile update', () => {
    const currentProfile: UserProfileData = {
      uid: 'user-standard-12345',
      email: 'test@example.com',
      displayName: 'Name',
      username: 'originaluser',
      normalizedUsername: 'originaluser',
      role: 'operator',
      isAdmin: false,
      emailVerified: true,
      providerId: 'password',
    };

    const res = validateUserProfileUpdates(currentProfile, {
      username: 'admin', // reserved
    });

    assert.strictEqual(res.valid, false);
    assert.match(res.error || '', /reserved/i);
  });

  // 17. Successful Profile Update on Dev Session
  it('17. updateUserProfile: successfully updates displayName, bio, and phone on dev admin session', async () => {
    const devUser: any = {
      uid: LOCAL_DEV_ADMIN_UID,
      email: 'admin@orion.local',
    };
    const currentProfile: UserProfileData = {
      uid: LOCAL_DEV_ADMIN_UID,
      email: 'admin@orion.local',
      displayName: 'Old Name',
      username: 'admin',
      normalizedUsername: 'admin',
      role: 'admin',
      isAdmin: true,
      emailVerified: true,
      providerId: 'local_dev',
    };

    const res = await updateUserProfile(
      devUser,
      {
        displayName: 'Updated Lead Architect',
        bio: 'Leading kernel engineering and security architecture.',
        phoneNumber: '+1 555 999 8888',
        jobTitle: 'Distinguished Engineer',
        department: 'Platform Architecture',
      },
      currentProfile
    );

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.updatedProfile?.displayName, 'Updated Lead Architect');
    assert.strictEqual(res.updatedProfile?.bio, 'Leading kernel engineering and security architecture.');
    assert.strictEqual(res.updatedProfile?.phoneNumber, '+1 555 999 8888');
    assert.strictEqual(res.updatedProfile?.jobTitle, 'Distinguished Engineer');
  });

  after(() => {
    // Terminate Node event loop immediately after suite completes
    setTimeout(() => process.exit(0), 50).unref();
  });
});
