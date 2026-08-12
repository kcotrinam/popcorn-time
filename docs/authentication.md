# Authentication

The application owns email/password authentication. Email addresses are normalized and unique, while passwords are Argon2id hashes. A user must complete a single-use, hashed verification token before login can issue a session. For local development only (`NODE_ENV=development`), newly registered accounts and pending registrations are automatically marked as verified, so Resend is not called; test and production environments retain email verification.

Web sessions use a 15-minute access JWT and a maximum-30-day opaque refresh token in Secure, HttpOnly, SameSite=Lax cookies. Refresh tokens are stored only as hashes. Rotation records the replacement session; reuse of an old token revokes the entire family. Password reset tokens are single use and revoke every user session after a successful reset. Logout revokes the current refresh session only.

Cookie-authenticated mutations require an allowed Origin and an `x-csrf-token` header matching the non-HttpOnly CSRF cookie. Registration, login, and password reset flows use generic responses where account enumeration could occur. Transactional messages are sent through Resend. Future OAuth identities belong in `external_identities`, separate from `users`.
