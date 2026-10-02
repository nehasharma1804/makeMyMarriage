import { spawn } from 'node:child_process';
import { setTimeout } from 'node:timers';

const npm = process.env.npm_execpath;
if (!npm) throw new Error('Start the workspace with npm run dev.');

const children = new Set();
let stopping = false;

function signalChild(child, signal) {
  if (!child.pid) return;
  try {
    // Separate process groups let Ctrl+C stop npm and its watcher descendants.
    if (process.platform === 'win32') child.kill(signal);
    else process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
}

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) signalChild(child, 'SIGTERM');
  setTimeout(() => {
    for (const child of children) signalChild(child, 'SIGKILL');
    children.clear();
  }, 5000);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => stop());
}

for (const workspace of ['@mmm/contracts', '@mmm/api', '@mmm/web']) {
  const child = spawn(
    process.execPath,
    [npm, 'run', 'dev', '--workspace', workspace],
    {
      stdio: 'inherit',
      detached: process.platform !== 'win32',
    },
  );
  children.add(child);
  child.once('error', () => {
    console.error(`Could not start ${workspace}.`);
    stop(1);
  });
  child.once('exit', (code) => {
    // Keep the entry until close so a failed parent cannot leave descendants running.
    if (!stopping) {
      console.error(
        `${workspace} stopped; shutting down the development workspace.`,
      );
      stop(code ?? 1);
    }
  });
  // Retain process-group leaders even after npm exits, so the grace-period
  // cleanup can still stop any watcher descendants left in their groups.
}
