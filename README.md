# makeMyMarriage

MakeMyMarriage now includes the full Stitch-based landing page, a read-only
Ashu and Priya sample wedding, email/password registration and sign-in, and wedding creation.
The Next.js web app uses a separate Fastify API and MongoDB. Real sign-in and
persistence still require your MongoDB configuration;
see `docs/AUTH_SETUP.md`. Media and the remaining planning tools are future work.
The original design PDFs and Stitch exports remain unchanged. Development can
happen entirely in Codex; VS Code is optional.

## Start on this Mac

For the public landing/demo release, follow [the Vercel deployment guide](docs/VERCEL_DEPLOYMENT.md).
Vercel defaults to demo-only mode; account pages and the API proxy are disabled
there until the full account launch is prepared. Local development is unchanged.

```sh
cd /Users/cisco/Documents/Codex/makeMyMarriage
source scripts/use-local-node.sh
node --version
npm --version
npm run setup
npm run setup:auth
npm run dev
```

Open http://localhost:3000. The API runs at http://127.0.0.1:4000. Stop with Ctrl+C;
the runner stops the web app, API, and shared-package watcher together, allowing
up to five seconds for cleanup. Run the `source` command in each new
terminal: Node 24.21.0 and npm 11.19.0 are installed in `.tools/` for this project;
your system Node 20.12.2 is unchanged. The landing page and sample demo need no credentials.

Dependencies are already installed. After cloning elsewhere, install Node 24.21.0
(with a version manager such as nvm, using `.nvmrc`) and run `npm ci`, then
`npm run setup`. The ignored `.tools/` directory is specific to this Mac and is
not included in Git. `npm run setup` copies example environment files without
overwriting existing ones. Active API settings have defaults, so older `.env`
files continue working. Run `npm run setup:auth` to generate a local session
secret without displaying it; an existing secret is preserved. Configure
MongoDB when ready; AWS remains deferred.

The two database options are prepared, but neither is installed/provisioned:
see `infrastructure/README.md` for local Docker MongoDB and MongoDB Atlas.
Leave `MONGODB_URI` empty while deciding. The API health endpoint works without
MongoDB; its readiness endpoint correctly returns HTTP 503 until a real database
connection succeeds. No Atlas or AWS accounts are required to run
the landing page and demo.

If port 3000 is occupied by an existing web server, stop that server in its own
terminal before running both services, or use `npm run dev:api` to start only
the API. The web app's server-only `API_BASE_URL` points its same-origin proxy
at Fastify, keeping authentication cookies on the web origin.

## Pages and current scope

- `/`: complete responsive landing-page layout from Stitch, with PRD-aligned copy.
- `/demo`: read-only sample workspace with planning tabs and guest website preview.
- `/login`: email/password sign-in and registration when configured; a clear availability
  message otherwise.
- `/app/setup`: authenticated wedding creation form.
- `/app/dashboard`: private summary of your saved wedding, role, and five events.

One account can belong to one active wedding. Creation saves the wedding, initial
Admin membership, and five unscheduled default events in a MongoDB transaction.
Atlas or a local replica set is required. Member invitations, event editing,
guest planning, tasks, expenses, public publishing, uploads, and sharing remain
later features. The landing/demo visuals use illustrative data.

## Chosen tools

- **Next.js 16 + React 19:** web application framework and UI library.
- **TypeScript 5.9:** catches type mistakes while you code; strict checks are enabled.
- **npm workspaces:** one dependency installation and lockfile for all packages.
- **Fastify 5:** separate modular monolith API, with health/readiness diagnostics.
- **MongoDB driver 7:** one reusable pool for local or Atlas connections, without
  an extra ORM layer.
- **Zod 4:** API/web environment validation and shared response contracts.
- **ESLint + Prettier:** catch common code problems and keep formatting consistent.
- **Vitest + tsx:** credential-free API/configuration tests and TypeScript execution.
  Fastify request injection tests the API without a live database or network socket.
- **Node process tools:** start all development services with no extra runner dependency.

TypeScript 5.9 stays within the lint tooling's supported version range. Node 24 LTS
supports the selected tooling; the previous Node 20.12.2 is too old for the current
MongoDB driver and Vitest. No global npm tools, database services, Docker, or cloud
resources were installed.

