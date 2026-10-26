/**
 * ORION-9 BRANDING ASSET STORAGE & VALIDATION SERVICE
 * Manages client-side validation, sanitization of SVG assets, dimensions measurement,
 * and upload to Firebase Storage (with local fallback).
 */

import { getFirebaseStorageInstance } from './firebase.ts';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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
export function sanitizeSvg(svgText: string): { sanitized: string; isClean: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (!svgText || typeof svgText !== 'string') {
    return { sanitized: '', isClean: false, warnings: ['Empty SVG content'] };
  }

  // Check if it's fundamentally an SVG document
  if (!/<svg\b[^>]*>/i.test(svgText)) {
    return { sanitized: '', isClean: false, warnings: ['Invalid SVG: missing <svg> root element'] };
  }

  let cleaned = svgText;

  // 1. Strip <script>...</script>
  if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(cleaned)) {
    cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    warnings.push('Embedded <script> tags were stripped');
  }

  // 2. Strip dangerous inline tags (<foreignObject>, <iframe>, <object>, <embed>, <applet>, <meta>, <link>)
  const dangerousTags = ['foreignObject', 'iframe', 'object', 'embed', 'applet', 'meta', 'link'];
  for (const tag of dangerousTags) {
    const regex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?<\\/${tag}>)?`, 'gi');
    if (regex.test(cleaned)) {
      cleaned = cleaned.replace(regex, '');
      warnings.push(`Dangerous <${tag}> elements were stripped`);
    }
  }

  // 3. Strip all on* attributes (onload, onerror, onclick, onmouseover, etc.)
  const onAttrRegex = /\s+on[a-z]+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
  if (onAttrRegex.test(cleaned)) {
    cleaned = cleaned.replace(onAttrRegex, '');
    warnings.push('Interactive event listener attributes (on*) were stripped');
  }

  // 4. Strip javascript:, vbscript:, data:text/html from href and xlink:href
  const dangerousProtocols = /(href|xlink:href)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|"vbscript:[^"]*"|'vbscript:[^']*'|"data:text\/html[^"]*"|'data:text\/html[^']*')/gi;
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

    const isSvg = file.type === 'image/svg+xml' || (file instanceof File && file.name.endsWith('.svg'));

    if (isSvg && file instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          const viewBoxMatch = text.match(/viewBox=["']\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
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
        } catch {}
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
  const mimeType = file.type.toLowerCase();
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
    const { sanitized, warnings } = sanitizeSvg(rawSvg);
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
 * Uploads a validated logo file to Firebase Storage under branding/logos/
 * or generates a persistent local URL fallback when Firebase Storage is offline.
 */
export async function uploadBrandingLogoAsset(
  placement: 'header' | 'auth' | 'footer' | 'default',
  file: File,
  onProgress?: (progressPct: number) => void
): Promise<LogoPlacementMetadata> {
  const validation = await validateLogoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid logo file.');
  }

  const dimensions = validation.dimensions || 'Responsive';
  const fileType = validation.fileType || file.type || 'image/png';
  const sizeBytes = validation.sizeBytes || file.size;

  const storage = getFirebaseStorageInstance();

  // If Firebase Storage is initialized and online, upload directly to the bucket
  if (storage) {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `branding/logos/${placement}_${Date.now()}_${cleanFileName}`;
      const fileRef = ref(storage, storagePath);

      let payload: Blob = file;
      if (validation.sanitizedContent) {
        payload = new Blob([validation.sanitizedContent], { type: 'image/svg+xml' });
      }

      const uploadTask = uploadBytesResumable(fileRef, payload, {
        contentType: fileType,
        customMetadata: {
          placement,
          dimensions,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) onProgress(pct);
          },
          (error) => {
            console.error('[BrandingStorage] Firebase Storage upload error:', error);
            reject(error);
          },
          () => {
            if (onProgress) onProgress(100);
            resolve();
          }
        );
      });

      const downloadUrl = await getDownloadURL(fileRef);

      return {
        url: downloadUrl,
        dimensions,
        fileType,
        sizeBytes,
        uploadedAt: new Date().toISOString(),
      };
    } catch (storageErr) {
      console.warn('[BrandingStorage] Cloud storage upload failed, falling back to local asset data URL:', storageErr);
    }
  }

  // Local development / offline fallback:
  if (onProgress) {
    onProgress(50);
    await new Promise((r) => setTimeout(r, 120));
    onProgress(100);
  }

  // Convert to clean Data URL or Object URL for local persistence
  const localDataUrl = await new Promise<string>((resolve, reject) => {
    if (validation.sanitizedContent) {
      const blob = new Blob([validation.sanitizedContent], { type: 'image/svg+xml' });
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    } else {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }
  });

  return {
    url: localDataUrl,
    dimensions,
    fileType,
    sizeBytes,
    uploadedAt: new Date().toISOString(),
  };
}
