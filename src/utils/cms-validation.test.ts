import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isSafeCmsUrl,
  isValidHexColor,
  sanitizeCmsText,
  validateBrandingConfig,
  validateNavigationConfig,
  validateHomepageConfig,
  validateSeoConfig,
} from './cms-validation';
import { DEFAULT_SITE_CONFIG } from '../data/defaultSiteConfig';

test('isSafeCmsUrl allows https, localhost, anchors, and relative paths while rejecting dangerous protocols', () => {
  assert.equal(isSafeCmsUrl('https://orion-9.ayushprakash0021.workers.dev/'), true);
  assert.equal(isSafeCmsUrl('#architecture'), true);
  assert.equal(isSafeCmsUrl('/login'), true);
  assert.equal(isSafeCmsUrl('http://localhost:3000/admin'), true);

  assert.equal(isSafeCmsUrl('javascript:alert(1)'), false);
  assert.equal(isSafeCmsUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isSafeCmsUrl('//evil.example.com'), false);
  assert.equal(isSafeCmsUrl('http://insecure.example.com'), false);
});

test('isValidHexColor enforces 6-digit hex color tokens', () => {
  assert.equal(isValidHexColor('#EAF4F8'), true);
  assert.equal(isValidHexColor('#101820'), true);
  assert.equal(isValidHexColor('#FFF'), false);
  assert.equal(isValidHexColor('rgb(0,0,0)'), false);
});

test('sanitizeCmsText strips script and HTML tags and enforces length limits', () => {
  const dirty = '  Orion-9 <script>alert("xss")</script><b>Control Tower</b>  ';
  assert.equal(sanitizeCmsText(dirty, 100), 'Orion-9 Control Tower');
});

test('DEFAULT_SITE_CONFIG passes all CMS section validators', () => {
  assert.equal(validateBrandingConfig(DEFAULT_SITE_CONFIG.branding).valid, true);
  assert.equal(validateNavigationConfig(DEFAULT_SITE_CONFIG.navigation).valid, true);
  assert.equal(validateHomepageConfig(DEFAULT_SITE_CONFIG.homepage).valid, true);
  assert.equal(validateSeoConfig(DEFAULT_SITE_CONFIG.seo).valid, true);
});
