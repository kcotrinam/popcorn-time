import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node',
    clearMocks: true,
    env: { DATABASE_URL: 'postgresql://test:test@localhost:5432/test?schema=public' },
  },
});
