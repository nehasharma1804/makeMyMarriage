import { MongoClient, type Db } from 'mongodb';
import type { ServerEnvironment } from '../config/env.js';

export interface DatabaseConnection {
  readonly configured: boolean;
  ping(): Promise<boolean>;
  close(): Promise<void>;
}

interface MongoDatabaseConnection extends DatabaseConnection {
  getDatabase(): Db;
}

export function createMongoDatabase(environment: ServerEnvironment) {
  const client = environment.MONGODB_URI
    ? new MongoClient(environment.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: environment.MONGODB_TIMEOUT_MS,
        connectTimeoutMS: environment.MONGODB_TIMEOUT_MS,
        timeoutMS: environment.MONGODB_TIMEOUT_MS,
      })
    : undefined;

  return {
    configured: Boolean(client),
    getDatabase(): Db {
      if (!client) throw new Error('MongoDB is not configured');
      return client.db(environment.MONGODB_DB_NAME);
    },
    async ping(): Promise<boolean> {
      if (!client) return false;
      try {
        // The driver connects lazily and reuses one connection pool per process.
        await client.db(environment.MONGODB_DB_NAME).command({ ping: 1 });
        return true;
      } catch {
        return false;
      }
    },
    async close(): Promise<void> {
      await client?.close();
    },
  } satisfies MongoDatabaseConnection;
}
