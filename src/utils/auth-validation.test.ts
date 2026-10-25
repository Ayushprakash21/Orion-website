import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidDestinationUrl,
  resolveLaunchUrl,
  validateEmail,
  validatePassword,
  validateSignUp,
  DEFAULT_ORION_APP_URL,
} from './auth-validation';

test('destination validation approves canonical Orion-9 live URL', () => {
  assert.equal(isValidDestinationUrl(DEFAULT_ORION_APP_URL), true);
  assert.equal(isValidDestinationUrl('https://orion-9.ayushprakash0021.workers.dev/dashboard'), true);
});

test('destination validation rejects untrusted or malicious URLs', () => {
  assert.equal(isValidDestinationUrl('javascript:alert(1)'), false);
  assert.equal(isValidDestinationUrl('data:text/html,<script>'), false);
  assert.equal(isValidDestinationUrl('https://evil-phishing-site.com/orion'), false);
  assert.equal(isValidDestinationUrl('ftp://orion-9.ayushprakash0021.workers.dev/'), false);
  assert.equal(isValidDestinationUrl(''), false);
});

test('resolveLaunchUrl falls back safely when untrusted URL is provided', () => {
  const result = resolveLaunchUrl('https://malicious-redirect.com/steal-creds');
  assert.equal(result.isTrusted, false);
  assert.equal(result.url, DEFAULT_ORION_APP_URL);
  assert.match(result.reason || '', /not on the trusted/);
});

test('email validation checks format accurately', () => {
  assert.equal(validateEmail('ops.director@supplychain.com').isValid, true);
  assert.equal(validateEmail('not-an-email').isValid, false);
  assert.equal(validateEmail('').isValid, false);
});

test('password validation enforces length and complexity', () => {
  const short = validatePassword('abc');
  assert.equal(short.isValid, false);

  const lettersOnly = validatePassword('PasswordOnly');
  assert.equal(lettersOnly.isValid, false);

  const strong = validatePassword('OrionControl2026!');
  assert.equal(strong.isValid, true);
  assert.ok(strong.score >= 3);
});

test('validateSignUp catches mismatched passwords and missing fields', () => {
  const mismatched = validateSignUp('Elena Rostova', 'elena@orion9.io', 'SecurePass1!', 'DifferentPass2!');
  assert.equal(mismatched.isValid, false);
  assert.equal(mismatched.errors.confirmPassword, 'Passwords do not match.');

  const valid = validateSignUp('Elena Rostova', 'elena@orion9.io', 'SecurePass1!', 'SecurePass1!');
  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});
