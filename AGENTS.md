# Popcorn Time Project Instructions

## Project Overview

Popcorn Time is a family-oriented, multi-user media manager for movies, TV series, anime, and documentaries.

## Technology Stack

- pnpm monorepo
- Frontend: React, Vite, TypeScript, Material UI, and TanStack Query
- Backend: Node.js, Express, and TypeScript
- Database: PostgreSQL with Prisma
- Authentication: custom email/password sessions
- Local infrastructure: Docker Compose

## Architecture Rules

Backend modules follow `Router → Controller → Service → Repository → Prisma`. Keep business logic out of controllers and validate input with Zod. Do not use `any`. Do not add Zustand or Redux unless a real global client-state requirement has been explicitly approved.

Catalog modules follow `Router → Controller → Service → Provider/Repository → TMDB client`. TMDB is called only from the Express backend; normalized catalog contracts are shared through `@popcorn-time/shared`. Catalog endpoints are public and rate-limited. The frontend must never call TMDB directly or expose its access token.

## Authentication Rules

- The application owns authentication, password hashes, sessions, and tokens.
- Never expose JWT secrets, password hashes, or email tokens to the frontend.
- Use the application's UUID as the internal user ID and a normalized email address as the login identifier.
- Preserve email verification, session rotation, CSRF protection for cookie-authenticated mutations, and secret redaction in logs.

## Database Rules

- Use Prisma migrations—not `db push`—for schema changes.
- Use snake_case database names through Prisma mappings.
- Use soft deletes only where explicitly defined, preserve migration history, and inspect generated SQL before applying migrations.

## Routing and UI Rules

The public landing page lives at `/` and must remain accessible to authenticated and unauthenticated visitors. It uses only local static mock poster assets and English copy. Its visual tokens must come from the Material UI theme palette; do not introduce hard-coded brand colors. Product-entry CTAs use `/sign-in` until their destination pages exist. Authenticated users remain on the landing page and see their avatar in the navbar.

`/explore` and `/explore/:type/:id` are authenticated application routes. They use the application shell with its desktop sidebar and responsive mobile navigation. Phase progress belongs in `docs/roadmap.md`, not in this file.

Read relevant files under `docs/` before implementing a task.

## Validation

Before claiming completion, run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. When database work changes, also run the applicable integration tests. Do not report a command as passing unless it was executed successfully.
