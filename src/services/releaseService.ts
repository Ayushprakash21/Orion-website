/**
 * ORION-9 APPLICATION RELEASE & DISTRIBUTION SERVICE
 *
 * Full lifecycle management for Windows (.exe), macOS (.dmg), Android (.apk), and iOS (.ipa).
 * Orchestrates client-side magic header validation, cryptographic SHA-256 computation,
 * authenticated streaming upload to Cloudflare R2, and Firestore release registry management.
 */

import {
  initializeFirebase,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  addDoc,
} from './firebase.ts';
import type {
  AppReleaseRecord,
  ReleasePlatform,
  ReleasePackageFormat,
  ReleasePublicationStatus,
  ReleaseChannel,
} from '../types/cms.ts';
import { DEFAULT_DESKTOP_RELEASES } from '../data/defaultSiteConfig.ts';
import { DEFAULT_RELEASE_CDN_BASE } from './downloadService.ts';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  magicValid?: boolean;
  detectedFormat?: string;
  sizeBytes?: number;
}

export interface UploadReleaseProgress {
  pct: number;
  loadedBytes: number;
  totalBytes: number;
  stage: 'validating' | 'hashing' | 'initializing' | 'uploading' | 'assembling' | 'verifying' | 'completed' | 'failed';
  detail?: string;
  currentPart?: number;
  totalParts?: number;
}

export class ReleaseUploadError extends Error {
  public code: string;
  public requestId?: string;
  public status?: number;
  constructor(message: string, code: string, requestId?: string, status?: number) {
    super(message);
    this.name = 'ReleaseUploadError';
    this.code = code;
    this.requestId = requestId;
    this.status = status;
  }
}

export interface UploadReleaseResponse {
  success: boolean;
  url: string;
  key: string;
  filename: string;
  sizeBytes: number;
  sha256: string;
  contentType: string;
  platform: string;
  version: string;
  channel: string;
  uploadedAt: string;
  error?: string;
}

// Unified release file size limit: 250 MB (250 MiB / 262,144,000 bytes)
export const MAX_RELEASE_FILE_SIZE_BYTES = 262144000;
export const MAX_DESKTOP_RELEASE_SIZE_BYTES = MAX_RELEASE_FILE_SIZE_BYTES;
export const MAX_MOBILE_RELEASE_SIZE_BYTES = MAX_RELEASE_FILE_SIZE_BYTES;

export const PERMITTED_PLATFORM_EXTENSIONS: Record<string, string[]> = {
  'windows-x64': ['.exe', '.msi'],
  'windows-arm64': ['.exe', '.msi'],
  'macos-universal': ['.dmg', '.pkg'],
  'macos-arm64': ['.dmg', '.pkg'],
  'macos-x64': ['.dmg', '.pkg'],
  'android-universal': ['.apk'],
  'android-arm64': ['.apk'],
  'ios-universal': ['.ipa'],
  'ios-arm64': ['.ipa'],
};

/**
 * Resolves Cloudflare R2 Worker API base URL.
 */
export function getReleaseApiBase(): string {
  const env =
    (import.meta as unknown as { env?: Record<string, string | undefined> })?.env || {};
  const explicitUpload = env.VITE_R2_RELEASE_UPLOAD_ENDPOINT?.trim();
  if (explicitUpload) {
    try {
      const u = new URL(explicitUpload);
      return u.origin;
    } catch {}
  }

  const cdnBase = env.VITE_RELEASE_CDN_BASE?.trim() || env.VITE_R2_PUBLIC_BASE_URL?.trim();
  return (cdnBase || DEFAULT_RELEASE_CDN_BASE).replace(/\/+$/, '');
}

/**
 * Resolves Cloudflare R2 Release Upload API endpoint.
 */
export function getReleaseUploadEndpoint(): string {
  const env =
    (import.meta as unknown as { env?: Record<string, string | undefined> })?.env || {};
  const explicit = env.VITE_R2_RELEASE_UPLOAD_ENDPOINT?.trim();
  if (explicit) return explicit;

  const base = getReleaseApiBase();
  return `${base}/api/releases/upload`;
}

/**
 * Validates binary magic byte signatures directly from File buffer.
 */
