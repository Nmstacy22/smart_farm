// Connection details for the local test Supabase (started by e2e/run.mjs).
import { execFileSync } from 'node:child_process';
import path from 'node:path';

export const APP_PORT = 3200;
export const APP_URL = `http://127.0.0.1:${APP_PORT}`;

let cached: { url: string; anonKey: string } | null = null;

export function localSupabase() {
  if (cached) return cached;
  const root = path.resolve(__dirname, '..');
  let raw: string;
  try {
    raw = execFileSync(path.join(root, 'node_modules/.bin/supabase'), ['status', '--workdir', 'e2e', '-o', 'json'], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString();
  } catch {
    throw new Error('Local Supabase is not running. Use `npm run test:e2e`, which starts it.');
  }
  const status = JSON.parse(raw.slice(raw.indexOf('{')));
  cached = { url: status.API_URL, anonKey: status.ANON_KEY };
  return cached;
}
