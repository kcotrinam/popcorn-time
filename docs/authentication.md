# Authentication

## Identity

The application owns email/password authentication. Email addresses are normalized for case-insensitive login uniqueness, and passwords are stored as Argon2id hashes. Internal relationships use the application's UUID rather than an external provider identifier.

Registration requires a display name and unique username. In test and production environments, a user must consume a single-use hashed verification token before signing in. Local development automatically verifies new and previously pending registrations and does not call Resend.

Future OAuth identities belong in `external_identities`, separate from the internal user identity.

## Sessions

The API issues:

- a 15-minute signed access JWT;
- a maximum-30-day opaque refresh token.

Both are HttpOnly, SameSite=Lax cookies. The `Secure` attribute is environment-controlled: false for local HTTP development and required for an HTTPS production deployment.

Only a hash of each refresh token is stored. Refresh rotation records the replacement session. Reuse of a revoked or replaced token revokes the entire session family. Logout revokes only the current refresh session. A successful password reset revokes every active session for the user.

Production startup rejects the repository's development-only JWT signing value. A deployment must supply an unpredictable `JWT_ACCESS_SECRET` of at least 32 characters.

## CSRF and origins

Cookie-authenticated mutations require:

1. an allowed request Origin matching `WEB_URL`;
2. an `x-csrf-token` header;
3. the matching non-HttpOnly CSRF cookie.

The browser obtains the CSRF token from the API and caches it in memory. `CORS_ORIGIN` and `WEB_URL` must both match the actual browser origin.

## Verification and password reset

Verification and password-reset tokens are random, single-use, hashed at rest, and expire. Transactional email is sent through Resend outside local development. Production must provide working mail delivery configuration; otherwise users cannot complete verification or password reset.

Registration, sign-in, and password-reset flows use generic responses where revealing account existence would enable enumeration.

## Secret handling

JWT secrets, passwords, token values, token hashes, cookie headers, request bodies, database URLs, and provider credentials must not be returned to the browser or written to logs. The tracked `.env.example` contains placeholders only; real values belong in ignored local or deployment-managed environment configuration.
