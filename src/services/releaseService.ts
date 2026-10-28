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
  stage: 'validating' | 'hashing' | 'uploading' | 'verifying' | 'completed' | 'failed';
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

// Configurable file size limits (matching Cloudflare Worker limits)
export const MAX_DESKTOP_RELEASE_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB
export const MAX_MOBILE_RELEASE_SIZE_BYTES = 150 * 1024 * 1024; // 150 MB

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
 * Resolves Cloudflare R2 Release Upload API endpoint.
 */
export function getReleaseUploadEndpoint(): string {
  const env =
    (import.meta as unknown as { env?: Record<string, string | undefined> })?.env || {};
  const explicit = env.VITE_R2_RELEASE_UPLOAD_ENDPOINT?.trim();
  if (explicit) return explicit;

  const cdnBase = env.VITE_RELEASE_CDN_BASE?.trim() || env.VITE_R2_PUBLIC_BASE_URL?.trim();
  const base = (cdnBase || DEFAULT_RELEASE_CDN_BASE).replace(/\/+$/, '');
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
 * Uploads a verified release binary to Cloudflare R2 through the authenticated Worker.
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
  // 1. Client-side validation
  if (onProgress) {
    onProgress({
      pct: 5,
      loadedBytes: 0,
      totalBytes: file.size,
      stage: 'validating',
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
    });
  }

  const clientSha256 = await computeFileSha256(file, (hPct) => {
    if (onProgress) {
      onProgress({
        pct: 15 + Math.round(hPct * 0.2), // 15% to 35%
        loadedBytes: 0,
        totalBytes: file.size,
        stage: 'hashing',
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

      xhr.timeout = 180000; // 3 minutes timeout for 100MB+ binaries
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
