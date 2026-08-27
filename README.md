# Popcorn Time

Popcorn Time is a private, multi-user media manager for discovering titles, maintaining personal libraries, exchanging recommendations, and coordinating shared viewing plans.

## Prerequisites

- Node.js 24
- pnpm 11.9.0 through Corepack
- Docker and Docker Compose for PostgreSQL or the full local container stack

## Install and run locally

Create local configuration, install dependencies, start PostgreSQL, generate Prisma Client, apply migrations, and start both applications:

```bash
cp .env.example .env
pnpm install
docker compose up -d db
pnpm db:generate
pnpm db:migrate
pnpm dev
```

PowerShell users can replace the first command with:

```powershell
Copy-Item .env.example .env
```

The host-based development URLs are:

- Web: http://localhost:5173
- API: http://localhost:3000/api/v1
- Health: http://localhost:3000/api/v1/health
- Swagger UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/docs/openapi.json
- PostgreSQL: localhost:5432

For the full local container stack, configure the required provider values in `.env` and run:

```bash
docker compose up --build
```

The containerized web application is served at http://localhost:8080. Compose runs the application in local-development mode so registrations are automatically verified and HTTP cookies work on localhost. Production deployments must provide their own secrets, HTTPS cookie settings, origins, and email delivery configuration.

## Environment

`.env` and environment-specific variants are ignored. `.env.example` is the versioned reference for API, database, web, email, cookie, and TMDB configuration.

When the API runs on the host, `DATABASE_URL` uses `localhost`. Inside Compose it uses the `db` service hostname. Never commit real credentials.

## Commands

| Command                                            | Purpose                                                        |
| -------------------------------------------------- | -------------------------------------------------------------- |
| `pnpm dev`                                         | Run web and API development servers                            |
| `pnpm dev:web` / `pnpm dev:api`                    | Run one application                                            |
| `pnpm format:check`                                | Check formatting                                               |
| `pnpm lint`                                        | Run workspace linting                                          |
| `pnpm typecheck`                                   | Run workspace type checks                                      |
| `pnpm test`                                        | Run unit and HTTP tests                                        |
| `pnpm build`                                       | Build all buildable workspaces                                 |
| `pnpm validate`                                    | Run the complete standard validation sequence                  |
| `pnpm db:up` / `pnpm db:down`                      | Start or stop PostgreSQL                                       |
| `pnpm db:generate`                                 | Generate Prisma Client                                         |
| `pnpm db:migrate`                                  | Create or apply a development migration                        |
| `pnpm db:studio`                                   | Open Prisma Studio                                             |
| `pnpm --filter @popcorn-time/api test:integration` | Run database integration tests with `INTEGRATION_DATABASE_URL` |

To intentionally remove disposable local database data, use `docker compose down -v`. This deletes the Compose PostgreSQL volume.

## Repository layout

```text
apps/
  api/                 Express API and Prisma schema/migrations
  web/                 React/Vite web client
packages/
  shared/              Shared API contracts and constants
  eslint-config/       Shared lint configuration
  typescript-config/   Shared TypeScript configuration
docs/                   Architecture, authentication, domain, and roadmap
```

## Documentation

- [Product definition](PRODUCT.md)
- [Architecture](docs/architecture.md)
- [Authentication](docs/authentication.md)
- [Domain rules](docs/domain.md)
- [Roadmap](docs/roadmap.md)
- [Web design system](apps/web/DESIGN.md)
- [Agent instructions](AGENTS.md)

## Troubleshooting

- Regenerate Prisma Client after schema changes.
- Ensure `CORS_ORIGIN` and `WEB_URL` match the browser origin when authentication mutations fail.
- A real database is required for migrations and integration tests, but ordinary API tests mock persistence.
- If existing PostgreSQL volume credentials no longer match `.env`, reset only disposable local data.
- If dependency manifests or the lockfile change, run `pnpm install` before validation.
