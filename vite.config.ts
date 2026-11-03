import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import {defineConfig, type Plugin} from 'vite';

function parseMultipart(
  body: Buffer,
  boundary: string
): { data: Buffer; filename: string; contentType: string; dimensions?: string } | null {
  const boundaryBuf = Buffer.from('--' + boundary);
  let startIdx = body.indexOf(boundaryBuf);
  let fileResult: { data: Buffer; filename: string; contentType: string } | null = null;
  let dims: string | undefined = undefined;

  while (startIdx !== -1) {
    const nextBoundary = body.indexOf(boundaryBuf, startIdx + boundaryBuf.length);
    if (nextBoundary === -1) break;

    const part = body.subarray(startIdx + boundaryBuf.length, nextBoundary);
    let headerEnd = part.indexOf('\r\n\r\n');
    let headerLen = 4;
    if (headerEnd === -1) {
      headerEnd = part.indexOf('\n\n');
      headerLen = 2;
    }

    if (headerEnd !== -1) {
      const headerStr = part.subarray(0, headerEnd).toString('utf8');
      const filenameMatch = headerStr.match(/filename=["']?([^"';\r\n]+)["']?/i);
      const nameMatch = headerStr.match(/name=["']?([^"';\r\n]+)["']?/i);
      const mimeMatch = headerStr.match(/content-type:\s*([^\r\n]+)/i);

      let content = part.subarray(headerEnd + headerLen);
      if (content.length >= 2 && content[content.length - 2] === 13 && content[content.length - 1] === 10) {
        content = content.subarray(0, content.length - 2);
      } else if (content.length >= 1 && content[content.length - 1] === 10) {
        content = content.subarray(0, content.length - 1);
      }

      if (nameMatch && nameMatch[1] === 'dimensions') {
        dims = content.toString('utf8').trim();
      }

      if (filenameMatch || (nameMatch && nameMatch[1] === 'file')) {
        fileResult = {
          filename: filenameMatch ? filenameMatch[1] : 'logo.png',
          contentType: mimeMatch ? mimeMatch[1].trim() : 'application/octet-stream',
          data: content,
        };
      }
    }

    startIdx = nextBoundary;
  }

  if (fileResult) {
    return { ...fileResult, dimensions: dims };
  }
  return null;
}

function handleLogoUploadRequest(req: any, res: any): boolean {
  const parsedUrl = new URL(req.url || '/', 'http://localhost');
  if (parsedUrl.pathname !== '/api/upload-logo') {
    return false;
  }

  // Handle CORS for local and cross-origin dev callers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method Not Allowed', code: 'method_not_allowed' }));
    return true;
  }

  const chunks: Buffer[] = [];
  req.on('data', (chunk: Buffer | Uint8Array) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  });

  req.on('end', () => {
    try {
      const body = Buffer.concat(chunks);
      if (body.length === 0) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Empty upload body.', code: 'missing_file' }));
        return;
      }

      if (body.length > 5 * 1024 * 1024) {
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'File size exceeds maximum allowed size of 5 MB.', code: 'file_too_large' }));
        return;
      }

      const contentTypeHeader = (req.headers['content-type'] || '').toString();
      let fileData: Buffer = body;
      let filename = 'logo.png';
      let mimeType = 'image/png';
      let dimensions = 'Responsive';

      const boundaryMatch = contentTypeHeader.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
      if (boundaryMatch) {
        const boundary = boundaryMatch[1] || boundaryMatch[2];
        const parsed = parseMultipart(body, boundary);
        if (parsed) {
          fileData = parsed.data;
          filename = parsed.filename;
          mimeType = parsed.contentType;
          if (parsed.dimensions) dimensions = parsed.dimensions;
        }
      } else if (contentTypeHeader.includes('image/svg+xml')) {
        mimeType = 'image/svg+xml';
        filename = 'logo.svg';
      } else if (contentTypeHeader.includes('image/png')) {
        mimeType = 'image/png';
        filename = 'logo.png';
      } else if (contentTypeHeader.includes('image/webp')) {
        mimeType = 'image/webp';
        filename = 'logo.webp';
      } else if (contentTypeHeader.includes('image/jpeg')) {
        mimeType = 'image/jpeg';
        filename = 'logo.jpg';
      }

      let ext = path.extname(filename).toLowerCase();
      if (!ext || ext === '.') {
        if (mimeType.includes('svg')) ext = '.svg';
        else if (mimeType.includes('webp')) ext = '.webp';
        else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
        else ext = '.png';
      }

      // Basic SVG sanitization and dimension extraction
      if (ext === '.svg' || mimeType.includes('svg')) {
        mimeType = 'image/svg+xml';
        let svgStr = fileData.toString('utf8');
        svgStr = svgStr
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/\s+on[a-z]+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
          .replace(/(href|xlink:href)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""');

        const vb = svgStr.match(/viewBox=["']\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
        if (vb && vb[1] && vb[2]) {
          dimensions = `${Math.round(parseFloat(vb[1]))} × ${Math.round(parseFloat(vb[2]))} px`;
        } else {
          dimensions = 'Vector (Scalable)';
        }
        fileData = Buffer.from(svgStr, 'utf8');
      }

      const timestamp = Date.now();
      const sanitizedBase = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
      const outputFilename = `orion9-brand-logo-${timestamp}${sanitizedBase ? `-${sanitizedBase}` : ''}${ext}`;

      const publicDir = path.resolve(__dirname, 'public/branding/logos');
      fs.mkdirSync(publicDir, { recursive: true });
      fs.writeFileSync(path.join(publicDir, outputFilename), fileData);

      const distDir = path.resolve(__dirname, 'dist/branding/logos');
      if (fs.existsSync(path.resolve(__dirname, 'dist'))) {
        fs.mkdirSync(distDir, { recursive: true });
        fs.writeFileSync(path.join(distDir, outputFilename), fileData);
      }

      const publicUrl = `/branding/logos/${outputFilename}`;

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          success: true,
          url: publicUrl,
          dimensions,
          fileType: mimeType,
          sizeBytes: fileData.length,
          uploadedAt: new Date().toISOString(),
          originalFilename: filename,
          storageProvider: 'orion9_local_brand_storage',
        })
      );
    } catch (err: unknown) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          error: `Logo upload failed: ${(err as Error).message}`,
          code: 'worker_exception',
          status: 500,
        })
      );
    }
  });

  return true;
}

