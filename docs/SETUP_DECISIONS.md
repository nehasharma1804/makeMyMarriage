# Foundation decisions and remaining questions

The four September 2026 PRD, system, database, and API design PDFs remain the
product baseline. This document records implementation choices without changing
those PDFs or implementing wedding features.

## Selected foundation

- TypeScript across the Next.js frontend, Fastify API, and shared contracts.
- One repository and npm workspaces, using the existing lockfile and versions.
- Node 24 LTS, already installed locally under `.tools/` on this Mac. System Node
  20.12.2 is not used for project commands.
- Next.js with a separate Fastify modular monolith. Future business logic belongs
  in `server/modules/`, not React components or API route handlers.
- Official MongoDB driver, with one reused pool per API process. Both Atlas and
  local MongoDB use environment configuration.
- Zod for environment and shared contract validation; strict TypeScript, ESLint,
  Prettier, and Vitest for verification.
- Google identity, private S3/CloudFront delivery, and later SQS/SES follow the
  design, but are not installed or implemented as features in this foundation.
- No new package is required for the foundation: the existing dependencies suffice.

## User preferences

Development happens in Codex. VS Code is optional and is not used by setup scripts.
Both hosted and local database configurations are prepared; selection is deferred.
No Atlas, Google Cloud, or AWS accounts are ready yet. No cloud resources or accounts
were created by this work.

## Resolve before the relevant feature work

1. **One wedding per account:** the PRD requires this, but the DB design's unique
   `(weddingId, userId)` membership index allows multiple weddings. Recommend a
   unique partial index on `userId` for active memberships and transactional
   enforcement during wedding creation and invitation acceptance.
2. **Identity and sessions:** the API accepts a verified Google ID token but leaves
   session versus JWT open. Recommend secure HTTP-only cookie sessions and a
   single browser origin, forwarding API calls to Fastify. Do not treat a Google
   client ID or decoded, unverified token as authentication.
3. **Member permissions:** the PRD describes Admin event/livestream control while
   the API matrix allows Members to manage these. Confirm a single permission
   matrix before implementing authorization.
4. **Invitation versus RSVP:** retain the database's separate invitation status
   and per-event RSVP response. The PRD's "Invited" label describes an invitation,
   not a response. One guest may attend multiple events without duplicate records.
5. **Dates:** decide whether auto-created events start unscheduled or with a
   provisional date. Preserve calendar dates and local event times in the wedding's
   timezone, defaulting to Asia/Kolkata.
6. **Money:** decide whole INR versus paise. Integer paise is recommended before
   accepting fractional amounts; the DB PDF currently permits whole INR.
7. **Collaboration lifecycle:** decide invite delivery before SES, last-Admin
   protection, and archive/deletion behavior. These are incomplete in the API docs.
8. **Media privacy:** later work must authorize CloudFront delivery as well as S3
   uploads, verify upload ownership/completion, and enforce token scope and quotas.
9. **MVP order:** follow the PRD phases. Internal RSVP tracking is core planning;
   polish public RSVP alongside invitations and the public wedding website.

None of these open feature decisions prevents the current health/configuration
foundation. Future tests should prioritize wedding isolation, role checks, safe
public projections, token expiry/revocation, and concurrent wedding creation.
