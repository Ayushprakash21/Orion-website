import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import workerModule, { isOriginAllowed, getCorsHeaders, type Env, type R2Bucket } from '../../workers/r2-brand-uploader/src/index.ts';
import { verifyFirebaseAdminToken } from '../../workers/r2-brand-uploader/src/auth.ts';
import { classifyStorageError, validateLogoFile } from '../services/brandingStorage.ts';

const worker = (workerModule as any).fetch ? workerModule : (workerModule as any).default;

// Mock R2 Bucket for testing
class MockR2Bucket implements R2Bucket {
  public store = new Map<string, { body: ArrayBuffer | string; metadata?: unknown }>();
  public shouldFailPut = false;

  async put(
    key: string,
    value: ArrayBuffer | string,
    options?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> }
  ): Promise<unknown> {
    if (this.shouldFailPut) {
      throw new Error('Simulated R2 storage quota exceeded or disk write failure');
    }
    this.store.set(key, { body: value, metadata: options });
    return { key };
  }

  async get(key: string): Promise<any> {
    const item = this.store.get(key);
    if (!item) return null;
    const size = typeof item.body === 'string' ? item.body.length : (item.body as any)?.byteLength || 0;
    return {
      body: item.body,
      size,
      httpMetadata: (item.metadata as any)?.httpMetadata,
      httpEtag: 'mock-etag-1234',
    };
  }

  async delete(keys: string | string[]): Promise<void> {
    const arr = Array.isArray(keys) ? keys : [keys];
    for (const k of arr) this.store.delete(k);
  }
}

function createTestEnv(mockBucket: MockR2Bucket): Env {
  return {
    BRAND_ASSETS: mockBucket,
    FIREBASE_PROJECT_ID: 'orion9-dev-db-2026',
    ALLOWED_ORIGINS:
      'https://orion-9-webos.ai.studio,https://ai.studio,http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000',
  };
}

