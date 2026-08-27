import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv({ path: fileURLToPath(new URL('../../../../.env', import.meta.url)) });

export const developmentAccessSecret = 'test-only-access-secret-change-before-production';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    API_PREFIX: z
      .string()
      .regex(/^api\/v\d+$/)
      .default('api/v1'),
    CORS_ORIGIN: z.url().default('http://localhost:5173'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    DATABASE_URL: z.url(),
    JWT_ACCESS_SECRET: z.string().min(32).default(developmentAccessSecret),
    WEB_URL: z.url().default('http://localhost:5173'),
    COOKIE_DOMAIN: z.string().optional(),
    COOKIE_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    RESEND_API_KEY: z.string().default(''),
    EMAIL_FROM: z.string().trim().email().default('onboarding@resend.dev'),
    TMDB_API_ACCESS_TOKEN: z.string().min(1).default(''),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV !== 'production') return;
    if (value.JWT_ACCESS_SECRET === developmentAccessSecret)
      context.addIssue({
        code: 'custom',
        path: ['JWT_ACCESS_SECRET'],
        message: 'Production requires an explicit JWT access secret',
      });
    if (!value.COOKIE_SECURE)
      context.addIssue({
        code: 'custom',
        path: ['COOKIE_SECURE'],
        message: 'Production requires secure cookies',
      });
    if (!value.RESEND_API_KEY)
      context.addIssue({
        code: 'custom',
        path: ['RESEND_API_KEY'],
        message: 'Production requires transactional email delivery',
      });
  });

export type Env = z.infer<typeof envSchema>;

export function loadEnv(input: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')}`,
    );
  }
  return parsed.data;
}
