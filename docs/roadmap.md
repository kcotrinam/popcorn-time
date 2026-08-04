# Roadmap

## Completed

- **Phase 0 — Technical foundation:** pnpm monorepo, React/Vite web app, Express API, PostgreSQL/Prisma, Docker Compose, OpenAPI, and quality tooling.
- **Public landing page:** public English landing experience with local static poster assets.
- **Phase 1 — Custom authentication and internal users:** email/password registration and verification, sessions, password reset, CSRF protection, and internal user persistence.
- **Phase 2A — Public TMDB catalog backend:** normalized, cached, rate-limited search, discovery, genre, and detail endpoints.
- **Phase 2B — Authenticated Explore frontend:** responsive app shell, catalog discovery and search, filters, cards, pagination, and catalog detail pages.
- **Phase 3 — Personal library:** private TMDB references with Pending/Watched status, protected idempotent mutations, filtering and pagination API, and responsive library UI.
- **Authenticated Home dashboard:** protected `/home` with personal-library recents, library search handoff, watched-history timestamps, and intentional deferred-feature empty states.
- **Manual content registration:** private owner-scoped movie and series entries, fixed categories, optional HTTPS poster links, and library filtering.

## Later phases

- Ratings and private comments.
- Recommendations.
- Shared viewing plans.
- Extended account settings.
- Production hardening.
- Google OAuth.
- Mobile application.
- Internationalization (i18n).
