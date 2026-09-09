import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: process.env.VITE_API_BACKEND_URL ? {
      '/api': {
        target: process.env.VITE_API_BACKEND_URL,
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (_err, _req, res) => {
            if (res && !res.headersSent && typeof (res as any).writeHead === 'function') {
              (res as any).writeHead(503, { 'Content-Type': 'application/json' });
              (res as any).end(JSON.stringify({
                message: 'Backend server not reachable on ' + options.target,
                code: 'BACKEND_OFFLINE',
              }));
            }
          });
        }
      }
    } : undefined
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  }
});
