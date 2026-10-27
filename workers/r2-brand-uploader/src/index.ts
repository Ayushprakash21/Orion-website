/**
 * ORION-9 CLOUDFLARE R2 BRAND ASSETS UPLOADER & CDN WORKER
 *
 * Provides a secure, authenticated bridge for uploading and serving
 * Orion-9 website brand logos from Cloudflare R2 bucket `orion9-brand-assets`.
 * 
 * Verifies Firebase Authentication ID tokens and administrator RBAC on all write endpoints.
 */

import { verifyFirebaseAdminToken } from './auth.ts';
import { sanitizeSvgServer } from './svgSanitizer.ts';

export interface R2ObjectMetadata {
  httpMetadata?: { contentType?: string; cacheControl?: string };
  customMetadata?: Record<string, string>;
  httpEtag?: string;
  size?: number;
}

export interface R2ObjectBody extends R2ObjectMetadata {
  body: ReadableStream;
}

export interface R2Bucket {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
    options?: {
      httpMetadata?: { contentType?: string; cacheControl?: string };
      customMetadata?: Record<string, string>;
    }
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(keys: string | string[]): Promise<void>;
}

export interface Env {
  BRAND_ASSETS: R2Bucket;
  R2_PUBLIC_BASE_URL?: string;
  FIREBASE_PROJECT_ID?: string;
  ALLOWED_ORIGINS?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
]);

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

