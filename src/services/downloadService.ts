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
): Promise<{ success: boolean; bytesReceived: number }> {
  const { signal, onProgress } = options;

  // Resolve download URL (ensure relative URLs resolve against current origin)
  let resolvedUrl = release.downloadUrl;
  if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://')) {
    if (typeof window !== 'undefined') {
      resolvedUrl = new URL(release.downloadUrl, window.location.origin).toString();
    }
  }

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
    window.URL.revokeObjectURL(objectUrl);
    document.body.removeChild(link);
  }

  return { success: true, bytesReceived: receivedBytes };
}
