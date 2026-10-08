import { afterEach, describe, expect, it, vi } from 'vitest';
import { isPublicDemo } from './deployment-mode';

afterEach(() => vi.unstubAllEnvs());

describe('public release mode', () => {
  it('keeps local account development enabled by default', () => {
    vi.stubEnv('VERCEL', undefined);
    vi.stubEnv('PUBLIC_DEMO_ONLY', undefined);
    expect(isPublicDemo()).toBe(false);
  });
  it('defaults Vercel to the demo even when the flag is missing', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('PUBLIC_DEMO_ONLY', undefined);
    expect(isPublicDemo()).toBe(true);
  });
  it('can test the public demo locally', () => {
    vi.stubEnv('VERCEL', undefined);
    vi.stubEnv('PUBLIC_DEMO_ONLY', 'true');
    expect(isPublicDemo()).toBe(true);
  });
  it('requires explicit false before a future account deployment', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('PUBLIC_DEMO_ONLY', 'false');
    expect(isPublicDemo()).toBe(false);
  });
  it('does not open accounts on Vercel for a misspelled flag', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('PUBLIC_DEMO_ONLY', 'fasle');
    expect(isPublicDemo()).toBe(true);
  });
});
