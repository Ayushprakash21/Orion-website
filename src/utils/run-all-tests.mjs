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
class MockStorage {
  constructor() {
    this.store = new Map();
  }

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }

  removeItem(key) {
    this.store.delete(key);
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }
}

// Mock Account Directory for username resolution & auth simulation
const mockDirectory = {
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
function simulateResolveAccount(identifier) {
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
function simulateLogin(identifier, pass, envOverride) {
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

  let resolvedEmail;
  try {
    resolvedEmail = simulateResolveAccount(identifier).email;
  } catch (err) {
    return { success: false, error: err.message };
  }

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
function simulatePasswordReset(identifier) {
  let targetEmail;
  if (identifier.includes('@')) {
    targetEmail = identifier.trim().toLowerCase();
  } else {
    try {
      targetEmail = simulateResolveAccount(identifier).email;
    } catch {
      targetEmail = undefined;
    }
  }

  return {
    success: true,
    message:
      'If an account is associated with that username or email address, password recovery instructions have been sent.',
    resolvedTargetEmail: targetEmail,
  };
}

const tests = [];
function runTest(name, fn) {
  tests.push({ name, fn });
}

// 1. Username validation: valid characters, min/max length, rejected characters
runTest('1. Username validation: valid characters, min/max length, rejected characters', () => {
  assert.equal(validateUsername('elena_r').isValid, true);
  assert.equal(validateUsername('operator_99').isValid, true);
  assert.equal(validateUsername('john123').isValid, true);
  assert.equal(validateUsername('abc').isValid, true);
  assert.equal(validateUsername('a'.repeat(30)).isValid, true);

  const tooShort = validateUsername('ab');
  assert.equal(tooShort.isValid, false);
  assert.match(tooShort.error || '', /at least 3 characters/);

  const tooLong = validateUsername('a'.repeat(31));
  assert.equal(tooLong.isValid, false);
  assert.match(tooLong.error || '', /cannot exceed 30 characters/);

  assert.equal(validateUsername('user name').isValid, false);
  assert.equal(validateUsername('user-name').isValid, false);
  assert.equal(validateUsername('user@domain').isValid, false);
  assert.equal(validateUsername('user$name').isValid, false);
  assert.equal(validateUsername('user#1').isValid, false);
  assert.equal(validateUsername('').isValid, false);
});

// 2. Case-insensitive uniqueness logic and normalization
runTest('2. Case-insensitive uniqueness logic and normalization', () => {
  assert.equal(normalizeUsername('  Elena_R  '), 'elena_r');
  assert.equal(normalizeUsername('ALEX_HUNTER'), 'alex_hunter');
  assert.equal(normalizeUsername('Operator_01'), 'operator_01');

  const key1 = normalizeUsername('SupplyChainLead');
  const key2 = normalizeUsername('supplychainlead');
  const key3 = normalizeUsername('SUPPLYCHAINLEAD');
  assert.equal(key1, key2);
  assert.equal(key2, key3);
});

// 3. Reserved username protection
runTest('3. Reserved username protection (admin, administrator, root, system, orion, etc.)', () => {
  for (const reserved of RESERVED_USERNAMES) {
    const checkLower = validateUsername(reserved);
    assert.equal(checkLower.isValid, false);
    assert.match(checkLower.error || '', /reserved and unavailable/);

    const checkUpper = validateUsername(reserved.toUpperCase());
    assert.equal(checkUpper.isValid, false);

    const checkMixed = validateUsername(reserved[0].toUpperCase() + reserved.slice(1));
    assert.equal(checkMixed.isValid, false);
  }
});

// 4. Correct resolution of usernames to accounts
runTest('4. Correct resolution of usernames to accounts', () => {
  const res1 = simulateResolveAccount('elena_r');
  assert.equal(res1.isUsername, true);
  assert.equal(res1.email, 'elena@enterprise.com');
  assert.equal(res1.uid, 'uid-elena-01');

  const res2 = simulateResolveAccount('ELENA_R');
  assert.equal(res2.email, 'elena@enterprise.com');

  const res3 = simulateResolveAccount('marcus_v');
  assert.equal(res3.email, 'marcus@globalfreight.org');
});

// 5. Successful login using a valid username
runTest('5. Successful login using a valid username', () => {
  const result = simulateLogin('elena_r', 'SecurePass1!', { isDev: true });
  assert.equal(result.success, true);
  assert.ok(result.user);
  assert.equal(result.user?.email, 'elena@enterprise.com');
  assert.equal(result.user?.uid, 'uid-elena-01');

  const casedResult = simulateLogin('Elena_R', 'SecurePass1!', { isDev: true });
  assert.equal(casedResult.success, true);
});

// 6. Successful login using a valid email
runTest('6. Successful login using a valid email', () => {
  const result = simulateLogin('elena@enterprise.com', 'SecurePass1!', { isDev: true });
  assert.equal(result.success, true);
  assert.ok(result.user);
  assert.equal(result.user?.email, 'elena@enterprise.com');

  const result2 = simulateLogin('marcus@globalfreight.org', 'OrionControl2026!', { isDev: true });
  assert.equal(result2.success, true);
  assert.equal(result2.user?.email, 'marcus@globalfreight.org');
});

// 7. Appropriate error handling for invalid passwords
runTest('7. Appropriate error handling for invalid passwords', () => {
  const result = simulateLogin('elena_r', 'WrongPassword999!', { isDev: true });
  assert.equal(result.success, false);
  assert.match(result.error || '', /Invalid username\/email or password/);

  const emailResult = simulateLogin('elena@enterprise.com', 'IncorrectPassword', { isDev: true });
  assert.equal(emailResult.success, false);
  assert.match(emailResult.error || '', /Invalid username\/email or password/);
});

// 8. Appropriate error handling for non-existent usernames
runTest('8. Appropriate error handling for non-existent usernames', () => {
  const result = simulateLogin('non_existent_user_404', 'SomePassword123!', { isDev: true });
  assert.equal(result.success, false);
  assert.match(result.error || '', /Invalid username\/email or password/);
});

// 9. Persistent storage of remembered usernames across sessions
runTest('9. Persistent storage of remembered usernames across sessions', () => {
  const storage = new MockStorage();
  assert.equal(getRememberedUsername(storage), null);

  saveRememberedUsername('alex_hunter', storage);
  assert.equal(storage.getItem(REMEMBERED_USERNAME_STORAGE_KEY), 'alex_hunter');
  assert.equal(getRememberedUsername(storage), 'alex_hunter');

  const restored = getRememberedUsername(storage);
  assert.equal(restored, 'alex_hunter');
});

// 10. Clearing of remembered usernames upon request
runTest('10. Clearing of remembered usernames upon request', () => {
  const storage = new MockStorage();
  saveRememberedUsername('operator_7', storage);
  assert.equal(getRememberedUsername(storage), 'operator_7');

  clearRememberedUsername(storage);
  assert.equal(storage.getItem(REMEMBERED_USERNAME_STORAGE_KEY), null);
  assert.equal(getRememberedUsername(storage), null);
});

// 11. Local development admin login with admin / admin
runTest('11. Local development admin login with admin / admin', () => {
  const result = simulateLogin('admin', 'admin', { isDev: true });
  assert.equal(result.success, true);
  assert.ok(result.user);
  assert.equal(result.user?.role, 'admin');
  assert.equal(result.user?.isAdmin, true);
  assert.equal(result.user?.uid, 'local-dev-admin-uid-01');

  const upperAdmin = simulateLogin('ADMIN', 'admin', { isDev: true });
  assert.equal(upperAdmin.success, true);
  assert.equal(upperAdmin.user?.isAdmin, true);
});

// 12. Rejection of admin / admin in production environments
runTest('12. Rejection of admin / admin in production environments', () => {
  const prodResult = simulateLogin('admin', 'admin', { isDev: false });
  assert.equal(prodResult.success, false);
  assert.match(prodResult.error || '', /strictly prohibited in production/i);
});

// 13. Prevention of privilege escalation via regular user registration
runTest('13. Prevention of privilege escalation via regular user registration', () => {
  const regAdmin = validateSignUp('Attacker', 'admin', 'attacker@domain.com', 'StrongPass1!', 'StrongPass1!');
  assert.equal(regAdmin.isValid, false);
  assert.match(regAdmin.errors.username || '', /reserved/);

  const regRoot = validateSignUp('Attacker', 'root', 'attacker@domain.com', 'StrongPass1!', 'StrongPass1!');
  assert.equal(regRoot.isValid, false);
  assert.match(regRoot.errors.username || '', /reserved/);

  const regSuper = validateSignUp('Attacker', 'superadmin', 'attacker@domain.com', 'StrongPass1!', 'StrongPass1!');
  assert.equal(regSuper.isValid, false);
  assert.match(regSuper.errors.username || '', /reserved/);

  const legitReg = validateSignUp('Legit User', 'supply_analyst', 'analyst@company.com', 'StrongPass1!', 'StrongPass1!');
  assert.equal(legitReg.isValid, true);
});

// 14. Password reset initiation using a username
runTest('14. Password reset initiation using a username', () => {
  const result = simulatePasswordReset('elena_r');
  assert.equal(result.success, true);
  assert.equal(result.resolvedTargetEmail, 'elena@enterprise.com');
  assert.match(result.message, /instructions have been sent/);

  const nonExistent = simulatePasswordReset('unknown_user_999');
  assert.equal(nonExistent.success, true);
  assert.equal(nonExistent.resolvedTargetEmail, undefined);
  assert.match(nonExistent.message, /instructions have been sent/);
});

// 15. Password reset initiation using an email address
runTest('15. Password reset initiation using an email address', () => {
  const result = simulatePasswordReset('elena@enterprise.com');
  assert.equal(result.success, true);
  assert.equal(result.resolvedTargetEmail, 'elena@enterprise.com');
  assert.match(result.message, /instructions have been sent/);
});

// Execution Summary
console.log('================================================================');
console.log('       ORION-9 AUTHENTICATION UPGRADE AUTOMATED TEST SUITE      ');
console.log('================================================================');
let passed = 0;
let failed = 0;

for (const t of tests) {
  try {
    t.fn();
    console.log(`[PASS] ${t.name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${t.name}:`, err.message);
    failed++;
  }
}

console.log('================================================================');
console.log(`Summary: ${passed} passed, ${failed} failed (Total: ${tests.length})`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}
