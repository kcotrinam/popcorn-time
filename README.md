# Popcorn Time

Popcorn Time is a family-oriented, multi-user media manager for movies, TV series, anime, and documentaries. The repository includes the pnpm monorepo, React client, Express API, PostgreSQL/Prisma persistence, custom authentication, a public TMDB-backed catalog API, an authenticated Explore experience, observability, documentation, tests, and Docker workflow.

## Shared viewing plans

Shared plans let up to ten verified users watch a TMDB movie or series together. Plans retain a trusted title snapshot, keep pending invitations private, and record independent participant progress. Completion saves owner-private Experience data; ratings, comments, watched dates, and Library records are never shared.

## Stack

- Web: React, Vite, TypeScript, React Router, Material UI, TanStack Query
- API: Express, TypeScript, Zod, Pino, Swagger/OpenAPI
- Data: PostgreSQL and Prisma
- Quality: ESLint, Prettier, Vitest, React Testing Library, Supertest
- Infrastructure: Docker Compose, multi-stage Docker images

## Requirements and installation

Install Node.js 24 (or a compatible current LTS), pnpm, Docker, and Docker Compose. Create local configuration with either `cp .env.example .env` (macOS/Linux) or `Copy-Item .env.example .env` (PowerShell), then run:

```bash
pnpm install
docker compose up -d db
pnpm db:generate
pnpm db:migrate
pnpm dev
```

`DATABASE_URL` uses `localhost` when API runs on the host. In Docker it must use the database service hostname `db`:

```env
DATABASE_URL=postgresql://popcorn_user:change_me@db:5432/popcorn_time?schema=public
```

Run all services as containers with `docker compose up --build`. The Vite dev server is at port 5173; the Nginx web container is at port 8080.

## URLs

- Web development: http://localhost:5173
- Web Docker: http://localhost:8080
- API root: http://localhost:3000/api/v1
- Health: http://localhost:3000/api/v1/health
- Swagger UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/docs/openapi.json
- PostgreSQL: localhost:5432
- Prisma Studio: `pnpm db:studio`

## Commands

`pnpm dev`, `pnpm dev:web`, `pnpm dev:api`, `pnpm build`, `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, and `pnpm validate` cover daily work. Database commands are `pnpm db:up`, `pnpm db:down`, `pnpm db:generate`, `pnpm db:migrate`, and `pnpm db:studio`. `pnpm docker:up` and `pnpm docker:down` manage the full environment.

## Architecture

The API follows `Router → Controller → Service → Repository → Prisma`. The `users` table stores the application's internal account identity, with a UUID primary key and normalized, unique email address. The health endpoint executes a live `SELECT 1` through its repository and returns 503 with a safe error envelope if PostgreSQL is unavailable. Request IDs, centralized errors, validation, security headers, CORS, and structured redacted logs are applied globally.

```
apps/
  api/       Express, Prisma, OpenAPI
  web/       React/Vite landing, authentication, and Explore client
packages/
  shared/    shared technical contracts/constants
  eslint-config/
  typescript-config/
```

## Authentication

Popcorn Time uses its own email/password authentication. Accounts must verify their email before signing in. Passwords are Argon2id hashes; access and rotating refresh credentials are `Secure`, `HttpOnly`, `SameSite=Lax` cookies. Refresh-token reuse revokes that session family, and password resets revoke every active session. Configure Resend for verification and reset emails.

## Public catalog

The public catalog is served only through the API under `/api/v1/catalog`; the browser never receives the TMDB access token or raw TMDB responses. Set `TMDB_API_ACCESS_TOKEN` to a TMDB v4 read access token. Search, discovery, genres, and detail responses use short-lived in-memory caching. Streaming availability is not included in this phase.

This product uses the TMDB API but is not endorsed or certified by TMDB.

## Environment variables

`NODE_ENV`, `API_PORT`, `API_PREFIX`, `CORS_ORIGIN`, `LOG_LEVEL`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `WEB_URL`, cookie settings, `RESEND_API_KEY`, `EMAIL_FROM`, and `TMDB_API_ACCESS_TOKEN` are validated by the API. PostgreSQL container setup additionally reads `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`. The web app reads `VITE_API_BASE_URL`. See `.env.example` for safe sample values.

## Prisma workflow

Run `pnpm db:generate` after schema changes, `pnpm db:migrate` to create/apply development migrations, and `pnpm db:studio` to inspect data. To reset disposable local data, stop the stack and intentionally run `docker compose down -v`; this removes the database volume.

### User persistence

`users` is the internal account table. `email` and `email_normalized` are required and unique; the latter provides case-insensitive uniqueness. `username` and `username_normalized` are nullable until settings/onboarding exist; the normalized value is lowercase and has a PostgreSQL partial unique index that applies only to active users. This allows multiple null usernames and reusing a username after a user is soft-deleted (`deleted_at` is set), while preventing active case-insensitive duplicates.

The partial username index is defined manually in `20260723000000_add_authentication_users/migration.sql` because Prisma schema syntax cannot describe its `WHERE deleted_at IS NULL AND username_normalized IS NOT NULL` predicate. Apply migrations with `pnpm db:migrate` after starting PostgreSQL. Integration persistence tests require an explicitly isolated `INTEGRATION_DATABASE_URL` schema and run with `pnpm --filter @popcorn-time/api test:integration`.

## Testing and troubleshooting

`pnpm test:web` uses mocked network calls; `pnpm test:api` uses mocked repository infrastructure. A real database is only required for migration and manual infrastructure verification. If a port is occupied, change the mapped port or stop its owner. If the database remains unhealthy, inspect `pnpm db:logs`; old volume credentials require resetting only disposable data. Regenerate Prisma Client after schema changes. Run `pnpm install` after lockfile changes. For Swagger failures verify `/api/docs`; for browser CORS errors ensure `CORS_ORIGIN` matches the web origin.

## Scope

The current implementation includes internal users, custom authentication, the public TMDB-backed catalog, authenticated Explore, private Pending/Watched libraries, manual titles, and owner-private watched-date, rating, and comment experiences. Recommendations, shared plans, notifications, Google OAuth, a mobile app, and i18n remain future work.
