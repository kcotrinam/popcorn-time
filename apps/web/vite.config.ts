import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@popcorn-time/shared': path.resolve(
        import.meta.dirname,
        '../../packages/shared/src/index.ts',
      ),
    },
  },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', globals: true },
});
