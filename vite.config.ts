import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // --- THIS SERVER CONFIGURATION IS THE FIX ---
  server: {
    port: 5173,
    // This tells Vite to forward any requests to /api to your backend server
    proxy: {
      '/api': {
        target: 'http://localhost:5173', // IMPORTANT: Change this if your backend runs on a different port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Removes /api from the start of the request
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
});