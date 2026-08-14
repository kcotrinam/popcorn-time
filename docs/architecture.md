# Architecture

The public catalog follows `Router → Controller → Service → Provider/Repository → TMDB client`. TMDB is called only from the Express backend with a v4 read token. The catalog service normalizes results into shared Popcorn Time contracts, applies a short in-memory TTL cache, and never persists or exposes raw TMDB payloads. Catalog routes are public and are protected with per-IP rate limiting; they do not use session authentication or CSRF checks.

For `discover?type=all`, movie and TV responses are queried separately and combined deterministically. Its pagination is an aggregation in v1 rather than a native TMDB page.

The protected personal library follows `Router → Controller → Service → Repository → Prisma`. TMDB creates resolve the trusted catalog snapshot through the catalog service before persisting a user-owned reference. Manual creates use a separate authenticated, CSRF-protected endpoint: before persisting, the library service verifies an exact normalized title match against TMDB. A confirmed match returns a typed conflict for catalog navigation, ambiguity returns a typed search conflict, and an unavailable catalog prevents the write. Only verified non-matches persist owner-provided private metadata; manual items never enter the public catalog. Reads authenticate the current session and mutations additionally use CSRF protection.

The authenticated Home dashboard reads the same protected personal-library endpoint through independent client queries. A library query supplied in `/library?query=...` is an all-status search so results from both Pending and Watched are visible; ordinary library tabs continue to filter by their selected status.

Private user recommendations follow `Router → Controller → Service → Repository → Prisma`. A sender resolves a trusted TMDB snapshot at creation; only the recipient can atomically accept it into their private library or delete a pending recommendation. Public identity lookup is exact, authenticated, rate-limited, and returns only verified active users' display identity.

Private experiences are stored on the owner-scoped `user_media` row. The authenticated, CSRF-protected experience endpoint atomically records an optional half-point personal rating, optional private comment, watched timestamp, and `WATCHED` status. Moving an item back to Pending atomically clears every experience field.

Shared viewing plans follow `Router → Controller → Service → Prisma` and use only trusted TMDB snapshots. Reads hide pending invitation identities from non-creators. Completing a participant writes their progress and owner-private Experience/library record atomically. TMDB season data is normalized and cached at the catalog boundary; specials and future episodes are excluded.

In-app notifications follow `Router → Controller → Service → Repository → Prisma`. Records carry a structured event type, minimal title snapshot, resource reference, actor identity where available, and deterministic deduplication key. Recommendation and shared-plan mutations create notifications in their domain transaction; inbox operations are recipient-scoped.
