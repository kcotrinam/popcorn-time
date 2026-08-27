# Popcorn Time Agent Instructions

Popcorn Time is a pnpm monorepo for a private, multi-user media manager. Read the relevant implementation and tests before changing behavior. Use [README.md](README.md) for developer workflow, [PRODUCT.md](PRODUCT.md) for product scope, and the targeted documents under `docs/` for architecture, authentication, domain rules, and roadmap status.

## Working conventions

- Use pnpm and the existing workspace scripts. Do not introduce dependencies or new architectural layers without a concrete need and explicit justification.
- Preserve the established boundaries of the module being changed. Most database-backed API modules use `Router → Controller → Service → Repository → Prisma`; documented exceptions are intentional until explicitly refactored. Keep business decisions out of controllers and validate external input with Zod.
- Keep TypeScript strict. Do not use `any`, and follow the shared ESLint and TypeScript configurations.
- Do not add Redux, Zustand, or another global client-state library without an approved global-state requirement. Server state belongs in TanStack Query.
- The browser must never call TMDB directly or receive its access token. Catalog data is normalized by the API and shared through `@popcorn-time/shared` contracts.

## Security and data

- Preserve application-owned authentication, email verification outside local development, session rotation, CSRF protection for cookie-authenticated mutations, and log redaction.
- Never expose JWT secrets, password hashes, email tokens, refresh tokens, or provider credentials to the frontend or logs.
- Use Prisma migrations rather than `db push`. Preserve migration history, inspect generated SQL, and keep database names snake_case through Prisma mappings.
- Apply soft deletion only where the schema and domain documentation explicitly define it.

## Frontend and documentation

- Preserve the public `/` route and authenticated application-route boundary. Follow `apps/web/DESIGN.md` for web UI work and use Material UI theme tokens instead of hard-coded brand colors in components.
- Update the owning document when product scope, domain rules, architecture, authentication, developer workflow, or roadmap status changes. Do not duplicate the same rule across documents.

## Validation

Before reporting completion, run `pnpm validate`. When database behavior changes, also run the applicable integration tests. Report a command as passing only when it completed successfully.
