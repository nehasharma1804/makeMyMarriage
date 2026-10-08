import { randomBytes } from 'node:crypto';
import { MongoServerError, ObjectId } from 'mongodb';
import type {
  CreateWeddingInput,
  WeddingEvent,
  WeddingSummary,
  WeddingWorkspace,
} from '@mmm/contracts';
import type {
  PasswordAccount,
  PasswordCredentials,
  LoginChallenge,
  StoredSession,
  StoredUser,
} from '../modules/auth/types.js';
import { ApiProblem } from '../shared/api-problem.js';
import type { DatabaseConnection, MongoDatabaseConnection } from './mongodb.js';

export interface AppStore {
  readonly configured: boolean;
  ready(): Promise<boolean>;
  createChallenge(challenge: LoginChallenge): Promise<void>;
  consumeChallenge(
    tokenHash: string,
    csrfHash: string,
    now: Date,
  ): Promise<boolean>;
  registerUser(account: PasswordAccount, now: Date): Promise<StoredUser>;
  getPasswordCredentials(email: string): Promise<PasswordCredentials | null>;
  getUser(userId: string): Promise<StoredUser | null>;
  createSession(session: StoredSession): Promise<void>;
  getSession(tokenHash: string, now: Date): Promise<StoredSession | null>;
  revokeSession(tokenHash: string): Promise<void>;
  getWedding(userId: string): Promise<WeddingWorkspace | null>;
  createWedding(
    userId: string,
    input: CreateWeddingInput,
    now: Date,
  ): Promise<WeddingWorkspace>;
}

