# Email/password accounts and wedding setup

Authentication now uses email and password, with user accounts and sessions in
MongoDB. Google OAuth is removed; no Google account, client ID, or client secret
is needed. The original PDFs retain their historical Google design; this change
follows the user's October 6 decision.

## Prepare local settings

```sh
source scripts/use-local-node.sh
npm run setup
npm run setup:auth
```

The auth setup command generates a random session secret in the ignored
`server/.env` and preserves an existing secret. It does not print the value.
Keep credentials out of Git and chat.

Set these values in `server/.env`:

```dotenv
WEB_ORIGIN=http://localhost:3000
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB_NAME=make_my_marriage_dev
```

Use either database option in [the database guide](../infrastructure/README.md):

- **Atlas:** configure a database user, connection string, and IP allowlist.
- **Local:** use the documented Docker MongoDB replica-set recipe.

Wedding creation requires transactions, so use Atlas or a local replica set.
No database or cloud account is provisioned by the authentication code.
The landing page and demo still work without MongoDB. The login page shows an
availability notice until MongoDB and the session secret are configured.
Old Google environment variables, if present, are ignored.

## Run and verify

```sh
npm run env:check
npm run dev
```

Restart existing services after the authentication change. Open
http://localhost:3000/login and choose **Create account**. Enter your name, email,
and a unique password of 15–128 characters, then confirm the password.
Registration signs you in and takes you to wedding setup. Existing accounts use
**Sign in** on the same page.

Check the complete live flow after connecting MongoDB:

1. Register, create a wedding, and see its five unscheduled default events.
2. Refresh the dashboard and confirm saved data persists.
3. Sign out, then sign in with the same email and password.
4. Confirm an incorrect password is rejected and a signed-out session cannot
   read the private dashboard.

```sh
npm run verify
curl http://127.0.0.1:4000/api/v1/health
curl -i http://127.0.0.1:4000/api/v1/ready
curl http://localhost:3000/api/v1/auth/config
```

Tests exercise real password hashing with database test doubles. They do not prove
live MongoDB persistence. Readiness returns 503 until MongoDB is reachable; auth
configuration also checks that the necessary database indexes can be initialized.

## API and storage

- `GET /api/v1/auth/config`: availability and a one-time challenge/CSRF token.
- `POST /api/v1/auth/register`: `{ name, email, password, nonce }`.
- `POST /api/v1/auth/login`: `{ email, password, nonce }`.
- `GET /api/v1/auth/me`: signed-in user and wedding context.
- `POST /api/v1/auth/logout`: revoke the session.

Registration/login require the matching signed challenge cookie, allowed Origin,
and `X-CSRF-Token`. The browser obtains a fresh challenge for each submission.
After sign-in, writes use the session's CSRF token. The Next.js proxy forwards
only the supported API routes. `/auth/google` is no longer available.

Passwords are stored as salted scrypt hashes (N=131072, r=8, p=1); plaintext
passwords are never stored or returned. These parameters follow the
[OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
The API uses asynchronous Node crypto and caps concurrent password derivations.
Emails are trimmed and lowercased, protected by a unique index. Session tokens
are random and stored only as hashes; cookies are HttpOnly, SameSite=Lax, and
Secure with a host-only prefix in production. Sessions expire and are revoked
on logout; login replaces an existing browser session.

Login errors do not distinguish wrong passwords, unknown emails, disabled users,
or legacy accounts without password hashes. Login/register share limits of
10 attempts per email per 15 minutes and 60 per transport peer per minute,
plus the existing challenge limiter. These counters are process-local. The
Next.js proxy means the peer limit is shared across browsers; a scaled deployment
will need trusted edge limits and shared counters.

## Remaining work and existing data

Email verification and password-reset/recovery are not implemented. New accounts
have `emailVerified: false`; a typed email is not proof of ownership and must not
be used for automatic invitation acceptance. Complete verification/recovery before
public launch. There is no hidden password-reset or Google fallback.

If you previously used the Google implementation against a real database, review
its `users` indexes before switching. The old non-sparse `unique_google_subject`
index would allow only one password account without a Google subject. A database
administrator should replace that index with a unique partial index covering only
string-valued `googleSubjectId` fields, preserving the email index and all data.
Do this as an explicit migration, with a backup, rather than deleting user records.
No live database migration is performed automatically by this change.

Existing Google-only users cannot sign in with a password and cannot be overwritten
through registration with the same email. They require a separate, verified account
recovery/migration flow. Existing session tokens retain their normal expiry unless
revoked. This project's database has not yet been configured, so fresh development
databases need no legacy migration.