function parseReleaseMultipart(
  body: Buffer,
  boundary: string
): {
  file: { data: Buffer; filename: string; contentType: string } | null;
  fields: Record<string, string>;
} {
  const boundaryBuf = Buffer.from('--' + boundary);
  let startIdx = body.indexOf(boundaryBuf);
  let fileResult: { data: Buffer; filename: string; contentType: string } | null = null;
  const fields: Record<string, string> = {};

  while (startIdx !== -1) {
    const nextBoundary = body.indexOf(boundaryBuf, startIdx + boundaryBuf.length);
    if (nextBoundary === -1) break;

    const part = body.subarray(startIdx + boundaryBuf.length, nextBoundary);
    let headerEnd = part.indexOf('\r\n\r\n');
    let headerLen = 4;
    if (headerEnd === -1) {
      headerEnd = part.indexOf('\n\n');
      headerLen = 2;
    }

    if (headerEnd !== -1) {
      const headerStr = part.subarray(0, headerEnd).toString('utf8');
      const filenameMatch = headerStr.match(/filename=["']?([^"';\r\n]+)["']?/i);
      const nameMatch = headerStr.match(/name=["']?([^"';\r\n]+)["']?/i);
      const mimeMatch = headerStr.match(/content-type:\s*([^\r\n]+)/i);

      let content = part.subarray(headerEnd + headerLen);
      if (content.length >= 2 && content[content.length - 2] === 13 && content[content.length - 1] === 10) {
        content = content.subarray(0, content.length - 2);
      } else if (content.length >= 1 && content[content.length - 1] === 10) {
        content = content.subarray(0, content.length - 1);
      }

      const fieldName = nameMatch ? nameMatch[1] : '';
      if (filenameMatch || fieldName === 'file') {
        fileResult = {
          filename: filenameMatch ? filenameMatch[1] : 'release.bin',
          contentType: mimeMatch ? mimeMatch[1].trim() : 'application/octet-stream',
          data: content,
        };
      } else if (fieldName) {
        fields[fieldName] = content.toString('utf8').trim();
      }
    }

    startIdx = nextBoundary;
  }

  return { file: fileResult, fields };
}

