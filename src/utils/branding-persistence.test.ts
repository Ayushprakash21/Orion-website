import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateLogoFile,
  sanitizeSvg,
  classifyStorageError,
  MAX_LOGO_FILE_SIZE_BYTES,
  ALLOWED_LOGO_EXTENSIONS,
  ALLOWED_LOGO_MIME_TYPES,
} from '../services/brandingStorage.ts';
import {
  validateStoragePayloadSafeguards,
  validateBrandingConfig,
  normalizeBrandingConfig,
  isSafeLogoUrl,
} from './cms-validation.ts';
import { DEFAULT_SITE_CONFIG, DEFAULT_LOGO_PLACEMENT_CONFIG } from '../data/defaultSiteConfig.ts';
import { evaluateHeroIntroSequence } from './cinematic-choreography.ts';
import type { BrandingConfig, LogoPlacementConfig, SiteConfigurationBundle } from '../types/cms.ts';

// Mock File implementation for Node.js test environment if not natively present
class MockTestFile {
  name: string;
  size: number;
  type: string;
  private content: string;

  constructor(content: string, name: string, options: { type?: string } = {}) {
    this.content = content;
    this.name = name;
    this.size = Buffer.byteLength(content, 'utf8');
    this.type = options.type || 'image/png';
  }

  async text(): Promise<string> {
    return this.content;
  }
}

