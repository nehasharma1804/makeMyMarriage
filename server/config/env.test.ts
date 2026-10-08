import { describe, expect, it } from 'vitest';
import { ConfigurationError, loadServerEnvironment } from './env.js';

describe('server environment', () => {
  it('allows initial development without cloud credentials', () => {
    const result = loadServerEnvironment({});
    expect(result.PORT).toBe(4000);
    expect(result.MONGODB_URI).toBe('');
  });

  it.each([
    'mongodb://127.0.0.1:27017',
    'mongodb+srv://user:password@cluster.example.com',
  ])('accepts a supported database connection format: %s', (uri) => {
    expect(loadServerEnvironment({ MONGODB_URI: uri }).MONGODB_URI).toBe(uri);
  });

  it('rejects a port outside the valid range', () => {
    expect(() => loadServerEnvironment({ PORT: '70000' })).toThrow('PORT');
  });

  it('rejects invalid settings without printing their values', () => {
    let failure: unknown;
    try {
      loadServerEnvironment({ MONGODB_URI: 'https://user:secret@example.com' });
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(ConfigurationError);
    expect((failure as Error).message).toContain('MONGODB_URI');
    expect((failure as Error).message).not.toContain('secret');
  });

  it('requires a configured database for production startup', () => {
    expect(() => loadServerEnvironment({ NODE_ENV: 'production' })).toThrow(
      'MONGODB_URI',
    );
  });

  it('rejects short session secrets and origins containing a path', () => {
    expect(() =>
      loadServerEnvironment({ SESSION_SECRET: 'too-short' }),
    ).toThrow('SESSION_SECRET');
    expect(() =>
      loadServerEnvironment({ WEB_ORIGIN: 'http://localhost:3000/path' }),
    ).toThrow('WEB_ORIGIN');
  });

  it('requires complete authentication settings and HTTPS for production', () => {
    expect(() =>
      loadServerEnvironment({
        NODE_ENV: 'production',
        MONGODB_URI: 'mongodb://localhost:27017',
      }),
    ).toThrow('SESSION_SECRET');
    expect(() =>
      loadServerEnvironment({
        NODE_ENV: 'production',
        MONGODB_URI: 'mongodb://localhost:27017',
        SESSION_SECRET: 'random-test-secret-at-least-32-characters',
      }),
    ).toThrow('WEB_ORIGIN');
  });
});
