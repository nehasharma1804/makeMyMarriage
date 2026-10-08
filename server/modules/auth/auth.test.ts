import { afterEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import {
  authConfigResponseSchema,
  authSessionResponseSchema,
  createWeddingSchema,
  weddingWorkspaceResponseSchema,
  type CreateWeddingInput,
  type WeddingWorkspace,
} from '@mmm/contracts';
import { buildApp } from '../../app.js';
import { loadServerEnvironment } from '../../config/env.js';
import type { AppStore } from '../../database/app-store.js';
import { ApiProblem } from '../../shared/api-problem.js';
import { hashPassword } from './password.js';
import type {
  PasswordAccount,
  LoginChallenge,
  StoredSession,
  StoredUser,
} from './types.js';

// Only database persistence is substituted: tests exercise the real password hashing.
class TestStore implements AppStore {
  configured = true;
  users = new Map<string, StoredUser>();
  passwordHashes = new Map<string, string>();
  sessions = new Map<string, StoredSession>();
  challenges = new Map<string, LoginChallenge>();
  weddings = new Map<string, WeddingWorkspace>();
  async ready() {
    return true;
  }
  async createChallenge(challenge: LoginChallenge) {
    this.challenges.set(challenge.tokenHash, challenge);
  }
  async consumeChallenge(tokenHash: string, csrfHash: string, now: Date) {
    const challenge = this.challenges.get(tokenHash);
    if (
      !challenge ||
      challenge.csrfHash !== csrfHash ||
      challenge.expiresAt <= now
    )
      return false;
    this.challenges.delete(tokenHash);
    return true;
  }
  async registerUser(account: PasswordAccount) {
    if ([...this.users.values()].some((user) => user.email === account.email))
      throw new ApiProblem(
        'REGISTRATION_UNAVAILABLE',
        409,
        'Unable to create this account. Try signing in instead.',
      );
    const user: StoredUser = {
      id: new ObjectId().toHexString(),
      name: account.name,
      email: account.email,
      profilePhotoUrl: null,
      status: 'ACTIVE',
    };
    this.users.set(user.id, user);
    this.passwordHashes.set(user.id, account.passwordHash);
    return user;
  }
  async getPasswordCredentials(email: string) {
    const user = [...this.users.values()].find((user) => user.email === email);
    return user
      ? { user, passwordHash: this.passwordHashes.get(user.id) ?? null }
      : null;
  }
  async getUser(id: string) {
    return this.users.get(id) ?? null;
  }
  async createSession(session: StoredSession) {
    this.sessions.set(session.tokenHash, session);
  }
  async getSession(hash: string) {
    return this.sessions.get(hash) ?? null;
  }
  async revokeSession(hash: string) {
    this.sessions.delete(hash);
  }
  async getWedding(userId: string) {
    return this.weddings.get(userId) ?? null;
  }
  async createWedding(userId: string, input: CreateWeddingInput) {
    if (this.weddings.has(userId))
      throw new ApiProblem(
        'WEDDING_ALREADY_EXISTS',
        409,
        'Your account already belongs to a wedding.',
      );
    const weddingId = new ObjectId().toHexString();
    const workspace: WeddingWorkspace = {
      wedding: {
        id: weddingId,
        ...input,
        description: input.description || null,
        slug: `wedding-${weddingId}`,
        timezone: 'Asia/Kolkata',
        status: 'ACTIVE',
      },
      membership: {
        id: new ObjectId().toHexString(),
        weddingId,
        role: 'ADMIN',
      },
      events: (
        ['HALDI', 'MEHNDI', 'SANGEET', 'WEDDING', 'RECEPTION'] as const
      ).map((type, sortOrder) => ({
        id: new ObjectId().toHexString(),
        weddingId,
        name: type,
        type,
        date: null,
        isDefault: true,
        sortOrder,
      })),
    };
    this.weddings.set(userId, workspace);
    return workspace;
  }
}

const apps: ReturnType<typeof buildApp>[] = [];
afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});
const origin = 'http://localhost:3000';
const weddingInput = {
  brideName: 'Priya',
  groomName: 'Ashu',
  weddingDate: '2026-12-12',
  city: 'Jaipur',
};

