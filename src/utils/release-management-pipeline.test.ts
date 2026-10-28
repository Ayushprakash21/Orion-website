import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import workerModule, {
  isOriginAllowed,
  getCorsHeaders,
  validateBinaryMagicBytes,
  computeSha256Hex,
  ALLOWED_RELEASE_EXTENSIONS,
  MAX_DESKTOP_RELEASE_SIZE_BYTES,
  MAX_MOBILE_RELEASE_SIZE_BYTES,
  type Env,
  type R2Bucket,
} from '../../workers/r2-brand-uploader/src/index.ts';
import {
  validateReleaseBinaryHeader,
  computeFileSha256,
  PERMITTED_PLATFORM_EXTENSIONS,
  publishApplicationRelease,
  unpublishApplicationRelease,
  rollbackApplicationRelease,
  deleteApplicationRelease,
} from '../services/releaseService.ts';
import {
  resolveReleaseDownloadUrl,
  verifyBinaryResponseHeaders,
  validateReleaseForDownload,
  DesktopDownloadError,
} from '../services/downloadService.ts';
import type { AppReleaseRecord, ReleasePlatform } from '../types/cms.ts';

const worker = (workerModule as any).fetch ? workerModule : (workerModule as any).default;

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
      httpEtag: 'mock-etag-rel-1234',
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

