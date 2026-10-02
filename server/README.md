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
Future business modules belong in `modules/`; authorization belongs on every
private operation. Authentication, wedding CRUD, uploads, rate limits on future
token routes, and cloud integrations are not implemented yet.

`.env.example` documents both active API settings and inactive future integration
placeholders. `npm run setup` preserves existing `.env` files; newly added active
settings have defaults. MongoDB is required for production startup. See
`infrastructure/README.md` for the two prepared database options.
