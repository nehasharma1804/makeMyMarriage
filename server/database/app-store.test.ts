import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
import {
  MongoClient,
  MongoServerError,
  ObjectId,
  type Document,
} from 'mongodb';
import { createAppStore } from './app-store.js';
import type { MongoDatabaseConnection } from './mongodb.js';

const now = new Date('2026-10-02T12:00:00Z');
const userId = new ObjectId();
const user = {
  _id: userId,
  passwordHash: 'stored-password-hash',
  emailVerified: false,
  name: 'Planner',
  email: 'planner@gmail.com',
  profilePhotoUrl: null,
  status: 'ACTIVE',
  lastLoginAt: now,
  createdAt: now,
  updatedAt: now,
};
const input = {
  brideName: 'Priya',
  groomName: 'Ashu',
  weddingDate: '2026-12-12',
  city: 'Jaipur',
};

function databaseHarness() {
  const committed = {
    weddings: [] as unknown[],
    wedding_members: [] as unknown[],
    events: [] as unknown[],
  };
  let pending: typeof committed | null = null;
  let failEventAt = -1;
  let memberError: Error | null = null;
  const endSession = vi.fn().mockResolvedValue(undefined);
  const session = {
    withTransaction: vi.fn(async (callback: () => Promise<unknown>) => {
      pending = {
        weddings: [...committed.weddings],
        wedding_members: [...committed.wedding_members],
        events: [...committed.events],
      };
      try {
        const result = await callback();
        Object.assign(committed, pending);
        return result;
      } finally {
        pending = null;
      }
    }),
    endSession,
  };
  const users = {
    createIndexes: vi.fn().mockResolvedValue([]),
    findOne: vi.fn().mockResolvedValue(user),
    insertOne: vi.fn().mockResolvedValue({ insertedId: userId }),
  };
  const weddings = {
    createIndex: vi.fn().mockResolvedValue('unique_wedding_slug'),
    insertOne: vi.fn(async (record: unknown, options: { session: unknown }) => {
      expect(options.session).toBe(session);
      pending!.weddings.push(record);
    }),
  };
  const members = {
    createIndexes: vi.fn().mockResolvedValue([]),
    findOne: vi.fn().mockResolvedValue(null),
    insertOne: vi.fn(async (record: unknown, options: { session: unknown }) => {
      expect(options.session).toBe(session);
      if (memberError) throw memberError;
      pending!.wedding_members.push(record);
    }),
  };
  const events = {
    createIndex: vi.fn().mockResolvedValue('wedding_events'),
    insertOne: vi.fn(async (record: unknown, options: { session: unknown }) => {
      expect(options.session).toBe(session);
      if (pending!.events.length === failEventAt)
        throw new Error('Injected event write failure');
      pending!.events.push(record);
    }),
    insertMany: vi.fn(
      async (records: unknown[], options: { session: unknown }) => {
        expect(options.session).toBe(session);
        if (failEventAt >= 0) throw new Error('Injected event write failure');
        pending!.events.push(...records);
      },
    ),
  };
  const generic = { createIndexes: vi.fn().mockResolvedValue([]) };
  const collections: Record<string, unknown> = {
    users,
    weddings,
    wedding_members: members,
    events,
  };
  const database = {
    configured: true,
    ping: async () => true,
    close: async () => {},
    getDatabase: () => ({
      collection: (name: string) => collections[name] ?? generic,
    }),
    getClient: () => ({ startSession: () => session }),
  } as unknown as MongoDatabaseConnection;
  return {
    store: createAppStore(database),
    committed,
    users,
    weddings,
    members,
    events,
    session,
    failEventWrite(after = 0) {
      failEventAt = after;
    },
    duplicateMembership() {
      memberError = new MongoServerError({
        code: 11000,
        message: 'Duplicate key',
        keyPattern: { userId: 1 },
      });
    },
  };
}

