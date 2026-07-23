# Popcorn Time

Phase 0 technical foundation for a personal media-library application. It establishes a pnpm monorepo, React client, Express API, PostgreSQL/Prisma persistence, observability, documentation, tests, and Docker workflow. It deliberately contains no authentication or media-domain functionality.

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

The API follows `Router → Controller → Service → Repository → Prisma`. The only persistence model is `app_metadata`. The health endpoint executes a live `SELECT 1` through its repository and returns 503 with a safe error envelope if PostgreSQL is unavailable. Request IDs, centralized errors, validation, security headers, CORS, and structured redacted logs are applied globally.

```
apps/
  api/       Express, Prisma, OpenAPI
  web/       React/Vite status client
packages/
  shared/    shared technical contracts/constants
  eslint-config/
  typescript-config/
```

## Environment variables

`NODE_ENV`, `API_PORT`, `API_PREFIX`, `CORS_ORIGIN`, `LOG_LEVEL`, and `DATABASE_URL` are validated by the API. PostgreSQL container setup additionally reads `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`. The web app reads `VITE_API_BASE_URL`. See `.env.example` for safe sample values.

## Prisma workflow

Run `pnpm db:generate` after schema changes, `pnpm db:migrate` to create/apply development migrations, and `pnpm db:studio` to inspect data. To reset disposable local data, stop the stack and intentionally run `docker compose down -v`; this removes the database volume.

## Testing and troubleshooting

`pnpm test:web` uses mocked network calls; `pnpm test:api` uses mocked repository infrastructure. A real database is only required for migration and manual infrastructure verification. If a port is occupied, change the mapped port or stop its owner. If the database remains unhealthy, inspect `pnpm db:logs`; old volume credentials require resetting only disposable data. Regenerate Prisma Client after schema changes. Run `pnpm install` after lockfile changes. For Swagger failures verify `/api/docs`; for browser CORS errors ensure `CORS_ORIGIN` matches the web origin.

## Scope

Phase 0 intentionally excludes users, authentication, catalog data, TMDB, watchlists, ratings, comments, recommendations, shared plans, queues, WebSockets, and cloud deployment.