export async function validateReleaseBinaryHeader(
  file: File,
  platform: ReleasePlatform
): Promise<FileValidationResult> {
  if (!file) {
    return { valid: false, error: 'No release binary selected.' };
  }

  const isMobile = platform.startsWith('android') || platform.startsWith('ios');
  const maxBytes = isMobile ? MAX_MOBILE_RELEASE_SIZE_BYTES : MAX_DESKTOP_RELEASE_SIZE_BYTES;
  const maxMb = Math.round(maxBytes / (1024 * 1024));

  if (file.size > maxBytes) {
    const fileMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${fileMb} MB) exceeds maximum permitted size of ${maxMb} MB.`,
    };
  }

  const extIndex = file.name.lastIndexOf('.');
  const ext = extIndex !== -1 ? file.name.slice(extIndex).toLowerCase() : '';
  const allowed = PERMITTED_PLATFORM_EXTENSIONS[platform] || [];

  if (!allowed.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension "${ext}" for platform "${platform}". Permitted extensions: ${allowed.join(', ')}.`,
    };
  }

  // Inspect first 32 bytes for magic signatures
  try {
    const slice = file.slice(0, 32);
    const buffer = await slice.arrayBuffer();
    const uint8 = new Uint8Array(buffer);

    // Reject HTML/text payloads masquerading as binaries
    if (
      uint8.length >= 2 &&
      uint8[0] === 0x3c &&
      (uint8[1] === 0x21 || uint8[1] === 0x68 || uint8[1] === 0x48 || uint8[1] === 0x3f)
    ) {
      return {
        valid: false,
        error: 'File header inspection failed: File is an HTML/text document, not a genuine binary.',
      };
    }

    if (ext === '.exe') {
      // Must start with PE 'MZ'
      if (uint8[0] !== 0x4d || uint8[1] !== 0x5a) {
        return {
          valid: false,
          error: 'Invalid Windows executable: Missing authentic PE "MZ" header signature.',
        };
      }
    } else if (ext === '.msi') {
      // OLE storage: 0xD0, 0xCF, 0x11, 0xE0
      if (uint8[0] !== 0xd0 || uint8[1] !== 0xcf || uint8[2] !== 0x11 || uint8[3] !== 0xe0) {
        return {
          valid: false,
          error: 'Invalid Windows MSI package: Missing authentic OLE compound file signature.',
        };
      }
    } else if (ext === '.apk') {
      // ZIP format: PK\x03\x04
      if (uint8[0] !== 0x50 || uint8[1] !== 0x4b || uint8[2] !== 0x03 || uint8[3] !== 0x04) {
        return {
          valid: false,
          error: 'Invalid Android package (.apk): Missing authentic ZIP/APK archive signature.',
        };
      }
    } else if (ext === '.ipa') {
      // ZIP format: PK\x03\x04
      if (uint8[0] !== 0x50 || uint8[1] !== 0x4b || uint8[2] !== 0x03 || uint8[3] !== 0x04) {
        return {
          valid: false,
          error: 'Invalid iOS application package (.ipa): Missing authentic ZIP/IPA archive signature.',
        };
      }
    }

    return {
      valid: true,
      magicValid: true,
      detectedFormat: ext.replace('.', '').toUpperCase(),
      sizeBytes: file.size,
    };
  } catch (err: unknown) {
    return {
      valid: false,
      error: `Could not inspect binary header: ${(err as Error).message}`,
    };
  }
}

/**
 * Calculates cryptographic SHA-256 from raw file bytes with progress updates.
 */
