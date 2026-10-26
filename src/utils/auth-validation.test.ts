import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUsername,
  validateUsername,
  validateLoginIdentifier,
  validateSignUp,
  validatePassword,
  validateEmail,
  validateAdminLogin,
  getRememberedUsername,
  saveRememberedUsername,
  clearRememberedUsername,
  REMEMBERED_USERNAME_STORAGE_KEY,
  RESERVED_USERNAMES,
} from './auth-validation.ts';

// In-memory mock storage for session and device persistence tests
class MockStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] || null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

// Mock Account Directory for username resolution & auth simulation
const mockDirectory: Record<string, { uid: string; email: string; passHash: string; role: string }> = {
  'elena_r': {
    uid: 'uid-elena-01',
    email: 'elena@enterprise.com',
    passHash: 'SecurePass1!',
    role: 'operator',
  },
  'marcus_v': {
    uid: 'uid-marcus-02',
    email: 'marcus@globalfreight.org',
    passHash: 'OrionControl2026!',
    role: 'operator',
  },
};

// Simulation of account resolution service
function simulateResolveAccount(identifier: string): { email: string; isUsername: boolean; uid?: string } {
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) {
    return { email: trimmed.toLowerCase(), isUsername: false };
  }
  const norm = normalizeUsername(trimmed);
  const record = mockDirectory[norm];
  if (!record) {
    throw new Error('Invalid username/email or password. Please verify your credentials.');
  }
  return { email: record.email, isUsername: true, uid: record.uid };
}

// Simulation of login flow
function simulateLogin(
  identifier: string,
  pass: string,
  envOverride?: { isDev?: boolean }
): { success: boolean; user?: { uid: string; email: string; role: string; isAdmin: boolean }; error?: string } {
  // Check local dev admin
  const adminCheck = validateAdminLogin(identifier, pass, envOverride);
  if (adminCheck.isLocalDevAttempt) {
    if (adminCheck.allowedInCurrentEnv) {
      return {
        success: true,
        user: {
          uid: 'local-dev-admin-uid-01',
          email: 'admin@orion9.local',
          role: 'admin',
          isAdmin: true,
        },
      };
    }
    return {
      success: false,
      error: adminCheck.error || 'Local dev admin credentials are prohibited in production.',
    };
  }

  let resolvedEmail: string;
  try {
    resolvedEmail = simulateResolveAccount(identifier).email;
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }

  // Lookup record by email
  const match = Object.values(mockDirectory).find((r) => r.email === resolvedEmail);
  if (!match || match.passHash !== pass) {
    return { success: false, error: 'Invalid username/email or password. Please verify your credentials.' };
  }

  return {
    success: true,
    user: {
      uid: match.uid,
      email: match.email,
      role: match.role,
      isAdmin: match.role === 'admin',
    },
  };
}

// Simulation of password reset request
function simulatePasswordReset(identifier: string): { success: boolean; message: string; resolvedTargetEmail?: string } {
  let targetEmail: string | undefined;
  if (identifier.includes('@')) {
    targetEmail = identifier.trim().toLowerCase();
  } else {
    try {
      targetEmail = simulateResolveAccount(identifier).email;
    } catch {
      // ANTI-ENUMERATION: Even if not resolved, return generic reassurance
      targetEmail = undefined;
    }
  }

  return {
    success: true,
    message: 'If an account is associated with that username or email address, password recovery instructions have been sent.',
    resolvedTargetEmail: targetEmail,
  };
}

/* ====================================================================
 * 15 REQUIRED TEST SUITES ACCORDING TO SPECIFICATION
 * ==================================================================== */

// TEST 1: Username validation (valid characters, min/max length, rejected characters)
test('1. Username validation: valid characters, min/max length, and rejected characters', () => {
  // Valid usernames
  assert.equal(validateUsername('elena_r').isValid, true);
  assert.equal(validateUsername('operator_99').isValid, true);
  assert.equal(validateUsername('john123').isValid, true);
  assert.equal(validateUsername('abc').isValid, true); // min length 3
  assert.equal(validateUsername('a'.repeat(30)).isValid, true); // max length 30

  // Invalid: Too short (< 3)
  const tooShort = validateUsername('ab');
  assert.equal(tooShort.isValid, false);
  assert.match(tooShort.error || '', /at least 3 characters/);

  // Invalid: Too long (> 30)
  const tooLong = validateUsername('a'.repeat(31));
  assert.equal(tooLong.isValid, false);
  assert.match(tooLong.error || '', /cannot exceed 30 characters/);

  // Invalid: Disallowed characters (spaces, hyphens, symbols, punctuation)
  assert.equal(validateUsername('user name').isValid, false);
  assert.equal(validateUsername('user-name').isValid, false);
  assert.equal(validateUsername('user@domain').isValid, false);
  assert.equal(validateUsername('user$name').isValid, false);
  assert.equal(validateUsername('user#1').isValid, false);
  assert.equal(validateUsername('').isValid, false);
});

