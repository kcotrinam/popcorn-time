import pino from 'pino';
import { env } from '../config/index.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: { paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token', 'DATABASE_URL'], remove: true },
  transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});
