# Domain Rules

These rules describe product behavior independent of the current framework or database.

## Accounts and privacy

- Each person has an application-owned account identified internally by a UUID and signs in with a normalized email address.
- Only active, verified users can participate in username-based multi-user workflows.
- A user's library, ratings, private comments, and watched dates are owner-private.
- Public user lookup returns only the minimum display identity needed to select another user.

## Catalog content

- Catalog-backed items use a trusted provider, external identifier, and media type.
- Popcorn Time supports movies and television records. Anime and documentary are discovery or manual-classification categories rather than separate provider media types.
- Trusted catalog snapshots may be stored for user-owned workflows, but raw provider records do not become a local public catalog.
- Manual records remain private and must not duplicate an exact catalog match. Ambiguous matches require user selection, and an unavailable catalog prevents manual creation because uniqueness cannot be verified.

## Personal library and experiences

- A catalog item appears at most once in one user's library for a provider, external identifier, and media type.
- Library items are either Pending (`WATCHLIST`) or Watched (`WATCHED`).
- Transitioning to Watched records a watched date.
- A viewing experience may contain one personal rating from 1 to 10 in half-point increments and one private comment up to 2,000 characters.
- Saving an experience marks the item Watched.
- Returning an item to Pending clears its watched date, rating, and private comment.

## Recommendations

- A verified user may recommend trusted catalog content to another verified user, but not to themselves.
- Recommending the same content repeatedly to the same recipient is prevented while the recommendation exists.
- Only the recipient may accept or decline a pending recommendation.
- Acceptance adds the trusted snapshot to the recipient's Pending library if it is not already present.
- Declining deletes the recommendation so the content may be recommended again.
- Recommendation ownership never reveals the recipient's library contents.

## Shared viewing plans

- A shared plan covers one trusted TMDB movie or television series.
- A plan contains at most ten users, including its creator.
- The creator is accepted immediately and cannot leave their own plan. Only the creator may remove another participant or cancel an active plan.
- Pending invitee identities are visible only to the creator and the invitee themselves.
- Participants accept independently and track progress independently.
- A plan is Pending until at least two participants are accepted, Active while accepted participants are still progressing, and Completed when every accepted participant is Watched. Cancelled and Completed plans are read-only.
- Movie progress uses a minute within the trusted runtime. Series progress uses an aired episode from a non-special season.
- Completing a participant updates only that participant's private library and experience.
- Leaving, rejection, or removal does not delete a user's private library or experience data.

## Notifications

- Notifications belong only to their recipient.
- Recommendation and shared-plan events create persistent in-app notifications atomically with the domain operation.
- Deterministic deduplication prevents the same event from producing duplicate notifications.
- Deleting an actor or related resource may remove the reference, but retained notification history remains recipient-owned.
- The current product does not promise email, browser, push, polling, or realtime notification delivery.
