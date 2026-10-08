import { apiErrorSchema, type ApiSuccess } from '@mmm/contracts';

export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function requestApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1/${path}`, {
      ...options,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new ApiRequestError(
      'API_UNAVAILABLE',
      'We could not connect. Please try again.',
      503,
    );
  }
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = apiErrorSchema.safeParse(result);
    throw new ApiRequestError(
      error.success ? error.data.error.code : 'REQUEST_FAILED',
      error.success
        ? error.data.error.message
        : 'Something went wrong. Please try again.',
      response.status,
    );
  }
  if (!result || typeof result !== 'object' || !('data' in result)) {
    throw new ApiRequestError('REQUEST_FAILED', 'Please try again.', 502);
  }
  return (result as ApiSuccess<T>).data;
}
