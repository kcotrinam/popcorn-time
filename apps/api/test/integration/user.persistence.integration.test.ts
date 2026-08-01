import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Prisma, PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const integrationDatabaseUrl = process.env.INTEGRATION_DATABASE_URL;

if (!integrationDatabaseUrl) {
  throw new Error('INTEGRATION_DATABASE_URL is required for persistence integration tests.');
}

const integrationUrl = new URL(integrationDatabaseUrl);
const schema = integrationUrl.searchParams.get('schema');

if (!schema || !/^[a-z0-9_]+_integration_test$/.test(schema)) {
  throw new Error('INTEGRATION_DATABASE_URL must use a schema ending in _integration_test.');
}

const adminUrl = new URL(integrationDatabaseUrl);
adminUrl.searchParams.delete('schema');

const prisma = new PrismaClient({ datasources: { db: { url: integrationUrl.toString() } } });
const admin = new PrismaClient({ datasources: { db: { url: adminUrl.toString() } } });

type IndexRow = { indexname: string; indexdef: string };
type RelationRow = { relation: string | null };

const quoteIdentifier = (identifier: string) => `"${identifier.replaceAll('"', '""')}"`;

async function applyMigration(fileName: string) {
  const migrationUrl = new URL(
    `../../prisma/migrations/${fileName}/migration.sql`,
    import.meta.url,
  );
  const migration = await readFile(fileURLToPath(migrationUrl), 'utf8');
  const statements = migration
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.replace(/^--.*$/gm, '').trim())
    .filter(Boolean);

  await prisma.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe(`SET LOCAL search_path TO ${quoteIdentifier(schema)}`);

    for (const statement of statements) {
      await transaction.$executeRawUnsafe(statement);
    }
  });
}

const userData = (overrides: Partial<Prisma.UserCreateInput> = {}): Prisma.UserCreateInput => ({
  authProviderId: `auth0|${randomUUID()}`,
  displayName: 'CineTrack User',
  ...overrides,
});

beforeAll(async () => {
  await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS ${quoteIdentifier(schema)} CASCADE`);
  await admin.$executeRawUnsafe(`CREATE SCHEMA ${quoteIdentifier(schema)}`);
  await applyMigration('20260722000000_init_foundation');
  await applyMigration('20260723000000_add_authentication_users');
});

beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
  await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS ${quoteIdentifier(schema)} CASCADE`);
  await admin.$disconnect();
});

describe('User persistence', () => {
  it('creates a user with generated identity, defaults, and audit dates', async () => {
    const user = await prisma.user.create({ data: userData() });

    expect(user.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(user.emailVerified).toBe(false);
    expect(user.preferredLanguage).toBe('ES');
    expect(user.theme).toBe('SYSTEM');
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('allows null and duplicate emails plus multiple null usernames', async () => {
    await prisma.user.create({
      data: userData({ email: null, username: null, usernameNormalized: null }),
    });
    await prisma.user.create({
      data: userData({ email: null, username: null, usernameNormalized: null }),
    });
    await prisma.user.create({ data: userData({ email: 'shared@example.com' }) });
    await prisma.user.create({ data: userData({ email: 'shared@example.com' }) });

    expect(await prisma.user.count()).toBe(4);
  });

  it('keeps the Auth0 provider identity globally unique, including after soft delete', async () => {
    const authProviderId = 'auth0|stable-subject';
    const user = await prisma.user.create({ data: userData({ authProviderId }) });
    await prisma.user.update({ where: { id: user.id }, data: { deletedAt: new Date() } });

    await expect(prisma.user.create({ data: userData({ authProviderId }) })).rejects.toMatchObject({
      code: 'P2002',
    });
    expect(await prisma.user.findUnique({ where: { id: user.id } })).not.toBeNull();
  });

  it('enforces normalized usernames only among active users and permits reuse after soft delete', async () => {
    const original = await prisma.user.create({
      data: userData({ username: 'Kevin_C', usernameNormalized: 'kevin_c' }),
    });

    await expect(
      prisma.user.create({
        data: userData({ username: 'KEVIN_C', usernameNormalized: 'kevin_c' }),
      }),
    ).rejects.toMatchObject({ code: 'P2002' });

    await prisma.user.update({ where: { id: original.id }, data: { deletedAt: new Date() } });
    const replacement = await prisma.user.create({
      data: userData({ username: 'KEVIN_C', usernameNormalized: 'kevin_c' }),
    });

    expect(replacement.username).toBe('KEVIN_C');
    expect(await prisma.user.count()).toBe(2);
  });

  it('contains the expected user constraints, indexes, and no AppMetadata table', async () => {
    const [appMetadata] = await prisma.$queryRaw<
      RelationRow[]
    >`SELECT to_regclass('app_metadata')::text AS relation`;
    const indexes = await prisma.$queryRaw<
      IndexRow[]
    >`SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = current_schema()`;

    expect(appMetadata?.relation).toBeNull();
    expect(indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ indexname: 'users_auth_provider_id_key' }),
        expect.objectContaining({ indexname: 'users_deleted_at_idx' }),
        expect.objectContaining({
          indexname: 'users_username_normalized_active_key',
          indexdef: expect.stringContaining(
            'WHERE ((deleted_at IS NULL) AND (username_normalized IS NOT NULL))',
          ),
        }),
      ]),
    );
  });
});
