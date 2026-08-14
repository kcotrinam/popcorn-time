# Project Overview

Popcorn Time is a family-oriented, multi-user media manager for movies, TV series, anime, and documentaries. It is designed to help people organize what they want to watch and the media they have watched while keeping account data private to each user.

## Current scope

- A public landing page at `/` with English copy and local static mock poster assets.
- Custom email/password authentication: registration, email verification, sign-in, protected routes, session refresh and rotation, sign-out, and password reset.
- A public catalog API backed by TMDB. The Express API normalizes and caches catalog data; the browser never calls TMDB directly.
- An authenticated Explore experience at `/explore`, including search, discovery filters, responsive catalog cards, and catalog detail pages at `/explore/:type/:id`.
- A private `/library` for Pending and Watched TMDB references, with search, filters, sorting, pagination, view preference, status changes, removal, and owner-private ratings/comments.
- An authenticated `/home` dashboard with recent Pending and Recently Watched library items, library-only search, and intentional empty states for deferred recommendations and shared plans.
- Private direct recommendations by exact username, with received/sent views and recipient-controlled acceptance into Pending.
- Shared viewing plans for TMDB movies and series, invitations, per-participant progress, and private Experience completion.
- Persistent in-app notifications for recommendation and shared-plan events, with an unread inbox badge.

## Deferred scope

The following are intentionally deferred: email, browser, push, and realtime notifications; Google OAuth; a mobile app; and internationalization (i18n).
