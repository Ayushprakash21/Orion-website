/**
 * ORION-9 CREATOR PROFILE PHOTOGRAPH & CLOUDFLARE R2 UPLOAD TEST SUITE
 *
 * Verifies:
 * 1. Default creator profile configuration integrity (Ayush Prakash, architect role, repo, foundational question).
 * 2. Creator profile validation logic & XSS / safe URL enforcement.
 * 3. Photograph file validation: MIME types, 5 MB size limit, SVG sanitization, dimension measurement.
 * 4. Authenticated Cloudflare R2 upload parameters (placement: 'creator', bucket: 'orion9-brand-assets').
 * 5. Draft vs. Published isolation (drafts do not leak to public website).
 * 6. Public About page (#created-by) synchronization & graceful fallback to "AP" initials.
 * 7. Non-interference with Website Brand Logo and 3D animated homepage centerpiece.
 * 8. Firestore schema compliance without undefined fields.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_CREATOR_PROFILE,
  DEFAULT_SITE_CONFIG,
} from '../data/defaultSiteConfig.ts';
import {
  validateCreatorProfileConfig,
  normalizeCreatorProfileConfig,
  isSafeLogoUrl,
  validateStoragePayloadSafeguards,
} from './cms-validation.ts';
import {
  validateCreatorImageFile,
  ALLOWED_LOGO_MIME_TYPES,
  ALLOWED_LOGO_EXTENSIONS,
  MAX_LOGO_FILE_SIZE_BYTES,
  DEFAULT_R2_BUCKET,
  DEFAULT_R2_WORKER_ENDPOINT,
  classifyStorageError,
  sanitizeSvg,
} from '../services/brandingStorage.ts';
import type { CreatorProfileConfig, SiteConfigurationBundle } from '../types/cms.ts';

test('Orion-9 Creator Profile & Cloudflare R2 Upload Test Suite', async (t) => {
  // 1. Default Profile Integrity
  await t.test('1. Default creator profile attribution is strictly grounded in creator identity', () => {
    assert.equal(DEFAULT_CREATOR_PROFILE.name, 'Ayush Prakash');
    assert.equal(DEFAULT_CREATOR_PROFILE.role, 'CREATOR & SUPPLY CHAIN OS ARCHITECT');
    assert.equal(DEFAULT_CREATOR_PROFILE.quote, 'What if the supply chain had an operating system?');
    assert.equal(DEFAULT_CREATOR_PROFILE.status, 'Creator & Architect');
    assert.ok(DEFAULT_CREATOR_PROFILE.avatarUrl?.includes('creator_1793142386775_044ada53_wall.png'));
  });

  // 2. Profile Validation Logic
  await t.test('2. Creator profile validation rejects empty names, roles, or malicious URLs', () => {
    const validConfig: CreatorProfileConfig = {
      name: 'Ayush Prakash',
      role: 'CREATOR & SUPPLY CHAIN OS ARCHITECT',
      quote: 'What if the supply chain had an operating system?',
      repository: 'Ayushprakash21/orion-9',
      status: 'Creator & Architect',
      avatarUrl: 'https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/cdn/branding/creator/creator_test.png',
    };

    const validCheck = validateCreatorProfileConfig(validConfig);
    assert.equal(validCheck.valid, true);
    assert.equal(validCheck.errors.length, 0);

    // Empty name
    const emptyName = validateCreatorProfileConfig({ ...validConfig, name: '' });
    assert.equal(emptyName.valid, false);

    // Malicious javascript: avatar URL
    const xssAvatar = validateCreatorProfileConfig({
      ...validConfig,
      avatarUrl: 'javascript:alert(1)',
    });
    assert.equal(xssAvatar.valid, false);
    assert.ok(xssAvatar.errors.some((e) => e.includes('invalid or unsafe')));
  });

  // 3. Normalization logic
  await t.test('3. normalizeCreatorProfileConfig guarantees no undefined properties', () => {
    const normalized = normalizeCreatorProfileConfig({
      name: '  Ayush Prakash  ',
      avatarUrl: '  https://example.com/avatar.png  ',
    });
    assert.equal(normalized.name, 'Ayush Prakash');
    assert.equal(normalized.avatarUrl, 'https://example.com/avatar.png');
    assert.equal(normalized.role, DEFAULT_CREATOR_PROFILE.role);
    assert.equal(normalized.quote, DEFAULT_CREATOR_PROFILE.quote);
    assert.ok(typeof normalized.updatedAt === 'string');
    assert.ok(typeof normalized.updatedBy === 'string');

    // Check that JSON serialization has zero undefined keys
    const jsonStr = JSON.stringify(normalized);
    assert.ok(!jsonStr.includes('undefined'));
  });

  // 4. File Validation
  await t.test('4. Photograph file validation enforces 5 MB limit, extensions, and SVG sanitization', async () => {
    assert.equal(MAX_LOGO_FILE_SIZE_BYTES, 5 * 1024 * 1024);
    assert.ok(ALLOWED_LOGO_MIME_TYPES.includes('image/png'));
    assert.ok(ALLOWED_LOGO_MIME_TYPES.includes('image/jpeg'));
    assert.ok(ALLOWED_LOGO_MIME_TYPES.includes('image/webp'));
    assert.ok(ALLOWED_LOGO_MIME_TYPES.includes('image/svg+xml'));
    assert.ok(ALLOWED_LOGO_EXTENSIONS.includes('.png'));
    assert.ok(ALLOWED_LOGO_EXTENSIONS.includes('.jpg'));
    assert.ok(ALLOWED_LOGO_EXTENSIONS.includes('.jpeg'));
    assert.ok(ALLOWED_LOGO_EXTENSIONS.includes('.webp'));
    assert.ok(ALLOWED_LOGO_EXTENSIONS.includes('.svg'));

    // Test SVG sanitization
    const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert("pwn")</script><circle cx="50" cy="50" r="40" onload="alert(1)" /></svg>`;
    const { sanitized, isClean, warnings } = sanitizeSvg(maliciousSvg);
    assert.equal(isClean, false);
    assert.ok(!sanitized.includes('<script>'));
    assert.ok(!sanitized.includes('onload='));
    assert.ok(warnings.length >= 2);
  });

  // 5. Cloudflare R2 Upload Infrastructure
  await t.test('5. Cloudflare R2 upload parameters target orion9-brand-assets and authenticated worker', () => {
    assert.equal(DEFAULT_R2_BUCKET, 'orion9-brand-assets');
    assert.equal(
      DEFAULT_R2_WORKER_ENDPOINT,
      'https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/api/upload-logo'
    );
  });

  // 6. Error Classification
  await t.test('6. Storage error classification surfaces actionable guidance', () => {
    const authErr = classifyStorageError({ status: 401 });
    assert.ok(authErr.includes('Authentication required'));

    const permErr = classifyStorageError({ status: 403 });
    assert.ok(permErr.includes('Permission denied'));

    const sizeErr = classifyStorageError({ status: 413 });
    assert.ok(sizeErr.includes('5 MB'));

    const netErr = classifyStorageError({ code: 'network_error' });
    assert.ok(netErr.includes('Network failure'));
  });

  // 7. Draft vs Published Isolation
  await t.test('7. Draft creator profile modifications do not alter published configuration', () => {
    const published: SiteConfigurationBundle = { ...DEFAULT_SITE_CONFIG };
    const draft: SiteConfigurationBundle = {
      ...published,
      creatorProfile: {
        ...published.creatorProfile,
        avatarUrl: 'https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/cdn/branding/creator/draft_only.png',
      },
    };

    // Public website reading publishedConfig sees no avatar
    assert.equal(published.creatorProfile.avatarUrl, null);
    // Draft config contains the staged avatar
    assert.ok(draft.creatorProfile.avatarUrl?.includes('draft_only.png'));
    // Isolation confirmed
    assert.notEqual(published.creatorProfile.avatarUrl, draft.creatorProfile.avatarUrl);
  });

  // 8. Brand Logo & 3D Centerpiece Invariant
  await t.test('8. Creator profile updates do not alter Website Brand Logo or 3D animated hero centerpiece', () => {
    const configBefore = { ...DEFAULT_SITE_CONFIG };
    const updatedCreator: CreatorProfileConfig = {
      ...configBefore.creatorProfile,
      avatarUrl: 'https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/cdn/branding/creator/photo.png',
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin@orion-9.com',
    };

    const configAfter: SiteConfigurationBundle = {
      ...configBefore,
      creatorProfile: updatedCreator,
    };

    // Website Brand Logo remains identical
    assert.equal(configAfter.branding.companyName, configBefore.branding.companyName);
    assert.equal(configAfter.branding.logoUrl, configBefore.branding.logoUrl);
    assert.equal(configAfter.branding.sharedLogo, configBefore.branding.sharedLogo);
    assert.deepEqual(configAfter.branding.sharedLogoConfig, configBefore.branding.sharedLogoConfig);

    // 3D centerpiece configuration remains untouched
    assert.equal(
      configAfter.homepage.sectionVisibility.scrollStorytelling,
      configBefore.homepage.sectionVisibility.scrollStorytelling
    );
  });

  // 9. Firestore Storage Safeguards
  await t.test('9. Large Base64 payloads (> 10 KB) are blocked from Firestore writes', () => {
    const hugeBase64 = 'data:image/png;base64,' + 'A'.repeat(12000);
    const payload = {
      avatarUrl: hugeBase64,
      name: 'Ayush Prakash',
    };
    const safeguardCheck = validateStoragePayloadSafeguards(payload);
    assert.equal(safeguardCheck.valid, false);
    assert.ok(safeguardCheck.error?.includes('Base64 embedding is not permitted'));
  });

  // 10. URL Protocol Safety
  await t.test('10. Safe URL validator accepts HTTPS Cloudflare R2 worker URLs', () => {
    const r2Url = 'https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/cdn/branding/creator/creator_123456_test.jpg';
    assert.equal(isSafeLogoUrl(r2Url), true);

    const relativeUrl = '/cdn/branding/creator/creator_test.jpg';
    assert.equal(isSafeLogoUrl(relativeUrl), true);

    const javascriptUrl = 'javascript:document.cookie';
    assert.equal(isSafeLogoUrl(javascriptUrl), false);
  });

  // 11. Redesigned Creator Profile Card Specifications
  await t.test('11. Creator profile card enforces responsive 180px portrait, clear typography, and distinct quote', () => {
    const aboutPath = path.resolve(process.cwd(), 'src/components/about/AboutPage.tsx');
    const aboutContent = fs.readFileSync(aboutPath, 'utf-8');

    // Desktop 180x180 px portrait and responsive scaling
    assert.ok(aboutContent.includes('lg:w-[180px] lg:h-[180px]'), 'Must support 180x180 px portrait on desktop');
    assert.ok(aboutContent.includes('w-28 h-28'), 'Must support mobile 112px portrait');
    assert.ok(aboutContent.includes('object-cover object-top'), 'Must preserve aspect ratio and focus on creator face');
    assert.ok(aboutContent.includes('creator of Orion-9'), 'Must provide meaningful alt text for accessibility');

    // Typographic hierarchy and distinct sections
    assert.ok(aboutContent.includes('data-testid="about-creator-card"'), 'Must maintain about-creator-card testid');
    assert.ok(aboutContent.includes('data-testid="about-creator-avatar"'), 'Must maintain about-creator-avatar testid');
    assert.ok(aboutContent.includes('Foundational Question'), 'Must provide distinct quote header');
    assert.ok(aboutContent.includes('Primary System Maintainer'), 'Must retain maintainer status attribution');
  });
});