export function isOriginAllowed(origin: string, env: Env): boolean {
  if (!origin) return false;
  const lower = origin.toLowerCase().trim();

  // 1. Production Google AI Studio & Google Cloud Run origins
  if (
    lower === 'https://orion-9-webos.ai.studio' ||
    lower.endsWith('.ai.studio') ||
    lower === 'https://ai.studio' ||
    lower.endsWith('.run.app')
  ) {
    return true;
  }

  // 2. Allow all localhost, loopback, and local network development origins
  if (
    lower.startsWith('http://localhost') ||
    lower.startsWith('http://127.0.0.1') ||
    lower.startsWith('http://[::1]') ||
    lower.startsWith('http://0.0.0.0') ||
    /^http:\/\/(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(lower)
  ) {
    return true;
  }

  // 3. Allow Cloudflare Workers and Cloudflare Pages origins
  if (lower.endsWith('.workers.dev') || lower.endsWith('.pages.dev')) {
    return true;
  }

  // 4. Allow GitHub Pages origins (e.g. https://ayushprakash21.github.io)
  if (lower.endsWith('.github.io')) {
    return true;
  }

  // 5. Allow Vercel and Netlify preview/production deployments
  if (lower.endsWith('.vercel.app') || lower.endsWith('.netlify.app')) {
    return true;
  }

  // 6. Allow explicitly configured origins in ALLOWED_ORIGINS
  const rawAllowed = env.ALLOWED_ORIGINS || '';
  if (rawAllowed) {
    const list = rawAllowed.split(',').map((o) => o.trim().toLowerCase());
    if (list.includes(lower)) return true;
  }

  return false;
}

export function getCorsHeaders(request: Request, env: Env): Headers {
  const headers = new Headers();
  const origin = request.headers.get('Origin');

  if (origin && isOriginAllowed(origin, env)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    const reqHeaders = request.headers.get('Access-Control-Request-Headers');
    headers.set(
      'Access-Control-Allow-Headers',
      reqHeaders || 'Authorization, Content-Type, Accept, X-Requested-With, Cache-Control, Origin'
    );
    headers.set('Access-Control-Max-Age', '86400');
    headers.set('Vary', 'Origin');
  } else if (!origin) {
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    headers.set(
      'Access-Control-Allow-Headers',
      'Authorization, Content-Type, Accept, X-Requested-With, Cache-Control, Origin'
    );
  }
  // For disallowed origins: do NOT set Access-Control-Allow-Origin

  return headers;
}

function jsonResponse(
  data: Record<string, unknown>,
  status = 200,
  corsHeaders?: Headers,
  requestId?: string
): Response {
  const headers = new Headers(corsHeaders);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  if (requestId) {
    headers.set('X-Request-Id', requestId);
  }
  const isSuccess = status >= 200 && status < 300;
  const payload: Record<string, unknown> = {
    success: typeof data.success === 'boolean' ? data.success : isSuccess,
    ...data,
    requestId: (data.requestId as string) || requestId || 'req-orion9',
  };
  return new Response(JSON.stringify(payload), { status, headers });
}

function extractFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  return idx !== -1 ? fileName.slice(idx).toLowerCase() : '';
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = getCorsHeaders(request, env);
    const requestId = request.headers.get('X-Request-Id') || crypto.randomUUID();

    try {
      const url = new URL(request.url);

      // 1. Handle CORS Preflight
      if (request.method === 'OPTIONS') {
        const origin = request.headers.get('Origin');
        if (origin && !isOriginAllowed(origin, env)) {
          return jsonResponse(
            { error: 'Origin not allowed by CORS security policy.', code: 'cors_forbidden' },
            403,
            corsHeaders
          );
        }
        const optHeaders = new Headers(corsHeaders);
        optHeaders.set('X-Request-Id', requestId);
        return new Response(null, { status: 204, headers: optHeaders });
      }

    // 2. Health & Status check endpoint
    if (url.pathname === '/api/r2-status' || url.pathname === '/health') {
      const hasBucket = Boolean(env.BRAND_ASSETS);
      const publicBase = env.R2_PUBLIC_BASE_URL?.trim() || null;
      return jsonResponse(
        {
          status: 'online',
          service: 'Orion-9 Cloudflare R2 Brand Uploader',
          bucket: 'orion9-brand-assets',
          bucketBound: hasBucket,
          publicDelivery: {
            configured: Boolean(publicBase),
            publicBaseUrl: publicBase,
            fallbackUrl: `${url.origin}/cdn/`,
            mode: publicBase ? 'custom_domain_or_r2_dev' : 'worker_stream_cdn',
          },
        },
        200,
        corsHeaders,
        requestId
      );
    }

    // 3. Public Asset CDN Delivery Route: /cdn/*, /branding/logos/*, /branding/creator/*, or /downloads/*
    // Enables direct, zero-configuration public streaming of stored logos, creator assets, and workstation binaries
    if (
      (request.method === 'GET' || request.method === 'HEAD') &&
      (url.pathname.startsWith('/cdn/') ||
        url.pathname.startsWith('/branding/logos/') ||
        url.pathname.startsWith('/branding/creator/') ||
        url.pathname.startsWith('/downloads/') ||
        url.pathname.startsWith('/releases/'))
    ) {
      if (!env.BRAND_ASSETS) {
        return jsonResponse(
          { error: 'Cloudflare R2 bucket binding is not configured.', code: 'r2_binding_missing' },
          503,
          corsHeaders
        );
      }

      let key = url.pathname.replace(/^\/cdn\//, '');
      if (key.startsWith('/')) key = key.slice(1);

      // Security Guard: Prevent directory traversal
      if (key.includes('..') || key.includes('\\')) {
        return jsonResponse(
          { error: 'Access denied: Invalid or unauthorized asset path.', code: 'invalid_path' },
          403,
          corsHeaders
        );
      }

      // Check allowed prefixes
      const isAllowed =
        key.startsWith('branding/logos/') ||
        key.startsWith('branding/creator/') ||
        key.startsWith('downloads/') ||
        key.startsWith('releases/') ||
        key.startsWith('media/');

      if (!isAllowed) {
        return jsonResponse(
          { error: 'Access denied: Path not permitted.', code: 'forbidden' },
          403,
          corsHeaders
        );
      }

      let object = await env.BRAND_ASSETS.get(key);
      // Fallback check for releases prefix
      if (!object && key.startsWith('downloads/')) {
        const altKey = key.replace(/^downloads\//, 'releases/');
        object = await env.BRAND_ASSETS.get(altKey);
      }

      if (!object) {
        const filename = key.split('/').pop() || 'artifact';
        return jsonResponse(
          {
            error: `Release artifact "${filename}" not found in storage.`,
            code: 'artifact_not_found',
            status: 404,
          },
          404,
          corsHeaders
        );
      }

      const filename = key.split('/').pop() || 'installer';
      const ext = extractFileExtension(filename);
      let inferredType = object.httpMetadata?.contentType || 'application/octet-stream';
      if (ext === '.exe') inferredType = 'application/vnd.microsoft.portable-executable';
      else if (ext === '.msi') inferredType = 'application/x-msi';
      else if (ext === '.dmg') inferredType = 'application/x-apple-diskimage';
      else if (ext === '.mp4') inferredType = 'video/mp4';

      const responseHeaders = new Headers(corsHeaders);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('Content-Type', inferredType);
      responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"`);
      responseHeaders.set(
        'Cache-Control',
        object.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable'
      );
      if (object.httpEtag) {
        responseHeaders.set('ETag', object.httpEtag);
      }
      if (typeof object.size === 'number') {
        responseHeaders.set('Content-Length', String(object.size));
      }

      if (request.method === 'HEAD') {
        return new Response(null, {
          status: 200,
          headers: responseHeaders,
        });
      }

      return new Response(object.body, {
        status: 200,
        headers: responseHeaders,
      });
    }

    // 4. Authenticated Logo Upload Endpoint: POST /api/upload-logo
    if (
      request.method === 'POST' &&
      (url.pathname === '/api/upload-logo' || url.pathname === '/upload')
    ) {
      // Guard against disallowed cross-origin write requests
      const requestOrigin = request.headers.get('Origin');
      if (requestOrigin && !isOriginAllowed(requestOrigin, env)) {
        return jsonResponse(
          {
            error: 'Origin not permitted by CORS security policy.',
            code: 'cors_forbidden',
          },
          403,
          corsHeaders
        );
      }

      if (!env.BRAND_ASSETS) {
        return jsonResponse(
          {
            error:
              'Cloudflare R2 bucket binding "BRAND_ASSETS" is missing in worker configuration.',
            code: 'r2_binding_missing',
          },
          503,
          corsHeaders
        );
      }

      // Check Authorization Header
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return jsonResponse(
          {
            error:
              'Authentication required: Missing Authorization header. Please sign in as an administrator.',
            code: 'unauthenticated',
          },
          401,
          corsHeaders
        );
      }

      const origin = (request.headers.get('Origin') || '').toLowerCase();
      const isLocalDevOrigin =
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin.startsWith('http://[::1]') ||
        origin.startsWith('http://0.0.0.0') ||
        /^http:\/\/(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(origin);

      const authResult = await verifyFirebaseAdminToken(
        authHeader,
        env.FIREBASE_PROJECT_ID || 'orion9-dev-db-2026',
        Boolean(isLocalDevOrigin)
      );

      if (!authResult.valid || !authResult.user?.isAdmin) {
        return jsonResponse(
          {
            error: authResult.error || 'Permission denied: Administrator role required.',
            code: authResult.status === 401 ? 'unauthenticated' : 'unauthorized',
          },
          authResult.status,
          corsHeaders
        );
      }

      // Parse multipart/form-data
      let formData: FormData;
      try {
        formData = await request.formData();
      } catch (err) {
        return jsonResponse(
          {
            error: 'Failed to parse multipart form data: ' + (err as Error).message,
            code: 'invalid_form_data',
          },
          400,
          corsHeaders
        );
      }

      const fileEntry = formData.get('file');
      const placement = (formData.get('placement') as string) || 'shared';
      const declaredDimensions = (formData.get('dimensions') as string) || 'Responsive';

      if (!fileEntry || !(fileEntry instanceof File)) {
        return jsonResponse(
          {
            error: 'No valid image file found in form payload under "file".',
            code: 'missing_file',
          },
          400,
          corsHeaders
        );
      }

      const file = fileEntry;

      // 1. File size enforcement
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const mb = (file.size / (1024 * 1024)).toFixed(1);
        return jsonResponse(
          {
            error: `File size (${mb} MB) exceeds maximum allowed size of 5 MB.`,
            code: 'file_too_large',
          },
          413,
          corsHeaders
        );
      }

      // 2. File extension & MIME type enforcement
      const ext = extractFileExtension(file.name);
      const mimeType = (file.type || '').toLowerCase();

      const isValidExt = ALLOWED_EXTENSIONS.has(ext);
      const isValidMime = ALLOWED_MIME_TYPES.has(mimeType) || !mimeType;

      if (!isValidExt || !isValidMime) {
        return jsonResponse(
          {
            error: `Unsupported file format (${ext || mimeType}). Supported formats: PNG, JPEG, WebP, SVG.`,
            code: 'unsupported_format',
          },
          400,
          corsHeaders
        );
      }

      // 3. Process and sanitize content
      let fileBuffer: ArrayBuffer;
      let finalMimeType = mimeType;

      if (ext === '.svg' || mimeType === 'image/svg+xml') {
        finalMimeType = 'image/svg+xml';
        const rawSvg = await file.text();
        const { sanitized } = sanitizeSvgServer(rawSvg);
        fileBuffer = new TextEncoder().encode(sanitized).buffer;
      } else {
        fileBuffer = await file.arrayBuffer();
        if (!finalMimeType) {
          finalMimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        }
      }

      // 4. Generate predictable, collision-resistant versioned key
      const safePlacement = ['shared', 'header', 'auth', 'footer', 'default', 'creator'].includes(placement)
        ? placement
        : 'shared';
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const randomSuffix = crypto.randomUUID().slice(0, 8);
      const prefix = safePlacement === 'creator' ? 'branding/creator' : 'branding/logos';
      const objectKey = `${prefix}/${safePlacement}_${Date.now()}_${randomSuffix}_${cleanFileName}`;

      // 5. Save to Cloudflare R2
      try {
        await env.BRAND_ASSETS.put(objectKey, fileBuffer, {
          httpMetadata: {
            contentType: finalMimeType,
            cacheControl: 'public, max-age=31536000, immutable',
          },
          customMetadata: {
            placement: safePlacement,
            originalFilename: file.name,
            dimensions: declaredDimensions,
            uploadedAt: new Date().toISOString(),
            uploadedBy: authResult.user.email || authResult.user.uid,
          },
        });
      } catch (r2Err: unknown) {
        console.error('[R2 Worker] Failed to write object to R2:', r2Err);
        return jsonResponse(
          {
            error: `Cloudflare R2 write error: ${(r2Err as Error).message}`,
            code: 'r2_write_failed',
          },
          500,
          corsHeaders
        );
      }

      // 6. Resolve public delivery URL
      let publicUrl: string;
      const configuredBase = env.R2_PUBLIC_BASE_URL?.trim();

      if (configuredBase && configuredBase.startsWith('http')) {
        publicUrl = `${configuredBase.replace(/\/$/, '')}/${objectKey}`;
      } else {
        // Fallback to Worker's integrated streaming CDN route
        publicUrl = `${url.origin}/cdn/${objectKey}`;
      }

      return jsonResponse(
        {
          success: true,
          url: publicUrl,
          key: objectKey,
          dimensions: declaredDimensions,
          fileType: finalMimeType,
          sizeBytes: fileBuffer.byteLength,
          uploadedAt: new Date().toISOString(),
          originalFilename: file.name,
        },
        200,
        corsHeaders,
        requestId
      );
    }

      // 404 for unmatched routes
      return jsonResponse(
        {
          error: 'Route not found. Valid routes: POST /api/upload-logo, GET /api/r2-status, GET /cdn/*',
        },
        404,
        corsHeaders
      );
    } catch (unhandledErr: unknown) {
      console.error('[R2 Worker] Uncaught handler error:', unhandledErr);
      return jsonResponse(
        {
          error: `Cloudflare R2 worker internal error: ${(unhandledErr as Error).message || 'Unknown error'}`,
          code: 'worker_exception',
        },
        500,
        corsHeaders
      );
    }
  },
};
