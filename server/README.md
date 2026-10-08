# API foundation

The separate Fastify service starts without cloud credentials in development.
It provides two diagnostics in the API design's `/api/v1` namespace:

- `GET /api/v1/health`: process liveness, HTTP 200.
- `GET /api/v1/ready`: a real MongoDB ping; HTTP 200 when reachable, otherwise
  HTTP 503 with `DATABASE_NOT_CONFIGURED` or `DATABASE_UNAVAILABLE`.

From the repository root, activate the project-local Node runtime and run
`npm run dev:api`. The default address is `http://127.0.0.1:4000`.
After `npm run build`, use `npm run start:api` for the compiled API.

`config/env.ts` validates active API settings, `database/mongodb.ts` owns the
connection pool, and `app.ts` constructs the testable Fastify app. `index.ts`
starts the process and closes resources on SIGINT/SIGTERM. Unknown routes use the
documented error envelope. Configuration errors report field names without values.

The readiness check does not create wedding data, collections, or indexes.
Business modules belong in `modules/`; authorization belongs on every private
operation. Email/password sign-in, persistent sessions, and wedding creation are now
implemented. Uploads and other planning APIs remain future work.

Current feature routes:

- `GET /api/v1/auth/config`: public availability and a one-time login challenge
  when configured. May initialize auth/wedding indexes.
- `POST /api/v1/auth/register`: validate name/email/password and CSRF challenge,
  store a salted scrypt hash, and create a persistent session.
- `POST /api/v1/auth/login`: verify the password and CSRF challenge; create a session.
- `GET /api/v1/auth/me` (also `/api/v1/me`): authenticated user/wedding context.
- `POST /api/v1/auth/logout`: revoke the session and clear its cookie.
- `POST /api/v1/weddings`: atomically create one wedding, Admin membership, and
  five default unscheduled events.
- `GET /api/v1/weddings/mine`: return the current active member's wedding and events.

The browser calls the API through the Next.js same-origin proxy. Writes require
the allowed web origin and an `X-CSRF-Token` from login/session context. Sessions
and login challenges store only token hashes and enforce expiry independently
of MongoDB's TTL cleanup. Wedding creation requires transactions on Atlas or a
local replica set. See `../docs/AUTH_SETUP.md` for account configuration.

Rate limits use server-verified identities rather than trusting forwarded IP
headers. Email/password sign-in allows 10 attempts per minute per signed, unexpired
challenge, plus shared login/register limits of 10 attempts per normalized email
per 15 minutes and 60 per actual API peer per minute. Password derivation is
bounded to two concurrent jobs per process. Wedding creation allows 10 attempts per minute per live session's user;
logout allows 20. Forged, missing, or expired credentials share a limit keyed by
the API's actual transport peer address. Behind the Next.js proxy, that anonymous
fallback is shared across browsers.

The config endpoint issues a signed HttpOnly visitor cookie with a checked
24-hour expiry. It allows 30 requests per minute per valid visitor, 120 per minute
for the shared new/invalid visitor bootstrap bucket, and 1,200 per minute across
the whole config service. Visitor cookies identify browser sessions, not people
or network clients. Clearing cookies returns to the shared bootstrap bucket;
these limits do not provide real per-client-IP protection. Counters live in this
API process and reset on restart. Production edge controls and shared counters
are needed if the API is deployed across multiple instances.

`.env.example` documents both active API settings and inactive future integration
placeholders. `npm run setup` preserves existing `.env` files; newly added active
settings have defaults. MongoDB is required for production startup. See
`infrastructure/README.md` for the two prepared database options.
