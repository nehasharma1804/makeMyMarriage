import { z } from 'zod';

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({ code: z.string(), message: z.string() }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiSuccess<T> = { success: true; data: T };

export const healthResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    service: z.literal('make-my-marriage-api'),
    status: z.literal('ok'),
  }),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const readinessResponseSchema = z.union([
  z.object({
    success: z.literal(true),
    data: z.object({
      service: z.literal('make-my-marriage-api'),
      database: z.literal('connected'),
    }),
  }),
  apiErrorSchema,
]);

export const webEnvironmentSchema = z.object({
  API_BASE_URL: z
    .url({ protocol: /^https?$/ })
    .default('http://127.0.0.1:4000'),
});
