import { randomBytes } from 'node:crypto';
import { readFile, writeFile, chmod } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { URL } from 'node:url';

try {
  const path = new URL('../server/.env', import.meta.url);
  const content = await readFile(path, 'utf8');
  const values = parseEnv(content);
  if (values.SESSION_SECRET?.trim()) {
    console.log('Preserved the existing local session secret.');
  } else {
    const secret = randomBytes(48).toString('base64url');
    const next = /^SESSION_SECRET=.*$/m.test(content)
      ? content.replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${secret}`)
      : `${content.trimEnd()}\nSESSION_SECRET=${secret}\n`;
    await writeFile(path, next, { mode: 0o600 });
    await chmod(path, 0o600);
    console.log(
      'Saved a random session secret in the ignored server/.env file.',
    );
  }
  console.log('Configure MONGODB_URI to enable real sign-in.');
} catch {
  console.error(
    'Could not prepare authentication. Run npm run setup first and check server/.env permissions.',
  );
  process.exitCode = 1;
}
