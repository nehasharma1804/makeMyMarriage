import { z } from 'zod';

const mongodbUri = z
  .string()
  .trim()
  .default('')
  .refine(
    (value) => value === '' || /^mongodb(?:\+srv)?:\/\/[^\s]+$/.test(value),
    'Expected a MongoDB connection string or an empty value',
  );

const environmentSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    HOST: z.string().trim().min(1).default('127.0.0.1'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    MONGODB_URI: mongodbUri,
    MONGODB_DB_NAME: z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9_-]+$/)
      .default('make_my_marriage_dev'),
    MONGODB_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(100)
      .max(30000)
      .default(5000),
    WEB_ORIGIN: z
      .url({ protocol: /^https?$/ })
      .default('http://localhost:3000')
      .refine(
        (value) => new URL(value).origin === value,
        'Use an origin without a path',
      ),
    SESSION_SECRET: z
      .string()
      .default('')
      .refine(
        (value) => value === '' || value.length >= 32,
        'Use at least 32 random characters',
      ),
    SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(720).default(168),
  })
  .superRefine((environment, context) => {
    if (environment.NODE_ENV === 'production' && !environment.MONGODB_URI) {
      context.addIssue({
        code: 'custom',
        path: ['MONGODB_URI'],
        message: 'Required in production',
      });
    }
    if (environment.NODE_ENV === 'production') {
      for (const setting of ['SESSION_SECRET'] as const) {
        if (!environment[setting]) {
          context.addIssue({
            code: 'custom',
            path: [setting],
            message: 'Required in production',
          });
        }
      }
      if (!environment.WEB_ORIGIN.startsWith('https://')) {
        context.addIssue({
          code: 'custom',
          path: ['WEB_ORIGIN'],
          message: 'HTTPS is required in production',
        });
      }
    }
  });

export type ServerEnvironment = z.infer<typeof environmentSchema>;

export class ConfigurationError extends Error {}

export function loadServerEnvironment(
  values: Record<string, string | undefined> = process.env,
): ServerEnvironment {
  const result = environmentSchema.safeParse(values);
  if (!result.success) {
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path.join('.'))),
    ];
    // Report names only: validation errors can otherwise reveal credentials.
    throw new ConfigurationError(
      `Invalid environment settings: ${fields.join(', ')}`,
    );
  }
  return result.data;
}
