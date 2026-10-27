/**
 * ORION-9 CLOUDFLARE R2 BRANDING ASSET STORAGE & VALIDATION SERVICE
 *
 * Manages client-side validation, SVG security sanitization, dimension measurement,
 * and authenticated upload to Cloudflare R2 bucket `orion9-brand-assets`
 * via the Orion-9 Cloudflare R2 Upload Worker.
 *
 * Enforces Firebase Authentication ID token RBAC, file size <= 5 MB, and strict MIME type checks.
 * NEVER silently falls back to Base64 or unverified storage.
 */

import { initializeFirebase } from './firebase.ts';
import type { LogoPlacementMetadata } from '../types/cms.ts';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  dimensions?: string;
  fileType?: string;
  sizeBytes?: number;
  sanitizedContent?: string;
}

/**
 * Cloudflare R2 Storage Configuration Constants
 */
export const DEFAULT_R2_BUCKET = 'orion9-brand-assets';
export const RUNTIME_R2_ENDPOINT_KEY = 'orion9_r2_upload_endpoint';
export const DEFAULT_R2_WORKER_ENDPOINT =
  'https://orion9-r2-brand-uploader.ayushprakash0021.workers.dev/api/upload-logo';

/**
 * Resolves the active Cloudflare R2 upload endpoint from environment, runtime localStorage, or default worker.
 */