function setup() {
  const store = new TestStore();
  let currentTime = new Date('2026-10-02T12:00:00Z');
  const app = buildApp(
    loadServerEnvironment({
      NODE_ENV: 'test',
      SESSION_SECRET: 'test-only-random-secret-at-least-32-characters',
    }),
    {
      logger: false,
      store,
      now: () => currentTime,
    },
  );
  apps.push(app);
  return {
    app,
    store,
    advance(ms: number) {
      currentTime = new Date(currentTime.getTime() + ms);
    },
  };
}
type Context = ReturnType<typeof setup>;
function cookieHeader(
  response: { headers: { 'set-cookie'?: string | string[] | undefined } },
  name?: string,
) {
  const raw = response.headers['set-cookie'];
  return (Array.isArray(raw) ? raw : raw ? [raw] : [])
    .map((cookie) => cookie.split(';')[0]!)
    .filter((cookie) => !name || cookie.startsWith(`${name}=`))
    .join('; ');
}
async function challenge(context: Context) {
  const response = await context.app.inject('/api/v1/auth/config');
  expect(response.statusCode).toBe(200);
  expect(authConfigResponseSchema.safeParse(response.json()).success).toBe(
    true,
  );
  return { ...response.json().data, cookie: cookieHeader(response) } as {
    nonce: string;
    csrfToken: string;
    cookie: string;
  };
}
const password = 'a long test passphrase 2026';
async function seedUser(context: Context, email = 'planner@example.com') {
  const existing = await context.store.getPasswordCredentials(email);
  if (existing) return existing.user;
  return context.store.registerUser({
    email,
    name: 'Test planner',
    passwordHash: await hashPassword(password),
  });
}
async function login(context: Context, subject?: string) {
  const config = await challenge(context);
  const email = `${subject ?? 'planner'}@example.com`;
  await seedUser(context, email);
  const response = await context.app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    headers: {
      origin,
      cookie: config.cookie,
      'x-csrf-token': config.csrfToken,
    },
    payload: {
      email,
      password,
      nonce: config.nonce,
    },
  });
  expect(response.statusCode).toBe(200);
  expect(authSessionResponseSchema.safeParse(response.json()).success).toBe(
    true,
  );
  return {
    cookie: cookieHeader(response, 'mmm_session'),
    csrfToken: response.json().data.csrfToken as string,
    userId: response.json().data.user.id as string,
    response,
  };
}

