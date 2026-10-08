# Publish the landing page and wedding demo

## Agreed first release

The October 7 decision is a public, personal, non-commercial demo on a free
`vercel.app` URL. Publish the Next.js web app only. Do not deploy Fastify or supply
MongoDB/session credentials for this release. Local email/password accounts and
wedding creation remain available on the Mac.

The Vercel account and Hobby project `make-my-marriage-demo` are configured in
scope `neha-bac3`. The web app declares its own TypeScript build dependencies,
and the cloud install explicitly includes development dependencies from every
workspace and the root (including the test runner needed for type checking).

The source repository is `github.com/nehasharma1804/makeMyMarriage`.
CLI deployments upload the current working files. Git deployments use only
committed and pushed files; connecting GitHub is optional.

## Build verification (October 8, 2026)

The Vercel preview build succeeded using Next.js 16.3.8 and the complete npm
workspace installation. Local `npm run verify` passed formatting, lint, types,
all 73 tests, and shared/API/web builds. The production dependency audit reports
zero known vulnerabilities. Five advisory entries remain in the development-only
ESLint dependency chain; the suggested automatic fix downgrades the Next lint
configuration and has not been applied.

[Verified build](https://vercel.com/neha-bac3/make-my-marriage-demo/EbjefmHsxv9tRg4CE4xnpvDYpYpX).
The preview requires Vercel authentication. The production demo is published at
[make-my-marriage-demo.vercel.app](https://make-my-marriage-demo.vercel.app).
Production serves the landing page and sample wedding only; accounts remain disabled.

## Create your account

1. Open [Vercel signup](https://vercel.com/signup).
2. Create your own account and select the free personal/Hobby plan. Complete
   login, any verification, and the terms yourself; do not share passwords or
   tokens in chat.
3. Avoid paid trials, add-ons, and domain purchases. Use the assigned `vercel.app`
   address for now.

Hobby is for personal, non-commercial use and has usage limits. Revisit hosting
before turning the project into a commercial service. See
[Vercel’s Hobby plan](https://vercel.com/docs/plans/hobby).

## How this release works

`PUBLIC_DEMO_ONLY=true` makes `/` and `/demo` available, changes account buttons
to demo links, redirects `/login` and private account pages to `/demo`, and
returns a safe 404 from the API proxy without contacting Fastify.

Vercel also defaults to this mode when the setting is missing. Set it explicitly
for both Production and Preview in the dashboard. Do not set it to `false` in
Vercel for this release. After changing it, redeploy: some pages are built ahead
of time. Leave local `.env` files alone.

No database connection, session secret, AWS service, or email provider is needed.
The demo contains illustrative data only and does not save changes.

## Project settings

Create one project, for example `make-my-marriage-demo` (subject to availability).

| Setting                                     | Value                                                                            |
| ------------------------------------------- | -------------------------------------------------------------------------------- |
| Framework                                   | Next.js                                                                          |
| Root Directory                              | `apps/web`                                                                       |
| Node.js                                     | `24.x`                                                                           |
| Include source files outside Root Directory | Enabled, for `packages/contracts`                                                |
| Install Command                             | `npm ci --include=dev --workspaces --include-workspace-root`                     |
| Build Command                               | `npm run build --workspace @mmm/contracts && npm run build --workspace @mmm/web` |
| Output Directory                            | Next.js default; do not override                                                 |
| Production + Preview environment            | `PUBLIC_DEMO_ONLY=true`                                                          |

`apps/web/vercel.json` supplies the framework and build/install commands. The
shared package must build first because Next.js imports its compiled exports.
Do not use the repository’s full build command as the Vercel web build; the API
is not part of this deployment.

The root `.vercelignore` excludes local credentials, tools, Stitch exports,
design PDFs, and generated artifacts from CLI uploads. `.vercel` project links
are ignored by Git. Review the upload file list before the first deployment.

## CLI route (current working files)

Run commands from the repository root. The CLI is installed separately in the
ignored `.tools/vercel-cli` directory; it is not an application dependency.

```sh
cd /Users/cisco/Documents/Codex/makeMyMarriage
source scripts/use-local-node.sh
.tools/vercel-cli/node_modules/.bin/vercel --version
.tools/vercel-cli/node_modules/.bin/vercel login --global-config .tools/vercel-auth
.tools/vercel-cli/node_modules/.bin/vercel link --global-config .tools/vercel-auth
```

During linking, choose your personal account and the intended web project.
Confirm the Root Directory is `apps/web` and apply the settings above before
deploying. Keep CLI commands at the repository root so the shared workspace is
included. If a setting cannot be chosen in the CLI, configure it in the dashboard.

After linking and setting the non-secret demo flag, create a preview:

```sh
.tools/vercel-cli/node_modules/.bin/vercel deploy --target preview --global-config .tools/vercel-auth
```

Check the preview first. When the cloud build and smoke checks pass, publish:

```sh
.tools/vercel-cli/node_modules/.bin/vercel deploy --prod --global-config .tools/vercel-auth
```

These commands publish files; the login/link commands alone do not prove a
deployment succeeded. Report the actual final deployment URL and status.

For ongoing Git deployments, connect the GitHub repository to this existing
Vercel project with the same settings after pushing reviewed changes.
That can automate preview builds for later changes. It is optional for this launch.

## Verification

Before upload:

```sh
source scripts/use-local-node.sh
npm run verify
PUBLIC_DEMO_ONLY=true npm run build --workspace @mmm/web
```

Verify the hosted preview and the production URL:

1. Home page and `/demo` load, including local images and fonts.
2. Desktop and mobile navigation work. All account calls to action lead to the
   sample, and the site clearly says personal accounts are coming later.
3. `/login`, `/app/setup`, and `/app/dashboard` redirect to `/demo`.
4. `/api/v1/auth/config`, `/api/v1/auth/register`, and `/api/v1/weddings` are
   unavailable with a `DEMO_ONLY` response. No backend connection is attempted.
5. The public sample does not imply it saves guest details, RSVP responses, or
   uploads. No real user data appears.

If the build cannot find `@mmm/contracts`, check the root directory, inclusion of
external source files, and the shared-package build command. If it tries to reach
localhost, check the demo flag and redeploy. Never fix that by uploading `.env`.

## Next release ideas

Start by gathering feedback on navigation, sample events, guest lists, and the
mobile experience. Keep any feedback collection separate until a real contact
method and data handling are decided; this release has no fake waitlist form.

For public accounts, finish email verification, password recovery, and rate limits
that work across server instances. Set up a separate production database/user and
new session secret, and rotate the database password previously shared in chat.
Do not reuse development credentials in production or previews.

The future architecture can use two Vercel projects: `apps/web` for Next.js and
`server` for Fastify, with MongoDB Atlas as the database. Set the web project’s
`API_BASE_URL` to the API URL, and the API’s `WEB_ORIGIN` to the exact HTTPS web
origin. Preserve the browser’s same-origin cookie flow through the web proxy.
Check Fastify entrypoint detection and shared-package bundling before that release;
the current API has both an app factory and a separate startup file.

Atlas network access must be reviewed for the hosting provider. Do not broaden
the allowlist automatically. Preview deployments need separate data and explicit
origin/protection handling; do not point arbitrary previews at production data.
Private S3/CloudFront media can wait until the media features are built.

## Official references

- [Vercel monorepos](https://vercel.com/docs/monorepos)
- [Supported Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [CLI login](https://vercel.com/docs/cli/login)
- [CLI deployment](https://vercel.com/docs/cli/deploy)
- [Excluding deployment files](https://vercel.com/docs/deployments/vercel-ignore)
- [Fastify on Vercel](https://vercel.com/docs/frameworks/backend/fastify)
