// dev-all.mjs
import { spawn } from 'node:child_process';

const PREFERRED_POCKETBASE_URL = 'http://127.0.0.1:8090';
const DEFAULT_SVELTE_PORT = '5173';
const HELP_FLAGS = new Set(['--help', '-h']);

const helpText = [
  'Starts the Svelte dev server and PocketBase together.',
  '',
  'Requirements:',
  '- PocketBase must be installed and available as `pocketbase` on PATH.',
  '',
  'Environment:',
  '- VITE_POCKETBASE_URL defaults to http://127.0.0.1:8090.',
  '- VITE_TASK_REPOSITORY=pocketbase enables the PocketBase data path.',
  '- VITE_BOARD_REPOSITORY=pocketbase can be set explicitly for boards.',
  '',
  'Commands:',
  '- npm run dev:svelte',
  '- npm run dev:pocketbase',
  '- npm run dev:all'
].join('\n');

if (process.argv.some((argument) => HELP_FLAGS.has(argument))) {
  console.log(helpText);
  process.exit(0);
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const childProcesses = [];

function spawnProcess(name, command, args, options = {}) {
  const childProcess = spawn(command, args, {
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      VITE_POCKETBASE_URL: process.env.VITE_POCKETBASE_URL ?? PREFERRED_POCKETBASE_URL,
      ...options.env
    }
  });

  childProcesses.push(childProcess);

  childProcess.on('error', (error) => {
    console.error(`${name} failed to start: ${error.message}`);
    stopAll(1);
  });

  childProcess.on('exit', (code, signal) => {
    if (signal) {
      stopAll(0);
      return;
    }

    stopAll(code ?? 0);
  });

  return childProcess;
}

function stopAll(exitCode) {
  childProcesses.forEach((childProcess) => {
    if (!childProcess.killed) childProcess.kill();
  });
  process.exit(exitCode);
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));

spawnProcess('PocketBase', 'pocketbase', ['serve', '--http', '127.0.0.1:8090']);
spawnProcess('Svelte', npmCommand, ['run', 'dev:svelte', '--', '--port', DEFAULT_SVELTE_PORT]);