describe('Password sign-in and session security', () => {
  it('reports setup requirements without pretending that authentication works', async () => {
    const app = buildApp(loadServerEnvironment({ NODE_ENV: 'test' }), {
      logger: false,
    });
    apps.push(app);
    const response = await app.inject('/api/v1/auth/config');
    expect(response.json().data).toMatchObject({
      configured: false,
      nonce: null,
      csrfToken: null,
      databaseReady: false,
    });
    expect(response.json().data.missingSettings).toEqual([
      'SESSION_SECRET',
      'MONGODB_URI',
    ]);
    expect((await app.inject('/api/v1/auth/me')).statusCode).toBe(503);
  });
  it.each([undefined, 'https://attacker.example'])(
    'rejects a missing or hostile sign-in origin: %s',
    async (badOrigin) => {
      const context = setup();
      const config = await challenge(context);
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers: {
          cookie: config.cookie,
          'x-csrf-token': config.csrfToken,
          ...(badOrigin ? { origin: badOrigin } : {}),
        },
        payload: {
          email: 'planner@example.com',
          password,
          nonce: config.nonce,
        },
      });
      expect(response.statusCode).toBe(403);
      expect(context.store.sessions.size).toBe(0);
    },
  );
  it('rejects missing CSRF proof and a forged challenge cookie before checking a password', async () => {
    const context = setup();
    const config = await challenge(context);
    for (const headers of [
      { origin, cookie: config.cookie },
      {
        origin,
        cookie: 'mmm_challenge=forged',
        'x-csrf-token': config.csrfToken,
      },
    ]) {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers,
        payload: {
          email: 'planner@example.com',
          password,
          nonce: config.nonce,
        },
      });
      expect(response.statusCode).toBe(403);
      expect(response.json().error.code).toBe('INVALID_CSRF_TOKEN');
    }
    expect(context.store.sessions.size).toBe(0);
  });
  it('returns the same error for wrong passwords, unknown, disabled, and password-less users', async () => {
    const context = setup();
    const user = await seedUser(context);
    for (const kind of ['wrong', 'unknown', 'disabled', 'legacy']) {
      if (kind === 'disabled')
        context.store.users.get(user.id)!.status = 'DISABLED';
      if (kind === 'legacy') {
        context.store.users.get(user.id)!.status = 'ACTIVE';
        context.store.passwordHashes.delete(user.id);
      }
      const config = await challenge(context);
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers: {
          origin,
          cookie: config.cookie,
          'x-csrf-token': config.csrfToken,
        },
        payload: {
          email: kind === 'unknown' ? 'unknown@example.com' : user.email,
          password: kind === 'wrong' ? 'wrong password' : password,
          nonce: config.nonce,
        },
      });
      expect(response.statusCode).toBe(401);
      expect(response.json().error).toEqual({
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect.',
      });
      expect(response.body).not.toContain(password);
      expect(context.store.sessions.size).toBe(0);
    }
  });
  it('registers a normalized email, hashes the password, and refuses duplicate registration without overwriting credentials', async () => {
    const context = setup();
    const attempt = async () => {
      const config = await challenge(context);
      return context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        headers: {
          origin,
          cookie: config.cookie,
          'x-csrf-token': config.csrfToken,
        },
        payload: {
          name: ' Planner ',
          email: ' Planner@Example.com ',
          password,
          nonce: config.nonce,
        },
      });
    };
    const first = await attempt();
    expect(first.statusCode).toBe(201);
    expect(authSessionResponseSchema.safeParse(first.json()).success).toBe(
      true,
    );
    expect(first.json().data.user.email).toBe('planner@example.com');
    expect(first.body).not.toContain('password');
    expect(first.body).not.toContain('scrypt');
    const original = [...context.store.passwordHashes.values()][0];
    expect(original).toMatch(/^scrypt\$/);
    expect(original).not.toContain(password);
    expect((await attempt()).statusCode).toBe(409);
    expect(context.store.users.size).toBe(1);
    expect([...context.store.passwordHashes.values()][0]).toBe(original);
  });
  it('rejects invalid registration fields and never persists short passwords', async () => {
    const context = setup();
    const config = await challenge(context);
    for (const fields of [
      { password: 'short' },
      { email: 'invalid' },
      { name: ' ' },
      { role: 'ADMIN' },
      { password: 'x'.repeat(129) },
    ]) {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        headers: {
          origin,
          cookie: config.cookie,
          'x-csrf-token': config.csrfToken,
        },
        payload: {
          name: 'Planner',
          email: 'planner@example.com',
          password,
          nonce: config.nonce,
          ...fields,
        },
      });
      expect(response.statusCode).toBe(422);
    }
    expect(context.store.users.size).toBe(0);
  });
  it('removes the Google sign-in endpoint', async () => {
    const context = setup();
    expect(
      (
        await context.app.inject({
          method: 'POST',
          url: '/api/v1/auth/google',
          payload: {},
        })
      ).statusCode,
    ).toBe(404);
  });
  it('consumes the sign-in challenge once, including simultaneous attempts', async () => {
    const context = setup();
    const config = await challenge(context);
    await seedUser(context);
    const request = {
      method: 'POST' as const,
      url: '/api/v1/auth/login',
      headers: {
        origin,
        cookie: config.cookie,
        'x-csrf-token': config.csrfToken,
      },
      payload: { email: 'planner@example.com', password, nonce: config.nonce },
    };
    const responses = await Promise.all([
      context.app.inject(request),
      context.app.inject(request),
    ]);
    expect(responses.map((response) => response.statusCode).sort()).toEqual([
      200, 401,
    ]);
    expect(context.store.sessions.size).toBe(1);
    expect(
      responses.find((response) => response.statusCode === 401)?.json().error
        .code,
    ).toBe('LOGIN_CHALLENGE_EXPIRED');
  });
  it('rejects an expired challenge even when the browser still sends its cookie', async () => {
    const context = setup();
    const config = await challenge(context);
    await seedUser(context);
    context.advance(6 * 60 * 1000);
    const response = await context.app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: {
        origin,
        cookie: config.cookie,
        'x-csrf-token': config.csrfToken,
      },
      payload: { email: 'planner@example.com', password, nonce: config.nonce },
    });
    expect(response.json().error.code).toBe('LOGIN_CHALLENGE_EXPIRED');
  });
  it('issues an HttpOnly cookie and only persists a one-way hash of the session token', async () => {
    const context = setup();
    const signedIn = await login(context);
    const sessionHeaders = signedIn.response.headers['set-cookie'] as string[];
    expect(
      sessionHeaders.find((value) => value.startsWith('mmm_session=')),
    ).toContain('HttpOnly; SameSite=Lax');
    const token = signedIn.cookie.split('=')[1]!;
    expect(token.length).toBe(43);
    expect([...context.store.sessions.keys()][0]).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify([...context.store.sessions.values()])).not.toContain(
      token,
    );
    expect(signedIn.response.body).not.toContain(token);
    const me = await context.app.inject({
      url: '/api/v1/auth/me',
      headers: { cookie: signedIn.cookie },
    });
    expect(me.statusCode).toBe(200);
    expect(me.json().data.user.id).toBe(signedIn.userId);
  });
  it('rejects expired sessions without relying on eventual MongoDB TTL deletion', async () => {
    const context = setup();
    const signedIn = await login(context);
    context.advance(169 * 3600 * 1000);
    const response = await context.app.inject({
      url: '/api/v1/auth/me',
      headers: { cookie: signedIn.cookie },
    });
    expect(response.statusCode).toBe(401);
  });
  it('requires CSRF proof for logout and revokes the persisted session', async () => {
    const context = setup();
    const signedIn = await login(context);
    const denied = await context.app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: { origin, cookie: signedIn.cookie },
    });
    expect(denied.statusCode).toBe(403);
    expect(context.store.sessions.size).toBe(1);
    const loggedOut = await context.app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: {
        origin,
        cookie: signedIn.cookie,
        'x-csrf-token': signedIn.csrfToken,
      },
    });
    expect(loggedOut.statusCode).toBe(200);
    expect(context.store.sessions.size).toBe(0);
    expect(
      (
        await context.app.inject({
          url: '/api/v1/auth/me',
          headers: { cookie: signedIn.cookie },
        })
      ).statusCode,
    ).toBe(401);
  });
  it('does not honor a session after its user has been disabled', async () => {
    const context = setup();
    const signedIn = await login(context);
    context.store.users.get(signedIn.userId)!.status = 'DISABLED';
    expect(
      (
        await context.app.inject({
          url: '/api/v1/auth/me',
          headers: { cookie: signedIn.cookie },
        })
      ).statusCode,
    ).toBe(401);
  });
  it('limits one valid challenge without locking out another browser behind the same Next.js peer', async () => {
    const context = setup();
    const config = await challenge(context);
    let response;
    for (let index = 0; index < 11; index++)
      response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers: { origin, cookie: config.cookie },
        payload: {
          email: 'planner@example.com',
          password,
          nonce: config.nonce,
        },
      });
    expect(response!.statusCode).toBe(429);
    expect(response!.json().error.code).toBe('RATE_LIMITED');
    // Both injected browsers have the same transport IP, but their authenticated
    // server-issued challenge cookies belong to independent limiter buckets.
    const otherConfig = await challenge(context);
    await seedUser(context, 'other@example.com');
    const otherLogin = await context.app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: {
        origin,
        cookie: otherConfig.cookie,
        'x-csrf-token': otherConfig.csrfToken,
      },
      payload: {
        email: 'other@example.com',
        password,
        nonce: otherConfig.nonce,
      },
    });
    expect(otherLogin.statusCode).toBe(200);
  });
  it('does not let forged challenge cookies or forwarded IPs choose unlimited sign-in buckets', async () => {
    const context = setup();
    let response;
    for (let index = 0; index < 11; index++) {
      response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers: {
          origin,
          cookie: `mmm_challenge=${encodeURIComponent(JSON.stringify({ nonce: String(index).padStart(43, '0'), csrfToken: 'forged', expiresAt: Date.now() + 60000 }))}`,
          'x-forwarded-for': `192.0.2.${index + 1}`,
        },
        payload: {
          email: 'planner@example.com',
          password,
          nonce: String(index).padStart(43, '0'),
        },
      });
    }
    expect(response!.statusCode).toBe(429);
    expect(context.store.sessions.size).toBe(0);
    const valid = await login(context, 'valid-after-anonymous-abuse');
    expect(valid.response.statusCode).toBe(200);
  });
  it('uses independent signed visitor buckets for config and bounds the visitor cookie lifetime', async () => {
    const context = setup();
    const first = await context.app.inject('/api/v1/auth/config');
    const visitorCookie = cookieHeader(first, 'mmm_visitor');
    expect(visitorCookie).toBeTruthy();
    expect(
      (first.headers['set-cookie'] as string[]).find((value) =>
        value.startsWith('mmm_visitor='),
      ),
    ).toContain('Max-Age=86400');
    let response;
    for (let index = 0; index < 31; index++)
      response = await context.app.inject({
        url: '/api/v1/auth/config',
        headers: { cookie: visitorCookie },
      });
    expect(response!.statusCode).toBe(429);
    const otherBrowser = await context.app.inject('/api/v1/auth/config');
    expect(otherBrowser.statusCode).toBe(200);
    const secondVisitor = cookieHeader(otherBrowser, 'mmm_visitor');
    expect(secondVisitor).not.toBe(visitorCookie);
    expect(
      (
        await context.app.inject({
          url: '/api/v1/auth/config',
          headers: { cookie: secondVisitor },
        })
      ).statusCode,
    ).toBe(200);
    context.advance(25 * 60 * 60 * 1000);
    const expiredVisitor = await context.app.inject({
      url: '/api/v1/auth/config',
      headers: { cookie: visitorCookie },
    });
    expect(expiredVisitor.statusCode).toBe(200);
    expect(cookieHeader(expiredVisitor, 'mmm_visitor')).not.toBe(visitorCookie);
  });
  it('puts forged visitor cookies into the shared bootstrap bucket rather than attacker-selected keys', async () => {
    const context = setup();
    let response;
    for (let index = 0; index < 121; index++) {
      response = await context.app.inject({
        url: '/api/v1/auth/config',
        headers: {
          cookie: `mmm_visitor=${encodeURIComponent(JSON.stringify({ id: String(index).padStart(43, '0'), expiresAt: Date.now() + 86400000 }))}`,
          'x-forwarded-for': `192.0.2.${(index % 250) + 1}`,
        },
      });
    }
    expect(response!.statusCode).toBe(429);
    expect(response!.headers['x-ratelimit-limit']).toBe('120');
  });
  it('applies a service-wide config backstop even when a signed visitor repeatedly hits its own limit', async () => {
    const context = setup();
    const first = await context.app.inject('/api/v1/auth/config');
    const cookie = cookieHeader(first, 'mmm_visitor');
    let response;
    for (let index = 0; index < 1200; index++)
      response = await context.app.inject({
        url: '/api/v1/auth/config',
        headers: { cookie },
      });
    expect(response!.statusCode).toBe(429);
    expect(response!.headers['x-ratelimit-limit']).toBe('1200');
  });
});

