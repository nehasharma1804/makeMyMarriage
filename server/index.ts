import { buildApp } from './app.js';
import { ConfigurationError, loadServerEnvironment } from './config/env.js';

try {
  const environment = loadServerEnvironment();
  const app = buildApp(environment);

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void app.close().catch(() => {
        process.exitCode = 1;
      });
    });
  }

  await app.listen({ host: environment.HOST, port: environment.PORT });
  if (!environment.MONGODB_URI) {
    app.log.warn(
      'MongoDB is not configured. Health is available; readiness returns 503.',
    );
  }
} catch (error) {
  console.error(
    error instanceof ConfigurationError
      ? error.message
      : 'API startup failed. Check your configuration and whether the port is in use.',
  );
  process.exitCode = 1;
}
