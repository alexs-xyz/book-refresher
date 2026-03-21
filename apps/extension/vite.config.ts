import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { defineConfig } from 'vite';

import manifest from './manifest.config';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        reader: resolve(__dirname, 'reader.html')
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
});
