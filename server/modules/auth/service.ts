import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type {
  AuthConfig,
  AuthSession,
  LoginInput,
  RegisterInput,
} from '@mmm/contracts';
import type { ServerEnvironment } from '../../config/env.js';
import type { AppStore } from '../../database/app-store.js';
import { ApiProblem } from '../../shared/api-problem.js';
import type { StoredUser } from './types.js';
import { hashPassword, verifyPassword } from './password.js';

export function tokenHash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}
function equalToken(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export class AuthService {
  readonly sessionCookie: string;
  private readonly challengeCookie: string;
  private readonly visitorCookie: string;
  private readonly allowedOrigins: Set<string>;
  constructor(
    private readonly environment: ServerEnvironment,
    private readonly store: AppStore,
    private readonly now: () => Date = () => new Date(),
  ) {
    const secure = environment.NODE_ENV === 'production';
    this.sessionCookie = secure ? '__Host-mmm_session' : 'mmm_session';
    this.challengeCookie = secure ? '__Host-mmm_challenge' : 'mmm_challenge';
    this.visitorCookie = secure ? '__Host-mmm_visitor' : 'mmm_visitor';
    this.allowedOrigins = new Set([environment.WEB_ORIGIN]);
    const origin = new URL(environment.WEB_ORIGIN);
    if (
      environment.NODE_ENV !== 'production' &&
      ['localhost', '127.0.0.1'].includes(origin.hostname)
    ) {
      origin.hostname =
        origin.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
      this.allowedOrigins.add(origin.origin);
    }
  }
  private cookieOptions() {
    return {
      httpOnly: true,
      secure: this.environment.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    } as const;
  }
  private signedCookie(
    request: FastifyRequest,
    name: string,
  ): Record<string, unknown> | null {
    const value = request.cookies[name];
    if (!this.environment.SESSION_SECRET || !value || value.length > 2048)
      return null;
    const signed = request.unsignCookie(value);
    if (!signed.valid || !signed.value) return null;
    try {
      const parsed: unknown = JSON.parse(signed.value);
      return parsed !== null &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  private validExpiry(expiresAt: unknown) {
    return (
      typeof expiresAt === 'number' &&
      Number.isFinite(expiresAt) &&
      expiresAt > this.now().getTime()
    );
  }
  private visitorId(request: FastifyRequest): string | null {
    const visitor = this.signedCookie(request, this.visitorCookie);
    return visitor &&
      typeof visitor.id === 'string' &&
      /^[A-Za-z0-9_-]{43}$/.test(visitor.id) &&
      this.validExpiry(visitor.expiresAt)
      ? visitor.id
      : null;
  }
  configRateKey(request: FastifyRequest) {
    const visitor = this.visitorId(request);
    // A visitor key distinguishes signed browser sessions, not network clients.
    // Clearing/forging cookies goes back to the service-wide bootstrap bucket.
    return visitor ? `visitor:${tokenHash(visitor)}` : 'auth-config-bootstrap';
  }
  loginRateKey(request: FastifyRequest) {
    const challenge = this.signedCookie(request, this.challengeCookie);
    const nonce = challenge?.nonce;
    if (
      typeof nonce === 'string' &&
      /^[A-Za-z0-9_-]{43}$/.test(nonce) &&
      this.validExpiry(challenge?.expiresAt)
    ) {
      return `challenge:${tokenHash(nonce)}`;
    }
    // Only the actual API peer address is trusted. Behind Next.js this fallback
    // is shared; it protects invalid anonymous attempts, not individual visitors.
    return `anonymous-peer:${request.ip}`;
  }
  async authenticatedWriteRateKey(request: FastifyRequest) {
    const token = request.cookies[this.sessionCookie];
    if (this.store.configured && token && /^[A-Za-z0-9_-]{43}$/.test(token)) {
      const session = await this.store.getSession(tokenHash(token), this.now());
      const user =
        session && session.expiresAt > this.now()
          ? await this.store.getUser(session.userId)
          : null;
      if (user?.status === 'ACTIVE') return `user:${user.id}`;
    }
    return `anonymous-peer:${request.ip}`;
  }
  private issueVisitorCookie(request: FastifyRequest, reply: FastifyReply) {
    if (!this.environment.SESSION_SECRET || this.visitorId(request)) return;
    const id = randomBytes(32).toString('base64url');
    const expiresAt = this.now().getTime() + 24 * 60 * 60 * 1000;
    reply.setCookie(this.visitorCookie, JSON.stringify({ id, expiresAt }), {
      ...this.cookieOptions(),
      signed: true,
      maxAge: 24 * 60 * 60,
    });
  }
  private missingSettings() {
    return [
      !this.environment.SESSION_SECRET && 'SESSION_SECRET',
      !this.store.configured && 'MONGODB_URI',
    ].filter((value): value is string => Boolean(value));
  }
  private requireConfiguration() {
    if (this.missingSettings().length) {
      throw new ApiProblem(
        'AUTH_NOT_CONFIGURED',
        503,
        'Sign-in is waiting for MongoDB and session setup.',
      );
    }
  }
  checkOrigin(request: FastifyRequest, requireOrigin = true) {
    const origin = request.headers.origin;
    if (
      request.headers['sec-fetch-site'] === 'cross-site' ||
      (requireOrigin && !origin) ||
      (origin && !this.allowedOrigins.has(origin))
    ) {
      throw new ApiProblem(
        'FORBIDDEN_ORIGIN',
        403,
        'The request must come from this application.',
      );
    }
  }
  async config(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<AuthConfig> {
    this.checkOrigin(request, false);
    this.issueVisitorCookie(request, reply);
    const missingSettings = this.missingSettings();
    const databaseReady = this.store.configured && (await this.store.ready());
    const configured = missingSettings.length === 0 && databaseReady;
    if (!configured) {
      return {
        configured: false,
        nonce: null,
        csrfToken: null,
        missingSettings,
        databaseReady,
      };
    }
    const nonce = randomBytes(32).toString('base64url');
    const csrfToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(this.now().getTime() + 5 * 60 * 1000);
    await this.store.createChallenge({
      tokenHash: tokenHash(nonce),
      csrfHash: tokenHash(csrfToken),
      expiresAt,
    });
    reply.setCookie(
      this.challengeCookie,
      JSON.stringify({ nonce, csrfToken, expiresAt: expiresAt.getTime() }),
      { ...this.cookieOptions(), signed: true, maxAge: 300 },
    );
    return {
      configured: true,
      nonce,
      csrfToken,
      missingSettings: [],
      databaseReady: true,
    };
  }
  private sessionCsrf(token: string) {
    return createHmac('sha256', this.environment.SESSION_SECRET)
      .update(`csrf:${token}`)
      .digest('base64url');
  }
  private async consumeLoginChallenge(
    request: FastifyRequest,
    reply: FastifyReply,
    nonce: string,
  ): Promise<void> {
    this.checkOrigin(request);
    this.requireConfiguration();
    const csrfHeader = request.headers['x-csrf-token'];
    const challenge = this.signedCookie(request, this.challengeCookie) ?? {};
    if (
      typeof csrfHeader !== 'string' ||
      typeof challenge.nonce !== 'string' ||
      typeof challenge.csrfToken !== 'string' ||
      !equalToken(challenge.nonce, nonce) ||
      !equalToken(challenge.csrfToken, csrfHeader)
    ) {
      throw new ApiProblem(
        'INVALID_CSRF_TOKEN',
        403,
        'Please refresh the sign-in page and try again.',
      );
    }
    if (!this.validExpiry(challenge.expiresAt)) {
      throw new ApiProblem(
        'LOGIN_CHALLENGE_EXPIRED',
        401,
        'This sign-in attempt expired. Please refresh and try again.',
      );
    }
    if (
      !(await this.store.consumeChallenge(
        tokenHash(nonce),
        tokenHash(csrfHeader),
        this.now(),
      ))
    ) {
      throw new ApiProblem(
        'LOGIN_CHALLENGE_EXPIRED',
        401,
        'This sign-in attempt expired. Please refresh and try again.',
      );
    }
    reply.clearCookie(this.challengeCookie, this.cookieOptions());
  }
  async register(
    request: FastifyRequest,
    reply: FastifyReply,
    input: RegisterInput,
  ) {
    await this.consumeLoginChallenge(request, reply, input.nonce);
    const passwordHash = await hashPassword(input.password);
    const user = await this.store.registerUser(
      { name: input.name, email: input.email, passwordHash },
      this.now(),
    );
    return this.issueSession(request, reply, user);
  }
  async login(request: FastifyRequest, reply: FastifyReply, input: LoginInput) {
    await this.consumeLoginChallenge(request, reply, input.nonce);
    const credentials = await this.store.getPasswordCredentials(input.email);
    // Unknown, disabled and legacy password-less users share the same response
    // and perform a full password derivation to reduce account enumeration.
    const valid = await verifyPassword(
      input.password,
      credentials?.passwordHash ?? null,
    );
    if (!credentials || !valid || credentials.user.status !== 'ACTIVE') {
      throw new ApiProblem(
        'INVALID_CREDENTIALS',
        401,
        'Email or password is incorrect.',
      );
    }
    return this.issueSession(request, reply, credentials.user);
  }
  private async issueSession(
    request: FastifyRequest,
    reply: FastifyReply,
    user: StoredUser,
  ): Promise<AuthSession> {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(
      this.now().getTime() +
        this.environment.SESSION_TTL_HOURS * 60 * 60 * 1000,
    );
    const context = await this.context(user, token);
    await this.store.createSession({
      tokenHash: tokenHash(token),
      userId: user.id,
      expiresAt,
    });
    const previous = request.cookies[this.sessionCookie];
    if (previous) await this.store.revokeSession(tokenHash(previous));
    reply.setCookie(this.sessionCookie, token, {
      ...this.cookieOptions(),
      maxAge: this.environment.SESSION_TTL_HOURS * 3600,
      expires: expiresAt,
    });
    reply.clearCookie(this.challengeCookie, this.cookieOptions());
    return context;
  }
  async authenticate(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<{ user: StoredUser; token: string }> {
    this.requireConfiguration();
    const token = request.cookies[this.sessionCookie];
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
      throw new ApiProblem(
        'UNAUTHENTICATED',
        401,
        'Please sign in to continue.',
      );
    }
    const session = await this.store.getSession(tokenHash(token), this.now());
    const user =
      session && session.expiresAt > this.now()
        ? await this.store.getUser(session.userId)
        : null;
    if (!user || user.status !== 'ACTIVE') {
      reply.clearCookie(this.sessionCookie, this.cookieOptions());
      throw new ApiProblem(
        'UNAUTHENTICATED',
        401,
        'Your session expired. Please sign in again.',
      );
    }
    return { user, token };
  }
  checkSessionCsrf(request: FastifyRequest, token: string) {
    this.checkOrigin(request);
    const header = request.headers['x-csrf-token'];
    if (
      typeof header !== 'string' ||
      !equalToken(header, this.sessionCsrf(token))
    ) {
      throw new ApiProblem(
        'INVALID_CSRF_TOKEN',
        403,
        'Please refresh the page and try again.',
      );
    }
  }
  private async context(user: StoredUser, token: string): Promise<AuthSession> {
    const workspace = await this.store.getWedding(user.id);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePhotoUrl: user.profilePhotoUrl,
      },
      membership: workspace?.membership ?? null,
      wedding: workspace?.wedding ?? null,
      requiresWeddingSetup: !workspace,
      csrfToken: this.sessionCsrf(token),
    };
  }
  async me(request: FastifyRequest, reply: FastifyReply) {
    this.checkOrigin(request, false);
    const { user, token } = await this.authenticate(request, reply);
    return this.context(user, token);
  }
  async logout(request: FastifyRequest, reply: FastifyReply) {
    const { token } = await this.authenticate(request, reply);
    this.checkSessionCsrf(request, token);
    await this.store.revokeSession(tokenHash(token));
    reply.clearCookie(this.sessionCookie, this.cookieOptions());
  }
}