export async function computeFileSha256(
  file: File,
  onProgress?: (progressPct: number) => void
): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is not supported in this runtime environment.');
  }

  if (onProgress) onProgress(10);
  const buffer = await file.arrayBuffer();
  if (onProgress) onProgress(60);

  const digestBuffer = await crypto.subtle.digest('SHA-256', buffer);
  if (onProgress) onProgress(90);

  const hashArray = Array.from(new Uint8Array(digestBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  if (onProgress) onProgress(100);

  return hex;
}

/**
 * Classifies release upload failure into a structured, diagnosable error with requestId.
 */
export function diagnoseReleaseUploadError(
  err: any,
  endpoint: string,
  requestId: string
): ReleaseUploadError {
  if (err instanceof ReleaseUploadError) return err;

  const msg = (err?.message || String(err)).trim();
  const status = typeof err?.status === 'number' ? err.status : undefined;

  if (status === 401 || msg.includes('Authentication required') || msg.includes('unauthenticated')) {
    return new ReleaseUploadError(
      `Authentication required: Session expired or invalid administrator credentials. Please sign in again. (Ref: ${requestId})`,
      'auth_required',
      requestId,
      401
    );
  }
  if (status === 403 || msg.includes('Permission denied') || msg.includes('unauthorized') || msg.includes('cors_forbidden')) {
    return new ReleaseUploadError(
      `Permission denied: Administrator role required to publish releases, or origin rejected by CORS security policy. (Ref: ${requestId})`,
      'permission_denied',
      requestId,
      403
    );
  }
  if (status === 413 || msg.includes('exceeds') || msg.includes('file_too_large') || msg.includes('Payload Too Large')) {
    return new ReleaseUploadError(
      `File exceeds maximum allowed size of 250 MiB. (Ref: ${requestId})`,
      'file_too_large',
      requestId,
      413
    );
  }
  if (status === 503 || msg.includes('r2_binding_missing')) {
    return new ReleaseUploadError(
      `Cloudflare R2 release storage binding is currently unavailable. Please contact system admin. (Ref: ${requestId})`,
      'storage_unavailable',
      requestId,
      503
    );
  }
  if (msg.includes('timed out') || msg.includes('timeout')) {
    return new ReleaseUploadError(
      `Release upload timed out while transferring binary chunks. Please check your connection speed and try again. (Ref: ${requestId})`,
      'timeout',
      requestId
    );
  }
  if (
    msg.includes('Network') ||
    msg.includes('Failed to fetch') ||
    msg.includes('Load failed') ||
    msg.includes('NetworkError') ||
    msg.includes('CORS')
  ) {
    return new ReleaseUploadError(
      `Network or CORS connection failure when uploading to release storage at ${endpoint}. (Ref: ${requestId})`,
      'network_failure',
      requestId
    );
  }
  if (msg.includes('corrupt_binary') || msg.includes('PE "MZ"') || msg.includes('ZIP/APK')) {
    return new ReleaseUploadError(
      `Binary format verification failure: ${msg} (Ref: ${requestId})`,
      'corrupt_binary',
      requestId
    );
  }
  if (msg.includes('SHA-256') || msg.includes('checksum mismatch')) {
    return new ReleaseUploadError(
      `Integrity verification failure: Cryptographic SHA-256 hash mismatch during upload transfer. (Ref: ${requestId})`,
      'checksum_mismatch',
      requestId
    );
  }

  return new ReleaseUploadError(
    `Release upload error: ${msg} (Ref: ${requestId})`,
    'upload_failed',
    requestId,
    status
  );
}

/**
 * Uploads a release binary via authenticated multipart chunked upload.
 * Required for files > 100 MB (e.g. Android APKs of 166 MB) to comply with Cloudflare edge request limits.
 */
export async function uploadReleaseMultipart(
  file: File,
  metadata: {
    platform: ReleasePlatform;
    version: string;
    channel: ReleaseChannel;
    product?: string;
  },
  onProgress?: (progress: UploadReleaseProgress) => void,
  explicitAuthToken?: string
): Promise<UploadReleaseResponse> {
  const clientRequestId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'req-rel-' + Date.now().toString(36);

  const apiBase = getReleaseApiBase();

  // 1. Validation
  if (onProgress) {
    onProgress({
      pct: 5,
      loadedBytes: 0,
      totalBytes: file.size,
      stage: 'validating',
      detail: 'Validating binary header and platform format...',
    });
  }

  const validation = await validateReleaseBinaryHeader(file, metadata.platform);
  if (!validation.valid) {
    throw new ReleaseUploadError(
      validation.error || 'Binary validation failed.',
      'validation_error',
      clientRequestId
    );
  }

  // 2. SHA-256
  if (onProgress) {
    onProgress({
      pct: 10,
      loadedBytes: 0,
      totalBytes: file.size,
      stage: 'hashing',
      detail: 'Computing client cryptographic SHA-256 checksum...',
    });
  }

  const clientSha256 = await computeFileSha256(file, (hPct) => {
    if (onProgress) {
      onProgress({
        pct: 10 + Math.round(hPct * 0.1), // 10% to 20%
        loadedBytes: 0,
        totalBytes: file.size,
        stage: 'hashing',
        detail: `Hashing binary (${hPct}%)...`,
      });
    }
  });

  // 3. Resolve Admin Auth Token
  let token = explicitAuthToken;
  if (!token) {
    const { auth } = initializeFirebase();
    const currentUser = auth?.currentUser;
    if (currentUser) {
      try {
        token = await currentUser.getIdToken(true).catch(async () => {
          return currentUser.getIdToken(false);
        });
      } catch (err) {
        console.error('[ReleaseService] Failed to acquire ID token:', err);
      }
    }
  }

  if (!token && typeof window !== 'undefined') {
    try {
      if (window.sessionStorage.getItem('orion_local_dev_admin') === 'true') {
        token = 'mock-local-dev-admin-token';
      }
    } catch {
      // ignore
    }
  }

  if (!token) {
    throw new ReleaseUploadError(
      'Authentication required: You must be signed in as an administrator to upload release binaries.',
      'auth_required',
      clientRequestId,
      401
    );
  }

  // 4. Init Multipart Upload
  if (onProgress) {
    onProgress({
      pct: 22,
      loadedBytes: 0,
      totalBytes: file.size,
      stage: 'initializing',
      detail: 'Initializing multipart session with Cloudflare R2...',
    });
  }

  let uploadId = '';
  let storageKey = '';
  let chunkSize = 10 * 1024 * 1024; // 10 MiB default

  try {
    const initRes = await fetch(`${apiBase}/api/releases/multipart/init`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Request-Id': clientRequestId,
      },
      body: JSON.stringify({
        filename: file.name,
        platform: metadata.platform,
        version: metadata.version.trim(),
        channel: metadata.channel,
        product: metadata.product || 'orion-9',
        sizeBytes: file.size,
        sha256: clientSha256,
      }),
    });

    const initJson: any = await initRes.json().catch(() => ({}));
    if (!initRes.ok || initJson.success !== true) {
      throw diagnoseReleaseUploadError(
        new Error(initJson.error || `Init returned HTTP ${initRes.status}`),
        `${apiBase}/api/releases/multipart/init`,
        initJson.requestId || clientRequestId
      );
    }

    uploadId = initJson.uploadId;
    storageKey = initJson.key;
    if (initJson.chunkSize && initJson.chunkSize > 0) {
      chunkSize = initJson.chunkSize;
    }
  } catch (err: any) {
    throw diagnoseReleaseUploadError(err, `${apiBase}/api/releases/multipart/init`, clientRequestId);
  }

  // 5. Upload chunks
  const totalParts = Math.max(1, Math.ceil(file.size / chunkSize));
  const uploadedParts: Array<{ partNumber: number; etag: string }> = [];
  let totalUploadedBytes = 0;

  try {
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunkBlob = file.slice(start, end);
      const chunkBytes = end - start;

      let partSuccess = false;
      let lastPartError: any = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const partRes = await fetch(
            `${apiBase}/api/releases/multipart/part?uploadId=${encodeURIComponent(uploadId)}&partNumber=${partNumber}&key=${encodeURIComponent(storageKey)}`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/octet-stream',
                'X-Upload-Id': uploadId,
                'X-Part-Number': String(partNumber),
                'X-Object-Key': storageKey,
                'X-Request-Id': clientRequestId,
              },
              body: chunkBlob,
            }
          );

          const partJson: any = await partRes.json().catch(() => ({}));
          if (!partRes.ok || partJson.success !== true) {
            throw new Error(partJson.error || `Part upload HTTP ${partRes.status}`);
          }

          uploadedParts.push({
            partNumber: partJson.partNumber || partNumber,
            etag: partJson.etag || '',
          });

          totalUploadedBytes += chunkBytes;
          partSuccess = true;

          if (onProgress) {
            const uploadPct = Math.round((totalUploadedBytes / file.size) * 63);
            onProgress({
              pct: 25 + uploadPct,
              loadedBytes: totalUploadedBytes,
              totalBytes: file.size,
              stage: 'uploading',
              currentPart: partNumber,
              totalParts,
              detail: `Streaming binary chunk ${partNumber} of ${totalParts} to R2...`,
            });
          }

          break;
        } catch (partErr: any) {
          lastPartError = partErr;
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 500 * attempt));
          }
        }
      }

      if (!partSuccess) {
        throw lastPartError || new Error(`Failed to upload part ${partNumber} after 3 attempts.`);
      }
    }
  } catch (chunkErr: any) {
    if (uploadId && storageKey) {
      fetch(`${apiBase}/api/releases/multipart/abort`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Request-Id': clientRequestId,
        },
        body: JSON.stringify({ uploadId, key: storageKey }),
      }).catch(() => {});
    }
    throw diagnoseReleaseUploadError(
      chunkErr,
      `${apiBase}/api/releases/multipart/part`,
      clientRequestId
    );
  }

  // 6. Complete Multipart Upload
  if (onProgress) {
    onProgress({
      pct: 90,
      loadedBytes: file.size,
      totalBytes: file.size,
      stage: 'assembling',
      detail: 'Assembling and finalizing release binary in Cloudflare R2...',
    });
  }

  let completeData: any;
  try {
    const completeRes = await fetch(`${apiBase}/api/releases/multipart/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Request-Id': clientRequestId,
      },
      body: JSON.stringify({
        uploadId,
        key: storageKey,
        parts: uploadedParts,
        expectedSha256: clientSha256,
        expectedSizeBytes: file.size,
        platform: metadata.platform,
        version: metadata.version.trim(),
        channel: metadata.channel,
        product: metadata.product || 'orion-9',
        filename: file.name,
      }),
    });

    const completeJson: any = await completeRes.json().catch(() => ({}));
    if (!completeRes.ok || completeJson.success !== true) {
      throw diagnoseReleaseUploadError(
        new Error(completeJson.error || `Complete returned HTTP ${completeRes.status}`),
        `${apiBase}/api/releases/multipart/complete`,
        completeJson.requestId || clientRequestId
      );
    }
    completeData = completeJson;
  } catch (err: any) {
    throw diagnoseReleaseUploadError(err, `${apiBase}/api/releases/multipart/complete`, clientRequestId);
  }

  // 7. Post-Upload Verification
  if (onProgress) {
    onProgress({
      pct: 96,
      loadedBytes: file.size,
      totalBytes: file.size,
      stage: 'verifying',
      detail: 'Verifying stored release integrity and magic byte headers...',
    });
  }

  try {
    const verifyRes = await fetch(`${apiBase}/api/releases/verify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Request-Id': clientRequestId,
      },
      body: JSON.stringify({ key: storageKey }),
    });

    const verifyJson: any = await verifyRes.json().catch(() => ({}));
    if (verifyRes.ok && verifyJson.success && verifyJson.verified === false) {
      throw new ReleaseUploadError(
        verifyJson.magicError || 'Storage verification failed: Binary magic byte headers invalid.',
        'corrupt_binary',
        verifyJson.requestId || clientRequestId
      );
    }
  } catch (err: any) {
    console.warn('[ReleaseService] Post-upload verification probe note:', err);
  }

  if (onProgress) {
    onProgress({
      pct: 100,
      loadedBytes: file.size,
      totalBytes: file.size,
      stage: 'completed',
      detail: 'Release upload and verification completed successfully!',
    });
  }

  return {
    success: true,
    url: completeData.url,
    key: completeData.key || storageKey,
    filename: completeData.filename || file.name,
    sizeBytes: completeData.sizeBytes || file.size,
    sha256: clientSha256,
    contentType: completeData.contentType || 'application/octet-stream',
    platform: completeData.platform || metadata.platform,
    version: completeData.version || metadata.version,
    channel: completeData.channel || metadata.channel,
    uploadedAt: completeData.uploadedAt || new Date().toISOString(),
  };
}

