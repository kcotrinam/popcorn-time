import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const integrationDatabaseUrl = process.env.INTEGRATION_DATABASE_URL;
const describeIntegration = integrationDatabaseUrl ? describe : describe.skip;
const prisma = integrationDatabaseUrl
  ? new PrismaClient({ datasources: { db: { url: integrationDatabaseUrl } } })
  : undefined;
const suffix = randomUUID();
const firstUserId = randomUUID();
const secondUserId = randomUUID();

describeIntegration('manual user media persistence', () => {
  beforeAll(async () => {
    await prisma?.user.createMany({
      data: [
        {
          id: firstUserId,
          email: `manual-first-${suffix}@example.test`,
          emailNormalized: `manual-first-${suffix}@example.test`,
          passwordHash: 'test-hash',
          displayName: 'First user',
        },
        {
          id: secondUserId,
          email: `manual-second-${suffix}@example.test`,
          emailNormalized: `manual-second-${suffix}@example.test`,
          passwordHash: 'test-hash',
          displayName: 'Second user',
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma?.userMedia.deleteMany({ where: { userId: { in: [firstUserId, secondUserId] } } });
    await prisma?.user.deleteMany({ where: { id: { in: [firstUserId, secondUserId] } } });
    await prisma?.$disconnect();
  });

  it('keeps TMDB references required while allowing private manual records without one', async () => {
    const client = prisma!;
    const tmdb = await client.userMedia.create({
      data: {
        userId: firstUserId,
        provider: 'tmdb',
        externalId: 42,
        mediaType: 'movie',
        title: 'TMDB snapshot',
        genreIds: [18],
      },
    });
    const manual = await client.userMedia.create({
      data: {
        userId: firstUserId,
        provider: 'manual',
        externalId: null,
        mediaType: 'tv',
        status: 'WATCHED',
        title: 'Private series',
        originalTitle: 'Original private series',
        manualCategories: ['Anime', 'Family'],
        watchedAt: new Date(),
        genreIds: [],
      },
    });

    expect(tmdb.externalId).toBe(42);
    expect(manual).toMatchObject({ provider: 'manual', externalId: null, status: 'WATCHED' });
    await expect(
      client.userMedia.create({
        data: {
          userId: firstUserId,
          provider: 'tmdb',
          externalId: null,
          mediaType: 'movie',
          title: 'Invalid TMDB row',
          genreIds: [],
        },
      }),
    ).rejects.toThrow();
  });

  it('uses OR category filtering without crossing user ownership', async () => {
    const client = prisma!;
    await client.userMedia.create({
      data: {
        userId: secondUserId,
        provider: 'manual',
        externalId: null,
        mediaType: 'movie',
        title: 'Other user private film',
        manualCategories: ['Anime'],
        genreIds: [],
      },
    });
    const records = await client.userMedia.findMany({
      where: {
        userId: firstUserId,
        manualCategories: { hasSome: ['Anime', 'Documentary'] },
      },
    });
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      title: 'Private series',
      manualCategories: ['Anime', 'Family'],
    });
  });
});
