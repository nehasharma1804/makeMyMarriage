# Foundation decisions and remaining questions

The four September 2026 PRD, system, database, and API design PDFs remain the
product baseline. This document records implementation choices without changing
those PDFs. Later user-approved decisions below supersede the original authentication design.

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
- Email/password identity with MongoDB replaces Google identity at the user's request. Private S3/CloudFront delivery and SQS/SES remain future work.
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
2. **Identity and sessions (resolved):** email/password accounts in MongoDB with
   secure HttpOnly cookie sessions. The same-origin Next.js proxy forwards to
   Fastify. The October 6 decision below supersedes the Google flow in the PDFs.
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

## Landing page and onboarding decisions (October 2026)

The user approved preserving the complete Stitch landing-page layout with
PRD-aligned copy and wedding creation. The initial Google integration was replaced
with email/password authentication on October 6.
Original Stitch exports remain unchanged under `.stitch/`; sample previews are
explicitly illustrative and carry no real guest or financial data.

- Random, opaque sessions use HttpOnly cookies. Only token hashes are stored in
  MongoDB. Origin checks and CSRF tokens protect writes; expiry and logout are
  enforced server-side. Next.js forwards requests through a small same-origin API
  proxy; business logic remains in Fastify.
- A unique partial index permits one active membership per user. Wedding,
  initial Admin membership, and five default events are created together in a
  transaction. Atlas or a local replica set is required for transactions.
- Individual event dates start unscheduled (`null`). The chosen wedding date is
  kept as a calendar date, with `Asia/Kolkata` as the wedding timezone.
- The private summary displays saved wedding and event data; remaining planning
  tools, member invitations, media, and guest sharing are future work.

Other open feature decisions above remain deferred until those features are
requested. See `docs/AUTH_SETUP.md` for account setup and live verification.

## Email/password decision (October 6, 2026)

The user explicitly chose email/password registration and login stored in MongoDB,
replacing Google OAuth. MongoDB is the data store; Fastify verifies passwords.

- Shared Zod contracts normalize emails with trim/lowercase and reject unknown
  fields. Registration requires a name and a password of 15–128 characters.
  Passwords are not trimmed or silently truncated.
- Node's asynchronous scrypt uses N=131072, r=8, p=1, a random 16-byte salt, and a
  64-byte derived key. Only the encoded hash is persisted. No new crypto dependency.
- A unique normalized email index prevents duplicate accounts. Registration never
  attaches a password to an existing account, including a legacy Google account.
- New accounts have `emailVerified: false`. Do not use that email as proof of
  ownership for future member invitations. Verification and password recovery are
  not implemented in this change; complete those flows before a public launch.
- HttpOnly sessions, CSRF checks, one-time challenges, and wedding access rules
  remain. Login gives a generic response for unknown emails, bad passwords,
  disabled users, and legacy accounts without a password hash.
- Credential routes share normalized-email and actual-peer limits, in addition
  to challenge limits. Config refresh cannot reset the email bucket. Memory for
  password hashing is capped by allowing two jobs per process.
- Google UI, endpoint, environment requirement, and dependency are removed.
  Existing `.env` values are preserved but any old Google client ID is ignored.
- No live database has been configured or migrated. See `AUTH_SETUP.md` for
  database setup and legacy-index considerations.