function validateBinaryMagicBytes(
  buffer: Buffer,
  ext: string
): { valid: boolean; error?: string } {
  if (buffer.length < 4) {
    return { valid: false, error: 'Binary file is too small or truncated.' };
  }
  const isHtml =
    buffer[0] === 0x3c &&
    (buffer[1] === 0x21 || buffer[1] === 0x68 || buffer[1] === 0x48 || buffer[1] === 0x3f);
  if (isHtml) {
    return {
      valid: false,
      error: `File header inspection failed: Payload contains HTML text instead of genuine ${ext} binary.`,
    };
  }
  if (ext === '.exe') {
    if (buffer[0] !== 0x4d || buffer[1] !== 0x5a) {
      return {
        valid: false,
        error: 'Invalid Windows executable: Missing authentic PE "MZ" header signature.',
      };
    }
  } else if (ext === '.msi') {
    if (buffer[0] !== 0xd0 || buffer[1] !== 0xcf || buffer[2] !== 0x11 || buffer[3] !== 0xe0) {
      return {
        valid: false,
        error: 'Invalid Windows Installer package: Missing authentic OLE compound file signature.',
      };
    }
  } else if (ext === '.apk') {
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4b || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
      return {
        valid: false,
        error: 'Invalid Android APK: Missing authentic ZIP/APK archive header signature (PK..).',
      };
    }
  } else if (ext === '.ipa') {
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4b || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
      return {
        valid: false,
        error: 'Invalid iOS IPA package: Missing authentic ZIP/IPA archive header signature (PK..).',
      };
    }
  }
  return { valid: true };
}

function handleReleaseUploadRequest(req: any, res: any): boolean {
  const parsedUrl = new URL(req.url || '/', 'http://localhost');
  if (parsedUrl.pathname !== '/api/releases/upload' && parsedUrl.pathname !== '/api/upload-release') {
    return false;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, Accept, X-Requested-With, Cache-Control, Origin, X-Request-Id'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method Not Allowed', code: 'method_not_allowed' }));
    return true;
  }

  const chunks: Buffer[] = [];
  req.on('data', (chunk: Buffer | Uint8Array) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  });

  req.on('end', () => {
    try {
      const body = Buffer.concat(chunks);
      if (body.length === 0) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Empty release payload.', code: 'missing_file' }));
        return;
      }

      const MAX_RELEASE_BYTES = 262144000; // 250 MiB
      if (body.length > MAX_RELEASE_BYTES) {
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(
          JSON.stringify({
            error: 'File size exceeds maximum allowed size of 250 MiB.',
            code: 'file_too_large',
          })
        );
        return;
      }

      const contentTypeHeader = (req.headers['content-type'] || '').toString();
      let fileData: Buffer = body;
      let filename = 'release.bin';
      let mimeType = 'application/octet-stream';
      let platform = 'android-universal';
      let version = '9.1.0';
      let channel = 'stable';
      let product = 'Orion-9';

      const boundaryMatch = contentTypeHeader.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
      if (boundaryMatch) {
        const boundary = boundaryMatch[1] || boundaryMatch[2];
        const parsed = parseReleaseMultipart(body, boundary);
        if (parsed.file) {
          fileData = parsed.file.data;
          filename = parsed.file.filename;
          mimeType = parsed.file.contentType;
        }
        if (parsed.fields.platform) platform = parsed.fields.platform;
        if (parsed.fields.version) version = parsed.fields.version;
        if (parsed.fields.channel) channel = parsed.fields.channel;
        if (parsed.fields.product) product = parsed.fields.product;
      }

      let platformFamily = 'windows';
      const platLower = platform.toLowerCase();
      if (platLower.includes('mac')) platformFamily = 'macos';
      else if (platLower.includes('android')) platformFamily = 'android';
      else if (platLower.includes('ios')) platformFamily = 'ios';
      else platformFamily = 'windows';

      const ext = path.extname(filename).toLowerCase();
      const magicCheck = validateBinaryMagicBytes(fileData, ext);
      if (!magicCheck.valid) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(
          JSON.stringify({
            error: magicCheck.error || 'Binary header validation failed.',
            code: 'corrupt_binary',
          })
        );
        return;
      }

      const sha256 = crypto.createHash('sha256').update(fileData).digest('hex');
      const cleanVersion = version.replace(/[^a-zA-Z0-9._-]/g, '') || 'v1.0.0';
      const cleanFilename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
      const objectKey = `releases/${platformFamily}/${cleanVersion}/${cleanFilename}`;

      let inferredType = mimeType;
      if (ext === '.exe') inferredType = 'application/vnd.microsoft.portable-executable';
      else if (ext === '.msi') inferredType = 'application/x-msi';
      else if (ext === '.dmg') inferredType = 'application/x-apple-diskimage';
      else if (ext === '.pkg') inferredType = 'application/octet-stream';
      else if (ext === '.apk') inferredType = 'application/vnd.android.package-archive';
      else if (ext === '.ipa') inferredType = 'application/octet-stream';

      // Save to public release and download staging directories
      const releaseDir = path.resolve(__dirname, `public/releases/${platformFamily}/${cleanVersion}`);
      const downloadDir = path.resolve(__dirname, 'public/downloads');
      fs.mkdirSync(releaseDir, { recursive: true });
      fs.mkdirSync(downloadDir, { recursive: true });

      fs.writeFileSync(path.join(releaseDir, cleanFilename), fileData);
      fs.writeFileSync(path.join(downloadDir, cleanFilename), fileData);

      // Also mirror to dist/ if built
      const distDir = path.resolve(__dirname, 'dist');
      if (fs.existsSync(distDir)) {
        const distReleaseDir = path.resolve(distDir, `releases/${platformFamily}/${cleanVersion}`);
        const distDownloadDir = path.resolve(distDir, 'downloads');
        fs.mkdirSync(distReleaseDir, { recursive: true });
        fs.mkdirSync(distDownloadDir, { recursive: true });
        fs.writeFileSync(path.join(distReleaseDir, cleanFilename), fileData);
        fs.writeFileSync(path.join(distDownloadDir, cleanFilename), fileData);
      }

      const publicUrl = `/downloads/${cleanFilename}`;

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          success: true,
          url: publicUrl,
          key: objectKey,
          filename: cleanFilename,
          sizeBytes: fileData.length,
          sha256,
          contentType: inferredType,
          platform,
          version: cleanVersion,
          channel,
          product,
          uploadedAt: new Date().toISOString(),
          verified: true,
        })
      );
    } catch (err: unknown) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          error: `Release binary upload failed: ${(err as Error).message}`,
          code: 'worker_exception',
          status: 500,
        })
      );
    }
  });

  return true;
}

