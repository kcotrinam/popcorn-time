# Product

## Purpose

Popcorn Time is a private, multi-user media manager for movies, TV series, anime, and documentaries. It helps people discover catalog titles, maintain personal Pending and Watched libraries, record viewing experiences, exchange recommendations, and coordinate shared viewing plans.

## Users and context

The product is intended for people and families organizing what they want to watch and what they have watched. Users access it in a web browser and interact through their own verified account.

## Product principles

1. Personal libraries, ratings, comments, and watched dates are private by default.
2. Shared tracking must remain useful without exposing another participant's private experience.
3. Public catalog data comes from a trusted backend boundary rather than directly from the browser.
4. Ownership, invitation state, and visibility must be explicit in multi-user workflows.
5. Product claims must be supported by repository evidence; do not fabricate testimonials, customers, benchmarks, or partnerships.

## Current scope

- A public English landing page with local static poster artwork.
- Application-owned email/password accounts and cookie-based sessions.
- A public, normalized TMDB-backed catalog API and authenticated Explore experience.
- Private Pending and Watched libraries, including verified manual entries.
- Owner-private watched dates, half-point ratings, and comments.
- Direct recommendations between verified users.
- Shared movie and series plans with invitations and independent progress.
- Persistent recipient-owned in-app notifications.

## Deferred scope

- Email, browser, push, and realtime notification delivery
- Google OAuth and other external sign-in providers
- Native mobile applications
- Internationalization
- Production deployment hardening

## Product boundaries

- Popcorn Time owns authentication, sessions, and private user data.
- The Express API is the only component that calls TMDB; the browser never receives the TMDB token or raw provider responses.
- TMDB snapshots support user-owned workflows but do not create a local public catalog.
- The product uses the TMDB API but is not endorsed or certified by TMDB.

Detailed lifecycle, ownership, and visibility rules live in [docs/domain.md](docs/domain.md). Current system boundaries live in [docs/architecture.md](docs/architecture.md).
