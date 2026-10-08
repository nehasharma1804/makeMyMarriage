import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '../app/api/v1/[...path]/route';

const context = (path: string) => ({
  params: Promise.resolve({ path: path.split('/') }),
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('same-origin API proxy', () => {
  it.each(['auth/config', 'auth/me', 'weddings/mine'])(
    'does not forward public-demo reads to the API: %s',
    async (path) => {
      vi.stubEnv('PUBLIC_DEMO_ONLY', 'true');
      const upstream = vi.fn();
      vi.stubGlobal('fetch', upstream);
      const response = await GET(
        new Request(`https://example.com/api/v1/${path}`),
        context(path),
      );
      expect(response.status).toBe(404);
      expect((await response.json()).error.code).toBe('DEMO_ONLY');
      expect(upstream).not.toHaveBeenCalled();
    },
  );

  it.each(['auth/register', 'auth/login', 'weddings'])(
    'does not forward public-demo writes to the API: %s',
    async (path) => {
      vi.stubEnv('PUBLIC_DEMO_ONLY', 'true');
      const upstream = vi.fn();
      vi.stubGlobal('fetch', upstream);
      const response = await POST(
        new Request(`https://example.com/api/v1/${path}`, {
          method: 'POST',
          body: '{}',
        }),
        context(path),
      );
      expect(response.status).toBe(404);
      expect(upstream).not.toHaveBeenCalled();
    },
  );

  it('forwards the real origin, session cookie and CSRF value and preserves multiple Set-Cookie headers', async () => {
    vi.stubEnv('API_BASE_URL', 'http://127.0.0.1:4000');
    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append(
      'Set-Cookie',
      'session=opaque; HttpOnly; SameSite=Lax; Path=/',
    );
    headers.append('Set-Cookie', 'challenge=; Max-Age=0; HttpOnly; Path=/');
    const upstream = vi
      .fn()
      .mockResolvedValue(
        new Response('{"success":true,"data":{}}', { headers }),
      );
    vi.stubGlobal('fetch', upstream);
    const request = new Request('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000',
        cookie: 'challenge=signed-value',
        'x-csrf-token': 'csrf-value',
        'Content-Type': 'application/json',
        'x-forwarded-for': 'attacker-controlled',
      },
      body: '{"email":"test@example.com","password":"test-passphrase"}',
    });
    const response = await POST(request, context('auth/login'));
    expect(response.status).toBe(200);
    expect(response.headers.getSetCookie()).toHaveLength(2);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const [url, options] = upstream.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://127.0.0.1:4000/api/v1/auth/login');
    const forwarded = options.headers as Headers;
    expect(forwarded.get('origin')).toBe('http://localhost:3000');
    expect(forwarded.get('cookie')).toBe('challenge=signed-value');
    expect(forwarded.get('x-csrf-token')).toBe('csrf-value');
    expect(forwarded.has('x-forwarded-for')).toBe(false);
    expect(new TextDecoder().decode(options.body as Uint8Array)).toBe(
      '{"email":"test@example.com","password":"test-passphrase"}',
    );
  });

  it('does not fabricate an allowed origin or CSRF header for a request missing them', async () => {
    const upstream = vi
      .fn()
      .mockResolvedValue(Response.json({ success: false }, { status: 403 }));
    vi.stubGlobal('fetch', upstream);
    const response = await POST(
      new Request('http://localhost:3000/api/v1/auth/logout', {
        method: 'POST',
        body: '{}',
      }),
      context('auth/logout'),
    );
    expect(response.status).toBe(403);
    const headers = upstream.mock.calls[0]![1].headers as Headers;
    expect(headers.has('origin')).toBe(false);
    expect(headers.has('x-csrf-token')).toBe(false);
  });

  it.each([
    '../auth/me',
    'https://example.com',
    'public/unknown',
    'auth/me/extra',
    'auth/google',
  ])('rejects an unapproved proxy path: %s', async (path) => {
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    const response = await GET(
      new Request('http://localhost:3000/api/v1/test'),
      context(path),
    );
    expect(response.status).toBe(404);
    expect(upstream).not.toHaveBeenCalled();
  });

  it('bounds sign-in and creation request bodies before forwarding', async () => {
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    const response = await POST(
      new Request('http://localhost:3000/api/v1/weddings', {
        method: 'POST',
        body: 'x'.repeat(32769),
      }),
      context('weddings'),
    );
    expect(response.status).toBe(413);
    expect(upstream).not.toHaveBeenCalled();
  });

  it('returns a safe error if the API cannot be reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('http://user:password@private-host')),
    );
    const response = await GET(
      new Request('http://localhost:3000/api/v1/auth/config'),
      context('auth/config'),
    );
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('password');
  });
});
