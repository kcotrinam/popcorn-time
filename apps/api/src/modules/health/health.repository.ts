import { prisma } from '../../lib/prisma.js';
import type { HealthRepository } from './health.types.js';
export const healthRepository: HealthRepository = { async check() { await prisma.$queryRaw`SELECT 1`; } };
