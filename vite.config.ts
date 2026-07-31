import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

function layoutConfigPlugin(): Plugin {
  const srcPath = () => path.resolve(process.cwd(), 'src/config/layout.json');
  const publicPath = () => path.resolve(process.cwd(), 'public/layout.json');

  // Sync public copy on startup
  const syncPublic = () => {
    try {
      const data = fs.readFileSync(srcPath(), 'utf-8');
      fs.writeFileSync(publicPath(), data);
    } catch { /* ignore if not found yet */ }
  };

  return {
    name: 'layout-config-plugin',
    buildStart() {
      syncPublic();
    },
    configureServer(server: ViteDevServer) {
      syncPublic();
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.url === '/api/layout-config' && req.method === 'GET') {
          try {
            const data = fs.readFileSync(srcPath(), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(data);
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }));
          }
        } else if (req.url === '/api/save-config' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              const pretty = JSON.stringify(parsed, null, 2);
              fs.writeFileSync(srcPath(), pretty);
              fs.writeFileSync(publicPath(), pretty);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              console.error(err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  base: process.env.NETLIFY ? '/' : '/portfolio/',
  optimizeDeps: {
    // Keep Vite from scanning the unrelated archived app stored in this repo.
    entries: ['index.html'],
  },
  plugins: [
    react(),
    tailwindcss(),
    layoutConfigPlugin(),
  ],
  build: {
    // The whole site used to ship as one 594 kB script, so nothing rendered
    // until every byte of it — GSAP, framer-motion, the icon set, all nine
    // sections — had downloaded, parsed and executed. Splitting it lets the
    // browser start on the hero while the rest streams in, and keeps the three
    // vendor chunks cached across deploys instead of being re-downloaded
    // whenever a single line of Frank's own code changes.
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) only takes the function form here.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
          if (/[\\/]node_modules[\\/]gsap[\\/]/.test(id)) return 'gsap';
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion';
          return 'vendor';
        },
      },
    },
    // The vendor split leaves every remaining chunk well under this; a warning
    // here now means something heavy has crept back into the entry.
    chunkSizeWarningLimit: 300,
  },
});
