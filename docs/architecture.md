# Architecture

The public catalog follows `Router → Controller → Service → Provider/Repository → TMDB client`. TMDB is called only from the Express backend with a v4 read token. The catalog service normalizes results into shared Popcorn Time contracts, applies a short in-memory TTL cache, and never persists or exposes raw TMDB payloads. Catalog routes are public and are protected with per-IP rate limiting; they do not use session authentication or CSRF checks.

For `discover?type=all`, movie and TV responses are queried separately and combined deterministically. Its pagination is an aggregation in v1 rather than a native TMDB page.

The protected personal library follows `Router → Controller → Service → Repository → Prisma`. Creates resolve the trusted catalog snapshot through the catalog service before persisting a user-owned reference; reads authenticate the current session and mutations additionally use CSRF protection.