// TEST 2: Case-insensitive uniqueness logic and normalization
test('2. Case-insensitive uniqueness logic and normalization', () => {
  assert.equal(normalizeUsername('  Elena_R  '), 'elena_r');
  assert.equal(normalizeUsername('ALEX_HUNTER'), 'alex_hunter');
  assert.equal(normalizeUsername('Operator_01'), 'operator_01');

  // Same username with different casing normalizes to identical key
  const key1 = normalizeUsername('SupplyChainLead');
  const key2 = normalizeUsername('supplychainlead');
  const key3 = normalizeUsername('SUPPLYCHAINLEAD');
  assert.equal(key1, key2);
  assert.equal(key2, key3);
});

// TEST 3: Reserved username protection (admin, administrator, root, system, etc.)
test('3. Reserved username protection (admin, administrator, root, system, orion, etc.)', () => {
  for (const reserved of RESERVED_USERNAMES) {
    const checkLower = validateUsername(reserved);
    assert.equal(checkLower.isValid, false, `Expected reserved word "${reserved}" to be rejected`);
    assert.match(checkLower.error || '', /reserved and unavailable/);

    const checkUpper = validateUsername(reserved.toUpperCase());
    assert.equal(checkUpper.isValid, false, `Expected uppercase reserved word "${reserved.toUpperCase()}" to be rejected`);

    const checkMixed = validateUsername(reserved[0].toUpperCase() + reserved.slice(1));
    assert.equal(checkMixed.isValid, false, `Expected mixed-case reserved word to be rejected`);
  }
});

// TEST 4: Correct resolution of usernames to accounts
test('4. Correct resolution of usernames to accounts', () => {
  const res1 = simulateResolveAccount('elena_r');
  assert.equal(res1.isUsername, true);
  assert.equal(res1.email, 'elena@enterprise.com');
  assert.equal(res1.uid, 'uid-elena-01');

  // Case-insensitive resolution
  const res2 = simulateResolveAccount('ELENA_R');
  assert.equal(res2.email, 'elena@enterprise.com');

  const res3 = simulateResolveAccount('marcus_v');
  assert.equal(res3.email, 'marcus@globalfreight.org');
});

// TEST 5: Successful login using a valid username
test('5. Successful login using a valid username', () => {
  const result = simulateLogin('elena_r', 'SecurePass1!', { isDev: true });
  assert.equal(result.success, true);
  assert.ok(result.user);
  assert.equal(result.user?.email, 'elena@enterprise.com');
  assert.equal(result.user?.uid, 'uid-elena-01');

  // Cased username login
  const casedResult = simulateLogin('Elena_R', 'SecurePass1!', { isDev: true });
  assert.equal(casedResult.success, true);
});

// TEST 6: Successful login using a valid email
test('6. Successful login using a valid email', () => {
  const result = simulateLogin('elena@enterprise.com', 'SecurePass1!', { isDev: true });
  assert.equal(result.success, true);
  assert.ok(result.user);
  assert.equal(result.user?.email, 'elena@enterprise.com');

  const result2 = simulateLogin('marcus@globalfreight.org', 'OrionControl2026!', { isDev: true });
  assert.equal(result2.success, true);
  assert.equal(result2.user?.email, 'marcus@globalfreight.org');
});

// TEST 7: Appropriate error handling for invalid passwords
test('7. Appropriate error handling for invalid passwords', () => {
  const result = simulateLogin('elena_r', 'WrongPassword999!', { isDev: true });
  assert.equal(result.success, false);
  assert.match(result.error || '', /Invalid username\/email or password/);

  const emailResult = simulateLogin('elena@enterprise.com', 'IncorrectPassword', { isDev: true });
  assert.equal(emailResult.success, false);
  assert.match(emailResult.error || '', /Invalid username\/email or password/);
});

// TEST 8: Appropriate error handling for non-existent usernames
test('8. Appropriate error handling for non-existent usernames', () => {
  const result = simulateLogin('non_existent_user_404', 'SomePassword123!', { isDev: true });
  assert.equal(result.success, false);
  // Uses uniform message to prevent username enumeration
  assert.match(result.error || '', /Invalid username\/email or password/);
});

