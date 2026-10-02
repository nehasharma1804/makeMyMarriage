# MakeMyMarriage development

This is the local MakeMyMarriage project, developed in Codex. An external editor
is optional. The product baseline is the four PDFs in `docs/`; read the relevant
documents and `docs/SETUP_DECISIONS.md` before implementing a feature.

## Commands on this Mac

Run from the repository root. Activate the existing project-local Node 24 runtime
with `source scripts/use-local-node.sh` before npm commands. The system Node
20.12.2 does not satisfy all installed tooling. Elsewhere, use the version pinned
in `.nvmrc`.

- `npm run setup`: create missing environment files without replacing existing ones.
- `npm run env:check`: validate configuration without displaying credentials.
- `npm run dev`: start web, API, and shared-contract watcher; Ctrl+C stops them.
- `npm run dev:web` / `npm run dev:api`: run just one service.
- `npm run verify`: formatting, lint, types, tests, and builds.

Check for existing servers before starting another. Preserve user-owned processes.
The default ports are web 3000 and API 4000. Readiness correctly returns 503 when
MongoDB is not configured; this is not successful database connectivity.

## Structure and scope

Use TypeScript, Next.js, Fastify, MongoDB's official driver, Zod, and npm workspaces.
Business logic belongs in `server/modules/`; database access in `server/database/`;
shared API types and validation in `packages/contracts/`. Obey any nested
`AGENTS.md` instructions, including Next.js documentation requirements in the web app.

The current stage is the basic project foundation. Build wedding features only
when requested. Follow the PRD delivery phases. Authentication, Google/AWS media
integration, and database collections/indexes are not implemented yet. Both Atlas
and local database options are prepared; account provisioning is deferred.

Preserve existing files and uncommitted changes. Keep credentials out of chat,
logs, and Git. Validate authorization on the server when private APIs are added.
Do not create paid resources. Commit or push only when the user asks.
