import { env } from './config/index.js';
import { prisma } from './lib/prisma.js';
import { logger } from './lib/logger.js';
import { app } from './app.js';
async function start() {
  await prisma.$connect();
  const server = app.listen(env.API_PORT, () => logger.info({ port: env.API_PORT }, 'API server started'));
  const shutdown = async (signal: string) => { logger.info({ signal }, 'Shutting down'); server.close(async () => { await prisma.$disconnect(); process.exit(0); }); };
  process.once('SIGINT', () => void shutdown('SIGINT')); process.once('SIGTERM', () => void shutdown('SIGTERM'));
}
void start().catch(async (error: unknown) => { logger.fatal({ err: error }, 'API startup failed'); await prisma.$disconnect(); process.exit(1); });
