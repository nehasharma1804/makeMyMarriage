import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { ApiProblem } from '../../shared/api-problem.js';

// OWASP scrypt baseline: N=2^17, r=8, p=1. Use asynchronous Node crypto.
const prefix = 'scrypt$131072$8$1';
const dummySalt = Buffer.alloc(16, 1);
const dummyKey = Buffer.alloc(64);
let activeDerivations = 0;

async function derive(password: string, salt: Buffer): Promise<Buffer> {
  // Bound native memory consumption instead of queueing unlimited costly work.
  if (activeDerivations >= 2)
    throw new ApiProblem(
      'AUTH_BUSY',
      503,
      'Sign-in is busy. Please try again shortly.',
    );
  activeDerivations++;
  try {
    return await new Promise<Buffer>((resolve, reject) => {
      scrypt(
        password,
        salt,
        64,
        { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 },
        (error, key) => {
          if (error) reject(error);
          else resolve(key);
        },
      );
    });
  } finally {
    activeDerivations--;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `${prefix}$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(
  password: string,
  encoded: string | null,
): Promise<boolean> {
  // Never use attacker-controlled cost parameters from a malformed stored hash.
  const match = encoded?.match(
    /^scrypt\$131072\$8\$1\$([a-f0-9]{32})\$([a-f0-9]{128})$/,
  );
  const salt = match ? Buffer.from(match[1]!, 'hex') : dummySalt;
  const expected = match ? Buffer.from(match[2]!, 'hex') : dummyKey;
  const actual = await derive(password, salt);
  return timingSafeEqual(actual, expected) && Boolean(match);
}
