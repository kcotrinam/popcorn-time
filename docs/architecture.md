# Architecture

The public catalog follows `Router → Controller → Service → Provider/Repository → TMDB client`. TMDB is called only from the Express backend with a v4 read token. The catalog service normalizes results into shared Popcorn Time contracts, applies a short in-memory TTL cache, and never persists or exposes raw TMDB payloads. Catalog routes are public and are protected with per-IP rate limiting; they do not use session authentication or CSRF checks.

For `discover?type=all`, movie and TV responses are queried separately and combined deterministically. Its pagination is an aggregation in v1 rather than a native TMDB page.

The protected personal library follows `Router → Controller → Service → Repository → Prisma`. TMDB creates resolve the trusted catalog snapshot through the catalog service before persisting a user-owned reference. Manual creates use a separate authenticated, CSRF-protected endpoint: before persisting, the library service verifies an exact normalized title match against TMDB. A confirmed match returns a typed conflict for catalog navigation, ambiguity returns a typed search conflict, and an unavailable catalog prevents the write. Only verified non-matches persist owner-provided private metadata; manual items never enter the public catalog. Reads authenticate the current session and mutations additionally use CSRF protection.

The authenticated Home dashboard reads the same protected personal-library endpoint through independent client queries. A library query supplied in `/library?query=...` is an all-status search so results from both Pending and Watched are visible; ordinary library tabs continue to filter by their selected status.
