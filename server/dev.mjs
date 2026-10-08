import { spawn } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import process from 'node:process';
import console from 'node:console';
import { URL } from 'node:url';
import { clearInterval, setInterval, setTimeout } from 'node:timers';

// Poll only API source and built contracts. This avoids native file-watcher
// limits on this Mac without changing system settings or watching dependencies.
const roots = [
  new URL('.', import.meta.url),
  new URL('../packages/contracts/dist/', import.meta.url),
];
const ignored = new Set(['node_modules', 'dist', 'coverage', '.git']);

async function snapshot() {
  const files = [];
  async function visit(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    for (const entry of entries) {
      const path = new URL(entry.name, directory);
      if (entry.isDirectory() && !ignored.has(entry.name)) {
        await visit(new URL(`${entry.name}/`, directory));
      } else if (
        entry.isFile() &&
        (/\.(ts|js|mjs|json)$/.test(entry.name) || entry.name === '.env')
      ) {
        try {
          const info = await stat(path);
          files.push(`${path.pathname}:${info.mtimeMs}:${info.size}`);
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
        }
      }
    }
  }
  for (const root of roots) await visit(root);
  return files.sort().join('\n');
}

let previous = await snapshot();
let stopping = false;
let restarting = false;
let checking = false;
let child;
let timer;

function start() {
  const processChild = spawn(
    process.execPath,
    ['--env-file-if-exists=.env', '--import=tsx', 'index.ts'],
    { stdio: 'inherit' },
  );
  processChild.once('error', () => {
    console.error('Could not start the API development process.');
    stop('SIGTERM');
    process.exitCode = 1;
  });
  processChild.once('exit', (code) => {
    if (!stopping && !restarting) {
      clearInterval(timer);
      process.exitCode = code ?? 1;
    }
  });
  return processChild;
}

function stop(signal) {
  stopping = true;
  clearInterval(timer);
  child?.kill(signal);
  setTimeout(() => child?.kill('SIGKILL'), 5000).unref();
}

async function restart() {
  restarting = true;
  console.log('API source changed; restarting.');
  await new Promise((resolve) => {
    const old = child;
    old.once('exit', resolve);
    old.kill('SIGTERM');
    setTimeout(() => old.kill('SIGKILL'), 5000).unref();
  });
  if (!stopping) child = start();
  restarting = false;
}

child = start();
timer = setInterval(async () => {
  if (checking || stopping || restarting) return;
  checking = true;
  try {
    const next = await snapshot();
    if (next !== previous) {
      previous = next;
      await restart();
    }
  } catch {
    console.error(
      'Could not inspect API source files. Check workspace permissions.',
    );
    stop('SIGTERM');
    process.exitCode = 1;
  } finally {
    checking = false;
  }
}, 750);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => stop(signal));
}
