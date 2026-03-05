import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: []
      }
    }),
    electron([
      {
        // Main process entry
        entry: 'electron/main/index.ts',
        onstart({ startup }) {
          // Start electron app after build
          startup();
        },
        vite: {
          build: {
            outDir: 'dist-electron/main',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
      {
        // Preload script
        entry: 'electron/preload/index.ts',
        onstart({ reload }) {
          // Reload renderer process when preload script changes
          reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@constants': path.resolve(__dirname, './src/constants'),
    },
  },
  esbuild: {
    loader: 'tsx',
    include: ['src/**/*.{ts,tsx}', 'electron/**/*.{ts,tsx}'],
    exclude: ['node_modules/**']
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