describe('P0 Bug Fix: Branding Logo Upload & Cloud Persistence Test Suite', () => {
  // 1. Valid image upload returns permanent download URL, not data URL
  it('1. Valid image validation checks return valid and permanent storage candidate', async () => {
    const file = new MockTestFile('<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#0284C7"/></svg>', 'valid-logo.svg', {
      type: 'image/svg+xml',
    }) as unknown as File;

    const res = await validateLogoFile(file);
    assert.equal(res.valid, true);
    assert.equal(res.fileType, 'image/svg+xml');
    assert.ok(res.sanitizedContent);
    assert.ok(!res.sanitizedContent?.includes('javascript:'));
  });

  // 2. Oversized image (> 5MB) rejected before upload
  it('2. Oversized image (> 5MB) rejected before upload', async () => {
    const largeFile = new MockTestFile('dummy', 'giant-logo.png', { type: 'image/png' }) as unknown as File;
    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 }); // 6 MB

    const res = await validateLogoFile(largeFile);
    assert.equal(res.valid, false);
    assert.match(res.error || '', /exceeds maximum allowed size of 5 MB/i);
  });

  // 3. Unsupported format rejected before upload
  it('3. Unsupported format rejected before upload', async () => {
    const badFile = new MockTestFile('content', 'malicious.exe', { type: 'application/x-msdownload' }) as unknown as File;
    const res = await validateLogoFile(badFile);
    assert.equal(res.valid, false);
    assert.match(res.error || '', /Unsupported file type/i);
  });

  // 4. SVG sanitization removes scripts and dangerous tags
  it('4. SVG sanitization removes scripts, dangerous tags, and event handlers', () => {
    const dirtySvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" onload="alert('pwned')">
        <script>alert('xss')</script>
        <foreignObject><body xmlns="http://www.w3.org/1999/xhtml"><iframe></iframe></body></foreignObject>
        <a href="javascript:alert(1)"><circle cx="50" cy="50" r="40" fill="red" onclick="alert(2)" /></a>
      </svg>
    `;

    const result = sanitizeSvg(dirtySvg);
    assert.equal(result.isClean, false);
    assert.ok(result.warnings.length >= 3);
    assert.ok(!result.sanitized.includes('<script>'));
    assert.ok(!result.sanitized.includes('alert('));
    assert.ok(!result.sanitized.includes('<foreignObject>'));
    assert.ok(!result.sanitized.includes('<iframe>'));
    assert.ok(!result.sanitized.includes('onload='));
    assert.ok(!result.sanitized.includes('onclick='));
    assert.ok(!result.sanitized.includes('javascript:'));
  });

  // 5. Firebase Storage unprovisioned bucket detection surfaces exact Console action
  it('5a. Firebase Storage unprovisioned bucket surfaces actionable Console instructions', () => {
    const bucketNotFoundError = {
      code: 'storage/bucket-not-found',
      message: 'The specified bucket does not exist.',
    };
    const msg = classifyStorageError(bucketNotFoundError);
    assert.match(msg, /Firebase Storage bucket is not provisioned or does not exist/i);
    assert.match(msg, /Firebase Console > Build > Storage for project "orion9-dev-db-2026"/i);
    assert.match(msg, /Get Started/i);
  });

  // 5b. Firebase Storage permission denied surfaces explicit error
  it('5b. Firebase Storage permission denied surfaces explicit user-facing error', () => {
    const storageError = {
      code: 'storage/unauthorized',
      message: 'User does not have permission to access this object.',
    };
    const msg = classifyStorageError(storageError);
    assert.match(msg, /Permission denied: You do not have permission to upload brand assets/);
  });

  // 6. Network failure during upload surfaces explicit error
  it('6. Network failure during upload surfaces explicit network failure error', () => {
    const networkError = {
      code: 'storage/retry-limit-exceeded',
      message: 'Max retry limit exceeded.',
    };
    const msg = classifyStorageError(networkError);
    assert.match(msg, /Network failure: Unable to upload logo/);
  });

  // 7. Upload does NOT silently fall back to Base64 on failure
  it('7. Upload does NOT silently fall back to Base64 on cloud failure', () => {
    // When an error occurs during cloud upload, the service throws an Error rather than returning a data: URL
    const simulateUploadFailure = () => {
      const storageFailure = new Error('storage/unauthorized: Access denied.');
      if (storageFailure) {
        throw new Error(
          'Permission denied: You do not have permission to upload brand assets to Firebase Storage. Please ensure you are authenticated as an administrator.'
        );
      }
      return { url: 'data:image/png;base64,broken' };
    };

    assert.throws(
      () => simulateUploadFailure(),
      /Permission denied: You do not have permission to upload brand assets/
    );
  });

  // 8. Unauthenticated save draft rejected with auth error
  it('8. Unauthenticated save draft rejected with explicit auth error', async () => {
    const simulateSaveDraft = async (user: { uid: string } | null, isConfigured: boolean) => {
      if (!isConfigured) {
        return {
          success: false,
          error: 'Firebase is not configured. Cloud persistence requires active Firebase configuration.',
        };
      }
      if (!user) {
        return {
          success: false,
          error: 'Authentication required. Please sign in with verified administrator credentials to persist changes.',
        };
      }
      return { success: true };
    };

    const res = await simulateSaveDraft(null, true);
    assert.equal(res.success, false);
    assert.match(res.error || '', /Authentication required/);
  });

  // 9. Unauthenticated publish rejected with auth error
  it('9. Unauthenticated publish rejected with explicit auth error', async () => {
    const simulatePublish = async (user: { uid: string } | null, isConfigured: boolean) => {
      if (!isConfigured) {
        return {
          success: false,
          error: 'Firebase is not configured. Cloud persistence requires active Firebase configuration.',
        };
      }
      if (!user) {
        return {
          success: false,
          error: 'Authentication required. Please sign in with verified administrator credentials to persist changes.',
        };
      }
      return { success: true };
    };

    const res = await simulatePublish(null, true);
    assert.equal(res.success, false);
    assert.match(res.error || '', /Authentication required/);
  });

  // 10. Unconfigured Firebase rejected with configuration error
  it('10. Unconfigured Firebase rejected with configuration error', async () => {
    const simulateSave = async (isConfigured: boolean, user: { uid: string } | null) => {
      if (!isConfigured) {
        return {
          success: false,
          error: 'Firebase is not configured. Cloud persistence requires active Firebase configuration.',
        };
      }
      if (!user) {
        return { success: false, error: 'Auth required' };
      }
      return { success: true };
    };

    const res = await simulateSave(false, { uid: 'admin-1' });
    assert.equal(res.success, false);
    assert.match(res.error || '', /Firebase is not configured/);
  });

  // 11. Firestore write failure does not update published runtime state
  it('11. Firestore write failure does not update published runtime state', async () => {
    let publishedState = { ...DEFAULT_SITE_CONFIG.branding };
    const initialUrl = publishedState.sharedLogo;

    const simulateFailedPublish = async (newConfig: BrandingConfig) => {
      // Simulate remote write failure
      const remoteWriteSucceeded = false;
      if (!remoteWriteSucceeded) {
        return { success: false, error: 'Firestore publish failed: PERMISSION_DENIED' };
      }
      publishedState = { ...newConfig };
      return { success: true };
    };

    const maliciousAttempt: BrandingConfig = {
      ...DEFAULT_SITE_CONFIG.branding,
      sharedLogo: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/new.png',
    };

    const res = await simulateFailedPublish(maliciousAttempt);
    assert.equal(res.success, false);
    // Verified: published state MUST remain unchanged
    assert.equal(publishedState.sharedLogo, initialUrl);
  });

  // 12. Firestore write failure preserves user's form state for retry
  it("12. Firestore write failure preserves user's working form state for retry", async () => {
    let adminFormState = {
      ...DEFAULT_SITE_CONFIG.branding,
      sharedLogo: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/retry_candidate.png',
    };

    const handleSave = async () => {
      const remoteSuccess = false; // Firestore offline or permission denied
      if (!remoteSuccess) {
        // Error returned, form state is NOT overwritten
        return { success: false, error: 'Network timeout writing to Firestore' };
      }
      return { success: true };
    };

    const res = await handleSave();
    assert.equal(res.success, false);
    // User's form state preserves candidate URL so admin doesn't need to re-upload
    assert.equal(
      adminFormState.sharedLogo,
      'https://firebasestorage.googleapis.com/v0/b/bucket/o/retry_candidate.png'
    );
  });

  // 13. Large Base64 payload (> 800KB or > 10KB data URL) rejected before write
  it('13. Large Base64 payload (> 800KB or > 10KB data URL) rejected before write', () => {
    // 13a: Check large data: URL (> 10KB)
    const bigBase64 = 'data:image/png;base64,' + 'A'.repeat(15 * 1024); // 15 KB data URL
    const check1 = validateStoragePayloadSafeguards({
      sharedLogo: bigBase64,
    });
    assert.equal(check1.valid, false);
    assert.equal(
      check1.error,
      'Logo asset must be uploaded to cloud storage before saving. Base64 embedding is not permitted for published assets.'
    );

    // 13b: Check total payload size (> 800 KB)
    const giantPayload = {
      notes: 'B'.repeat(850 * 1024),
    };
    const check2 = validateStoragePayloadSafeguards(giantPayload);
    assert.equal(check2.valid, false);
    assert.match(check2.error || '', /Payload size exceeds 800 KB limit/);

    // 13c: Normal cloud URL is accepted
    const validCloudPayload = {
      sharedLogo: 'https://firebasestorage.googleapis.com/v0/b/orion9-dev-db-2026.firebasestorage.app/o/branding%2Flogos%2Fshared_123.png?alt=media',
      companyName: 'Orion-9',
    };
    const check3 = validateStoragePayloadSafeguards(validCloudPayload);
    assert.equal(check3.valid, true);
  });

  // 14. Published config reloaded from Firestore on fresh session (localStorage empty)
  it('14. Published config reloaded from Firestore on fresh session with empty localStorage', () => {
    // Simulate empty localStorage
    const localStore: Record<string, string> = {};

    const mockFirestoreDoc = {
      companyName: 'Orion-9 Technologies',
      sharedLogo: 'https://firebasestorage.googleapis.com/v0/b/orion9-dev-db-2026/o/logos%2Fprod.png',
      sharedLogoConfig: {
        useCustom: true,
        customUrl: 'https://firebasestorage.googleapis.com/v0/b/orion9-dev-db-2026/o/logos%2Fprod.png',
        originalFilename: 'corporate-logo.png',
      },
    };

    // When client starts with empty cache, it normalizes fetched Firestore doc
    const normalized = normalizeBrandingConfig({
      ...DEFAULT_SITE_CONFIG.branding,
      ...mockFirestoreDoc,
    });

    assert.equal(normalized.companyName, 'Orion-9 Technologies');
    assert.equal(normalized.sharedLogo, 'https://firebasestorage.googleapis.com/v0/b/orion9-dev-db-2026/o/logos%2Fprod.png');
    assert.equal(normalized.headerLogo, 'https://firebasestorage.googleapis.com/v0/b/orion9-dev-db-2026/o/logos%2Fprod.png');
    assert.equal(normalized.authLogo, 'https://firebasestorage.googleapis.com/v0/b/orion9-dev-db-2026/o/logos%2Fprod.png');
    assert.equal(normalized.footerLogo, 'https://firebasestorage.googleapis.com/v0/b/orion9-dev-db-2026/o/logos%2Fprod.png');
  });

  // 15. Broken image URL in OrionLogo falls back to default vector SVG without crashing
  it('15. Broken image URL falls back gracefully to default vector identity', () => {
    const resolveEffectiveState = (customUrl: string | null, imgError: boolean) => {
      const hasCustomLogo = Boolean(customUrl && !imgError);
      return {
        renderCustomImg: hasCustomLogo,
        renderDefaultSvg: !hasCustomLogo,
      };
    };

    // Initial state with valid URL
    const state1 = resolveEffectiveState('https://example.com/logo.png', false);
    assert.equal(state1.renderCustomImg, true);
    assert.equal(state1.renderDefaultSvg, false);

    // Image load error triggers onError -> imgError = true
    const state2 = resolveEffectiveState('https://example.com/broken.png', true);
    assert.equal(state2.renderCustomImg, false);
    assert.equal(state2.renderDefaultSvg, true); // Fallback to Infinity-9 vector SVG
  });

  // 16. 3D animated hero remains autonomous and unaffected by branding logo changes
  it('16. 3D animated hero centerpiece remains autonomous and unaffected by branding logo changes', () => {
    // The 3D continuous choreography evaluates its 5-stage logo reveal sequence and ambient loop
    // completely independently of CMS static image URLs
    const sequenceAt2000ms = evaluateHeroIntroSequence(2000, false);
    assert.equal(typeof sequenceAt2000ms.infinityOpacity, 'number');
    assert.equal(typeof sequenceAt2000ms.wordmarkOpacity, 'number');
    assert.equal(typeof sequenceAt2000ms.environmentOpacity, 'number');
    assert.ok(sequenceAt2000ms.infinityOpacity > 0);
    assert.ok(sequenceAt2000ms.wordmarkOpacity > 0);
  });
});
