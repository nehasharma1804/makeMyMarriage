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

const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/);

export const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value &&
      value >= '1900-01-01' &&
      value <= '2200-12-31'
    );
  }, 'Enter a valid calendar date');

export const createWeddingSchema = z
  .object({
    brideName: z.string().trim().min(1).max(100),
    groomName: z.string().trim().min(1).max(100),
    weddingDate: calendarDateSchema,
    city: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000).optional(),
  })
  .strict();
export type CreateWeddingInput = z.infer<typeof createWeddingSchema>;

export const publicUserSchema = z.object({
  id: objectIdSchema,
  name: z.string(),
  email: z.email(),
  profilePhotoUrl: z.url({ protocol: /^https$/ }).nullable(),
});
export type PublicUser = z.infer<typeof publicUserSchema>;

export const membershipSchema = z.object({
  id: objectIdSchema,
  weddingId: objectIdSchema,
  role: z.enum(['ADMIN', 'MEMBER']),
});
export type Membership = z.infer<typeof membershipSchema>;

export const weddingSummarySchema = z.object({
  id: objectIdSchema,
  brideName: z.string(),
  groomName: z.string(),
  weddingDate: calendarDateSchema,
  city: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  timezone: z.literal('Asia/Kolkata'),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']),
});
export type WeddingSummary = z.infer<typeof weddingSummarySchema>;

export const weddingEventSchema = z.object({
  id: objectIdSchema,
  weddingId: objectIdSchema,
  name: z.string(),
  type: z.enum(['HALDI', 'MEHNDI', 'SANGEET', 'WEDDING', 'RECEPTION']),
  date: calendarDateSchema.nullable(),
  isDefault: z.literal(true),
  sortOrder: z.number().int(),
});
export type WeddingEvent = z.infer<typeof weddingEventSchema>;

export const weddingWorkspaceSchema = z.object({
  wedding: weddingSummarySchema,
  membership: membershipSchema,
  events: z.array(weddingEventSchema),
});
export type WeddingWorkspace = z.infer<typeof weddingWorkspaceSchema>;

export const authConfigSchema = z.object({
  configured: z.boolean(),
  nonce: z.string().nullable(),
  csrfToken: z.string().nullable(),
  missingSettings: z.array(z.string()),
  databaseReady: z.boolean(),
});
export type AuthConfig = z.infer<typeof authConfigSchema>;
export const authConfigResponseSchema = z.object({
  success: z.literal(true),
  data: authConfigSchema,
});

export const accountEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email().max(254));
const loginPasswordSchema = z.string().min(1).max(128);
export const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: accountEmailSchema,
    password: loginPasswordSchema.min(15, 'Use at least 15 characters'),
    nonce: z.string().min(32).max(128),
  })
  .strict();
export const loginSchema = z
  .object({
    email: accountEmailSchema,
    password: loginPasswordSchema,
    nonce: z.string().min(32).max(128),
  })
  .strict();
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const authSessionSchema = z.object({
  user: publicUserSchema,
  membership: membershipSchema.nullable(),
  wedding: weddingSummarySchema.nullable(),
  requiresWeddingSetup: z.boolean(),
  csrfToken: z.string(),
});
export type AuthSession = z.infer<typeof authSessionSchema>;
export const authSessionResponseSchema = z.object({
  success: z.literal(true),
  data: authSessionSchema,
});
export const weddingWorkspaceResponseSchema = z.object({
  success: z.literal(true),
  data: weddingWorkspaceSchema.nullable(),
});
