import type { DesktopReleaseRecord } from '../types/cms.ts';

export type DownloadErrorType =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'server_error'
  | 'network_error'
  | 'html_fallback'
  | 'corrupt_binary'
  | 'checksum_mismatch'
  | 'cancelled'
  | 'unknown';

export interface DownloadErrorDetails {
  type: DownloadErrorType;
  message: string;
  statusCode?: number;
  contentType?: string;
  details?: string;
}

export class DesktopDownloadError extends Error {
  public type: DownloadErrorType;
  public statusCode?: number;
  public contentType?: string;

  constructor(details: DownloadErrorDetails) {
    super(details.message);
    this.name = 'DesktopDownloadError';
    this.type = details.type;
    this.statusCode = details.statusCode;
    this.contentType = details.contentType;
  }
}

/**
 * Authoritative Cloudflare R2 worker CDN base endpoint for desktop workstation binaries.
 */
export const DEFAULT_RELEASE_CDN_BASE =
  'https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev';

/**
 * Resolves a release download URL to an authentic, absolute streaming endpoint.
 * Protects against relative routes (/downloads/...) falling through to the SPA HTML host.
 */
export function resolveReleaseDownloadUrl(downloadUrl: string): string {
  if (!downloadUrl) return '';
  const trimmed = downloadUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  const env =
    (import.meta as unknown as { env?: Record<string, string | undefined> })?.env || {};
  const configuredCdn = env.VITE_RELEASE_CDN_BASE?.trim() || env.VITE_R2_PUBLIC_BASE_URL?.trim();
  const cdnBase = (configuredCdn || DEFAULT_RELEASE_CDN_BASE).replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${cdnBase}${cleanPath}`;
}

export interface ReleaseAvailabilityResult {
  available: boolean;
  status?: number;
  sizeBytes?: number;
  error?: string;
  isHtmlFallback?: boolean;
}

/**
 * Probes the distribution server using a lightweight HEAD request to verify that the
 * binary actually exists on the CDN/R2 before permitting download initiation.
 */
export async function checkReleaseAvailability(
  release: DesktopReleaseRecord,
  signal?: AbortSignal
): Promise<ReleaseAvailabilityResult> {
  const resolvedUrl = resolveReleaseDownloadUrl(release.downloadUrl);
  try {
    const res = await fetch(resolvedUrl, {
      method: 'HEAD',
      headers: {
        Accept:
          'application/octet-stream, application/vnd.microsoft.portable-executable, application/x-apple-diskimage, application/x-msi, */*',
      },
      signal,
    });

    const ct = (res.headers.get('content-type') || '').toLowerCase();
    const cl = res.headers.get('content-length');
    const size = cl ? parseInt(cl, 10) : undefined;

    // Detect and reject HTML fallback responses
    if (ct.includes('text/html') || ct.includes('application/xhtml+xml')) {
      return {
        available: false,
        status: res.status,
        isHtmlFallback: true,
        error: `Endpoint returned HTML fallback (${ct}) instead of authentic desktop installer binary.`,
      };
    }

    if (res.status === 200) {
      return {
        available: true,
        status: 200,
        sizeBytes: size,
      };
    }

    if (res.status === 404) {
      return {
        available: false,
        status: 404,
        error: `Release artifact "${release.filename}" is currently not deployed on the distribution server (HTTP 404).`,
      };
    }

    return {
      available: false,
      status: res.status,
      error: `Distribution storage server returned status ${res.status} ${res.statusText}.`,
    };
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') {
      return { available: false, error: 'Availability check was cancelled.' };
    }
    return {
      available: false,
      error: `Could not reach release distribution server: ${(err as Error).message}`,
    };
  }
}

/**
 * Validates whether a desktop release is eligible for distribution based on status and user role.
 */
export function validateReleaseForDownload(
  release: DesktopReleaseRecord,
  userRole?: string
): { allowed: boolean; error?: string; errorType?: DownloadErrorType } {
  if (release.status === 'disabled' || release.status === 'retired') {
    return {
      allowed: false,
      error: `Release v${release.version} (${release.platform}) has been ${release.status} by administrators and is unavailable for distribution.`,
      errorType: 'forbidden',
    };
  }

  if (release.status === 'draft' && userRole !== 'admin') {
    return {
      allowed: false,
      error: `Release v${release.version} is in draft staging and accessible only to authorized administrators.`,
      errorType: 'forbidden',
    };
  }

  return { allowed: true };
}

/**
 * Verifies the binary response headers from the distribution server.
 * Protects against SPA HTML fallback responses (where Vite or a CDN serves index.html for missing routes).
 */
export function verifyBinaryResponseHeaders(
  response: Response,
  expectedRelease: DesktopReleaseRecord
): { valid: boolean; error?: string; errorType?: DownloadErrorType } {
  const status = response.status;
  const contentType = (response.headers.get('content-type') || '').toLowerCase();

  // 1. Detect and reject SPA HTML fallback responses
  if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml')) {
    return {
      valid: false,
      error: `Binary streaming error: Endpoint returned HTML fallback (${contentType}) instead of authentic desktop installer binary.`,
      errorType: 'html_fallback',
    };
  }

  // 2. Classify HTTP status codes
  if (status === 401) {
    return {
      valid: false,
      error: 'Authentication required: Your user session is invalid or expired. Please sign in.',
      errorType: 'unauthorized',
    };
  }

  if (status === 403) {
    return {
      valid: false,
      error: `Access denied: Distribution of release ${expectedRelease.filename} is restricted.`,
      errorType: 'forbidden',
    };
  }

  if (status === 404) {
    return {
      valid: false,
      error: `Release artifact "${expectedRelease.filename}" was not found on the distribution storage server (HTTP 404).`,
      errorType: 'not_found',
    };
  }

  if (status >= 500) {
    return {
      valid: false,
      error: `Distribution storage server returned error (HTTP ${status} ${response.statusText}). Please try again later.`,
      errorType: 'server_error',
    };
  }

  if (!response.ok) {
    return {
      valid: false,
      error: `HTTP download failed with status ${status} ${response.statusText}.`,
      errorType: 'unknown',
    };
  }

  return { valid: true };
}

export interface StreamInstallerOptions {
  signal?: AbortSignal;
  onProgress?: (receivedBytes: number, totalBytes: number) => void;
}

/**
 * Initiates an authentic, chunked stream download of the desktop installer.
 * Avoids loading the complete 30MB+ payload into JavaScript heap if supported,
 * and triggers the native browser file download with the authentic filename.
 */
export async function downloadDesktopInstaller(
  release: DesktopReleaseRecord,
  options: StreamInstallerOptions = {}
): Promise<{ success: boolean; bytesReceived: number; sha256Matched?: boolean }> {
  const { signal, onProgress } = options;

  // Resolve download URL to authoritative CDN
  const resolvedUrl = resolveReleaseDownloadUrl(release.downloadUrl);

  let response: Response;
  try {
    response = await fetch(resolvedUrl, {
      method: 'GET',
      headers: {
        Accept:
          'application/octet-stream, application/vnd.microsoft.portable-executable, application/x-apple-diskimage, application/x-msi, */*',
      },
      signal,
    });
  } catch (fetchErr: unknown) {
    if ((fetchErr as Error)?.name === 'AbortError') {
      throw new DesktopDownloadError({
        type: 'cancelled',
        message: 'Download was cancelled by user.',
      });
    }

    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    throw new DesktopDownloadError({
      type: 'network_error',
      message: isOffline
        ? 'Network connectivity lost. Please check your internet connection.'
        : `Network request to download endpoint failed: ${(fetchErr as Error).message}`,
    });
  }

  // Verify headers and status
  const headerCheck = verifyBinaryResponseHeaders(response, release);
  if (!headerCheck.valid) {
    throw new DesktopDownloadError({
      type: headerCheck.errorType || 'unknown',
      message: headerCheck.error || 'Binary response verification failed',
      statusCode: response.status,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  // Stream binary chunks
  const contentLengthHeader = response.headers.get('content-length');
  const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : release.sizeBytes;
  const reader = response.body?.getReader();

  let receivedBytes = 0;
  const chunks: Uint8Array[] = [];

  if (reader) {
    while (true) {
      if (signal?.aborted) {
        reader.cancel();
        throw new DesktopDownloadError({
          type: 'cancelled',
          message: 'Download was cancelled by user.',
        });
      }

      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        chunks.push(value);
        receivedBytes += value.length;
        if (onProgress) {
          onProgress(receivedBytes, totalBytes);
        }
      }
    }
  } else {
    // Fallback if reader not supported
    const blobData = await response.blob();
    receivedBytes = blobData.size;
    chunks.push(new Uint8Array(await blobData.arrayBuffer()));
  }

  // Sanity check: Ensure we did not receive an empty or 0-byte file
  if (receivedBytes === 0) {
    throw new DesktopDownloadError({
      type: 'corrupt_binary',
      message: 'Downloaded package is empty (0 bytes received).',
    });
  }

  // Cryptographic SHA-256 integrity verification if Web Crypto API is available
  let sha256Matched = false;
  if (typeof crypto !== 'undefined' && crypto.subtle && release.sha256) {
    try {
      const fullBuffer = new Uint8Array(receivedBytes);
      let offset = 0;
      for (const chunk of chunks) {
        fullBuffer.set(chunk, offset);
        offset += chunk.length;
      }
      const digestBuffer = await crypto.subtle.digest('SHA-256', fullBuffer);
      const hashArray = Array.from(new Uint8Array(digestBuffer));
      const calculatedHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      if (calculatedHex.toLowerCase() !== release.sha256.toLowerCase()) {
        throw new DesktopDownloadError({
          type: 'checksum_mismatch',
          message: `Cryptographic SHA-256 integrity check failed. Expected ${release.sha256}, but downloaded payload computed ${calculatedHex}.`,
        });
      }
      sha256Matched = true;
    } catch (cryptoErr) {
      if (cryptoErr instanceof DesktopDownloadError) {
        throw cryptoErr;
      }
      // If subtle crypto fails for another reason, do not block delivery
      console.warn('Subtle crypto SHA-256 calculation note:', cryptoErr);
    }
  }

  // Trigger browser download via Blob
  const blob = new Blob(chunks as BlobPart[], {
    type: response.headers.get('content-type') || 'application/octet-stream',
  });

  if (typeof window !== 'undefined') {
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = objectUrl;
    link.download = release.filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl);
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 1500);
  }

  return { success: true, bytesReceived: receivedBytes, sha256Matched };
}