interface UserDocument {
  _id: ObjectId;
  passwordHash?: string;
  emailVerified?: boolean;
  email: string;
  name: string;
  profilePhotoUrl: string | null;
  status: 'ACTIVE' | 'DISABLED';
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
interface SessionDocument extends Omit<StoredSession, 'userId'> {
  userId: ObjectId;
  createdAt: Date;
}
interface WeddingDocument extends Omit<WeddingSummary, 'id' | 'weddingDate'> {
  _id: ObjectId;
  weddingDate: Date;
  state: null;
  country: 'India';
  createdBy: ObjectId;
  guestUploadsEnabled: false;
  websiteConfig: {
    theme: 'CLASSIC';
    published: false;
    publicSections: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
interface MembershipDocument {
  _id: ObjectId;
  weddingId: ObjectId;
  userId: ObjectId;
  role: 'ADMIN' | 'MEMBER';
  status: 'ACTIVE' | 'REMOVED';
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
interface EventDocument extends Omit<
  WeddingEvent,
  'id' | 'weddingId' | 'date'
> {
  _id: ObjectId;
  weddingId: ObjectId;
  date: Date | null;
  startTime: null;
  endTime: null;
  description: null;
  venue: { name: null; address: null };
  status: 'ACTIVE';
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

function publicUser(document: UserDocument): StoredUser {
  return {
    id: document._id.toHexString(),
    name: document.name,
    email: document.email,
    profilePhotoUrl: document.profilePhotoUrl,
    status: document.status,
  };
}
function publicWedding(document: WeddingDocument): WeddingSummary {
  return {
    id: document._id.toHexString(),
    brideName: document.brideName,
    groomName: document.groomName,
    weddingDate: document.weddingDate.toISOString().slice(0, 10),
    city: document.city,
    description: document.description,
    slug: document.slug,
    timezone: document.timezone,
    status: document.status,
  };
}
function workspace(
  wedding: WeddingDocument,
  membership: MembershipDocument,
  events: EventDocument[],
): WeddingWorkspace {
  return {
    wedding: publicWedding(wedding),
    membership: {
      id: membership._id.toHexString(),
      weddingId: membership.weddingId.toHexString(),
      role: membership.role,
    },
    events: events.map((event) => ({
      id: event._id.toHexString(),
      weddingId: event.weddingId.toHexString(),
      name: event.name,
      type: event.type,
      date: event.date?.toISOString().slice(0, 10) ?? null,
      isDefault: true,
      sortOrder: event.sortOrder,
    })),
  };
}

export function createAppStore(database: DatabaseConnection): AppStore {
  if (!('getClient' in database) || !('getDatabase' in database)) {
    const unavailable = async (): Promise<never> => {
      throw new ApiProblem(
        'DATABASE_NOT_CONFIGURED',
        503,
        'Configure MongoDB before signing in or creating a wedding.',
      );
    };
    return {
      configured: false,
      ready: async () => false,
      createChallenge: unavailable,
      consumeChallenge: unavailable,
      registerUser: unavailable,
      getPasswordCredentials: unavailable,
      getUser: unavailable,
      createSession: unavailable,
      getSession: unavailable,
      revokeSession: unavailable,
      getWedding: unavailable,
      createWedding: unavailable,
    };
  }
  return new MongoAppStore(database as MongoDatabaseConnection);
}

class MongoAppStore implements AppStore {
  private indexes: Promise<void> | undefined;
  constructor(private readonly database: MongoDatabaseConnection) {}
  get configured() {
    return this.database.configured;
  }
  private db() {
    return this.database.getDatabase();
  }

  async ready(): Promise<boolean> {
    if (!this.configured || !(await this.database.ping())) return false;
    try {
      await this.ensureIndexes();
      return true;
    } catch {
      return false;
    }
  }
  private async ensureIndexes() {
    if (!this.indexes) {
      this.indexes = (async () => {
        const db = this.db();
        await db.collection('users').createIndexes([
          {
            key: { email: 1 },
            unique: true,
            name: 'unique_normalized_email',
          },
        ]);
        await db.collection('sessions').createIndexes([
          {
            key: { tokenHash: 1 },
            unique: true,
            name: 'unique_session_token_hash',
          },
          {
            key: { expiresAt: 1 },
            expireAfterSeconds: 0,
            name: 'session_expiry',
          },
        ]);
        await db.collection('auth_challenges').createIndexes([
          {
            key: { tokenHash: 1 },
            unique: true,
            name: 'unique_challenge_hash',
          },
          {
            key: { expiresAt: 1 },
            expireAfterSeconds: 0,
            name: 'challenge_expiry',
          },
        ]);
        await db
          .collection('weddings')
          .createIndex(
            { slug: 1 },
            { unique: true, name: 'unique_wedding_slug' },
          );
        await db.collection('wedding_members').createIndexes([
          {
            key: { weddingId: 1, userId: 1 },
            unique: true,
            name: 'unique_wedding_member',
          },
          {
            key: { userId: 1 },
            unique: true,
            partialFilterExpression: { status: 'ACTIVE' },
            name: 'one_active_wedding_per_user',
          },
        ]);
        await db
          .collection('events')
          .createIndex({ weddingId: 1, sortOrder: 1 });
      })().catch((error: unknown) => {
        this.indexes = undefined;
        throw error;
      });
    }
    await this.indexes;
  }
  async createChallenge(challenge: LoginChallenge) {
    await this.ensureIndexes();
    await this.db()
      .collection<LoginChallenge>('auth_challenges')
      .insertOne(challenge);
  }
  async consumeChallenge(tokenHash: string, csrfHash: string, now: Date) {
    const result = await this.db()
      .collection<LoginChallenge>('auth_challenges')
      .findOneAndDelete({ tokenHash, csrfHash, expiresAt: { $gt: now } });
    return Boolean(result);
  }
  async registerUser(account: PasswordAccount, now: Date): Promise<StoredUser> {
    await this.ensureIndexes();
    const user: UserDocument = {
      _id: new ObjectId(),
      ...account,
      emailVerified: false,
      profilePhotoUrl: null,
      status: 'ACTIVE',
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await this.db().collection<UserDocument>('users').insertOne(user);
      return publicUser(user);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        // Never attach a new password to an existing email (including legacy users).
        throw new ApiProblem(
          'REGISTRATION_UNAVAILABLE',
          409,
          'Unable to create this account. Try signing in instead.',
        );
      }
      throw error;
    }
  }
  async getPasswordCredentials(
    email: string,
  ): Promise<PasswordCredentials | null> {
    await this.ensureIndexes();
    const user = await this.db()
      .collection<UserDocument>('users')
      .findOne({ email });
    return user
      ? { user: publicUser(user), passwordHash: user.passwordHash ?? null }
      : null;
  }
  async getUser(userId: string) {
    const user = await this.db()
      .collection<UserDocument>('users')
      .findOne({ _id: new ObjectId(userId) });
    return user ? publicUser(user) : null;
  }
  async createSession(session: StoredSession) {
    await this.db()
      .collection<SessionDocument>('sessions')
      .insertOne({
        ...session,
        userId: new ObjectId(session.userId),
        createdAt: new Date(),
      });
  }
  async getSession(tokenHash: string, now: Date) {
    const session = await this.db()
      .collection<SessionDocument>('sessions')
      .findOne({ tokenHash, expiresAt: { $gt: now } });
    return session
      ? {
          tokenHash: session.tokenHash,
          userId: session.userId.toHexString(),
          expiresAt: session.expiresAt,
        }
      : null;
  }
  async revokeSession(tokenHash: string) {
    await this.db()
      .collection<SessionDocument>('sessions')
      .deleteOne({ tokenHash });
  }
  async getWedding(userId: string) {
    const db = this.db();
    const member = await db
      .collection<MembershipDocument>('wedding_members')
      .findOne({ userId: new ObjectId(userId), status: 'ACTIVE' });
    if (!member) return null;
    const wedding = await db
      .collection<WeddingDocument>('weddings')
      .findOne({ _id: member.weddingId, status: { $ne: 'ARCHIVED' } });
    if (!wedding)
      throw new ApiProblem(
        'WEDDING_UNAVAILABLE',
        409,
        'Your wedding workspace is unavailable.',
      );
    const events = await db
      .collection<EventDocument>('events')
      .find({ weddingId: member.weddingId, status: 'ACTIVE' })
      .sort({ sortOrder: 1 })
      .toArray();
    return workspace(wedding, member, events);
  }
  async createWedding(userId: string, input: CreateWeddingInput, now: Date) {
    await this.ensureIndexes();
    const db = this.db();
    const userObjectId = new ObjectId(userId);
    const session = this.database.getClient().startSession();
    try {
      return await session.withTransaction(
        async () => {
          const user = await db
            .collection<UserDocument>('users')
            .findOne({ _id: userObjectId, status: 'ACTIVE' }, { session });
          if (!user)
            throw new ApiProblem(
              'UNAUTHENTICATED',
              401,
              'Please sign in again.',
            );
          if (
            await db
              .collection<MembershipDocument>('wedding_members')
              .findOne({ userId: userObjectId, status: 'ACTIVE' }, { session })
          ) {
            throw new ApiProblem(
              'WEDDING_ALREADY_EXISTS',
              409,
              'Your account already belongs to a wedding.',
            );
          }
          const weddingId = new ObjectId();
          const slugBase =
            `${input.brideName}-${input.groomName}`
              .normalize('NFKD')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
              .slice(0, 70) || 'wedding';
          const wedding: WeddingDocument = {
            _id: weddingId,
            ...input,
            description: input.description || null,
            weddingDate: new Date(`${input.weddingDate}T00:00:00.000Z`),
            state: null,
            country: 'India',
            timezone: 'Asia/Kolkata',
            slug: `${slugBase}-${randomBytes(6).toString('hex')}`,
            status: 'ACTIVE',
            createdBy: userObjectId,
            guestUploadsEnabled: false,
            websiteConfig: {
              theme: 'CLASSIC',
              published: false,
              publicSections: [],
            },
            createdAt: now,
            updatedAt: now,
          };
          const member: MembershipDocument = {
            _id: new ObjectId(),
            weddingId,
            userId: userObjectId,
            role: 'ADMIN',
            status: 'ACTIVE',
            joinedAt: now,
            createdAt: now,
            updatedAt: now,
          };
          const defaults = [
            ['Haldi', 'HALDI'],
            ['Mehndi', 'MEHNDI'],
            ['Sangeet', 'SANGEET'],
            ['Wedding', 'WEDDING'],
            ['Reception', 'RECEPTION'],
          ] as const;
          const events: EventDocument[] = defaults.map(
            ([name, type], sortOrder) => ({
              _id: new ObjectId(),
              weddingId,
              name,
              type,
              isDefault: true,
              date: null,
              startTime: null,
              endTime: null,
              description: null,
              venue: { name: null, address: null },
              sortOrder,
              status: 'ACTIVE',
              createdBy: userObjectId,
              createdAt: now,
              updatedAt: now,
            }),
          );
          await db
            .collection<WeddingDocument>('weddings')
            .insertOne(wedding, { session });
          await db
            .collection<MembershipDocument>('wedding_members')
            .insertOne(member, { session });
          // Keep the shared transaction deadline. The driver's insertMany bulk
          // path re-applies the client timeout and rejects it inside withTransaction.
          const eventCollection = db.collection<EventDocument>('events');
          for (const event of events) {
            await eventCollection.insertOne(event, { session });
          }
          return workspace(wedding, member, events);
        },
        {
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority' },
          maxCommitTimeMS: 10000,
        },
      );
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        if (error.keyPattern && 'slug' in error.keyPattern) {
          throw new ApiProblem(
            'SLUG_ALREADY_EXISTS',
            409,
            'Please try creating the wedding again.',
          );
        }
        throw new ApiProblem(
          'WEDDING_ALREADY_EXISTS',
          409,
          'Your account already belongs to a wedding.',
        );
      }
      if (
        error instanceof MongoServerError &&
        typeof error.code === 'number' &&
        [20, 303].includes(error.code)
      ) {
        throw new ApiProblem(
          'TRANSACTIONS_REQUIRED',
          503,
          'Wedding creation requires MongoDB Atlas or a local MongoDB replica set.',
        );
      }
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
