import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';

// Codex consumes stdout as authentication headers. Do not run this helper in a
// terminal to inspect it: that would display the key. No key belongs in TOML.
try {
  const key = (
    process.env.STITCH_API_KEY ||
    (await readFile(new URL('../.stitch/api-key', import.meta.url), 'utf8'))
  ).trim();

  const invalidHeader = [...key].some((character) => {
    const code = character.charCodeAt(0);
    return code <= 32 || code >= 127;
  });
  if (!key || invalidHeader) {
    throw new Error('Missing or invalid key');
  }

  process.stdout.write(JSON.stringify({ 'X-Goog-Api-Key': key }));
} catch {
  console.error(
    'Stitch authentication is not configured. Save the API key in the ignored .stitch/api-key file.',
  );
  process.exitCode = 1;
}
