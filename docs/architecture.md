# Architecture

## System boundaries

Popcorn Time is a pnpm monorepo with two deployable applications and three internal packages:

```text
Browser
  ↓ HTTP + cookie credentials
apps/web (React/Vite)
  ↓ normalized JSON contracts
apps/api (Express)
  ├─ PostgreSQL through Prisma
  ├─ TMDB through the catalog client
  └─ Resend for production transactional email
```

- `apps/web` owns browser routing, presentation, local UI preferences, and server-state orchestration with TanStack Query.
- `apps/api` owns authentication, authorization, validation, business operations, provider access, persistence, and OpenAPI.
- `packages/shared` owns normalized technical contracts and constants used by both applications. It does not contain business services or provider payloads.
- `packages/eslint-config` and `packages/typescript-config` centralize workspace quality settings.

## Frontend

The web client is organized by feature under `apps/web/src/features`. React Router defines the public landing and authentication pages plus authenticated application routes. Authenticated product pages render through the shared application shell, which provides desktop and mobile navigation.

TanStack Query owns remote server state. Small persistent presentation preferences, such as theme and library view, use local storage. The frontend calls only the Popcorn Time API through `src/services/http-client.ts`; it does not call TMDB.

The public landing page remains available at `/` to signed-in and signed-out visitors. Product pages such as Home, Explore, Library, Recommendations, Shared Plans, and Notifications require an authenticated session.

## API

Express mounts versioned routes below `/api/v1`. Helmet, CORS, JSON limits, cookies, request IDs, structured redacted logging, not-found handling, and centralized error responses are configured globally.

Most database-backed features follow:

```text
Router → Controller → Service → Repository → Prisma
```

Controllers translate HTTP input and output. Services own business decisions. Repositories own persistence queries and transactions. This is the prevailing convention, not a claim that every existing module already has the same shape:

- Shared Plans currently performs Prisma operations directly in its service because its lifecycle is transaction-heavy.
- Catalog uses a service, TMDB client, cache, and pure response normalizers; its `catalog.repository.ts` is a normalizer rather than a database repository.
- Health constructs its service and repository in the router to support dependency isolation.

New changes should preserve the boundary of the module being touched unless a focused refactor is explicitly in scope.

## Catalog boundary

Catalog routes are public, validated, and rate-limited per IP. The API calls TMDB with a server-only v4 read token, normalizes provider responses into `@popcorn-time/shared` contracts, and applies a short in-memory TTL cache. Raw provider payloads and the token never reach the browser.

`discover?type=all` queries movie and television discovery independently and combines the results deterministically. Its pagination is an API aggregation rather than a native TMDB page.

TMDB catalog records are not mirrored into a public PostgreSQL catalog. User workflows persist stable provider/type/external-ID references plus trusted display snapshots.

## Persistence

Prisma maps application names to snake_case PostgreSQL tables and columns. Schema changes use preserved migrations under `apps/api/prisma/migrations`; manually authored constraints and partial indexes remain part of migration history.

The main persisted areas are:

- internal users, refresh sessions, verification/reset tokens, and future external identities;
- owner-scoped library items and private viewing experiences;
- direct recommendations;
- shared plans and participant progress;
- recipient-owned notifications.

Cross-record operations that affect recommendations, notifications, shared-plan state, or private library experience use Prisma transactions.

## Authentication and request protection

The application owns email/password identity. Access and refresh credentials are cookie based. Authenticated reads verify the session; cookie-authenticated mutations additionally require the CSRF cookie/header pair and an allowed Origin. Detailed security behavior and environment requirements are documented in [authentication.md](authentication.md).

## Local infrastructure

Root `compose.yaml` orchestrates PostgreSQL, the API image, and the Nginx-served web image for local use. Dockerfiles remain beside their owning applications because the current infrastructure is small and ownership is clear.

The Compose application uses local-development authentication behavior at `http://localhost:8080`. It is not a production deployment definition. Production must supply secrets, HTTPS cookie settings, correct origins, provider credentials, and an email-delivery configuration.

## API documentation

OpenAPI is assembled in `apps/api/src/docs/openapi.ts` and served as JSON and Swagger UI by Express. Router changes must update the OpenAPI paths in the same change.

Product-independent business rules are documented in [domain.md](domain.md). Source code, tests, Prisma schema, and migration SQL remain implementation truth.
