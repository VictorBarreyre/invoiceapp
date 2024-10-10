import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteBabel from 'vite-plugin-babel';

export default defineConfig({
  plugins: [
    react(),
    viteBabel() // Ajout du plugin Babel pour Vite
  ],
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console'] : [],
  }
});