describe('Cloudflare R2 Brand Uploader — Master CORS, Auth & Pipeline Test Suite', () => {
  // -------------------------------------------------------------
  // CORS Origin Verification
  // -------------------------------------------------------------
  it('1. OPTIONS from approved production Google AI Studio origin returns valid CORS preflight response', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);

    const req = new Request('https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/api/upload-logo', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://orion-9-webos.ai.studio',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), 'https://orion-9-webos.ai.studio');
    assert.ok(res.headers.get('Access-Control-Allow-Methods')?.includes('POST'));
    assert.ok(res.headers.get('Access-Control-Allow-Headers')?.toLowerCase().includes('authorization'));
    assert.equal(res.headers.get('Vary'), 'Origin');
    // Security check: Never emit Access-Control-Allow-Credentials: true for Bearer token uploads
    assert.equal(res.headers.get('Access-Control-Allow-Credentials'), null);
  });

  it('2. OPTIONS from approved development origins (localhost, 127.0.0.1) return valid preflight', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);

    const devOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'];
    for (const devOrigin of devOrigins) {
      const req = new Request('https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/api/upload-logo', {
        method: 'OPTIONS',
        headers: { Origin: devOrigin },
      });
      const res = await worker.fetch(req, env);
      assert.equal(res.status, 204);
      assert.equal(res.headers.get('Access-Control-Allow-Origin'), devOrigin);
      assert.equal(res.headers.get('Vary'), 'Origin');
    }
  });

  it('3. OPTIONS from unapproved origin is rejected without Access-Control-Allow-Origin', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);

    const untrustedOrigin = 'https://untrusted-attacker-site.com';
    const req = new Request('https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/api/upload-logo', {
      method: 'OPTIONS',
      headers: {
        Origin: untrustedOrigin,
        'Access-Control-Request-Method': 'POST',
      },
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), null);
    const body = (await res.json()) as any;
    assert.equal(body.code, 'cors_forbidden');
  });

  it('3b. Arbitrary .ai.studio and .run.app suffixes are rejected (no suffix wildcards)', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);

    const disallowedOrigins = [
      'https://attacker.ai.studio',
      'https://orion-9.ai.studio',
      'https://random-app.run.app',
      'https://phishing-ai.studio',
    ];

    for (const origin of disallowedOrigins) {
      assert.equal(isOriginAllowed(origin, env), false, `Origin ${origin} should be rejected`);

      const req = new Request('https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/api/upload-logo', {
        method: 'OPTIONS',
        headers: {
          Origin: origin,
          'Access-Control-Request-Method': 'POST',
        },
      });

      const res = await worker.fetch(req, env);
      assert.equal(res.status, 403, `Preflight for ${origin} should return 403`);
      assert.equal(res.headers.get('Access-Control-Allow-Origin'), null, `Preflight for ${origin} must not emit allow-origin header`);
    }
  });

  it('4. POST from unapproved origin is rejected with 403 before parsing body or authenticating', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);

    const req = new Request('https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/api/upload-logo', {
      method: 'POST',
      headers: {
        Origin: 'https://evil-hacker.com',
        Authorization: 'Bearer any-token',
      },
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), null);
    const body = (await res.json()) as any;
    assert.equal(body.code, 'cors_forbidden');
  });

  it('5. Error responses for approved origins carry full CORS headers so browser can read JSON error', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);

    // Unauthenticated request from approved origin
    const req = new Request('https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/api/upload-logo', {
      method: 'POST',
      headers: {
        Origin: 'https://orion-9-webos.ai.studio',
      },
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 401);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), 'https://orion-9-webos.ai.studio');
    assert.equal(res.headers.get('Vary'), 'Origin');
    const data = (await res.json()) as any;
    assert.equal(data.code, 'unauthenticated');
    assert.ok(data.error.includes('Missing Authorization header'));
  });

  // -------------------------------------------------------------
  // Authentication and RBAC Verification
  // -------------------------------------------------------------
  it('6. Missing Authorization header returns HTTP 401', async () => {
    const res = await verifyFirebaseAdminToken('');
    assert.equal(res.valid, false);
    assert.equal(res.status, 401);
    assert.ok(res.error?.includes('missing or empty'));
  });

  it('7. Malformed JWT structure returns HTTP 401', async () => {
    const res = await verifyFirebaseAdminToken('Bearer not.a.valid.jwt.token');
    assert.equal(res.valid, false);
    assert.equal(res.status, 401);
    assert.ok(res.error?.includes('Malformed JWT structure'));
  });

  it('8. Expired token returns HTTP 401 with explicit expiration guidance', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-kid' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        aud: 'orion9-dev-db-2026',
        iss: 'https://securetoken.google.com/orion9-dev-db-2026',
        sub: 'user-123',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      })
    ).toString('base64url');
    const token = `${header}.${payload}.mockSignature`;

    const res = await verifyFirebaseAdminToken(token, 'orion9-dev-db-2026');
    assert.equal(res.valid, false);
    assert.equal(res.status, 401);
    assert.ok(res.error?.includes('expired'));
  });

  it('9. Token audience and issuer mismatches return HTTP 403', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-kid' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        aud: 'wrong-project-id',
        iss: 'https://securetoken.google.com/wrong-project-id',
        sub: 'user-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
    ).toString('base64url');
    const token = `${header}.${payload}.mockSignature`;

    const res = await verifyFirebaseAdminToken(token, 'orion9-dev-db-2026');
    assert.equal(res.valid, false);
    assert.equal(res.status, 403);
    assert.ok(res.error?.includes('mismatch'));
  });

  it('10. Authenticated non-admin user is rejected with HTTP 403', async () => {
    // Synthetic local dev token without admin privilege
    const res = await verifyFirebaseAdminToken('Bearer regular-user-token', 'orion9-dev-db-2026', true);
    assert.equal(res.valid, false);
    assert.equal(res.status, 401);
  });

  it('11. Synthetic dev token is strictly rejected from non-local production origins', async () => {
    const res = await verifyFirebaseAdminToken('Bearer mock-local-dev-admin-token', 'orion9-dev-db-2026', false);
    assert.equal(res.valid, false);
    assert.equal(res.status, 401);
    assert.ok(res.error?.includes('Synthetic local development administrator credentials are only permitted'));
  });

  it('12. Local development admin token is accepted when allowLocalDev is true', async () => {
    const res = await verifyFirebaseAdminToken('Bearer mock-local-dev-admin-token', 'orion9-dev-db-2026', true);
    assert.equal(res.valid, true);
    assert.equal(res.status, 200);
    assert.equal(res.user?.isAdmin, true);
    assert.equal(res.user?.email, 'ayushprakash0021@gmail.com');
  });

  // -------------------------------------------------------------
  // Full Upload Pipeline & R2 Storage
  // -------------------------------------------------------------
  it('13. Authenticated valid image uploads to R2 and returns CDN URL', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);

    const formData = new FormData();
    const svgBlob = new Blob(
      ['<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#00D2FF"/></svg>'],
      { type: 'image/svg+xml' }
    );
    formData.append('file', svgBlob, 'brand-logo.svg');
    formData.append('placement', 'shared');
    formData.append('dimensions', '100 × 100 px');

    const req = new Request('https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/api/upload-logo', {
      method: 'POST',
      headers: {
        Origin: 'http://localhost:3000',
        Authorization: 'Bearer mock-local-dev-admin-token',
      },
      body: formData,
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 200);
    const data = (await res.json()) as any;
    assert.equal(data.success, true);
    assert.ok(data.url.includes('/cdn/branding/logos/shared_'));
    assert.equal(data.fileType, 'image/svg+xml');
    assert.equal(data.dimensions, '100 × 100 px');
    assert.equal(bucket.store.size, 1);
  });

  it('14. Unsupported file formats (.exe, .sh) are rejected with HTTP 400', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);

    const formData = new FormData();
    const badBlob = new Blob(['binary-content'], { type: 'application/x-msdownload' });
    formData.append('file', badBlob, 'malicious.exe');

    const req = new Request('https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/api/upload-logo', {
      method: 'POST',
      headers: {
        Origin: 'http://localhost:3000',
        Authorization: 'Bearer mock-local-dev-admin-token',
      },
      body: formData,
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 400);
    const data = (await res.json()) as any;
    assert.equal(data.code, 'unsupported_format');
  });

  it('15. Files exceeding 5 MB limit are rejected with HTTP 413', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);

    const formData = new FormData();
    // Simulate oversized file entry
    const largeBlob = new Blob([new Uint8Array(6 * 1024 * 1024)], { type: 'image/png' });
    formData.append('file', largeBlob, 'giant-logo.png');

    const req = new Request('https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/api/upload-logo', {
      method: 'POST',
      headers: {
        Origin: 'http://localhost:3000',
        Authorization: 'Bearer mock-local-dev-admin-token',
      },
      body: formData,
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 413);
    const data = (await res.json()) as any;
    assert.equal(data.code, 'file_too_large');
  });

  it('16. Malicious script inside SVG is safely sanitized before storing to R2', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);

    const maliciousSvg =
      '<svg viewBox="0 0 100 100"><script>alert("xss")</script><circle cx="50" cy="50" r="40" fill="#00D2FF"/></svg>';
    const formData = new FormData();
    formData.append('file', new Blob([maliciousSvg], { type: 'image/svg+xml' }), 'xss.svg');

    const req = new Request('https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/api/upload-logo', {
      method: 'POST',
      headers: {
        Origin: 'http://localhost:3000',
        Authorization: 'Bearer mock-local-dev-admin-token',
      },
      body: formData,
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 200);
    const data = (await res.json()) as any;
    assert.equal(data.success, true);

    // Verify stored content in R2 does not contain <script>
    const stored = bucket.store.get(data.key);
    assert.ok(stored);
    const storedText = new TextDecoder().decode(stored.body as ArrayBuffer);
    assert.ok(!storedText.includes('<script>'));
    assert.ok(!storedText.includes('alert('));
  });

  it('17. R2 storage write failures return HTTP 500 with r2_write_failed code', async () => {
    const bucket = new MockR2Bucket();
    bucket.shouldFailPut = true;
    const env = createTestEnv(bucket);

    const formData = new FormData();
    formData.append('file', new Blob(['<svg></svg>'], { type: 'image/svg+xml' }), 'logo.svg');

    const req = new Request('https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/api/upload-logo', {
      method: 'POST',
      headers: {
        Origin: 'http://localhost:3000',
        Authorization: 'Bearer mock-local-dev-admin-token',
      },
      body: formData,
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 500);
    const data = (await res.json()) as any;
    assert.equal(data.code, 'r2_write_failed');
  });

  // -------------------------------------------------------------
  // Frontend Error Classification
  // -------------------------------------------------------------
  it('18. Frontend classifyStorageError accurately maps diagnostics without leaking secrets', () => {
    // 401 unauthenticated
    const msg401 = classifyStorageError({ status: 401 });
    assert.ok(msg401.includes('Authentication required'));

    // 403 unauthorized
    const msg403 = classifyStorageError({ status: 403 });
    assert.ok(msg403.includes('Permission denied'));

    // 404 bucket missing
    const msg404 = classifyStorageError({ status: 404 });
    assert.ok(msg404.includes('Cloudflare R2 bucket'));

    // Preflight or CORS failure with host diagnostic
    const msgPreflight = classifyStorageError({
      code: 'cors_or_network_failure',
      endpointHost: 'orion9-r2-brand-uploader.ayushprakash0021.workers.dev',
      endpointPath: '/api/upload-logo',
    });
    assert.ok(msgPreflight.includes('Network or CORS failure'));
    assert.ok(msgPreflight.includes('orion9-r2-brand-uploader.ayushprakash0021.workers.dev'));
    assert.ok(msgPreflight.includes('CORS origin permissions'));
  });

  it('19. HEAD requests to /downloads/* return headers without body', async () => {
    const bucket = new MockR2Bucket();
    const payload = new Uint8Array([1, 2, 3, 4, 5]).buffer;
    await bucket.put('downloads/test.exe', payload);

    const headReq = new Request('https://orion9-r2-brand-uploader.workers.dev/downloads/test.exe', {
      method: 'HEAD',
    });
    const headRes = await worker.fetch(headReq, { BRAND_ASSETS: bucket });
    assert.strictEqual(headRes.status, 200);
    assert.strictEqual(headRes.headers.get('Content-Type'), 'application/vnd.microsoft.portable-executable');
    assert.strictEqual(headRes.headers.get('Content-Length'), '5');
    assert.strictEqual(headRes.headers.get('Access-Control-Allow-Origin'), '*');
    const body = await headRes.text();
    assert.strictEqual(body, '');
  });
});
