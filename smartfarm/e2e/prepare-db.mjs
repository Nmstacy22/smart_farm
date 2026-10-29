// Builds the local test database migrations from the project's real SQL files, so the
// end-to-end tests always run against exactly what gets deployed:
//   1. db.sql                         (base schema)
//   2. supabase/schema_additions.sql
//   3. supabase/enable_rls_policies.sql
// db.sql lists tables in an order where some foreign keys point at tables defined later,
// so FK constraints are moved into ALTER TABLE statements after all tables exist.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'e2e/supabase/migrations');

function schemaWithDeferredForeignKeys(sql) {
  const out = [];
  const fks = [];
  let table = null;
  for (const line of sql.split('\n')) {
    const create = line.match(/^CREATE TABLE (\S+)/);
    if (create) table = create[1];
    const fk = line.match(/^\s*(CONSTRAINT \S+ FOREIGN KEY .*?),?\s*$/);
    if (fk && table) {
      fks.push(`ALTER TABLE ${table} ADD ${fk[1]};`);
      continue;
    }
    out.push(line);
  }
  // Removing FK lines can leave a trailing comma before ");"
  return out.join('\n').replace(/,(\s*\n\);)/g, '$1') + '\n\n-- Foreign keys\n' + fks.join('\n') + '\n';
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const files = [
  ['20260101000000_base_schema.sql', schemaWithDeferredForeignKeys(fs.readFileSync(path.join(root, 'db.sql'), 'utf8'))],
  ['20260101000001_schema_additions.sql', fs.readFileSync(path.join(root, 'supabase/schema_additions.sql'), 'utf8')],
  ['20260101000002_enable_rls_policies.sql', fs.readFileSync(path.join(root, 'supabase/enable_rls_policies.sql'), 'utf8')],
];
for (const [name, body] of files) fs.writeFileSync(path.join(outDir, name), body);
console.log(`Wrote ${files.length} migrations to ${path.relative(root, outDir)}`);
