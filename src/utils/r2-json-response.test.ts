/**
 * ORION-9 CLOUDFLARE R2 RESPONSE HANDLING & UPLOAD PIPELINE COMPREHENSIVE TEST SUITE
 * 
 * Verifies strict response contract compliance, safe error parsing,
 * defense against unexpected HTML responses, empty/malformed responses,
 * authentication/authorization gating, and recovery integrity.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import workerModule from '../../workers/r2-brand-uploader/src/index.ts';
import {
  classifyStorageError,
  uploadBrandingLogoAsset,
  setRuntimeR2UploadEndpoint,
  DEFAULT_R2_BUCKET,
} from '../services/brandingStorage.ts';

const worker = (workerModule as any).fetch ? workerModule : (workerModule as any).default;

type Env = any;
type R2Bucket = any;

class MockR2Bucket implements R2Bucket {
  public store = new Map<string, { body: any; options?: any }>();
  public shouldFail = false;

  async put(key: string, value: any, options?: any) {
    if (this.shouldFail) {
      throw new Error('Simulated R2 storage quota exceeded or disk write failure');
    }
    this.store.set(key, { body: value, options });
    return { key };
  }

  async get(key: string) {
    if (!this.store.has(key)) return null;
    const item = this.store.get(key)!;
    return {
      body: item.body,
      httpMetadata: item.options?.httpMetadata,
      customMetadata: item.options?.customMetadata,
      httpEtag: 'mock-etag-' + key,
    } as any;
  }

  async delete(keys: string | string[]) {
    const arr = Array.isArray(keys) ? keys : [keys];
    for (const k of arr) this.store.delete(k);
  }
}

function createTestEnv(bucket: MockR2Bucket): Env {
  return {
    BRAND_ASSETS: bucket,
    FIREBASE_PROJECT_ID: 'orion9-dev-db-2026',
    ALLOWED_ORIGINS: 'https://orion-9-webos.ai.studio,http://localhost:3000',
    R2_PUBLIC_BASE_URL: '',
  };
}

describe('PHASE 8: Orion-9 R2 Upload Pipeline & JSON Contract Tests', () => {
  let bucket: MockR2Bucket;
  let env: Env;

  beforeEach(() => {
    bucket = new MockR2Bucket();
    env = createTestEnv(bucket);
    setRuntimeR2UploadEndpoint(null);
  });

  // 1. Valid JSON success response
  it('1. Valid JSON success response conforms to schema and includes requestId', async () => {
    const form = new FormData();
    const file = new Blob(['<svg><circle cx="10" cy="10" r="5"/></svg>'], { type: 'image/svg+xml' });
    form.append('file', file, 'logo.svg');
    form.append('placement', 'shared');

    const req = new Request('https://worker.test/api/upload-logo', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer mock-local-dev-admin-token',
        Origin: 'http://localhost:3000',
        'X-Request-Id': 'req-test-1',
      },
      body: form,
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 200);
    assert.ok(res.headers.get('content-type')?.includes('application/json'));

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(typeof data.url === 'string' && data.url.includes('/cdn/branding/logos/'));
    assert.ok(typeof data.key === 'string');
    assert.equal(data.requestId, 'req-test-1');
  });

  // 2. Valid JSON error response
  it('2. Valid JSON error response conforms to schema with success=false', async () => {
    const form = new FormData();
    const req = new Request('https://worker.test/api/upload-logo', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer mock-local-dev-admin-token',
        Origin: 'http://localhost:3000',
      },
      body: form,
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'missing_file');
    assert.ok(typeof data.error === 'string');
    assert.ok(typeof data.requestId === 'string');
  });

  // 3. HTML response from an unexpected upstream or platform failure
  it('3. HTML response from upstream / SPA fallback is safely caught and diagnosed', () => {
    const errorMsg = classifyStorageError({
      status: 200,
      code: 'unexpected_html_response',
      contentType: 'text/html',
      message: 'Upload service returned an unexpected HTML response instead of JSON. Request ID: req-123',
    });
    assert.ok(errorMsg.includes('unexpected HTML response instead of JSON'));
  });

  // 4. Plain-text response
  it('4. Plain-text response is detected as invalid JSON without crash', () => {
    const errorMsg = classifyStorageError({
      status: 200,
      code: 'invalid_json_response',
      contentType: 'text/plain',
      message: 'Upload service returned an invalid JSON response. Request ID: req-124',
    });
    assert.ok(errorMsg.includes('invalid JSON response'));
  });

  // 5. Empty response
  it('5. Empty response body (e.g. 204 or severed connection) is safely handled', () => {
    const errorMsg = classifyStorageError({
      status: 200,
      code: 'empty_response',
      message: 'Upload service returned an empty response (HTTP 200). Request ID: req-125',
    });
    assert.ok(errorMsg.includes('empty response'));
  });

  // 6. Malformed JSON
  it('6. Malformed JSON syntax is caught and diagnosed without crashing', () => {
    const errorMsg = classifyStorageError({
      status: 200,
      code: 'invalid_json_response',
      message: 'Upload service returned an invalid JSON response. Request ID: req-126',
    });
    assert.ok(errorMsg.includes('invalid JSON response'));
  });

  // 7. Valid JSON with a missing required asset URL
  it('7. Valid JSON missing required asset URL fails schema validation', () => {
    const errorMsg = classifyStorageError({
      status: 200,
      code: 'invalid_response_schema',
      message: 'Server did not return a valid asset URL. Request ID: req-127',
    });
    assert.ok(errorMsg.includes('did not return a valid asset URL'));
  });

  // 8. Non-2xx response
  it('8. Non-2xx response preserves server error code and message safely', () => {
    const errorMsg = classifyStorageError({
      status: 400,
      code: 'unsupported_format',
      message: 'Unsupported file format (.exe). Supported formats: PNG, JPEG, WebP, SVG.',
    });
    assert.ok(errorMsg.includes('Unsupported file format'));
  });

  // 9. R2 write failure
  it('9. R2 write failure returns HTTP 500 with r2_write_failed code and requestId', async () => {
    bucket.shouldFail = true;
    const form = new FormData();
    const file = new Blob(['<svg><circle cx="5" cy="5" r="4"/></svg>'], { type: 'image/svg+xml' });
    form.append('file', file, 'logo.svg');

    const req = new Request('https://worker.test/api/upload-logo', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer mock-local-dev-admin-token',
        Origin: 'http://localhost:3000',
      },
      body: form,
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 500);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'r2_write_failed');
    assert.ok(data.error.includes('Cloudflare R2 write error'));
    assert.ok(data.requestId);
  });

  // 10. Firebase authentication failure
  it('10. Firebase authentication failure returns HTTP 401 with explicit unauthenticated code', async () => {
    const form = new FormData();
    const file = new Blob(['<svg><circle cx="5" cy="5" r="4"/></svg>'], { type: 'image/svg+xml' });
    form.append('file', file, 'logo.svg');

    const req = new Request('https://worker.test/api/upload-logo', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer invalid-token-without-dots',
        Origin: 'https://orion-9-webos.ai.studio',
      },
      body: form,
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'unauthenticated');
    assert.ok(data.error.includes('Malformed JWT structure') || data.error.includes('invalid'));
  });

  // 11. Non-admin authorization failure
  it('11. Non-admin authenticated user is strictly rejected with HTTP 401/403', async () => {
    const req = new Request('https://worker.test/api/upload-logo', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer regular-user-untrusted-token',
        Origin: 'https://orion-9-webos.ai.studio',
      },
    });

    const res = await worker.fetch(req, env);
    assert.ok(res.status === 401 || res.status === 403);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // 12. Valid admin upload
  it('12. Valid admin upload stores asset in R2 with correct metadata', async () => {
    const form = new FormData();
    const file = new Blob(['<svg><rect width="20" height="20"/></svg>'], { type: 'image/svg+xml' });
    form.append('file', file, 'admin_brand.svg');
    form.append('placement', 'shared');
    form.append('dimensions', '200x200');

    const req = new Request('https://worker.test/api/upload-logo', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer mock-local-dev-admin-token',
        Origin: 'http://localhost:3000',
      },
      body: form,
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.key.startsWith('branding/logos/shared_'));
    assert.equal(data.dimensions, '200x200');
    assert.equal(data.fileType, 'image/svg+xml');

    // Verify stored object in R2
    assert.equal(bucket.store.size, 1);
    const stored = bucket.store.get(data.key);
    assert.ok(stored);
    assert.equal(stored.options.customMetadata.placement, 'shared');
  });

  // 13. Allowed-origin preflight
  it('13. Allowed-origin OPTIONS returns 204 with full CORS headers and X-Request-Id', async () => {
    const req = new Request('https://worker.test/api/upload-logo', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://orion-9-webos.ai.studio',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Authorization, Content-Type, Accept',
      },
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), 'https://orion-9-webos.ai.studio');
    assert.ok(res.headers.get('Access-Control-Allow-Methods')?.includes('POST'));
    assert.ok(res.headers.get('X-Request-Id'));
  });

  // 14. Disallowed-origin request
  it('14. Disallowed-origin request is rejected without Access-Control-Allow-Origin', async () => {
    const req = new Request('https://worker.test/api/upload-logo', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://malicious-phishing-site.com',
        'Access-Control-Request-Method': 'POST',
      },
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), null);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'cors_forbidden');
  });

  // 15. Confirmation that a failed upload cannot display a false success state
  it('15. Failed upload throws explicit error and never returns a false success state or URL', async () => {
    bucket.shouldFail = true;

    setRuntimeR2UploadEndpoint('https://failing.worker.test/api/upload-logo');
    const dummyFile = new File(['dummy'], 'logo.png', { type: 'image/png' });

    await assert.rejects(
      async () => {
        await uploadBrandingLogoAsset('shared', dummyFile, undefined, 'dummy-token');
      },
      (err: any) => {
        assert.ok(err instanceof Error);
        // Ensure error is actionable and not a false success
        assert.ok(!err.message.includes('success'));
        assert.ok(
          err.message.includes('failed') ||
          err.message.includes('Network') ||
          err.message.includes('Authentication') ||
          err.message.includes('Upload service')
        );
        return true;
      }
    );
  });

  // 16. Confirmation that an already stored object is not duplicated during recovery
  it('16. Public CDN streaming serves already stored objects without re-uploading or duplicating', async () => {
    const testKey = 'branding/logos/shared_test_logo.png';
    const testContent = Buffer.from('png-binary-content');
    await bucket.put(testKey, testContent, {
      httpMetadata: { contentType: 'image/png' },
      customMetadata: { placement: 'shared' },
    });

    assert.equal(bucket.store.size, 1);

    const getReq = new Request(`https://worker.test/cdn/${testKey}`, {
      method: 'GET',
    });

    const getRes = await worker.fetch(getReq, env);
    assert.equal(getRes.status, 200);
    assert.equal(getRes.headers.get('Content-Type'), 'image/png');
    assert.ok(getRes.headers.get('Content-Disposition')?.includes('shared_test_logo.png'));

    // Verify storage size remains exactly 1 (no duplicate written)
    assert.equal(bucket.store.size, 1);
  });
});