Tooling limitation: ESLint 9 is pinned because the React plugin in the Next.js lint
configuration does not yet accept ESLint 10. npm marks ESLint 9 as out of support;
upgrade when that plugin supports ESLint 10. The current lint checks pass.

Run `npm run verify` for formatting, linting, type checks, API/configuration tests,
and production builds. No test assumes a working Atlas account or AWS service.

## Workspace

```text
apps/web/src/       Next.js application source
apps/web/public/    Static assets served directly
server/             API app, diagnostics, environment parsing, and MongoDB pool
packages/contracts/ Shared API types, response schemas, and web environment schema
scripts/            Local Node activation, environment setup/checks, dev process runner
infrastructure/     Optional local MongoDB compose recipe and Atlas instructions
docs/               Original project design PDFs
.vscode/            Recommended ESLint/Prettier extensions and project TypeScript
```

In Codex, select this repository as your local project. Use the integrated terminal
for the commands above, or ask Codex to run them. Existing `.vscode/` recommendations
remain available if you choose to use that editor later; no setup command requires it.

## Commands

```sh
npm run setup         # Create missing .env files, preserving existing files
npm run setup:auth    # Generate/preserve the local session secret privately
npm run env:check     # Validate web/API settings without displaying credentials
npm run dev           # Start web, API, and shared-contract watcher
npm run dev:web       # Start only web
npm run dev:api       # Start only API
npm test              # Run API/configuration tests without cloud accounts
npm run format        # Format project files
npm run verify        # Formatting, lint, type checks, tests, production builds
npm run build         # Build shared package, API, and web app
npm start             # Serve the built web app
npm run start:api     # Serve the compiled API
curl http://127.0.0.1:4000/api/v1/health
curl -i http://127.0.0.1:4000/api/v1/ready
```

`server/.env.example` documents active API settings plus future integration
placeholders. Do not paste credentials into chat or commit `.env` files. Set a
local `mongodb://` or Atlas `mongodb+srv://` URI in `server/.env` when ready, then
restart the API. Readiness pings the database without creating wedding data.
Production API startup requires a MongoDB URI, session
secret, and HTTPS web origin; it still reports unavailable if the configured
database cannot be reached.

Atlas needs a database user, connection string, and IP allowlist. Local MongoDB
is also supported. No Google account or OAuth credentials are needed.
See `docs/AUTH_SETUP.md` for the exact account and local configuration steps.
AWS S3/CloudFront can wait until media work; SQS and SES remain deferred. No
accounts or paid resources were created. Local Docker MongoDB has no
authentication and is bound to this laptop only; it is a development recipe.

## Later implementation order

Follow the PRD phases when feature work is authorized:

1. Core planning: email/password login, wedding creation and membership, events, guests and
   event assignments, RSVP tracking, tasks, expenses, shopping, and dashboard.
2. Vendors and sharing: vendors, invitations, public wedding website and public RSVP.
3. Media: private S3/CloudFront delivery, albums, member/QR uploads, gallery share
   links, and external livestream links.
4. Public product experience: expand the sample demo and onboarding polish, and
   add website customization. The landing page was built early at the user's request.

Before implementation, resolve the documents' differing member permissions,
invitation versus RSVP status, enforcement of one active wedding per user,
session handling, date/money semantics, and invitation delivery before SES.
See `docs/SETUP_DECISIONS.md` for recommendations. These decisions do not block
this setup.

## Web source structure

```text
apps/web/
  src/
    app/          Routes, root layout, pages, and global CSS
    components/   Reusable UI components
    features/     Feature-specific UI and logic, added as features are built
    hooks/        Reusable React hooks
    lib/          Shared frontend utilities
    types/        Frontend-only TypeScript types
  public/         Static images, icons, and other public assets
```

Use `@/` to import from `apps/web/src/`, for example `@/components/button` once
that component exists. Types and validation shared with the future backend belong
in `packages/contracts/`. Configuration and `.env` files stay in `apps/web/`.
Empty folders contain `.gitkeep` files so Git can retain the structure.
