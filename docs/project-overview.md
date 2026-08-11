# Project Overview

Popcorn Time is a family-oriented, multi-user media manager for movies, TV series, anime, and documentaries. It is designed to help people organize what they want to watch and the media they have watched while keeping account data private to each user.

## Current scope

- A public landing page at `/` with English copy and local static mock poster assets.
- Custom email/password authentication: registration, email verification, sign-in, protected routes, session refresh and rotation, sign-out, and password reset.
- A public catalog API backed by TMDB. The Express API normalizes and caches catalog data; the browser never calls TMDB directly.
- An authenticated Explore experience at `/explore`, including search, discovery filters, responsive catalog cards, and catalog detail pages at `/explore/:type/:id`.
- A private `/library` for Pending and Watched TMDB references, with search, filters, sorting, pagination, view preference, status changes, removal, and owner-private ratings/comments.
- An authenticated `/home` dashboard with recent Pending and Recently Watched library items, library-only search, and intentional empty states for deferred recommendations and shared plans.

## Deferred scope

The following are intentionally deferred: recommendations, shared viewing plans, notifications, Google OAuth, a mobile app, and internationalization (i18n).
