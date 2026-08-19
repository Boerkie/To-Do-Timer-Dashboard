// copy-build-to-pocketbase.mjs
import { cp, mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const BUILD_DIR = resolve('build');
const POCKETBASE_PUBLIC_DIR = resolve('pb_public');
const HELP_FLAGS = new Set(['--help', '-h']);

const helpText = [
  'Copies the Svelte static build into PocketBase public files.',
  '',
  'Usage:',
  '- npm run build:pocketbase-public',
  '',
  'Output:',
  '- build is created by Vite.',
  '- pb_public is served by `pocketbase serve` when run from the project root.'
].join('\n');

if (process.argv.some((argument) => HELP_FLAGS.has(argument))) {
  console.log(helpText);
  process.exit(0);
}

async function assertBuildExists() {
  try {
    const buildStats = await stat(BUILD_DIR);
    if (buildStats.isDirectory()) return;
  } catch {
    // Keep the failure message focused on the user action.
  }

  throw new Error('Missing build directory. Run `npm run build:static` first.');
}

await assertBuildExists();
await mkdir(POCKETBASE_PUBLIC_DIR, { recursive: true });
await cp(BUILD_DIR, POCKETBASE_PUBLIC_DIR, { recursive: true, force: true });

console.log(`Copied ${BUILD_DIR} to ${POCKETBASE_PUBLIC_DIR}.`);
