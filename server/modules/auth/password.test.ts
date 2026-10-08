import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';

describe('password storage', () => {
  it('uses independent salts and checks the complete password, including spaces and Unicode', async () => {
    const password = ' a long wedding passphrase नमस्ते ';
    const first = await hashPassword(password);
    const second = await hashPassword(password);
    expect(first).not.toBe(second);
    expect(first).not.toContain(password);
    expect(await verifyPassword(password, first)).toBe(true);
    expect(await verifyPassword(password.trim(), first)).toBe(false);
    expect(await verifyPassword(`${password}x`, first)).toBe(false);
  });
  it('rejects missing or malformed hashes without accepting arbitrary cost parameters', async () => {
    for (const hash of [
      null,
      '',
      'not-a-hash',
      'scrypt$999999999$8$1$abcd$abcd',
    ]) {
      expect(await verifyPassword('any password', hash)).toBe(false);
    }
  });
});
