import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DEFAULT_DESKTOP_RELEASES } from '../data/defaultSiteConfig';
import {
  validateReleaseForDownload,
  verifyBinaryResponseHeaders,
  DesktopDownloadError,
} from '../services/downloadService';

describe('Desktop Installer Download & Binary Pipeline Test Suite', () => {
  const winRelease = DEFAULT_DESKTOP_RELEASES.find((r) => r.platform === 'windows-x64' && r.format === 'exe')!;
  const macRelease = DEFAULT_DESKTOP_RELEASES.find((r) => r.platform === 'macos-universal' && r.format === 'dmg')!;
  const msiRelease = DEFAULT_DESKTOP_RELEASES.find((r) => r.format === 'msi')!;
  const armMacRelease = DEFAULT_DESKTOP_RELEASES.find((r) => r.platform === 'macos-arm64')!;

  test('1. Successful Windows binary verification and header validation', () => {
    assert.ok(winRelease, 'Windows release must exist in default catalog');
    const mockResponse = new Response(new Uint8Array([0x4d, 0x5a, 0x90, 0x00]), {
      status: 200,
      headers: {
        'content-type': 'application/vnd.microsoft.portable-executable',
        'content-disposition': `attachment; filename="${winRelease.filename}"`,
        'content-length': '30336791',
      },
    });

    const check = verifyBinaryResponseHeaders(mockResponse, winRelease);
    assert.equal(check.valid, true);
    assert.equal(check.error, undefined);
  });

  test('2. Successful macOS binary verification and header validation', () => {
    assert.ok(macRelease, 'macOS release must exist in default catalog');
    const mockResponse = new Response(new Uint8Array([0x4f, 0x72, 0x69, 0x6f]), {
      status: 200,
      headers: {
        'content-type': 'application/x-apple-diskimage',
        'content-disposition': `attachment; filename="${macRelease.filename}"`,
        'content-length': '2097152',
      },
    });

    const check = verifyBinaryResponseHeaders(mockResponse, macRelease);
    assert.equal(check.valid, true);
    assert.equal(check.error, undefined);
  });

  test('3. Missing release artifact returns a real error (404), not index.html', () => {
    const mock404Response = new Response(
      JSON.stringify({ error: 'Release artifact not found.', code: 'artifact_not_found', status: 404 }),
      {
        status: 404,
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
      }
    );

    const check = verifyBinaryResponseHeaders(mock404Response, winRelease);
    assert.equal(check.valid, false);
    assert.equal(check.errorType, 'not_found');
    assert.match(check.error!, /was not found on the distribution storage server/);
  });

  test('4. Unknown download route does not return a successful HTML fallback', () => {
    // Simulates SPA fallback response where server responds with index.html
    const mockSpaFallback = new Response('<!DOCTYPE html><html><head><title>Orion-9</title></head></html>', {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    });

    const check = verifyBinaryResponseHeaders(mockSpaFallback, winRelease);
    assert.equal(check.valid, false);
    assert.equal(check.errorType, 'html_fallback');
    assert.match(check.error!, /Endpoint returned HTML fallback/);
  });

  test('5. Unauthorized requests remain unauthorized (HTTP 401)', () => {
    const mock401Response = new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'content-type': 'application/json',
      },
    });

    const check = verifyBinaryResponseHeaders(mock401Response, winRelease);
    assert.equal(check.valid, false);
    assert.equal(check.errorType, 'unauthorized');
    assert.match(check.error!, /Authentication required/);
  });

  test('6. Forbidden requests remain forbidden (HTTP 403 & disabled/retired states)', () => {
    const disabledRel = { ...winRelease, status: 'disabled' as const };
    const checkDisabled = validateReleaseForDownload(disabledRel);
    assert.equal(checkDisabled.allowed, false);
    assert.equal(checkDisabled.errorType, 'forbidden');
    assert.match(checkDisabled.error!, /has been disabled/);

    const retiredRel = { ...winRelease, status: 'retired' as const };
    const checkRetired = validateReleaseForDownload(retiredRel);
    assert.equal(checkRetired.allowed, false);
    assert.equal(checkRetired.errorType, 'forbidden');

    const draftRel = { ...winRelease, status: 'draft' as const };
    const checkDraftUser = validateReleaseForDownload(draftRel, 'user');
    assert.equal(checkDraftUser.allowed, false);
    assert.equal(checkDraftUser.errorType, 'forbidden');

    const checkDraftAdmin = validateReleaseForDownload(draftRel, 'admin');
    assert.equal(checkDraftAdmin.allowed, true);

    const mock403Response = new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
    const check403 = verifyBinaryResponseHeaders(mock403Response, winRelease);
    assert.equal(check403.valid, false);
    assert.equal(check403.errorType, 'forbidden');
  });

  test('7. HTML responses are strictly rejected as installer binaries', () => {
    const htmlVariants = [
      'text/html',
      'text/html; charset=utf-8',
      'text/html; charset=iso-8859-1',
      'application/xhtml+xml',
    ];

    for (const ct of htmlVariants) {
      const resp = new Response('<html><body>Error</body></html>', {
        status: 200,
        headers: { 'content-type': ct },
      });
      const check = verifyBinaryResponseHeaders(resp, winRelease);
      assert.equal(check.valid, false);
      assert.equal(check.errorType, 'html_fallback');
    }
  });

  test('8. Server error responses (HTTP 500, 502, 503) are classified correctly', () => {
    const serverStatuses = [500, 502, 503, 504];
    for (const code of serverStatuses) {
      const resp = new Response('Server Error', {
        status: code,
        headers: { 'content-type': 'application/json' },
      });
      const check = verifyBinaryResponseHeaders(resp, winRelease);
      assert.equal(check.valid, false);
      assert.equal(check.errorType, 'server_error');
    }
  });

  test('9. SHA-256 matches the actual downloaded disk artifacts on disk', () => {
    const artifacts = [
      {
        path: path.resolve(process.cwd(), 'public/downloads/Orion-9-Setup.exe'),
        expectedSha: winRelease.sha256,
        expectedBytes: winRelease.sizeBytes,
      },
      {
        path: path.resolve(process.cwd(), 'public/downloads/Orion-9-Setup.msi'),
        expectedSha: msiRelease.sha256,
        expectedBytes: msiRelease.sizeBytes,
      },
      {
        path: path.resolve(process.cwd(), 'public/downloads/Orion-9-Universal.dmg'),
        expectedSha: macRelease.sha256,
        expectedBytes: macRelease.sizeBytes,
      },
      {
        path: path.resolve(process.cwd(), 'public/downloads/Orion-9-aarch64.dmg'),
        expectedSha: armMacRelease.sha256,
        expectedBytes: armMacRelease.sizeBytes,
      },
    ];

    for (const art of artifacts) {
      assert.ok(fs.existsSync(art.path), `Artifact must exist at ${art.path}`);
      const buf = fs.readFileSync(art.path);
      assert.equal(buf.length, art.expectedBytes, `File size mismatch for ${path.basename(art.path)}`);

      const actualSha = crypto.createHash('sha256').update(buf).digest('hex');
      assert.equal(actualSha, art.expectedSha, `SHA-256 mismatch for ${path.basename(art.path)}`);
    }
  });

  test('10. Windows PE header format integrity validation', () => {
    const exePath = path.resolve(process.cwd(), 'public/downloads/Orion-9-Setup.exe');
    const buf = fs.readFileSync(exePath);
    // Standard DOS header signature: 'MZ' (0x4D, 0x5A)
    assert.equal(buf[0], 0x4d);
    assert.equal(buf[1], 0x5a);
    // Size check (> 20 MB)
    assert.ok(buf.length > 20 * 1024 * 1024);
  });

  test('11. Filenames and Content-Disposition formatting', () => {
    assert.equal(winRelease.filename, 'Orion-9-Setup.exe');
    assert.equal(macRelease.filename, 'Orion-9-Universal.dmg');
    assert.equal(msiRelease.filename, 'Orion-9-Setup.msi');
    assert.equal(armMacRelease.filename, 'Orion-9-aarch64.dmg');

    const expectedHeader = `attachment; filename="${winRelease.filename}"`;
    assert.match(expectedHeader, /attachment;\s*filename="Orion-9-Setup\.exe"/);
  });

  test('12. Existing release metadata and catalog schema integrity', () => {
    for (const rel of DEFAULT_DESKTOP_RELEASES) {
      assert.ok(rel.id, 'Release id is required');
      assert.ok(rel.version, 'Release version is required');
      assert.ok(rel.platform, 'Release platform is required');
      assert.ok(rel.format, 'Release format is required');
      assert.ok(rel.downloadUrl, 'Download URL is required');
      assert.match(rel.sha256, /^[a-f0-9]{64}$/, 'SHA-256 must be valid lowercase 64-char hex');
      assert.ok(rel.sizeBytes > 0, 'Size must be > 0');
      assert.ok(rel.minimumOs, 'Minimum OS requirement must be defined');
    }
  });
});
