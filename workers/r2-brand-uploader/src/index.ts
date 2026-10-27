/**
 * ORION-9 CLOUDFLARE R2 BRAND ASSETS UPLOADER & CDN WORKER
 *
 * Provides a secure, authenticated bridge for uploading and serving
 * Orion-9 website brand logos from Cloudflare R2 bucket `orion9-brand-assets`.
 * 
 * Verifies Firebase Authentication ID tokens and administrator RBAC on all write endpoints.
 */

import { verifyFirebaseAdminToken } from './auth';
import { sanitizeSvgServer } from './svgSanitizer';

export interface R2ObjectMetadata {
  httpMetadata?: { contentType?: string; cacheControl?: string };
  customMetadata?: Record<string, string>;
  httpEtag?: string;
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

function getCorsHeaders(request: Request, env: Env): Headers {
  const headers = new Headers();
  const origin = request.headers.get('Origin');

  const allowedOriginsList = (
    env.ALLOWED_ORIGINS ||
    'https://orion9.pages.dev,https://orion-9.ayushprakash0021.workers.dev,http://localhost:3000,http://localhost:5173'
  )
    .split(',')
    .map((o) => o.trim().toLowerCase());

  if (origin) {
    const originLower = origin.toLowerCase();
    const isAllowed =
      allowedOriginsList.includes(originLower) ||
      originLower.endsWith('.workers.dev') ||
      originLower.endsWith('.pages.dev') ||
      originLower.includes('localhost:') ||
      originLower.includes('127.0.0.1:');

    if (isAllowed) {
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Access-Control-Allow-Credentials', 'true');
    }
  } else {
    headers.set('Access-Control-Allow-Origin', '*');
  }

  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  headers.set(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, X-Requested-With, Cache-Control'
  );
  headers.set('Access-Control-Max-Age', '86400');
  return headers;
}

function jsonResponse(
  data: Record<string, unknown>,
  status = 200,
  corsHeaders?: Headers
): Response {
  const headers = new Headers(corsHeaders);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { status, headers });
}

function extractFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  return idx !== -1 ? fileName.slice(idx).toLowerCase() : '';
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request, env);

    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
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
        corsHeaders
      );
    }

    // 3. Public Asset CDN Delivery Route: /cdn/* or /branding/logos/*
    // Enables direct, zero-configuration public streaming of stored logos even before a custom domain is attached
    if (
      request.method === 'GET' &&
      (url.pathname.startsWith('/cdn/') || url.pathname.startsWith('/branding/logos/'))
    ) {
      if (!env.BRAND_ASSETS) {
        return new Response('Cloudflare R2 bucket binding is not configured.', {
          status: 503,
          headers: corsHeaders,
        });
      }

      let key = url.pathname.replace(/^\/cdn\//, '');
      if (key.startsWith('/')) key = key.slice(1);

      // Security Guard: Prevent directory traversal & restrict strictly to public branding/logos/
      if (
        key.includes('..') ||
        key.includes('\\') ||
        !key.startsWith('branding/logos/')
      ) {
        return new Response('Access denied: Invalid or unauthorized asset path.', {
          status: 403,
          headers: corsHeaders,
        });
      }

      const object = await env.BRAND_ASSETS.get(key);
      if (!object) {
        return new Response('Asset not found.', { status: 404, headers: corsHeaders });
      }

      const responseHeaders = new Headers(corsHeaders);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set(
        'Content-Type',
        object.httpMetadata?.contentType || 'application/octet-stream'
      );
      responseHeaders.set(
        'Cache-Control',
        object.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable'
      );
      if (object.httpEtag) {
        responseHeaders.set('ETag', object.httpEtag);
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

      const isLocalDevOrigin =
        request.headers.get('Origin')?.includes('localhost') ||
        request.headers.get('Origin')?.includes('127.0.0.1');

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
      const safePlacement = ['shared', 'header', 'auth', 'footer', 'default'].includes(placement)
        ? placement
        : 'shared';
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const randomSuffix = crypto.randomUUID().slice(0, 8);
      const objectKey = `branding/logos/${safePlacement}_${Date.now()}_${randomSuffix}_${cleanFileName}`;

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
        corsHeaders
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
  },
};