describe('MongoDB persistence boundaries', () => {
  it('creates a unique partial active-membership index, not only a wedding/user relationship', async () => {
    const context = databaseHarness();
    expect(await context.store.ready()).toBe(true);
    expect(context.members.createIndexes).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          key: { userId: 1 },
          unique: true,
          partialFilterExpression: { status: 'ACTIVE' },
        }),
      ]),
    );
    expect(context.users.createIndexes).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ key: { email: 1 }, unique: true }),
      ]),
    );
  });
  it('passes the same transaction session to every wedding write and commits the complete bundle', async () => {
    const context = databaseHarness();
    const result = await context.store.createWedding(
      userId.toHexString(),
      input,
      now,
    );
    expect(result.events.map((event) => event.name)).toEqual([
      'Haldi',
      'Mehndi',
      'Sangeet',
      'Wedding',
      'Reception',
    ]);
    expect(
      result.events.every(
        (event) => event.date === null && event.weddingId === result.wedding.id,
      ),
    ).toBe(true);
    expect(context.session.withTransaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
      }),
    );
    expect(context.committed.weddings).toHaveLength(1);
    expect(context.committed.wedding_members).toHaveLength(1);
    expect(context.committed.events).toHaveLength(5);
    expect(context.session.endSession).toHaveBeenCalledOnce();
  });
  it('propagates an event failure so the transaction rolls back all earlier writes', async () => {
    const context = databaseHarness();
    context.failEventWrite(2);
    await expect(
      context.store.createWedding(userId.toHexString(), input, now),
    ).rejects.toThrow('Injected event write failure');
    expect(context.committed).toEqual({
      weddings: [],
      wedding_members: [],
      events: [],
    });
    expect(context.session.endSession).toHaveBeenCalledOnce();
    expect(context.events.insertOne).toHaveBeenCalledTimes(3);
  });
  it('turns a concurrent membership uniqueness violation into a conflict and leaves no orphan wedding', async () => {
    const context = databaseHarness();
    context.duplicateMembership();
    await expect(
      context.store.createWedding(userId.toHexString(), input, now),
    ).rejects.toMatchObject({
      code: 'WEDDING_ALREADY_EXISTS',
      statusCode: 409,
    });
    expect(context.committed).toEqual({
      weddings: [],
      wedding_members: [],
      events: [],
    });
    expect(context.events.insertMany).not.toHaveBeenCalled();
    expect(context.events.insertOne).not.toHaveBeenCalled();
  });
  it('creates default events with the real driver transaction timeout rules', async () => {
    const context = databaseHarness();
    const client = new MongoClient('mongodb://127.0.0.1:1', {
      timeoutMS: 5000,
    });
    // Exercise the installed driver's option resolution; replace only its final
    // operation executor so this regression never connects to a database.
    const loadDriver = createRequire(import.meta.url);
    const executor = loadDriver(
      'mongodb/lib/operations/execute_operation.js',
    ) as {
      executeOperation: (...args: unknown[]) => Promise<unknown>;
    };
    const execute = vi.spyOn(executor, 'executeOperation').mockResolvedValue({
      acknowledged: true,
    });
    const connect = vi
      .spyOn(client, 'connect')
      .mockRejectedValue(
        new Error('This regression must not open a database connection'),
      );
    const session = client.startSession();
    const collection = client.db('offline_regression').collection('events');
    const runHarnessTransaction =
      context.session.withTransaction.getMockImplementation()!;
    context.session.withTransaction.mockImplementation((callback) =>
      session.withTransaction(() => runHarnessTransaction(callback)),
    );
    context.events.insertOne.mockImplementation(async (record, options) => {
      expect(options.session).toBe(context.session);
      await collection.insertOne(record as Document, { session });
    });
    context.events.insertMany.mockImplementation(async (records, options) => {
      expect(options.session).toBe(context.session);
      await collection.insertMany(records as Document[], { session });
    });
    try {
      const result = await context.store.createWedding(
        userId.toHexString(),
        input,
        now,
      );
      expect(result.events).toHaveLength(5);
      expect(execute).toHaveBeenCalledTimes(5);
      for (const [operationClient, operation] of execute.mock.calls) {
        expect(operationClient).toBe(client);
        expect(operation).toMatchObject({ options: { session } });
      }
      expect(connect).not.toHaveBeenCalled();
    } finally {
      await session.endSession();
      await client.close();
      execute.mockRestore();
      connect.mockRestore();
    }
  });
  it('stores only the supplied hash and never exposes it through public user reads', async () => {
    const context = databaseHarness();
    const account = {
      email: 'new@example.com',
      name: 'New user',
      passwordHash: 'salted-password-hash',
    };
    const created = await context.store.registerUser(account, now);
    expect(context.users.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ ...account, emailVerified: false }),
    );
    expect(created).not.toHaveProperty('passwordHash');
    expect(
      await context.store.getUser(userId.toHexString()),
    ).not.toHaveProperty('passwordHash');
    expect(
      await context.store.getPasswordCredentials(user.email),
    ).toMatchObject({ passwordHash: user.passwordHash });
  });
  it('never replaces a password on duplicate registration, including legacy accounts', async () => {
    const context = databaseHarness();
    context.users.insertOne.mockRejectedValue(
      new MongoServerError({ code: 11000, message: 'Duplicate email' }),
    );
    await expect(
      context.store.registerUser(
        { email: user.email, name: 'Imposter', passwordHash: 'attacker-hash' },
        now,
      ),
    ).rejects.toMatchObject({
      code: 'REGISTRATION_UNAVAILABLE',
      statusCode: 409,
    });
  });
  it('does not supply credentials for an unknown account or a password-less legacy account', async () => {
    const context = databaseHarness();
    context.users.findOne.mockResolvedValueOnce(null);
    expect(
      await context.store.getPasswordCredentials('unknown@example.com'),
    ).toBeNull();
    context.users.findOne.mockResolvedValueOnce({
      ...user,
      passwordHash: undefined,
    });
    expect(
      await context.store.getPasswordCredentials(user.email),
    ).toMatchObject({ passwordHash: null });
  });
});
