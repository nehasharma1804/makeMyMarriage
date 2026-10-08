import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  loginSchema,
  registerSchema,
  accountEmailSchema,
} from '@mmm/contracts';
import { ApiProblem } from '../../shared/api-problem.js';
import { tokenHash, type AuthService } from './service.js';

export function registerAuthRoutes(app: FastifyInstance, auth: AuthService) {
  const checkConfigBackstop = app.createRateLimit({
    max: 1200,
    timeWindow: '1 minute',
    keyGenerator: () => 'auth-config-service',
  });
  app.get(
    '/api/v1/auth/config',
    {
      // Fixed service-wide backstop also bounds clients that obtain many valid
      // visitor cookies. A trusted edge limiter can later add real network-IP limits.
      onRequest: async (request, reply) => {
        // createRateLimit checks without setting the plugin's once-per-request
        // hook marker, so the route's visitor limiter also runs.
        const limit = await checkConfigBackstop(request);
        if (!limit.isAllowed && limit.isExceeded) {
          reply.header('X-RateLimit-Limit', limit.max);
          reply.header('Retry-After', limit.ttlInSeconds);
          throw new ApiProblem(
            'RATE_LIMITED',
            429,
            'Too many requests. Please try again shortly.',
          );
        }
      },
      config: {
        rateLimit: {
          keyGenerator: (request) => auth.configRateKey(request),
          max: (_request, key) => (key.startsWith('visitor:') ? 30 : 120),
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => ({
      success: true,
      data: await auth.config(request, reply),
    }),
  );
  // These shared buckets survive challenge rotation and cover both auth routes.
  // The API trusts only its socket peer, not client-controlled forwarded IPs.
  const credentialBackstop = app.createRateLimit({
    max: 60,
    timeWindow: '1 minute',
    keyGenerator: (request) => `password-peer:${request.ip}`,
  });
  const accountBackstop = app.createRateLimit({
    max: 10,
    timeWindow: '15 minutes',
    keyGenerator: (request) => {
      const body = request.body as { email?: unknown } | null;
      const email = accountEmailSchema.safeParse(body?.email);
      return email.success
        ? `account:${tokenHash(email.data)}`
        : `invalid:${request.ip}`;
    },
  });
  for (const action of ['register', 'login'] as const) {
    app.post(
      `/api/v1/auth/${action}`,
      {
        bodyLimit: 4096,
        onRequest: async (request) => {
          auth.checkOrigin(request);
          const limit = await credentialBackstop(request);
          if (!limit.isAllowed && limit.isExceeded)
            throw new ApiProblem(
              'RATE_LIMITED',
              429,
              'Too many attempts. Please try again later.',
            );
        },
        preHandler: async (request) => {
          const limit = await accountBackstop(request);
          if (!limit.isAllowed && limit.isExceeded)
            throw new ApiProblem(
              'RATE_LIMITED',
              429,
              'Too many attempts. Please try again later.',
            );
        },
        config: {
          rateLimit: {
            max: 10,
            timeWindow: '1 minute',
            keyGenerator: (request) => auth.loginRateKey(request),
          },
        },
      },
      async (request, reply) => {
        if (action === 'register') {
          const parsed = registerSchema.safeParse(request.body);
          if (!parsed.success)
            throw new ApiProblem(
              'VALIDATION_ERROR',
              422,
              'Enter your name, a valid email, and a password of 15–128 characters.',
            );
          const data = await auth.register(request, reply, parsed.data);
          return reply.code(201).send({ success: true, data });
        }
        const parsed = loginSchema.safeParse(request.body);
        if (!parsed.success)
          throw new ApiProblem(
            'VALIDATION_ERROR',
            422,
            'Enter a valid email and password.',
          );
        return {
          success: true,
          data: await auth.login(request, reply, parsed.data),
        };
      },
    );
  }
  const me = async (request: FastifyRequest, reply: FastifyReply) => ({
    success: true,
    data: await auth.me(request, reply),
  });
  app.get('/api/v1/auth/me', me);
  app.get('/api/v1/me', me);
  app.post(
    '/api/v1/auth/logout',
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: '1 minute',
          keyGenerator: (request) => auth.authenticatedWriteRateKey(request),
        },
      },
    },
    async (request, reply) => {
      await auth.logout(request, reply);
      return { success: true, data: { signedOut: true } };
    },
  );
}
