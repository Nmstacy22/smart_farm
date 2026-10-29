// One-command end-to-end test run:  npm run test:e2e  [-- extra Playwright args]
//
//   1. Regenerates local migrations from db.sql + supabase/*.sql (prepare-db.mjs)
//   2. Starts the local Supabase in Docker (only db, auth and REST API) if needed
//   3. Resets the database, so every run starts empty
//   4. Runs Playwright, which builds and starts the app against that database
//
// Requires Docker Desktop to be running. Stop the containers with: npm run test:e2e:stop
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const supabase = path.join(root, 'node_modules/.bin/supabase');
const workdir = ['--workdir', 'e2e'];
// Services the app doesn't use; skipping them keeps startup fast and memory low
const EXCLUDE = 'studio,imgproxy,storage-api,realtime,edge-runtime,logflare,vector,postgres-meta,supavisor,mailpit';

const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: 'inherit' });

try {
  execFileSync('docker', ['info'], { stdio: 'ignore' });
} catch {
  console.error('Docker is not running. Start Docker Desktop, then run npm run test:e2e again.');
  process.exit(1);
}

run('node', ['e2e/prepare-db.mjs']);
run(supabase, ['start', ...workdir, '-x', EXCLUDE]);
run(supabase, ['db', 'reset', ...workdir]);

// supabase-js needs a global WebSocket, which Node 20 only provides behind a flag (Node 22+ has it)
const major = Number(process.versions.node.split('.')[0]);
const NODE_OPTIONS = [process.env.NODE_OPTIONS, major < 22 ? '--experimental-websocket' : ''].filter(Boolean).join(' ');

const result = spawnSync(path.join(root, 'node_modules/.bin/playwright'), ['test', '-c', 'e2e/playwright.config.ts', ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS },
});
process.exit(result.status ?? 1);