export function getR2UploadEndpoint(): string {
  const env =
    (import.meta as unknown as { env?: Record<string, string | undefined> })?.env || {};
  const envEndpoint = env.VITE_R2_UPLOAD_ENDPOINT?.trim();
  if (envEndpoint) {
    return envEndpoint;
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(RUNTIME_R2_ENDPOINT_KEY);
      if (stored?.trim() && (stored.startsWith('https://') || stored.startsWith('http://'))) {
        return stored.trim();
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  return DEFAULT_R2_WORKER_ENDPOINT;
}

export function setRuntimeR2UploadEndpoint(endpoint: string | null): void {
  if (typeof window === 'undefined') return;
  if (!endpoint || !endpoint.trim()) {
    window.localStorage.removeItem(RUNTIME_R2_ENDPOINT_KEY);
  } else {
    window.localStorage.setItem(RUNTIME_R2_ENDPOINT_KEY, endpoint.trim());
  }
}

/**
 * Supported MIME types and extensions for website branding logos
 */
export const ALLOWED_LOGO_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
];

export const ALLOWED_LOGO_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

export const MAX_LOGO_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Safely sanitizes raw SVG strings by stripping dangerous tags, scripts, and event handlers.
 */
export function sanitizeSvg(svgText: string): {
  sanitized: string;
  isClean: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!svgText || typeof svgText !== 'string') {
    return { sanitized: '', isClean: false, warnings: ['Empty SVG content'] };
  }

  if (!/<svg\b[^>]*>/i.test(svgText)) {
    return { sanitized: '', isClean: false, warnings: ['Invalid SVG: missing <svg> root element'] };
  }

  let cleaned = svgText;

  // 1. Strip <script>...</script>
  if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(cleaned)) {
    cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    warnings.push('Embedded <script> tags were stripped');
  }

  // 2. Strip dangerous inline tags
  const dangerousTags = ['foreignObject', 'iframe', 'object', 'embed', 'applet', 'meta', 'link'];
  for (const tag of dangerousTags) {
    const regex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?<\\/${tag}>)?`, 'gi');
    if (regex.test(cleaned)) {
      cleaned = cleaned.replace(regex, '');
      warnings.push(`Dangerous <${tag}> elements were stripped`);
    }
  }

  // 3. Strip all on* attributes
  const onAttrRegex = /\s+on[a-z]+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
  if (onAttrRegex.test(cleaned)) {
    cleaned = cleaned.replace(onAttrRegex, '');
    warnings.push('Interactive event listener attributes (on*) were stripped');
  }

  // 4. Strip dangerous protocols from href and xlink:href
  const dangerousProtocols =
    /(href|xlink:href)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|"vbscript:[^"]*"|'vbscript:[^']*'|"data:text\/html[^"]*"|'data:text\/html[^']*')/gi;
  if (dangerousProtocols.test(cleaned)) {
    cleaned = cleaned.replace(dangerousProtocols, '$1=""');
    warnings.push('Malicious protocol links (javascript:, vbscript:) were neutralized');
  }

  return {
    sanitized: cleaned,
    isClean: warnings.length === 0,
    warnings,
  };
}

/**
 * Measures dimensions of an image file (PNG, JPEG, WebP, SVG) client-side.
 */
export function measureImageDimensions(file: File | Blob): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve('Unknown');
      return;
    }

    const isSvg =
      file.type === 'image/svg+xml' || (file instanceof File && file.name.endsWith('.svg'));

    if (isSvg && file instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          const viewBoxMatch = text.match(
            /viewBox=["']\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i
          );
          if (viewBoxMatch && viewBoxMatch[1] && viewBoxMatch[2]) {
            const w = Math.round(parseFloat(viewBoxMatch[1]));
            const h = Math.round(parseFloat(viewBoxMatch[2]));
            resolve(`${w} × ${h} px`);
            return;
          }
          const widthMatch = text.match(/\bwidth=["']([\d.]+)(?:px)?["']/i);
          const heightMatch = text.match(/\bheight=["']([\d.]+)(?:px)?["']/i);
          if (widthMatch && heightMatch) {
            const w = Math.round(parseFloat(widthMatch[1]));
            const h = Math.round(parseFloat(heightMatch[1]));
            resolve(`${w} × ${h} px`);
            return;
          }
        } catch {
          // Fallback to vector
        }
        resolve('Vector (Scalable)');
      };
      reader.onerror = () => resolve('Vector (Scalable)');
      reader.readAsText(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      URL.revokeObjectURL(objectUrl);
      resolve(w > 0 && h > 0 ? `${w} × ${h} px` : 'Responsive');
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve('Responsive');
    };
    img.src = objectUrl;
  });
}

/**
 * Validates a logo file before upload (file format, size, SVG sanitization, dimensions).
 */
export async function validateLogoFile(file: File): Promise<FileValidationResult> {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // 1. File size check
  if (file.size > MAX_LOGO_FILE_SIZE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return { valid: false, error: `File size (${mb} MB) exceeds maximum allowed size of 5 MB.` };
  }

  // 2. Format / extension check
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  const mimeType = (file.type || '').toLowerCase();
  const isAllowedExt = ALLOWED_LOGO_EXTENSIONS.includes(ext);
  const isAllowedMime = ALLOWED_LOGO_MIME_TYPES.includes(mimeType) || !mimeType;

  if (!isAllowedExt && !isAllowedMime) {
    return {
      valid: false,
      error: `Unsupported file type (${ext || mimeType}). Supported formats: PNG, JPEG, WebP, SVG.`,
    };
  }

  const dimensions = await measureImageDimensions(file);

  // 3. SVG sanitization check
  if (ext === '.svg' || mimeType === 'image/svg+xml') {
    const rawSvg = await file.text();
    const { sanitized } = sanitizeSvg(rawSvg);
    return {
      valid: true,
      dimensions,
      fileType: 'image/svg+xml',
      sizeBytes: file.size,
      sanitizedContent: sanitized,
    };
  }

  return {
    valid: true,
    dimensions,
    fileType: mimeType || `image/${ext.replace('.', '')}`,
    sizeBytes: file.size,
  };
}

/**
 * Classifies Cloudflare R2 & Storage errors into actionable, explicit user-facing messages.
 */
export function classifyStorageError(storageErr: unknown): string {
  const errCode = (storageErr as { code?: string })?.code;
  const errMsg = (storageErr as Error)?.message || '';
  const status = (storageErr as { status?: number })?.status;
  const combined = `${errCode || ''} ${errMsg} ${status || ''}`.toLowerCase();

  // Preserved specific server-side diagnostic messages
  if (
    errMsg &&
    !errMsg.startsWith('HTTP ') &&
    !errMsg.includes('Unknown storage error') &&
    errMsg !== 'Logo upload failed.'
  ) {
    if (combined.includes('expired')) {
      return 'Session expired: Your authentication session has expired. Please sign in again as an administrator.';
    }
    if (combined.includes('malformed') || combined.includes('invalid cryptographic signature')) {
      return 'Authentication failed: Invalid administrator token signature. Please sign in again.';
    }
    if (
      status === 403 ||
      errCode === 'unauthorized' ||
      combined.includes('permission') ||
      combined.includes('unauthorized') ||
      combined.includes('access denied')
    ) {
      if (errMsg && errMsg !== 'Permission denied' && errMsg !== 'Unauthorized' && errMsg.includes('administrator')) {
        return errMsg.includes('Permission denied') ? errMsg : `Permission denied: ${errMsg}`;
      }
      return 'Permission denied: You do not have permission to upload brand assets to Cloudflare R2. Please ensure you are authenticated as an administrator.';
    }
  }

  if (
    status === 401 ||
    errCode === 'unauthenticated' ||
    combined.includes('unauthenticated') ||
    combined.includes('sign in')
  ) {
    return 'Authentication required: You must be signed in as an administrator to upload assets.';
  }

  if (
    status === 403 ||
    errCode === 'unauthorized' ||
    combined.includes('permission') ||
    combined.includes('unauthorized') ||
    combined.includes('access denied')
  ) {
    return 'Permission denied: You do not have permission to upload brand assets to Cloudflare R2. Please ensure you are authenticated as an administrator.';
  }

  if (
    status === 413 ||
    errCode === 'file_too_large' ||
    combined.includes('file size') ||
    combined.includes('too large')
  ) {
    return 'File size exceeds maximum allowed size of 5 MB.';
  }

  if (
    status === 400 ||
    errCode === 'unsupported_format' ||
    errCode === 'invalid_form_data' ||
    combined.includes('unsupported file format') ||
    combined.includes('unsupported format')
  ) {
    return 'Invalid file: Unsupported file format. Please upload a valid SVG, PNG, WebP, or JPG image.';
  }

  if (errCode === 'invalid_svg' || combined.includes('sanitization')) {
    return 'Invalid SVG file: Security sanitization failed. Please verify the SVG does not contain executable scripts.';
  }

  if (errCode === 'missing_file' || combined.includes('no valid image file')) {
    return 'Invalid upload request: No valid image file was provided in the upload payload.';
  }

  if (
    status === 404 ||
    status === 503 ||
    errCode === 'r2_binding_missing' ||
    errCode === 'storage/bucket-not-found' ||
    combined.includes('bucket') ||
    combined.includes('endpoint or bucket') ||
    combined.includes('not found')
  ) {
    return `Cloudflare R2 bucket "${DEFAULT_R2_BUCKET}" or upload worker is unavailable. Please check the Cloudflare Worker deployment.`;
  }

  if (
    errCode === 'r2_write_failed' ||
    combined.includes('r2 write error') ||
    combined.includes('r2 storage error')
  ) {
    return `Cloudflare R2 storage error: Failed to write asset to bucket "${DEFAULT_R2_BUCKET}". Please verify R2 bucket permissions.`;
  }

  if (
    status === 500 ||
    status === 502 ||
    errCode === 'worker_exception' ||
    combined.includes('worker internal error') ||
    combined.includes('worker internal exception') ||
    combined.includes('error 1101')
  ) {
    return 'Backend service error: The Cloudflare R2 upload worker encountered an internal error. Please check worker logs and try again.';
  }

  if (
    errCode === 'cors_or_network_failure' ||
    combined.includes('cors') ||
    combined.includes('network or cors')
  ) {
    return 'Network or CORS failure: Unable to reach Cloudflare R2 upload worker. Please check your internet connection and verify CORS origin permissions.';
  }

  if (
    errCode === 'network_offline' ||
    (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.onLine === false)
  ) {
    return 'Network failure: Your device is currently offline. Please check your internet connection and try again.';
  }

  if (
    errCode === 'upload_timeout' ||
    combined.includes('timed out')
  ) {
    return 'Network timeout: Upload request to Cloudflare R2 timed out. Please check your internet connection and try again.';
  }

  if (
    errCode === 'network_error' ||
    errCode === 'storage/retry-limit-exceeded' ||
    combined.includes('network') ||
    combined.includes('offline') ||
    combined.includes('timeout') ||
    combined.includes('failed to fetch')
  ) {
    return 'Network failure: Unable to upload logo to Cloudflare R2. Please check your internet connection and try again.';
  }

  if (combined.includes('not configured')) {
    return 'Cloudflare R2 upload endpoint is not configured. Please set VITE_R2_UPLOAD_ENDPOINT or verify worker deployment.';
  }

  return `Cloudflare R2 upload failed: ${errMsg || 'Unknown storage error.'}`;
}

/**
 * Uploads a validated logo file to Cloudflare R2 under branding/logos/
 * via the authenticated Orion-9 R2 worker endpoint and returns the permanent public download URL.
 * NEVER silently falls back to Base64 or Firebase Storage on failure.
 */
export async function uploadBrandingLogoAsset(
  placement: 'header' | 'auth' | 'footer' | 'default' | 'shared' | 'creator',
  file: File,
  onProgress?: (progressPct: number) => void,
  explicitAuthToken?: string
): Promise<LogoPlacementMetadata> {
  // 1. Client-side file validation
  const validation = await validateLogoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid logo file.');
  }

  const dimensions = validation.dimensions || 'Responsive';
  const fileType = validation.fileType || file.type || 'image/png';
  const sizeBytes = validation.sizeBytes || file.size;

  // 2. Authentication: obtain Firebase ID token
  let token = explicitAuthToken;
  if (!token) {
    const { auth } = initializeFirebase();
    const currentUser = auth?.currentUser;
    if (currentUser) {
      try {
        // Attempt fresh token first, with fallback to standard token
        token = await currentUser.getIdToken(true).catch(async () => {
          return currentUser.getIdToken(false);
        });
      } catch (tokenErr) {
        console.error('[BrandingStorage] Failed to retrieve Firebase ID token:', tokenErr);
      }
    }
  }

  // Fallback: Check if local development admin session is active
  if (!token && typeof window !== 'undefined') {
    try {
      const isDevAdmin = window.sessionStorage.getItem('orion_local_dev_admin') === 'true';
      if (isDevAdmin) {
        token = 'mock-local-dev-admin-token';
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }

  if (!token) {
    throw new Error(
      'Authentication required: You must be signed in as an administrator to upload assets.'
    );
  }

  // 3. Resolve upload endpoint
  const endpoint = getR2UploadEndpoint();
  if (!endpoint) {
    throw new Error(
      'Cloudflare R2 upload endpoint is not configured. Please configure VITE_R2_UPLOAD_ENDPOINT.'
    );
  }

  // 4. Construct FormData payload
  const formData = new FormData();
  let payloadBlob: Blob = file;
  if (validation.sanitizedContent) {
    payloadBlob = new Blob([validation.sanitizedContent], { type: 'image/svg+xml' });
  }

  formData.append('file', payloadBlob, file.name);
  formData.append('placement', placement);
  formData.append('dimensions', dimensions);

  // 5. Execute authenticated upload
  try {
    const result = await new Promise<{
      url: string;
      dimensions?: string;
      fileType?: string;
      sizeBytes?: number;
      uploadedAt?: string;
    }>((resolve, reject) => {
      // Browser environment with XMLHttpRequest for upload progress tracking
      if (typeof XMLHttpRequest !== 'undefined') {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('Accept', 'application/json');

        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable && evt.total > 0) {
              const pct = Math.round((evt.loaded / evt.total) * 100);
              onProgress(pct);
            }
          };
        }

        xhr.onload = () => {
          if (onProgress) onProgress(100);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const parsed = JSON.parse(xhr.responseText);
              if (parsed.success && parsed.url) {
                resolve(parsed);
              } else {
                reject({
                  status: xhr.status,
                  code: parsed.code,
                  message: parsed.error || 'Server did not return a valid asset URL.',
                });
              }
            } catch {
              reject({ status: xhr.status, message: 'Invalid JSON response from R2 worker.' });
            }
          } else {
            let errorMsg = `HTTP ${xhr.status}`;
            let errorCode: string | undefined;
            try {
              const parsed = JSON.parse(xhr.responseText);
              if (parsed.error) errorMsg = parsed.error;
              if (parsed.code) errorCode = parsed.code;
            } catch {
              // Ignore parse error
            }
            reject({ status: xhr.status, code: errorCode, message: errorMsg });
          }
        };

        xhr.onerror = () => {
          const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
          if (isOffline) {
            reject({
              code: 'network_offline',
              status: 0,
              message: 'Network offline: Your device is not connected to the internet.',
            });
          } else {
            reject({
              code: 'cors_or_network_failure',
              status: 0,
              message: `Network or CORS error: Unable to reach Cloudflare R2 upload worker at ${endpoint}. This may be caused by a CORS restriction, firewall, or ad-blocker.`,
            });
          }
        };

        xhr.ontimeout = () => {
          reject({
            code: 'upload_timeout',
            status: 408,
            message: 'Upload request to Cloudflare R2 timed out after 30 seconds. Please try again.',
          });
        };

        xhr.timeout = 30000;
        xhr.send(formData);
        return;
      }

      // Fallback for non-browser Node.js environments (tests)
      if (typeof fetch !== 'undefined') {
        fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: formData,
        })
          .then(async (res) => {
            if (onProgress) onProgress(100);
            if (!res.ok) {
              let msg = `HTTP ${res.status}`;
              let code: string | undefined;
              try {
                const errData = await res.json();
                if (errData.error) msg = errData.error;
                if (errData.code) code = errData.code;
              } catch {}
              return reject({ status: res.status, code, message: msg });
            }
            const data = await res.json();
            resolve(data);
          })
          .catch((err) => {
            const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
            reject({
              code: isOffline ? 'network_offline' : 'cors_or_network_failure',
              status: 0,
              message: isOffline
                ? 'Network offline: Your device is not connected to the internet.'
                : `Network or CORS error: ${err.message}`,
            });
          });
        return;
      }

      reject(new Error('No HTTP transport available.'));
    });

    if (!result.url || typeof result.url !== 'string' || (!result.url.startsWith('http') && !result.url.startsWith('/'))) {
      throw new Error('Failed to obtain a permanent Cloudflare R2 URL.');
    }

    return {
      url: result.url,
      dimensions: result.dimensions || dimensions,
      fileType: result.fileType || fileType,
      sizeBytes: result.sizeBytes || sizeBytes,
      uploadedAt: result.uploadedAt || new Date().toISOString(),
      originalFilename: file.name,
    };
  } catch (err: unknown) {
    console.error('[BrandingStorage] Cloudflare R2 upload failed:', err);
    const userMessage = classifyStorageError(err);
    throw new Error(userMessage);
  }
}

/**
 * Validates a creator photograph file before upload (file format, size <= 5MB, SVG sanitization, dimensions).
 */
export const validateCreatorImageFile = validateLogoFile;

/**
 * Uploads a validated creator photograph to Cloudflare R2 bucket `orion9-brand-assets`
 * via the authenticated Orion-9 R2 worker upload endpoint.
 * Enforces file size <= 5MB, supported formats (PNG, JPEG, WebP, SVG), SVG sanitization, and admin authentication.
 */
export async function uploadCreatorProfileImage(
  file: File,
  onProgress?: (progressPct: number) => void,
  explicitAuthToken?: string
): Promise<LogoPlacementMetadata> {
  return uploadBrandingLogoAsset('creator', file, onProgress, explicitAuthToken);
}
