import Fastify, { LogController } from 'fastify';
import type { ApiError, HealthResponse } from '@mmm/contracts';
import type { ServerEnvironment } from './config/env.js';
import {
  createMongoDatabase,
  type DatabaseConnection,
} from './database/mongodb.js';

export function buildApp(
  environment: ServerEnvironment,
  options: { database?: DatabaseConnection; logger?: boolean } = {},
) {
  const database = options.database ?? createMongoDatabase(environment);
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