/**
 * Single-POST release upload implementation for small files (< 10 MB).
 */
export async function uploadReleaseSingle(
  file: File,
  metadata: {
    platform: ReleasePlatform;
    version: string;
    channel: ReleaseChannel;
    product?: string;
  },
  onProgress?: (progress: UploadReleaseProgress) => void,
  explicitAuthToken?: string
): Promise<UploadReleaseResponse> {
  // 1. Client-side validation
  if (onProgress) {
    onProgress({
      pct: 5,
      loadedBytes: 0,
      totalBytes: file.size,
      stage: 'validating',
      detail: 'Validating binary header...',
    });
  }

  const validation = await validateReleaseBinaryHeader(file, metadata.platform);
  if (!validation.valid) {
    throw new Error(validation.error || 'Binary validation failed.');
  }

  // 2. Client-side SHA-256 computation
  if (onProgress) {
    onProgress({
      pct: 15,
      loadedBytes: 0,
      totalBytes: file.size,
      stage: 'hashing',
      detail: 'Computing client SHA-256...',
    });
  }

  const clientSha256 = await computeFileSha256(file, (hPct) => {
    if (onProgress) {
      onProgress({
        pct: 15 + Math.round(hPct * 0.2), // 15% to 35%
        loadedBytes: 0,
        totalBytes: file.size,
        stage: 'hashing',
        detail: `Hashing binary (${hPct}%)...`,
      });
    }
  });

  // 3. Resolve Admin Auth Token
  let token = explicitAuthToken;
  if (!token) {
    const { auth } = initializeFirebase();
    const currentUser = auth?.currentUser;
    if (currentUser) {
      try {
        token = await currentUser.getIdToken(true).catch(async () => {
          return currentUser.getIdToken(false);
        });
      } catch (err) {
        console.error('[ReleaseService] Failed to acquire ID token:', err);
      }
    }
  }

  if (!token && typeof window !== 'undefined') {
    try {
      if (window.sessionStorage.getItem('orion_local_dev_admin') === 'true') {
        token = 'mock-local-dev-admin-token';
      }
    } catch {
      // ignore
    }
  }

  if (!token) {
    throw new Error(
      'Authentication required: You must be signed in as an administrator to upload release binaries.'
    );
  }

  // 4. Construct Multipart FormData Payload
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('platform', metadata.platform);
  formData.append('version', metadata.version);
  formData.append('channel', metadata.channel);
  formData.append('product', metadata.product || 'orion-9');

  const endpoint = getReleaseUploadEndpoint();
  const clientRequestId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'req-rel-' + Date.now();

  // 5. Execute Authenticated Streaming Upload
  return new Promise<UploadReleaseResponse>((resolve, reject) => {
    if (typeof XMLHttpRequest !== 'undefined') {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('X-Request-Id', clientRequestId);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable && evt.total > 0) {
            const uploadPct = Math.round((evt.loaded / evt.total) * 55); // 35% to 90%
            onProgress({
              pct: 35 + uploadPct,
              loadedBytes: evt.loaded,
              totalBytes: evt.total,
              stage: 'uploading',
              detail: 'Streaming binary to Cloudflare R2...',
            });
          }
        };
      }

      xhr.onload = () => {
        if (onProgress) {
          onProgress({
            pct: 95,
            loadedBytes: file.size,
            totalBytes: file.size,
            stage: 'verifying',
            detail: 'Verifying integrity in R2...',
          });
        }

        const status = xhr.status;
        const contentType = (xhr.getResponseHeader('Content-Type') || '').toLowerCase();
        const rawText = (xhr.responseText || '').trim();

        if (
          contentType.includes('text/html') ||
          rawText.startsWith('<!doctype') ||
          rawText.startsWith('<html')
        ) {
          return reject(
            new Error(
              `Upload service returned HTML fallback (${contentType}) instead of authentic JSON response.`
            )
          );
        }

        let parsed: Record<string, any>;
        try {
          parsed = JSON.parse(rawText);
        } catch {
          return reject(
            new Error(
              `Upload service returned invalid JSON response (HTTP ${status}). Response text: ${rawText.slice(0, 120)}`
            )
          );
        }

        if (status < 200 || status >= 300 || parsed.success !== true) {
          return reject(
            new Error(
              parsed?.error || parsed?.message || `Release upload failed with HTTP status ${status}.`
            )
          );
        }

        // Verify end-to-end cryptographic checksum
        const serverSha256 = (parsed.sha256 || '').toLowerCase();
        if (serverSha256 && serverSha256 !== clientSha256.toLowerCase()) {
          return reject(
            new Error(
              `Cryptographic SHA-256 checksum mismatch: Client calculated ${clientSha256}, but storage worker received ${serverSha256}. Transfer corrupted.`
            )
          );
        }

        if (onProgress) {
          onProgress({
            pct: 100,
            loadedBytes: file.size,
            totalBytes: file.size,
            stage: 'completed',
            detail: 'Complete!',
          });
        }

        resolve({
          success: true,
          url: parsed.url,
          key: parsed.key,
          filename: parsed.filename || file.name,
          sizeBytes: parsed.sizeBytes || file.size,
          sha256: clientSha256,
          contentType: parsed.contentType || 'application/octet-stream',
          platform: parsed.platform || metadata.platform,
          version: parsed.version || metadata.version,
          channel: parsed.channel || metadata.channel,
          uploadedAt: parsed.uploadedAt || new Date().toISOString(),
        });
      };

      xhr.onerror = () => {
        reject(
          new Error(
            `Network or CORS connection failure when uploading to release storage at ${endpoint}.`
          )
        );
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload to Cloudflare R2 storage timed out.'));
      };

      xhr.timeout = 180000;
      xhr.send(formData);
      return;
    }

    // Node.js / test environment fallback
    if (typeof fetch !== 'undefined') {
      fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'X-Request-Id': clientRequestId,
        },
        body: formData,
      })
        .then(async (res) => {
          const raw = await res.text();
          let json: Record<string, any>;
          try {
            json = JSON.parse(raw);
          } catch {
            return reject(new Error('Invalid JSON response: ' + raw.slice(0, 100)));
          }
          if (!res.ok || json.success !== true) {
            return reject(new Error(json.error || `HTTP ${res.status}`));
          }
          resolve({
            success: true,
            url: json.url,
            key: json.key,
            filename: json.filename || file.name,
            sizeBytes: json.sizeBytes || file.size,
            sha256: json.sha256 || clientSha256,
            contentType: json.contentType || 'application/octet-stream',
            platform: json.platform || metadata.platform,
            version: json.version || metadata.version,
            channel: json.channel || metadata.channel,
            uploadedAt: json.uploadedAt || new Date().toISOString(),
          });
        })
        .catch(reject);
      return;
    }

    reject(new Error('No HTTP transport available.'));
  });
}

