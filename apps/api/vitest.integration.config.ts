import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    clearMocks: true,
    include: ['test/integration/**/*.test.ts'],
    testTimeout: 30_000,
  },
});
