import type { FastifyInstance } from 'fastify';
import { createWeddingSchema } from '@mmm/contracts';
import type { AppStore } from '../../database/app-store.js';
import type { AuthService } from '../auth/service.js';
import { ApiProblem } from '../../shared/api-problem.js';

export function registerWeddingRoutes(
  app: FastifyInstance,
  store: AppStore,
  auth: AuthService,
  now: () => Date,
) {
  app.get('/api/v1/weddings/mine', async (request, reply) => {
    auth.checkOrigin(request, false);
    const { user } = await auth.authenticate(request, reply);
    return { success: true, data: await store.getWedding(user.id) };
  });
  app.post(
    '/api/v1/weddings',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
          keyGenerator: (request) => auth.authenticatedWriteRateKey(request),
        },
      },
    },
    async (request, reply) => {
      const { user, token } = await auth.authenticate(request, reply);
      auth.checkSessionCsrf(request, token);
      const parsed = createWeddingSchema.safeParse(request.body);
      if (!parsed.success)
        throw new ApiProblem(
          'VALIDATION_ERROR',
          422,
          'Enter couple names, a valid wedding date, and a city.',
        );
      const workspace = await store.createWedding(user.id, parsed.data, now());
      return reply.code(201).send({ success: true, data: workspace });
    },
  );
}