function orionDesktopDownloadPlugin(): Plugin {
  return {
    name: 'orion-desktop-download-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (handleLogoUploadRequest(req, res)) {
          return;
        }
        if (handleReleaseUploadRequest(req, res)) {
          return;
        }

        const parsedUrl = new URL(req.url || '/', 'http://localhost');
        const pathname = parsedUrl.pathname;

        if (pathname.startsWith('/branding/')) {
          const relPath = pathname.replace(/^\/branding\//, '');
          const publicPath = path.resolve(__dirname, 'public/branding', relPath);
          const distPath = path.resolve(__dirname, 'dist/branding', relPath);
          const targetPath = fs.existsSync(publicPath) ? publicPath : (fs.existsSync(distPath) ? distPath : null);

          if (!targetPath) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'Asset not found', code: 'asset_not_found', status: 404 }));
            return;
          }

          try {
            const stat = fs.statSync(targetPath);
            const ext = path.extname(targetPath).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.svg') contentType = 'image/svg+xml';
            else if (ext === '.png') contentType = 'image/png';
            else if (ext === '.webp') contentType = 'image/webp';
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

            res.statusCode = 200;
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Access-Control-Allow-Origin', '*');
            const stream = fs.createReadStream(targetPath);
            stream.pipe(res);
            return;
          } catch (err: unknown) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: (err as Error).message, status: 500 }));
            return;
          }
        }

        if (
          pathname.startsWith('/downloads/') ||
          pathname.startsWith('/api/downloads/') ||
          pathname.startsWith('/releases/') ||
          pathname.startsWith('/api/releases/')
        ) {
          let relPath = pathname
            .replace(/^\/api\/(downloads|releases)\//, '$1/')
            .replace(/^\//, '');
          if (relPath.startsWith('downloads/') || relPath.startsWith('releases/')) {
            // Keep relPath
          } else {
            relPath = `downloads/${path.basename(pathname)}`;
          }

          const filename = path.basename(pathname);
          const publicReleasePath = path.resolve(__dirname, 'public', relPath);
          const publicDownloadPath = path.resolve(__dirname, 'public/downloads', filename);
          const targetPath = fs.existsSync(publicReleasePath)
            ? publicReleasePath
            : fs.existsSync(publicDownloadPath)
              ? publicDownloadPath
              : null;

          // 1. Defect Guard: If file does not exist, return a real HTTP 404 error, NEVER index.html!
          if (!targetPath) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                error: `Release artifact "${filename}" not found.`,
                code: 'artifact_not_found',
                status: 404,
              })
            );
            return;
          }

          // 2. Stream real binary with authentic headers
          try {
            const stat = fs.statSync(targetPath);
            let contentType = 'application/octet-stream';
            if (filename.endsWith('.exe')) {
              contentType = 'application/vnd.microsoft.portable-executable';
            } else if (filename.endsWith('.msi')) {
              contentType = 'application/x-msi';
            } else if (filename.endsWith('.dmg')) {
              contentType = 'application/x-apple-diskimage';
            } else if (filename.endsWith('.apk')) {
              contentType = 'application/vnd.android.package-archive';
            } else if (filename.endsWith('.ipa') || filename.endsWith('.pkg')) {
              contentType = 'application/octet-stream';
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Cache-Control', 'public, max-age=3600, no-transform');
            res.setHeader('Access-Control-Allow-Origin', '*');

            const stream = fs.createReadStream(targetPath);
            stream.pipe(res);
            return;
          } catch (err: unknown) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                error: `Failed to stream binary: ${(err as Error).message}`,
                code: 'stream_error',
                status: 500,
              })
            );
            return;
          }
        }

        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (handleLogoUploadRequest(req, res)) {
          return;
        }
        if (handleReleaseUploadRequest(req, res)) {
          return;
        }

        const parsedUrl = new URL(req.url || '/', 'http://localhost');
        const pathname = parsedUrl.pathname;

        if (pathname.startsWith('/branding/')) {
          const relPath = pathname.replace(/^\/branding\//, '');
          const distPath = path.resolve(__dirname, 'dist/branding', relPath);
          const publicPath = path.resolve(__dirname, 'public/branding', relPath);
          const targetPath = fs.existsSync(distPath) ? distPath : (fs.existsSync(publicPath) ? publicPath : null);

          if (!targetPath) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'Asset not found', code: 'asset_not_found', status: 404 }));
            return;
          }

          try {
            const stat = fs.statSync(targetPath);
            const ext = path.extname(targetPath).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.svg') contentType = 'image/svg+xml';
            else if (ext === '.png') contentType = 'image/png';
            else if (ext === '.webp') contentType = 'image/webp';
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

            res.statusCode = 200;
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Access-Control-Allow-Origin', '*');
            const stream = fs.createReadStream(targetPath);
            stream.pipe(res);
            return;
          } catch (err: unknown) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: (err as Error).message, status: 500 }));
            return;
          }
        }

        if (
          pathname.startsWith('/downloads/') ||
          pathname.startsWith('/api/downloads/') ||
          pathname.startsWith('/releases/') ||
          pathname.startsWith('/api/releases/')
        ) {
          let relPath = pathname
            .replace(/^\/api\/(downloads|releases)\//, '$1/')
            .replace(/^\//, '');
          if (relPath.startsWith('downloads/') || relPath.startsWith('releases/')) {
            // Keep relPath
          } else {
            relPath = `downloads/${path.basename(pathname)}`;
          }

          const filename = path.basename(pathname);
          const distReleasePath = path.resolve(__dirname, 'dist', relPath);
          const publicReleasePath = path.resolve(__dirname, 'public', relPath);
          const distDownloadPath = path.resolve(__dirname, 'dist/downloads', filename);
          const publicDownloadPath = path.resolve(__dirname, 'public/downloads', filename);

          const targetPath = fs.existsSync(distReleasePath)
            ? distReleasePath
            : fs.existsSync(publicReleasePath)
              ? publicReleasePath
              : fs.existsSync(distDownloadPath)
                ? distDownloadPath
                : fs.existsSync(publicDownloadPath)
                  ? publicDownloadPath
                  : null;

          if (!targetPath) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                error: `Release artifact "${filename}" not found.`,
                code: 'artifact_not_found',
                status: 404,
              })
            );
            return;
          }

          const stat = fs.statSync(targetPath);
          let contentType = 'application/octet-stream';
          if (filename.endsWith('.exe')) {
            contentType = 'application/vnd.microsoft.portable-executable';
          } else if (filename.endsWith('.msi')) {
            contentType = 'application/x-msi';
          } else if (filename.endsWith('.dmg')) {
            contentType = 'application/x-apple-diskimage';
          } else if (filename.endsWith('.apk')) {
            contentType = 'application/vnd.android.package-archive';
          } else if (filename.endsWith('.ipa') || filename.endsWith('.pkg')) {
            contentType = 'application/octet-stream';
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Length', stat.size);
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('Cache-Control', 'public, max-age=3600, no-transform');
          res.setHeader('Access-Control-Allow-Origin', '*');

          const stream = fs.createReadStream(targetPath);
          stream.pipe(res);
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), orionDesktopDownloadPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      entries: ['index.html'],
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'three',
        'lucide-react',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
      ],
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
