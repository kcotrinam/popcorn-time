# Database Decisions

## Identity and account data

`users` is the internal identity table. It uses the application's UUID as the primary key and keeps both the user-entered email and a normalized, unique email for case-insensitive login identity. Each user stores an Argon2id password hash, email-verification state, display and account preferences, soft-delete state, and creation/update timestamps.

User preferences currently include preferred language and theme. Usernames are optional until settings/onboarding is implemented; their normalized value is protected by a partial unique index for active users.

## Session and token storage

Refresh sessions are persisted separately from users. Only a hash of each opaque refresh token is stored, along with its expiry, revocation/replacement data, session family, and optional client metadata. Rotation records the replacement session so reuse can revoke the session family.

Email-verification tokens and password-reset tokens are separate tables. They store only token hashes, expiry, use state, and their user relationship. Future OAuth or other external identities belong in `external_identities`, separate from the internal user identity.

## Catalog references

TMDB catalog content is not copied into PostgreSQL during Phase 2. The API fetches, normalizes, and caches it at the application boundary. Future user-media relationships must persist stable `provider + externalId + mediaType` references rather than duplicating TMDB content rows.

## Personal library

`user_media` stores each user's private TMDB reference and a small display snapshot (title, poster, release year, and genre IDs). The `(user_id, provider, external_id, media_type)` unique key prevents duplicate TMDB ownership. It also stores owner-private manual records, whose provider is `manual`, whose external reference is absent, and whose optional metadata and fixed categories are stored on the same row. A database check preserves the TMDB external-reference requirement and limits manual categories to the fixed product set. `watched_at` records when an item most recently transitions to Watched and is cleared if it returns to Pending. User/status/created-date, user/status/watched-date, user/media-type, and manual-category indexes support private listing, filtering, and recent-history queries without a local TMDB catalog.

## Migration history

Create a new Prisma migration for every schema change. Never rewrite an applied migration; preserve migration history and inspect generated SQL before applying it.