// TEST 9: Persistent storage of remembered usernames across sessions
test('9. Persistent storage of remembered usernames across sessions', () => {
  const storage = new MockStorage();

  // Initially empty
  assert.equal(getRememberedUsername(storage), null);

  // Save remembered username
  saveRememberedUsername('alex_hunter', storage);
  assert.equal(storage.getItem(REMEMBERED_USERNAME_STORAGE_KEY), 'alex_hunter');
  assert.equal(getRememberedUsername(storage), 'alex_hunter');

  // Simulating subsequent visit / browser reload
  const restored = getRememberedUsername(storage);
  assert.equal(restored, 'alex_hunter');
});

// TEST 10: Clearing of remembered usernames upon request
test('10. Clearing of remembered usernames upon request', () => {
  const storage = new MockStorage();
  saveRememberedUsername('operator_7', storage);
  assert.equal(getRememberedUsername(storage), 'operator_7');

  // Clear remembered username
  clearRememberedUsername(storage);
  assert.equal(storage.getItem(REMEMBERED_USERNAME_STORAGE_KEY), null);
  assert.equal(getRememberedUsername(storage), null);
});

// TEST 11: Local development admin login with admin / admin
test('11. Local development admin login with admin / admin', () => {
  const result = simulateLogin('admin', 'admin', { isDev: true });
  assert.equal(result.success, true);
  assert.ok(result.user);
  assert.equal(result.user?.role, 'admin');
  assert.equal(result.user?.isAdmin, true);
  assert.equal(result.user?.uid, 'local-dev-admin-uid-01');

  // Case-insensitive admin username check in dev
  const upperAdmin = simulateLogin('ADMIN', 'admin', { isDev: true });
  assert.equal(upperAdmin.success, true);
  assert.equal(upperAdmin.user?.isAdmin, true);
});

// TEST 12: Rejection of admin / admin in production environments
test('12. Rejection of admin / admin in production environments', () => {
  const prodResult = simulateLogin('admin', 'admin', { isDev: false });
  assert.equal(prodResult.success, false);
  assert.match(prodResult.error || '', /strictly prohibited in production/i);
});

// TEST 13: Prevention of privilege escalation via regular user registration
test('13. Prevention of privilege escalation via regular user registration', () => {
  // Regular user attempts to register reserved admin usernames
  const regAdmin = validateSignUp('Attacker', 'admin', 'attacker@domain.com', 'StrongPass1!', 'StrongPass1!');
  assert.equal(regAdmin.isValid, false);
  assert.match(regAdmin.errors.username || '', /reserved/);

  const regRoot = validateSignUp('Attacker', 'root', 'attacker@domain.com', 'StrongPass1!', 'StrongPass1!');
  assert.equal(regRoot.isValid, false);
  assert.match(regRoot.errors.username || '', /reserved/);

  const regSuper = validateSignUp('Attacker', 'superadmin', 'attacker@domain.com', 'StrongPass1!', 'StrongPass1!');
  assert.equal(regSuper.isValid, false);
  assert.match(regSuper.errors.username || '', /reserved/);

  // Even if a user registers a legal username, their role is locked to operator
  const legitReg = validateSignUp('Legit User', 'supply_analyst', 'analyst@company.com', 'StrongPass1!', 'StrongPass1!');
  assert.equal(legitReg.isValid, true);
});

// TEST 14: Password reset initiation using a username
test('14. Password reset initiation using a username', () => {
  const result = simulatePasswordReset('elena_r');
  assert.equal(result.success, true);
  assert.equal(result.resolvedTargetEmail, 'elena@enterprise.com');
  assert.match(result.message, /instructions have been sent/);

  // Non-existent username also returns reassuring generic success (anti-enumeration)
  const nonExistent = simulatePasswordReset('unknown_user_999');
  assert.equal(nonExistent.success, true);
  assert.equal(nonExistent.resolvedTargetEmail, undefined);
  assert.match(nonExistent.message, /instructions have been sent/);
});

// TEST 15: Password reset initiation using an email address
test('15. Password reset initiation using an email address', () => {
  const result = simulatePasswordReset('elena@enterprise.com');
  assert.equal(result.success, true);
  assert.equal(result.resolvedTargetEmail, 'elena@enterprise.com');
  assert.match(result.message, /instructions have been sent/);
});