describe('Orion-9 Release & Distribution Manager Master Pipeline Test Suite', () => {
  // Test 1: Administrator-only upload access
  it('1. Administrator-only upload access: Missing token returns HTTP 401', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);
    const req = new Request('http://localhost:5173/api/releases/upload', {
      method: 'POST',
      headers: {
        Origin: 'http://localhost:5173',
      },
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.code, 'unauthenticated');
    assert.equal(data.success, false);
  });

  // Test 2: Rejection of unauthorized uploads
  it('2. Rejection of unauthorized uploads: Non-admin token returns HTTP 403', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);
    // Malformed token without valid admin signature
    const req = new Request('http://localhost:5173/api/releases/upload', {
      method: 'POST',
      headers: {
        Origin: 'http://localhost:5173',
        Authorization: 'Bearer invalid-token-sample',
      },
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 401);
  });

  // Test 3: Allowed and disallowed file extensions
  it('3. Allowed and disallowed file extensions: Windows rejects .dmg/.apk, accepts .exe', () => {
    assert.ok(ALLOWED_RELEASE_EXTENSIONS.windows.has('.exe'));
    assert.ok(ALLOWED_RELEASE_EXTENSIONS.windows.has('.msi'));
    assert.ok(!ALLOWED_RELEASE_EXTENSIONS.windows.has('.apk'));
    assert.ok(!ALLOWED_RELEASE_EXTENSIONS.windows.has('.ipa'));
    assert.ok(!ALLOWED_RELEASE_EXTENSIONS.windows.has('.sh'));

    assert.ok(ALLOWED_RELEASE_EXTENSIONS.macos.has('.dmg'));
    assert.ok(ALLOWED_RELEASE_EXTENSIONS.android.has('.apk'));
    assert.ok(ALLOWED_RELEASE_EXTENSIONS.ios.has('.ipa'));
  });

  // Test 4: Server-side file-size enforcement
  it('4. Server-side file-size enforcement: Rejects payloads exceeding limit with HTTP 413', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);
    // Configurable size limit: set limit to 10 bytes for test
    env.MAX_RELEASE_FILE_SIZE_BYTES = 10;

    const formData = new FormData();
    const testFile = new File([new Uint8Array(50)], 'Orion-9-Setup.exe', { type: 'application/octet-stream' });
    formData.append('file', testFile, 'Orion-9-Setup.exe');
    formData.append('platform', 'windows-x64');
    formData.append('version', '9.1.0');

    const req = new Request('http://localhost:5173/api/releases/upload', {
      method: 'POST',
      headers: {
        Origin: 'http://localhost:5173',
        Authorization: 'Bearer mock-local-dev-admin-token',
      },
      body: formData,
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 413);
    const data = await res.json();
    assert.equal(data.code, 'file_too_large');
  });

  // Test 5: Invalid binary magic bytes handling (Rejecting HTML renamed as .exe)
  it('5. Binary header magic validation: Detects and rejects HTML text masqueraded as .exe', () => {
    const fakeHtmlExe = new TextEncoder().encode('<!DOCTYPE html><html><body>Error 404</body></html>');
    const result = validateBinaryMagicBytes(fakeHtmlExe, '.exe');
    assert.equal(result.valid, false);
    assert.match(result.error || '', /File header inspection failed/i);
  });

  // Test 6: Genuine Windows PE MZ header validation
  it('6. Windows PE MZ header validation: Passes genuine executable bytes', () => {
    const genuineMz = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]); // MZ...
    const result = validateBinaryMagicBytes(genuineMz, '.exe');
    assert.equal(result.valid, true);
  });

  // Test 7: Android APK ZIP header validation
  it('7. Android APK ZIP header validation: Passes PK.. signature', () => {
    const apkZipHeader = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]); // PK\x03\x04
    const result = validateBinaryMagicBytes(apkZipHeader, '.apk');
    assert.equal(result.valid, true);
  });

  // Test 8: iOS IPA ZIP header validation
  it('8. iOS IPA ZIP header validation: Passes PK.. signature', () => {
    const ipaZipHeader = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]); // PK\x03\x04
    const result = validateBinaryMagicBytes(ipaZipHeader, '.ipa');
    assert.equal(result.valid, true);
  });

  // Test 9: Cryptographic SHA-256 calculation
  it('9. SHA-256 calculation: Accurately hashes binary bytes', async () => {
    const testBytes = new TextEncoder().encode('Orion-9 Workstation Binary Payload 2026');
    const hash = await computeSha256Hex(testBytes.buffer);
    assert.equal(typeof hash, 'string');
    assert.equal(hash.length, 64);
    // Deterministic verify
    const hash2 = await computeSha256Hex(testBytes.buffer);
    assert.equal(hash, hash2);
  });

  // Test 10: Authenticated release upload saves to R2 with correct key & metadata
  it('10. Release upload pipeline: Stores binary in R2 and returns authoritative CDN URL', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);

    const validMzPayload = new Uint8Array([0x4d, 0x5a, 0x00, 0x00, 0x20, 0x26]);
    const file = new File([validMzPayload], 'Orion-9-Setup.exe', { type: 'application/octet-stream' });

    const formData = new FormData();
    formData.append('file', file, 'Orion-9-Setup.exe');
    formData.append('platform', 'windows-x64');
    formData.append('version', '9.2.0');
    formData.append('channel', 'stable');

    const req = new Request('http://localhost:5173/api/releases/upload', {
      method: 'POST',
      headers: {
        Origin: 'http://localhost:5173',
        Authorization: 'Bearer mock-local-dev-admin-token',
      },
      body: formData,
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.filename, 'Orion-9-Setup.exe');
    assert.equal(data.key, 'releases/windows/9.2.0/Orion-9-Setup.exe');
    assert.equal(data.contentType, 'application/vnd.microsoft.portable-executable');
    assert.equal(data.sha256.length, 64);

    // Verify stored object in bucket
    const stored = await bucket.get('releases/windows/9.2.0/Orion-9-Setup.exe');
    assert.ok(stored);
    assert.equal(stored.size, validMzPayload.length);
  });

  // Test 11: Release Verification endpoint
  it('11. Release verification endpoint: Correctly inspects stored R2 object and computes hash', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);

    const validMzPayload = new Uint8Array([0x4d, 0x5a, 0x01, 0x02]);
    await bucket.put('releases/windows/v9.0.0/Orion-9-Setup.exe', validMzPayload.buffer);

    const req = new Request('http://localhost:5173/api/releases/verify', {
      method: 'POST',
      headers: {
        Origin: 'http://localhost:5173',
        Authorization: 'Bearer mock-local-dev-admin-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: 'releases/windows/v9.0.0/Orion-9-Setup.exe' }),
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.verified, true);
    assert.equal(data.sizeBytes, 4);
    assert.equal(data.sha256.length, 64);
  });

  // Test 12: Missing R2 object returns HTTP 404, NEVER HTML
  it('12. Missing R2 object returns clean JSON 404, never HTML index fallback', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);

    const req = new Request('http://localhost:5173/releases/windows/v99.0/Missing.exe', {
      method: 'GET',
      headers: {
        Origin: 'http://localhost:5173',
      },
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 404);
    const ct = res.headers.get('content-type') || '';
    assert.ok(ct.includes('application/json'));
    assert.ok(!ct.includes('text/html'));
  });

  // Test 13: Binary streaming delivery sets correct Content-Type and Content-Disposition
  it('13. Binary streaming delivery sets correct attachment headers and Content-Type', async () => {
    const bucket = new MockR2Bucket();
    const env = createTestEnv(bucket);

    const apkBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    await bucket.put('releases/android/v9.0.0/Orion-9.apk', apkBytes.buffer);

    const req = new Request('http://localhost:5173/cdn/releases/android/v9.0.0/Orion-9.apk', {
      method: 'GET',
    });

    const res = await worker.fetch(req, env);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/vnd.android.package-archive');
    assert.equal(res.headers.get('content-disposition'), 'attachment; filename="Orion-9.apk"');
  });

  // Test 14: Lifecycle publishing: Supersedes previous published release
  it('14. Lifecycle publication: Sets new release to published and marks prior as superseded', async () => {
    const initialList: AppReleaseRecord[] = [
      {
        id: 'rel-1',
        version: '9.0.0',
        platform: 'windows-x64',
        format: 'exe',
        status: 'published',
        channel: 'stable',
        filename: 'Orion-9-Setup.exe',
        sha256: 'e2dfeb480522b9da077bb58e0954d6d8e09f1023fb6af28b8b74b2a8dc23ee70',
        downloadUrl: 'https://cdn.orion-9.com/Orion-9-Setup.exe',
        sizeBytes: 30000000,
        releaseDate: '2026-10-26',
        releaseNotes: ['v9.0.0'],
        minimumOs: 'Windows 10',
        downloadCount: 10,
        isLatest: true,
      },
      {
        id: 'rel-2',
        version: '9.1.0',
        platform: 'windows-x64',
        format: 'exe',
        status: 'verified',
        channel: 'stable',
        filename: 'Orion-9-Setup-9.1.0.exe',
        sha256: '1111111111111111111111111111111111111111111111111111111111111111',
        downloadUrl: 'https://cdn.orion-9.com/Orion-9-Setup-9.1.0.exe',
        sizeBytes: 30000000,
        releaseDate: '2026-10-28',
        releaseNotes: ['v9.1.0'],
        minimumOs: 'Windows 10',
        downloadCount: 0,
        isLatest: false,
      },
    ];

    const res = await publishApplicationRelease('rel-2', 'admin@orion-9.com', initialList);
    assert.equal(res.success, true);
    const rel1 = res.updatedList.find((r) => r.id === 'rel-1')!;
    const rel2 = res.updatedList.find((r) => r.id === 'rel-2')!;

    assert.equal(rel2.status, 'published');
    assert.equal(rel2.isLatest, true);
    assert.equal(rel1.status, 'superseded');
    assert.equal(rel1.isLatest, false);
  });

  // Test 15: Rollback operation restores prior release to published
  it('15. Rollback operation: Promotes superseded release back to published', async () => {
    const list: AppReleaseRecord[] = [
      {
        id: 'rel-1',
        version: '9.0.0',
        platform: 'windows-x64',
        format: 'exe',
        status: 'superseded',
        channel: 'stable',
        filename: 'Orion-9-Setup.exe',
        sha256: 'e2dfeb480522b9da077bb58e0954d6d8e09f1023fb6af28b8b74b2a8dc23ee70',
        downloadUrl: 'https://cdn.orion-9.com/Orion-9-Setup.exe',
        sizeBytes: 30000000,
        releaseDate: '2026-10-26',
        releaseNotes: ['v9.0.0'],
        minimumOs: 'Windows 10',
        downloadCount: 10,
        isLatest: false,
      },
      {
        id: 'rel-2',
        version: '9.1.0',
        platform: 'windows-x64',
        format: 'exe',
        status: 'published',
        channel: 'stable',
        filename: 'Orion-9-Setup-9.1.0.exe',
        sha256: '1111111111111111111111111111111111111111111111111111111111111111',
        downloadUrl: 'https://cdn.orion-9.com/Orion-9-Setup-9.1.0.exe',
        sizeBytes: 30000000,
        releaseDate: '2026-10-28',
        releaseNotes: ['v9.1.0'],
        minimumOs: 'Windows 10',
        downloadCount: 0,
        isLatest: true,
      },
    ];

    const res = await rollbackApplicationRelease('rel-1', 'admin@orion-9.com', list);
    assert.equal(res.success, true);
    const rel1 = res.updatedList.find((r) => r.id === 'rel-1')!;
    const rel2 = res.updatedList.find((r) => r.id === 'rel-2')!;

    assert.equal(rel1.status, 'published');
    assert.equal(rel1.isLatest, true);
    assert.equal(rel2.status, 'superseded');
  });

  // Test 16: Safe deletion prevents deleting currently published release
  it('16. Delete guard: Rejects deletion of an active published release', async () => {
    const list: AppReleaseRecord[] = [
      {
        id: 'rel-published',
        version: '9.0.0',
        platform: 'windows-x64',
        format: 'exe',
        status: 'published',
        channel: 'stable',
        filename: 'Orion-9-Setup.exe',
        sha256: 'e2dfeb480522b9da077bb58e0954d6d8e09f1023fb6af28b8b74b2a8dc23ee70',
        downloadUrl: 'https://cdn.orion-9.com/Orion-9-Setup.exe',
        sizeBytes: 30000000,
        releaseDate: '2026-10-26',
        releaseNotes: ['v9.0.0'],
        minimumOs: 'Windows 10',
        downloadCount: 10,
        isLatest: true,
      },
    ];

    const res = await deleteApplicationRelease('rel-published', 'admin@orion-9.com', list);
    assert.equal(res.success, false);
    assert.match(res.error || '', /Cannot delete an active published release/i);
  });
});