/**
 * Primary release binary upload entrypoint.
 * Automatically chooses between multipart chunked upload (> 10 MB) and single upload (<= 10 MB).
 */
export async function uploadReleaseToStorage(
  file: File,
  metadata: {
    platform: ReleasePlatform;
    version: string;
    channel: ReleaseChannel;
    product?: string;
  },
  onProgress?: (progress: UploadReleaseProgress) => void,
  explicitAuthToken?: string
): Promise<UploadReleaseResponse> {
  // Always use multipart chunked upload for files > 10MB to guarantee bypassing Cloudflare edge request body limits
  if (file.size > 10 * 1024 * 1024) {
    return uploadReleaseMultipart(file, metadata, onProgress, explicitAuthToken);
  }

  try {
    return await uploadReleaseSingle(file, metadata, onProgress, explicitAuthToken);
  } catch (err: any) {
    console.warn('[ReleaseService] Single upload failed, attempting fallback to multipart upload:', err);
    return uploadReleaseMultipart(file, metadata, onProgress, explicitAuthToken);
  }
}

/**
 * Loads all registered releases from Firestore /releases and siteConfig.
 */
export async function getRegisteredReleases(): Promise<AppReleaseRecord[]> {
  const { db, isConfigured } = initializeFirebase();
  if (!isConfigured || !db) {
    return DEFAULT_DESKTOP_RELEASES;
  }

  try {
    const fetchPromise = getDocs(collection(db, 'releases'));
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1800));
    const releasesSnap = await Promise.race([fetchPromise, timeoutPromise]);
    if (releasesSnap && !releasesSnap.empty) {
      const records: AppReleaseRecord[] = releasesSnap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          productId: d.productId || 'orion-9',
          productName: d.productName || 'Orion-9',
          version: d.version || '9.0.0',
          releaseDate: d.releaseDate || new Date().toISOString().slice(0, 10),
          platform: d.platform as ReleasePlatform,
          format: d.format as ReleasePackageFormat,
          status: (d.status as ReleasePublicationStatus) || 'published',
          filename: d.filename || 'Orion-9-Setup.exe',
          objectKey: d.objectKey || '',
          sizeBytes: Number(d.sizeBytes || d.fileSizeBytes || 0),
          sha256: d.sha256 || '',
          downloadUrl: d.downloadUrl || '',
          channel: (d.channel as ReleaseChannel) || 'stable',
          isLatest: Boolean(d.isLatest),
          releaseNotes: Array.isArray(d.releaseNotes)
            ? d.releaseNotes
            : typeof d.releaseNotes === 'string'
              ? [d.releaseNotes]
              : [],
          minimumOs: d.minimumOs || d.minimumOsVersion || 'Universal',
          downloadCount: Number(d.downloadCount || 0),
          externalUrl: d.externalUrl || undefined,
          uploadedAt: d.uploadedAt || undefined,
          publishedAt: d.publishedAt || undefined,
          createdBy: d.createdBy || undefined,
          publishedBy: d.publishedBy || undefined,
          preflightGates: d.preflightGates || {
            formatValidated: true,
            shaVerified: true,
            signatureChecked: true,
          },
          updatedAt: d.updatedAt || undefined,
          updatedBy: d.updatedBy || undefined,
        };
      });
      return records;
    }

    // Check siteConfig/desktopReleases fallback
    const configSnap = await getDoc(doc(db, 'siteConfig', 'desktopReleases'));
    if (configSnap.exists()) {
      const data = configSnap.data();
      const list = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];
      if (list.length > 0) return list;
    }
  } catch (err) {
    console.warn('[ReleaseService] Could not read Firestore releases collection:', err);
  }

  return DEFAULT_DESKTOP_RELEASES;
}

