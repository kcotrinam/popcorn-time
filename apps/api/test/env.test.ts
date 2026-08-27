import { describe, expect, it } from 'vitest';
import { developmentAccessSecret, loadEnv } from '../src/config/env.js';

const databaseUrl = 'postgresql://test:test@localhost:5432/test?schema=public';

describe('environment configuration', () => {
  it('allows development-only authentication defaults outside production', () => {
    const env = loadEnv({ NODE_ENV: 'development', DATABASE_URL: databaseUrl });

    expect(env.JWT_ACCESS_SECRET).toBe(developmentAccessSecret);
    expect(env.COOKIE_SECURE).toBe(false);
  });

  it('rejects development authentication defaults in production', () => {
    expect(() => loadEnv({ NODE_ENV: 'production', DATABASE_URL: databaseUrl })).toThrow(
      /JWT_ACCESS_SECRET, COOKIE_SECURE, RESEND_API_KEY/,
    );
  });

  it('accepts explicit production authentication configuration', () => {
    const env = loadEnv({
      NODE_ENV: 'production',
      DATABASE_URL: databaseUrl,
      JWT_ACCESS_SECRET: 'a-production-secret-with-at-least-32-characters',
      COOKIE_SECURE: 'true',
      RESEND_API_KEY: 'configured-resend-key',
    });

    expect(env.COOKIE_SECURE).toBe(true);
  });
});
