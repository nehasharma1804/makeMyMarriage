import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { webEnvironmentSchema } from '@mmm/contracts';
import {
  loadServerEnvironment,
  ConfigurationError,
} from '../server/config/env.ts';

async function readEnvironment(path) {
  try {
    return parseEnv(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

try {
  const server = loadServerEnvironment({
    ...(await readEnvironment('server/.env')),
    ...process.env,
  });
  const web = webEnvironmentSchema.safeParse({
    ...(await readEnvironment('apps/web/.env')),
    ...process.env,
  });
  if (!web.success)
    throw new ConfigurationError('Invalid environment settings: API_BASE_URL');
  console.log('Web and API environment settings are valid.');
  console.log(
    server.MONGODB_URI
      ? 'MongoDB is configured; readiness will check the connection.'
      : 'MongoDB is not configured; the API can start but readiness will return 503.',
  );
  console.log(
    'Google sign-in and AWS media features have not been implemented yet.',
  );
} catch (error) {
  console.error(
    error instanceof ConfigurationError
      ? error.message
      : 'Could not read environment files. Check file paths and permissions.',
  );
  process.exitCode = 1;
}