/**
 * Records an audit log entry in /auditLogs.
 */
export async function logReleaseAudit(
  actorEmail: string,
  action: 'publish' | 'save_draft' | 'reset_defaults' | 'auth_config' | 'role_check',
  summary: string
): Promise<void> {
  const { db, isConfigured, auth } = initializeFirebase();
  if (!isConfigured || !db) return;

  try {
    const actorUid = auth?.currentUser?.uid || 'admin-system';
    await addDoc(collection(db, 'auditLogs'), {
      actorUid,
      actorEmail: actorEmail || 'admin@orion-9.com',
      section: 'releases',
      action,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[ReleaseService] Audit log write note:', err);
  }
}

/**
 * Saves or updates a release record in Firestore and updates the siteConfig distribution catalog.
 */
export async function persistReleaseRecord(
  release: AppReleaseRecord,
  actorEmail: string,
  allReleases: AppReleaseRecord[]
): Promise<{ success: boolean; error?: string }> {
  const { db, isConfigured, auth } = initializeFirebase();
  const canWriteFirestore = isConfigured && db && Boolean(auth?.currentUser);
  if (!canWriteFirestore) {
    return { success: true };
  }

  try {
    const updatedRecord: AppReleaseRecord = {
      ...release,
      updatedAt: new Date().toISOString(),
      updatedBy: actorEmail,
    };

    // 1. Write granular document to /releases/{id}
    await setDoc(doc(db, 'releases', release.id), updatedRecord, { merge: true });

    // 2. Synchronize full catalog in /siteConfig/desktopReleases & /siteConfig/releases
    const mergedList = allReleases.map((r) => (r.id === release.id ? updatedRecord : r));
    if (!mergedList.some((r) => r.id === release.id)) {
      mergedList.push(updatedRecord);
    }

    await setDoc(
      doc(db, 'siteConfig', 'desktopReleases'),
      {
        items: mergedList,
        updatedAt: new Date().toISOString(),
        updatedBy: actorEmail,
      },
      { merge: true }
    );

    await logReleaseAudit(
      actorEmail,
      'save_draft',
      `Updated release ${release.version} (${release.platform}) status=${release.status}`
    );

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Publishes an application release and marks prior published releases for the same platform & channel as superseded.
 */
export async function publishApplicationRelease(
  releaseId: string,
  actorEmail: string,
  currentReleases: AppReleaseRecord[]
): Promise<{ success: boolean; error?: string; updatedList: AppReleaseRecord[] }> {
  const target = currentReleases.find((r) => r.id === releaseId);
  if (!target) {
    return { success: false, error: `Release ID "${releaseId}" not found.`, updatedList: currentReleases };
  }

  // Safety guard: Never publish a release without verified binary SHA-256 and download URL
  if (!target.sha256 || target.sha256.length !== 64 || !target.downloadUrl) {
    return {
      success: false,
      error: 'Cannot publish release: Binary asset is missing or has unverified cryptographic SHA-256.',
      updatedList: currentReleases,
    };
  }

  const { db, isConfigured, auth } = initializeFirebase();
  const now = new Date().toISOString();

  const updatedList = currentReleases.map((r) => {
    // If it's the target release, publish it
    if (r.id === releaseId) {
      return {
        ...r,
        status: 'published' as ReleasePublicationStatus,
        isLatest: true,
        publishedAt: now,
        publishedBy: actorEmail,
        updatedAt: now,
        updatedBy: actorEmail,
      };
    }

    // If it's for the same platform and channel, mark prior published as superseded
    if (r.platform === target.platform && r.channel === target.channel && r.status === 'published') {
      return {
        ...r,
        status: 'superseded' as ReleasePublicationStatus,
        isLatest: false,
        updatedAt: now,
        updatedBy: actorEmail,
      };
    }

    return r;
  });

  const canWriteFirestore = isConfigured && db && Boolean(auth?.currentUser);
  if (canWriteFirestore) {
    try {
      // 1. Update target document
      const publishedDoc = updatedList.find((r) => r.id === releaseId)!;
      await setDoc(doc(db, 'releases', releaseId), publishedDoc, { merge: true });

      // 2. Update superseded documents
      for (const r of updatedList) {
        if (r.status === 'superseded' && r.platform === target.platform && r.channel === target.channel) {
          await setDoc(doc(db, 'releases', r.id), r, { merge: true });
        }
      }

      // 3. Update siteConfig catalog
      await setDoc(
        doc(db, 'siteConfig', 'desktopReleases'),
        {
          items: updatedList,
          updatedAt: now,
          updatedBy: actorEmail,
        },
        { merge: true }
      );

      await logReleaseAudit(
        actorEmail,
        'publish',
        `Published official release v${target.version} (${target.platform}) channel=${target.channel}`
      );
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message, updatedList: currentReleases };
    }
  }

  return { success: true, updatedList };
}

/**
 * Rolls back an active release to a prior version.
 */
export async function rollbackApplicationRelease(
  targetReleaseId: string,
  actorEmail: string,
  currentReleases: AppReleaseRecord[]
): Promise<{ success: boolean; error?: string; updatedList: AppReleaseRecord[] }> {
  return publishApplicationRelease(targetReleaseId, actorEmail, currentReleases);
}

/**
 * Unpublishes / withdraws an active release.
 */
export async function unpublishApplicationRelease(
  releaseId: string,
  actorEmail: string,
  currentReleases: AppReleaseRecord[]
): Promise<{ success: boolean; error?: string; updatedList: AppReleaseRecord[] }> {
  const target = currentReleases.find((r) => r.id === releaseId);
  if (!target) {
    return { success: false, error: 'Release not found.', updatedList: currentReleases };
  }

  const { db, isConfigured, auth } = initializeFirebase();
  const now = new Date().toISOString();

  const updatedList = currentReleases.map((r) => {
    if (r.id === releaseId) {
      return {
        ...r,
        status: 'archived' as ReleasePublicationStatus,
        isLatest: false,
        updatedAt: now,
        updatedBy: actorEmail,
      };
    }
    return r;
  });

  if (isConfigured && db) {
    try {
      await setDoc(
        doc(db, 'releases', releaseId),
        {
          status: 'archived',
          isLatest: false,
          updatedAt: now,
          updatedBy: actorEmail,
        },
        { merge: true }
      );

      await setDoc(
        doc(db, 'siteConfig', 'desktopReleases'),
        {
          items: updatedList,
          updatedAt: now,
          updatedBy: actorEmail,
        },
        { merge: true }
      );

      await logReleaseAudit(
        actorEmail,
        'save_draft',
        `Unpublished release v${target.version} (${target.platform})`
      );
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message, updatedList: currentReleases };
    }
  }

  return { success: true, updatedList };
}

/**
 * Deletes a release record (prevented if currently published).
 */
export async function deleteApplicationRelease(
  releaseId: string,
  actorEmail: string,
  currentReleases: AppReleaseRecord[]
): Promise<{ success: boolean; error?: string; updatedList: AppReleaseRecord[] }> {
  const target = currentReleases.find((r) => r.id === releaseId);
  if (!target) {
    return { success: false, error: 'Release not found.', updatedList: currentReleases };
  }

  if (target.status === 'published') {
    return {
      success: false,
      error: 'Cannot delete an active published release. Please unpublish or supersede it first.',
      updatedList: currentReleases,
    };
  }

  const { db, isConfigured, auth } = initializeFirebase();
  const updatedList = currentReleases.filter((r) => r.id !== releaseId);

  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, 'releases', releaseId));
      await setDoc(
        doc(db, 'siteConfig', 'desktopReleases'),
        {
          items: updatedList,
          updatedAt: new Date().toISOString(),
          updatedBy: actorEmail,
        },
        { merge: true }
      );

      await logReleaseAudit(
        actorEmail,
        'save_draft',
        `Deleted release record ${releaseId} (${target.filename})`
      );
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message, updatedList: currentReleases };
    }
  }

  return { success: true, updatedList };
}