describe('password-specific boundaries', () => {
  it('does not let rotating login challenges bypass the normalized account limit', async () => {
    const context = setup();
    let response;
    for (let index = 0; index < 11; index++) {
      const config = await challenge(context);
      response = await context.app.inject({
        method: 'POST',
        url: index % 2 ? '/api/v1/auth/register' : '/api/v1/auth/login',
        headers: { origin, cookie: config.cookie }, // Invalid CSRF, but still counted.
        payload: {
          email: index % 2 ? ' Planner@Example.com ' : 'planner@example.com',
          password,
          nonce: config.nonce,
          ...(index % 2 ? { name: 'Planner' } : {}),
        },
      });
    }
    expect(response!.statusCode).toBe(429);
    expect(context.store.sessions.size).toBe(0);
    expect(context.store.users.size).toBe(0);
  });
  it('rotates and revokes an old session on a fresh password login', async () => {
    const context = setup();
    const old = await login(context);
    const config = await challenge(context);
    const response = await context.app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: {
        origin,
        cookie: `${old.cookie}; ${config.cookie}`,
        'x-csrf-token': config.csrfToken,
      },
      payload: { email: 'planner@example.com', password, nonce: config.nonce },
    });
    expect(response.statusCode).toBe(200);
    expect(cookieHeader(response, 'mmm_session')).not.toBe(old.cookie);
    expect(context.store.sessions.size).toBe(1);
    expect(
      (
        await context.app.inject({
          url: '/api/v1/me',
          headers: { cookie: old.cookie },
        })
      ).statusCode,
    ).toBe(401);
  });
  it('sets Secure host-only session cookies in production without Google configuration', async () => {
    const store = new TestStore();
    const app = buildApp(
      loadServerEnvironment({
        NODE_ENV: 'production',
        MONGODB_URI: 'mongodb://localhost:27017',
        WEB_ORIGIN: 'https://wedding.example',
        SESSION_SECRET: 'a-production-length-test-only-secret',
      }),
      { store, logger: false },
    );
    apps.push(app);
    const config = await app.inject('/api/v1/auth/config');
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      headers: {
        origin: 'https://wedding.example',
        cookie: cookieHeader(config),
        'x-csrf-token': config.json().data.csrfToken,
      },
      payload: {
        name: 'Planner',
        email: 'planner@example.com',
        password,
        nonce: config.json().data.nonce,
      },
    });
    expect(response.statusCode).toBe(201);
    const header = (response.headers['set-cookie'] as string[]).find((cookie) =>
      cookie.startsWith('__Host-mmm_session='),
    )!;
    expect(header).toContain('Secure');
    expect(header).toContain('HttpOnly');
    expect(header).toContain('Path=/');
    expect(header).not.toContain('Domain=');
  });
});

