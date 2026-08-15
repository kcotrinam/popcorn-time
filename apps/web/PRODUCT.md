# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People and families who want to organize what they plan to watch and record what they have watched, including with another Popcorn Time user.

## Product Purpose

Popcorn Time is a private multi-user media manager for movies, TV series, anime, and documentaries. It helps users maintain a personal library, track viewing activity, exchange recommendations, and coordinate shared viewing plans.

## Positioning

Shared viewing plans let users track a movie or series with another participant while preserving each person's private library, ratings, comments, and watched dates.

## Operating Context

Users access the product in a web browser to explore the public TMDB-backed catalog, add titles to their private library, send recommendations, accept invitations, and update their independent progress in shared plans.

## Capabilities and Constraints

- Authentication is owned by the application; private data remains owner-scoped.
- TMDB is accessed only by the Express backend; the browser never receives its token.
- Current capabilities include a personal library, private experiences, direct recommendations, shared plans, and persistent in-app notifications.
- Email, browser, push, and realtime notifications, Google OAuth, native mobile apps, and i18n are deferred.
- UI copy is currently English-only.

## Brand Commitments

The product is family-oriented and privacy-conscious. It is currently being developed as a portfolio project; no additional brand commitments have been specified.

## Evidence on Hand

- Local static landing-page poster assets: `apps/web/public/posters/`.
- Product, architecture, database, authentication, and roadmap documentation: `docs/`.
- There are no confirmed customer testimonials, case studies, benchmarks, or external proof assets; future work must not fabricate them.

## Product Principles

1. Keep personal viewing data private by default.
2. Make shared tracking useful without exposing private experiences.
3. Use trusted catalog data through the backend boundary.
4. Support practical, multi-user viewing workflows with clear ownership.
