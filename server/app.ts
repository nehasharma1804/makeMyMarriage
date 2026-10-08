import Fastify, { LogController } from 'fastify';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import type { ApiError, HealthResponse } from '@mmm/contracts';
import type { ServerEnvironment } from './config/env.js';
import {
  createMongoDatabase,
  type DatabaseConnection,
} from './database/mongodb.js';
import { createAppStore, type AppStore } from './database/app-store.js';
import { AuthService } from './modules/auth/service.js';
import { registerAuthRoutes } from './modules/auth/routes.js';
import { registerWeddingRoutes } from './modules/weddings/routes.js';
import { ApiProblem } from './shared/api-problem.js';

export function buildApp(
  environment: ServerEnvironment,
  options: {
    database?: DatabaseConnection;
    logger?: boolean;
    store?: AppStore;
    now?: () => Date;
  } = {},
) {
  const database = options.database ?? createMongoDatabase(environment);
  const store = options.store ?? createAppStore(database);
  const now = options.now ?? (() => new Date());
  const auth = new AuthService(environment, store, now);
  const app = Fastify({
    logger:
      options.logger === false
        ? false
        : {
            level: environment.LOG_LEVEL,
            redact: ['req.headers.authorization', 'req.headers.cookie'],
          },
    // Public token URLs must not end up in automatic request logs.
    logController: new LogController({ disableRequestLogging: true }),
    bodyLimit: 1024 * 1024,
  });

  app.addHook('onClose', async () => database.close());
  app.register(
    cookie,
    environment.SESSION_SECRET ? { secret: environment.SESSION_SECRET } : {},
  );
  app.register(rateLimit, {
    global: false,
    errorResponseBuilder: () =>
      new ApiProblem(
        'RATE_LIMITED',
        429,
        'Too many requests. Please try again shortly.',
      ),
  });
  app.addHook('onSend', async (_request, reply) => {
    reply.header('Cache-Control', 'no-store');
    reply.header('X-Content-Type-Options', 'nosniff');
  });
  // Register routes after the plugins load so route-level rate limits take effect.
  app.register(async (featureApp) => {
    registerAuthRoutes(featureApp, auth);
    registerWeddingRoutes(featureApp, store, auth, now);
  });

  app.get('/api/v1/health', async () => {
    return {
      success: true,
      data: { service: 'make-my-marriage-api', status: 'ok' },
    } satisfies HealthResponse;
  });

  app.get('/api/v1/ready', async (_request, reply) => {
    if (!database.configured) {
      return reply.code(503).send({
        success: false,
        error: {
          code: 'DATABASE_NOT_CONFIGURED',
          message: 'Configure MongoDB before using database-backed features.',
        },
      } satisfies ApiError);
    }

    let connected = false;
    try {
      connected = await database.ping();
    } catch {
      // Never return driver exceptions or connection strings to callers.
    }
    if (!connected) {
      return reply.code(503).send({
        success: false,
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'The API could not reach MongoDB.',
        },
      } satisfies ApiError);
    }

    return {
      success: true,
      data: { service: 'make-my-marriage-api', database: 'connected' },
    };
  });

  app.setNotFoundHandler((_request, reply) => {
    return reply.code(404).send({
      success: false,
      error: { code: 'NOT_FOUND', message: 'API endpoint not found.' },
    } satisfies ApiError);
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ApiProblem) {
      return reply.code(error.statusCode).send({
        success: false,
        error: { code: error.code, message: error.message },
      } satisfies ApiError);
    }
    const responseStatus =
      error instanceof Error && 'statusCode' in error
        ? error.statusCode
        : undefined;
    const statusCode =
      typeof responseStatus === 'number' &&
      responseStatus >= 400 &&
      responseStatus < 500
        ? responseStatus
        : 500;
    return reply.code(statusCode).send({
      success: false,
      error: {
        code: statusCode < 500 ? 'INVALID_REQUEST' : 'INTERNAL_ERROR',
        message:
          statusCode < 500
            ? 'The request is invalid.'
            : 'An unexpected error occurred.',
      },
    } satisfies ApiError);
  });

  return app;
}