describe('wedding setup boundaries', () => {
  it('limits authenticated writes per verified user without locking out another browser', async () => {
    const context = setup();
    const first = await login(context, 'first-limited-user');
    let response;
    for (let index = 0; index < 11; index++)
      response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/weddings',
        headers: {
          origin,
          cookie: first.cookie,
          'x-csrf-token': first.csrfToken,
        },
        payload: { ...weddingInput, city: '' },
      });
    expect(response!.statusCode).toBe(429);
    const second = await login(context, 'second-independent-user');
    const secondWedding = await context.app.inject({
      method: 'POST',
      url: '/api/v1/weddings',
      headers: {
        origin,
        cookie: second.cookie,
        'x-csrf-token': second.csrfToken,
      },
      payload: weddingInput,
    });
    expect(secondWedding.statusCode).toBe(201);
  });
  it('does not let spoofed session cookies choose arbitrary authenticated-write buckets', async () => {
    const context = setup();
    let response;
    for (let index = 0; index < 11; index++)
      response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/weddings',
        headers: {
          origin,
          cookie: `mmm_session=${String(index).padStart(43, '0')}`,
          'x-forwarded-for': `192.0.2.${index + 1}`,
        },
        payload: weddingInput,
      });
    expect(response!.statusCode).toBe(429);
    expect(context.store.weddings.size).toBe(0);
  });
  it('validates real calendar dates, names, limits and unexpected tenant fields', () => {
    expect(
      createWeddingSchema.safeParse({
        ...weddingInput,
        weddingDate: '2027-02-29',
      }).success,
    ).toBe(false);
    expect(
      createWeddingSchema.safeParse({
        ...weddingInput,
        weddingDate: '2028-02-29',
      }).success,
    ).toBe(true);
    expect(
      createWeddingSchema.safeParse({ ...weddingInput, brideName: '   ' })
        .success,
    ).toBe(false);
    expect(
      createWeddingSchema.safeParse({
        ...weddingInput,
        weddingId: new ObjectId().toHexString(),
      }).success,
    ).toBe(false);
  });
  it('protects wedding creation with authentication, origin and session CSRF', async () => {
    const context = setup();
    expect(
      (
        await context.app.inject({
          method: 'POST',
          url: '/api/v1/weddings',
          payload: weddingInput,
        })
      ).statusCode,
    ).toBe(401);
    const signedIn = await login(context);
    expect(
      (
        await context.app.inject({
          method: 'POST',
          url: '/api/v1/weddings',
          headers: { origin, cookie: signedIn.cookie },
          payload: weddingInput,
        })
      ).statusCode,
    ).toBe(403);
    expect(context.store.weddings.size).toBe(0);
  });
  it('creates an Admin workspace with five unscheduled events and prevents duplicate creation', async () => {
    const context = setup();
    const signedIn = await login(context);
    const request = {
      method: 'POST' as const,
      url: '/api/v1/weddings',
      headers: {
        origin,
        cookie: signedIn.cookie,
        'x-csrf-token': signedIn.csrfToken,
      },
      payload: weddingInput,
    };
    const responses = await Promise.all([
      context.app.inject(request),
      context.app.inject(request),
    ]);
    expect(responses.map((response) => response.statusCode).sort()).toEqual([
      201, 409,
    ]);
    const created = responses.find((response) => response.statusCode === 201)!;
    expect(
      weddingWorkspaceResponseSchema.safeParse(created.json()).success,
    ).toBe(true);
    expect(created.json().data.membership.role).toBe('ADMIN');
    expect(
      created.json().data.events.map((event: { date: null }) => event.date),
    ).toEqual([null, null, null, null, null]);
    const me = await context.app.inject({
      url: '/api/v1/auth/me',
      headers: { cookie: signedIn.cookie },
    });
    expect(me.json().data.requiresWeddingSetup).toBe(false);
  });
  it('returns only the signed-in user’s wedding and never accepts another tenant ID as authority', async () => {
    const context = setup();
    const first = await login(context, 'first-user');
    const created = await context.app.inject({
      method: 'POST',
      url: '/api/v1/weddings',
      headers: {
        origin,
        cookie: first.cookie,
        'x-csrf-token': first.csrfToken,
      },
      payload: weddingInput,
    });
    const second = await login(context, 'second-user');
    const mine = await context.app.inject({
      url: '/api/v1/weddings/mine',
      headers: { cookie: second.cookie },
    });
    expect(mine.json().data).toBeNull();
    expect(
      (
        await context.app.inject({
          url: `/api/v1/weddings/${created.json().data.wedding.id}`,
          headers: { cookie: second.cookie },
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await context.app.inject({
          url: '/api/v1/weddings/mine',
          headers: { cookie: first.cookie },
        })
      ).json().data.wedding.id,
    ).toBe(created.json().data.wedding.id);
  });
});
