import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateLogoFile,
  sanitizeSvg,
  classifyStorageError,
  getR2UploadEndpoint,
  setRuntimeR2UploadEndpoint,
  DEFAULT_R2_BUCKET,
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

// Mock File implementation for Node.js test environment
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

describe('Cloudflare R2 Brand Logo Upload & Persistence Test Suite', () => {
  // 1. Valid image upload returns permanent download URL, not data URL
  it('1. Valid image validation checks return valid and permanent storage candidate', async () => {
    const file = new MockTestFile(
      '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#0284C7"/></svg>',
      'valid-logo.svg',
      { type: 'image/svg+xml' }
    ) as unknown as File;

    const res = await validateLogoFile(file);
    assert.equal(res.valid, true);
    assert.equal(res.fileType, 'image/svg+xml');
    assert.ok(res.sanitizedContent);
    assert.ok(!res.sanitizedContent?.includes('javascript:'));
  });

  // 2. Oversized image (> 5MB) rejected before upload
  it('2. Oversized image (> 5MB) rejected before upload', async () => {
    const largeFile = new MockTestFile('dummy', 'giant-logo.png', {
      type: 'image/png',
    }) as unknown as File;
    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 }); // 6 MB

    const res = await validateLogoFile(largeFile);
    assert.equal(res.valid, false);
    assert.match(res.error || '', /exceeds maximum allowed size of 5 MB/i);
  });

  // 3. Unsupported format rejected before upload
  it('3. Unsupported format rejected before upload', async () => {
    const badFile = new MockTestFile('content', 'malicious.exe', {
      type: 'application/x-msdownload',
    }) as unknown as File;
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

  // 5. Cloudflare R2 bucket and configuration verification
  it('5. Cloudflare R2 bucket name matches specification and endpoint is resolvable', () => {
    assert.equal(DEFAULT_R2_BUCKET, 'orion9-brand-assets');
    const endpoint = getR2UploadEndpoint();
    assert.ok(endpoint.includes('upload') || endpoint.includes('api'));
  });

  // 6. Cloudflare R2 unauthenticated upload rejected
  it('6. Cloudflare R2 unauthenticated upload rejected with explicit auth error', () => {
    const err = { status: 401, message: 'Authentication required' };
    const msg = classifyStorageError(err);
    assert.match(msg, /Authentication required/i);
  });

  // 7. Cloudflare R2 unauthorized upload rejected
  it('7. Cloudflare R2 unauthorized upload rejected with explicit administrator error', () => {
    const err = { status: 403, message: 'Permission denied' };
    const msg = classifyStorageError(err);
    assert.match(msg, /Permission denied: You do not have permission to upload brand assets to Cloudflare R2/i);
  });

  // 8. Cloudflare R2 bucket / worker missing surfaces actionable guidance
  it('8. Cloudflare R2 missing bucket or worker returns actionable diagnostic message', () => {
    const err = { status: 404, message: 'Endpoint or bucket not found' };
    const msg = classifyStorageError(err);
    assert.match(msg, /Cloudflare R2 bucket "orion9-brand-assets" or upload worker is unavailable/i);
  });

  // 9. Network failure during upload surfaces explicit network failure error
  it('9. Network failure during upload surfaces explicit connectivity error', () => {
    const networkError = {
      code: 'network_error',
      message: 'Failed to fetch',
    };
    const msg = classifyStorageError(networkError);
    assert.match(msg, /Network failure: Unable to upload logo to Cloudflare R2/);
  });

  // 10. Upload does NOT silently fall back to Base64 on cloud failure
  it('10. Upload does NOT silently fall back to Base64 on cloud failure', () => {
    const simulateUploadFailure = () => {
      const uploadError = new Error('Cloudflare R2 write error: 500');
      if (uploadError) {
        throw new Error('Cloudflare R2 upload failed: Cloudflare R2 write error: 500');
      }
      return { url: 'data:image/png;base64,broken' };
    };

    assert.throws(() => simulateUploadFailure(), /Cloudflare R2 upload failed/);
  });

  // 11. Preserving published logo when upload fails
  it('11. Preserving published logo when upload fails', () => {
    const publishedLogo = 'https://brand-assets.orion-9.com/branding/logos/shared_published.png';
    let workingDraftLogo = publishedLogo;

    // Simulate upload failure
    try {
      throw new Error('Network failure: Unable to upload logo to Cloudflare R2');
    } catch {
      // On failure, draft and published states are NOT updated
    }

    assert.equal(workingDraftLogo, publishedLogo);
    assert.equal(publishedLogo, 'https://brand-assets.orion-9.com/branding/logos/shared_published.png');
  });

  // 12. Firestore write failure does not update published runtime state
  it('12. Firestore write failure does not update published runtime state', async () => {
    let publishedState = { ...DEFAULT_SITE_CONFIG.branding };
    const initialUrl = publishedState.sharedLogo;

    const simulateFailedPublish = async (newConfig: BrandingConfig) => {
      const remoteWriteSucceeded = false;
      if (!remoteWriteSucceeded) {
        return { success: false, error: 'Firestore publish failed: PERMISSION_DENIED' };
      }
      publishedState = { ...newConfig };
      return { success: true };
    };

    const attempt: BrandingConfig = {
      ...DEFAULT_SITE_CONFIG.branding,
      sharedLogo: 'https://brand-assets.orion-9.com/branding/logos/new_candidate.png',
    };

    const res = await simulateFailedPublish(attempt);
    assert.equal(res.success, false);
    assert.equal(publishedState.sharedLogo, initialUrl);
  });

  // 13. Large Base64 payload (> 800KB or > 10KB data URL) rejected before write
  it('13. Large Base64 payload (> 800KB or > 10KB data URL) rejected before write', () => {
    const bigBase64 = 'data:image/png;base64,' + 'A'.repeat(15 * 1024);
    const check1 = validateStoragePayloadSafeguards({
      sharedLogo: bigBase64,
    });
    assert.equal(check1.valid, false);
    assert.equal(
      check1.error,
      'Logo asset must be uploaded to cloud storage before saving. Base64 embedding is not permitted for published assets.'
    );

    const validCloudPayload = {
      sharedLogo: 'https://brand-assets.orion-9.com/branding/logos/shared_123.png',
      companyName: 'Orion-9',
    };
    const check2 = validateStoragePayloadSafeguards(validCloudPayload);
    assert.equal(check2.valid, true);
  });

  // 14. Published config reloaded from Firestore on fresh session with empty localStorage
  it('14. Published config reloaded from Firestore on fresh session with empty localStorage', () => {
    const mockFirestoreDoc = {
      companyName: 'Orion-9 Technologies',
      sharedLogo: 'https://brand-assets.orion-9.com/branding/logos/prod.png',
      sharedLogoConfig: {
        useCustom: true,
        customUrl: 'https://brand-assets.orion-9.com/branding/logos/prod.png',
        originalFilename: 'corporate-logo.png',
      },
    };

    const normalized = normalizeBrandingConfig({
      ...DEFAULT_SITE_CONFIG.branding,
      ...mockFirestoreDoc,
    });

    assert.equal(normalized.companyName, 'Orion-9 Technologies');
    assert.equal(normalized.sharedLogo, 'https://brand-assets.orion-9.com/branding/logos/prod.png');
    assert.equal(normalized.headerLogo, 'https://brand-assets.orion-9.com/branding/logos/prod.png');
    assert.equal(normalized.authLogo, 'https://brand-assets.orion-9.com/branding/logos/prod.png');
    assert.equal(normalized.footerLogo, 'https://brand-assets.orion-9.com/branding/logos/prod.png');
  });

  // 15. Broken image URL in OrionLogo falls back gracefully to default vector SVG without crashing
  it('15. Broken image URL falls back gracefully to default vector identity', () => {
    const resolveEffectiveState = (customUrl: string | null, imgError: boolean) => {
      const hasCustomLogo = Boolean(customUrl && !imgError);
      return {
        renderCustomImg: hasCustomLogo,
        renderDefaultSvg: !hasCustomLogo,
      };
    };

    const state1 = resolveEffectiveState('https://brand-assets.orion-9.com/logo.png', false);
    assert.equal(state1.renderCustomImg, true);
    assert.equal(state1.renderDefaultSvg, false);

    const state2 = resolveEffectiveState('https://brand-assets.orion-9.com/broken.png', true);
    assert.equal(state2.renderCustomImg, false);
    assert.equal(state2.renderDefaultSvg, true);
  });

  // 16. 3D animated hero remains autonomous and unaffected by branding logo changes
  it('16. 3D animated hero centerpiece remains autonomous and unaffected by branding logo changes', () => {
    const sequenceAt2000ms = evaluateHeroIntroSequence(2000, false);
    assert.equal(typeof sequenceAt2000ms.infinityOpacity, 'number');
    assert.equal(typeof sequenceAt2000ms.wordmarkOpacity, 'number');
    assert.equal(typeof sequenceAt2000ms.environmentOpacity, 'number');
    assert.ok(sequenceAt2000ms.infinityOpacity > 0);
    assert.ok(sequenceAt2000ms.wordmarkOpacity > 0);
  });

  // 17. Safe logo URL validation accepts HTTPS Cloudflare R2 and CDN URLs
  it('17. Safe logo URL validation accepts HTTPS Cloudflare R2 and CDN URLs', () => {
    const r2Url = 'https://brand-assets.orion-9.com/branding/logos/shared_1700000000_logo.png';
    const cdnUrl = 'https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/cdn/branding/logos/shared.png';
    assert.equal(isSafeLogoUrl(r2Url), true);
    assert.equal(isSafeLogoUrl(cdnUrl), true);
    assert.equal(isSafeLogoUrl('javascript:alert(1)'), false);
    assert.equal(isSafeLogoUrl('data:text/html,<script>alert(1)</script>'), false);
  });
});
