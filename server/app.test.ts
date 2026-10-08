import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  apiErrorSchema,
  healthResponseSchema,
  readinessResponseSchema,
} from '@mmm/contracts';
import { buildApp } from './app.js';
import { loadServerEnvironment } from './config/env.js';
import type { DatabaseConnection } from './database/mongodb.js';

const apps: ReturnType<typeof buildApp>[] = [];
afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

function createApp(database?: DatabaseConnection) {
  const app = buildApp(loadServerEnvironment({ NODE_ENV: 'test' }), {
    logger: false,
    ...(database ? { database } : {}),
  });
  apps.push(app);
  return app;
}

describe('API foundation', () => {
  it('reports process health even before MongoDB is configured', async () => {
    const response = await createApp().inject('/api/v1/health');
    expect(response.statusCode).toBe(200);
    expect(healthResponseSchema.safeParse(response.json()).success).toBe(true);
  });

  it('reports missing database configuration as unavailable, not a working database', async () => {
    const database = { configured: false, ping: vi.fn(), close: vi.fn() };
    const response = await createApp(database).inject('/api/v1/ready');
    expect(response.statusCode).toBe(503);
    expect(response.json().error.code).toBe('DATABASE_NOT_CONFIGURED');
    expect(readinessResponseSchema.safeParse(response.json()).success).toBe(
      true,
    );
    expect(database.ping).not.toHaveBeenCalled();
  });

  it('only reports readiness after the database check succeeds', async () => {
    const database = {
      configured: true,
      ping: vi.fn().mockResolvedValue(true),
      close: vi.fn(),
    };
    const response = await createApp(database).inject('/api/v1/ready');
    expect(response.statusCode).toBe(200);
    expect(response.json().data.database).toBe('connected');
    expect(readinessResponseSchema.safeParse(response.json()).success).toBe(
      true,
    );
    expect(database.ping).toHaveBeenCalledOnce();
  });

  it('reports a failed database connection as unavailable', async () => {
    const response = await createApp({
      configured: true,
      ping: vi.fn().mockResolvedValue(false),
      close: vi.fn(),
    }).inject('/api/v1/ready');
    expect(response.statusCode).toBe(503);
    expect(response.json().error.code).toBe('DATABASE_UNAVAILABLE');
  });

  it('does not expose database credentials from a driver exception', async () => {
    const response = await createApp({
      configured: true,
      ping: vi.fn().mockRejectedValue(new Error('mongodb://user:secret@host')),
      close: vi.fn(),
    }).inject('/api/v1/ready');
    expect(response.statusCode).toBe(503);
    expect(response.body).not.toContain('secret');
    expect(apiErrorSchema.safeParse(response.json()).success).toBe(true);
  });

  it('uses the documented error envelope for unimplemented routes', async () => {
    const response = await createApp().inject('/api/v1/not-implemented');
    expect(response.statusCode).toBe(404);
    expect(apiErrorSchema.safeParse(response.json()).success).toBe(true);
  });

  it('closes database resources during shutdown', async () => {
    const database = { configured: true, ping: vi.fn(), close: vi.fn() };
    const app = createApp(database);
    await app.ready();
    await app.close();
    expect(database.close).toHaveBeenCalledOnce();
  });
});
