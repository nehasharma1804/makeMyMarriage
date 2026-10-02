# makeMyMarriage

Development foundation: Next.js web app, separate Fastify API, shared contracts,
environment validation, and MongoDB connection support. Authentication, media
uploads, and wedding features are not implemented yet. The design PDFs remain
unchanged. Development can happen entirely in Codex; VS Code is optional.

## Start on this Mac

```sh
cd /Users/cisco/Documents/Codex/makeMyMarriage
source scripts/use-local-node.sh
node --version
npm --version
npm run setup
npm run dev
```

Open http://127.0.0.1:3000. The API runs at http://127.0.0.1:4000. Stop with Ctrl+C;
the runner stops the web app, API, and shared-package watcher together, allowing
up to five seconds for cleanup. Run the `source` command in each new
terminal: Node 24.21.0 and npm 11.19.0 are installed in `.tools/` for this project;
your system Node 20.12.2 is unchanged. The starter page needs no credentials.

Dependencies are already installed. After cloning elsewhere, install Node 24.21.0
(with a version manager such as nvm, using `.nvmrc`) and run `npm ci`, then
`npm run setup`. The ignored `.tools/` directory is specific to this Mac and is
not included in Git. `npm run setup` copies example environment files without
overwriting existing ones. Active API settings have defaults, so older `.env`
files continue working. Google and AWS placeholders are inactive until their
integrations are built.

The two database options are prepared, but neither is installed/provisioned:
see `infrastructure/README.md` for local Docker MongoDB and MongoDB Atlas.
Leave `MONGODB_URI` empty while deciding. The API health endpoint works without
MongoDB; its readiness endpoint correctly returns HTTP 503 until a real database
connection succeeds. No Atlas, Google Cloud, or AWS accounts are required to run
the basic starter.

If port 3000 is occupied by an existing web server, stop that server in its own
terminal before running both services, or use `npm run dev:api` to start only
the API. The web app's `API_BASE_URL` is validated but does not yet power any
wedding feature or authentication flow.

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
Production API startup requires a MongoDB URI; it still reports unavailable if
the configured database cannot be reached.

Atlas needs a database user, connection string, and IP allowlist. Google sign-in
will need Google Cloud OAuth configuration when that feature is implemented.
AWS S3/CloudFront can wait until media work; SQS and SES remain deferred. No
accounts or paid resources were created. Local Docker MongoDB has no
authentication and is bound to this laptop only; it is a development recipe.

## Later implementation order

Follow the PRD phases when feature work is authorized:

1. Core planning: Google login, wedding creation and membership, events, guests and
   event assignments, RSVP tracking, tasks, expenses, shopping, and dashboard.
2. Vendors and sharing: vendors, invitations, public wedding website and public RSVP.
3. Media: private S3/CloudFront delivery, albums, member/QR uploads, gallery share
   links, and external livestream links.
4. Public product experience: landing page, read-only Ashu and Priya demo,
   onboarding polish and website customization.

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
