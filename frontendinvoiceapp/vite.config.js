import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteBabel from 'vite-plugin-babel';

export default defineConfig({
  plugins: [
    react(),
    viteBabel(),
    commonjs()
  ],
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console'] : [],
  }
});
