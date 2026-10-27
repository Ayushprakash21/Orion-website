import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, type Plugin} from 'vite';

function orionDesktopDownloadPlugin(): Plugin {
  return {
    name: 'orion-desktop-download-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const parsedUrl = new URL(req.url || '/', 'http://localhost');
        const pathname = parsedUrl.pathname;

        if (pathname.startsWith('/downloads/') || pathname.startsWith('/api/downloads/')) {
          const filename = path.basename(pathname);
          const publicDownloadPath = path.resolve(__dirname, 'public/downloads', filename);

          // 1. Defect Guard: If file does not exist, return a real HTTP 404 error, NEVER index.html!
          if (!fs.existsSync(publicDownloadPath)) {
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
            const stat = fs.statSync(publicDownloadPath);
            let contentType = 'application/octet-stream';
            if (filename.endsWith('.exe')) {
              contentType = 'application/vnd.microsoft.portable-executable';
            } else if (filename.endsWith('.msi')) {
              contentType = 'application/x-msi';
            } else if (filename.endsWith('.dmg')) {
              contentType = 'application/x-apple-diskimage';
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Cache-Control', 'public, max-age=3600, no-transform');

            const stream = fs.createReadStream(publicDownloadPath);
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
        const parsedUrl = new URL(req.url || '/', 'http://localhost');
        const pathname = parsedUrl.pathname;

        if (pathname.startsWith('/downloads/') || pathname.startsWith('/api/downloads/')) {
          const filename = path.basename(pathname);
          const distDownloadPath = path.resolve(__dirname, 'dist/downloads', filename);
          const publicDownloadPath = path.resolve(__dirname, 'public/downloads', filename);
          const targetPath = fs.existsSync(distDownloadPath) ? distDownloadPath : publicDownloadPath;

          if (!fs.existsSync(targetPath)) {
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
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Length', stat.size);
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('Cache-Control', 'public, max-age=3600, no-transform');

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
