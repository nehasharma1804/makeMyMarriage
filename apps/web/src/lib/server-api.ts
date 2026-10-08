import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isPublicDemo } from './deployment-mode';
import {
  authSessionResponseSchema,
  webEnvironmentSchema,
  weddingWorkspaceResponseSchema,
} from '@mmm/contracts';

export async function serverApi(path: string) {
  if (isPublicDemo()) redirect('/demo');
  const environment = webEnvironmentSchema.parse({
    API_BASE_URL: process.env.API_BASE_URL,
  });
  try {
    const response = await fetch(`${environment.API_BASE_URL}/api/v1/${path}`, {
      headers: { cookie: (await cookies()).toString() },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    return { response, body: await response.json() };
  } catch {
    return null;
  }
}

export async function loadSession() {
  const result = await serverApi('auth/me');
  if (result?.response.status === 401) redirect('/login');
  const parsed = authSessionResponseSchema.safeParse(result?.body);
  return parsed.success ? parsed.data.data : null;
}

export async function loadWedding() {
  const result = await serverApi('weddings/mine');
  if (result?.response.status === 401) redirect('/login');
  const parsed = weddingWorkspaceResponseSchema.safeParse(result?.body);
  return parsed.success ? { workspace: parsed.data.data } : null;
}
