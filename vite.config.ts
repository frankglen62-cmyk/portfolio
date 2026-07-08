import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

function layoutConfigPlugin() {
  const srcPath = () => path.resolve(process.cwd(), 'src/config/layout.json');
  const publicPath = () => path.resolve(process.cwd(), 'public/layout.json');

  // Sync public copy on startup
  const syncPublic = () => {
    try {
      const data = fs.readFileSync(srcPath(), 'utf-8');
      fs.writeFileSync(publicPath(), data);
    } catch (e) { /* ignore if not found yet */ }
  };

  return {
    name: 'layout-config-plugin',
    buildStart() {
      syncPublic();
    },
    configureServer(server: any) {
      syncPublic();
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/layout-config' && req.method === 'GET') {
          try {
            const data = fs.readFileSync(srcPath(), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(data);
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        } else if (req.url === '/api/save-config' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              const pretty = JSON.stringify(parsed, null, 2);
              fs.writeFileSync(srcPath(), pretty);
              fs.writeFileSync(publicPath(), pretty);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              console.error(err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
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
  plugins: [
    react(),
    tailwindcss(),
    layoutConfigPlugin(),
  ],
});
