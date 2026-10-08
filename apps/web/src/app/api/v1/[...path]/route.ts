import { webEnvironmentSchema } from '@mmm/contracts';
import { isPublicDemo } from '../../../../lib/deployment-mode';

export const runtime = 'nodejs';

const allowedRoutes: Record<string, string[]> = {
  'auth/config': ['GET'],
  'auth/login': ['POST'],
  'auth/register': ['POST'],
  'auth/me': ['GET'],
  'auth/logout': ['POST'],
  weddings: ['POST'],
  'weddings/mine': ['GET'],
  health: ['GET'],
  ready: ['GET'],
};

const failure = (code: string, message: string, status: number) =>
  Response.json(
    { success: false, error: { code, message } },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );

async function proxy(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  if (isPublicDemo()) {
    return failure(
      'DEMO_ONLY',
      'Accounts are not available in this public demo.',
      404,
    );
  }
  const path = (await context.params).path.join('/');
  if (!allowedRoutes[path]?.includes(request.method)) {
    return failure('NOT_FOUND', 'This endpoint is not available.', 404);
  }
  const environment = webEnvironmentSchema.parse({
    API_BASE_URL: process.env.API_BASE_URL,
  });
  const headers = new Headers();
  for (const name of [
    'cookie',
    'origin',
    'sec-fetch-site',
    'x-csrf-token',
    'content-type',
  ]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  let body: Uint8Array | undefined;
  if (request.method === 'POST' && request.body) {
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 32768) {
        await reader.cancel();
        return failure('VALIDATION_ERROR', 'Request is too large.', 413);
      }
      chunks.push(chunk.value);
    }
    body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
  }
  try {
    const upstream = await fetch(`${environment.API_BASE_URL}/api/v1/${path}`, {
      method: request.method,
      headers,
      ...(body ? { body: body as BodyInit } : {}),
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const responseHeaders = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    for (const cookie of upstream.headers.getSetCookie()) {
      responseHeaders.append('Set-Cookie', cookie);
    }
    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return failure(
      'API_UNAVAILABLE',
      'We could not connect. Please try again.',
      503,
    );
  }
}

export const GET = proxy;
export const POST = proxy;
